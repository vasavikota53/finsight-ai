
from pathlib import Path
import re

import chromadb
import numpy as np
import onnxruntime as ort
from pypdf import PdfReader
from tokenizers import Tokenizer

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models" / "all-MiniLM-L6-v2"
DB_DIR = BASE_DIR / "vector_db"

COLLECTION_NAME = "finsight_documents"
MAX_LENGTH = 128
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def chunk_text(text):
    text = " ".join(text.split())
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end == len(text):
            break

        start = end - CHUNK_OVERLAP

    return chunks


def mean_pool_and_normalize(token_embeddings, attention_mask):
    mask = attention_mask[..., None].astype(np.float32)
    summed = (token_embeddings * mask).sum(axis=1)
    counts = np.maximum(mask.sum(axis=1), 1e-9)
    pooled = summed / counts
    norms = np.linalg.norm(pooled, axis=1, keepdims=True)
    return (pooled / np.maximum(norms, 1e-12)).astype(np.float32)


def embed_chunks(chunks):
    tokenizer = Tokenizer.from_file(
        str(MODEL_DIR / "tokenizer.json")
    )
    tokenizer.enable_truncation(max_length=MAX_LENGTH)

    session = ort.InferenceSession(
        str(MODEL_DIR / "onnx" / "model.onnx"),
        providers=["CPUExecutionProvider"],
    )
    input_names = {item.name for item in session.get_inputs()}

    vectors = []

    for start in range(0, len(chunks), 16):
        batch = chunks[start:start + 16]
        encoded = [tokenizer.encode(text) for text in batch]
        max_tokens = max(len(item.ids) for item in encoded)

        input_ids = np.zeros(
            (len(batch), max_tokens), dtype=np.int64
        )
        attention_mask = np.zeros_like(input_ids)
        token_type_ids = np.zeros_like(input_ids)

        for i, item in enumerate(encoded):
            length = len(item.ids)
            input_ids[i, :length] = item.ids
            attention_mask[i, :length] = item.attention_mask
            token_type_ids[i, :length] = item.type_ids

        inputs = {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
        }
        if "token_type_ids" in input_names:
            inputs["token_type_ids"] = token_type_ids

        output = session.run(None, inputs)[0]
        vectors.extend(
            mean_pool_and_normalize(output, attention_mask)
        )

    return np.asarray(vectors, dtype=np.float32)


def index_pdf(pdf_path, document_id, original_filename=None):
    pdf_path = Path(pdf_path)
    reader = PdfReader(str(pdf_path))

    text = "\n".join(
        page.extract_text() or "" for page in reader.pages
    ).strip()

    if not text:
        raise ValueError(
            "No readable text found. This PDF may be scanned."
        )

    chunks = chunk_text(text)
    if not chunks:
        raise ValueError("No text chunks could be created.")

    embeddings = embed_chunks(chunks)

    client = chromadb.PersistentClient(path=str(DB_DIR))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    # Store a unique source for this upload; preserve existing records.
    source = f"upload_{document_id}"
    ids = [f"{source}__{i + 1}" for i in range(len(chunks))]

    collection.upsert(
        ids=ids,
        embeddings=embeddings.tolist(),
        documents=chunks,
        metadatas=[
            {
                "source": source,
                "filename": pdf_path.name,
                "chunk_id": str(i + 1),
                "company": (
                    "Amazon" if re.search(
                        r"amazon", pdf_path.name, re.I
                    ) else (
                        "Apple" if re.search(
                            r"apple", pdf_path.name, re.I
                        ) else "Uploaded"
                    )
                ),
            }
            for i in range(len(chunks))
        ],
    )

    return {
        "chunks_indexed": len(chunks),
        "source": source,
    }
