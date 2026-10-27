
from pathlib import Path
import json

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer


BASE_DIR = Path(__file__).resolve().parent.parent
CHUNKS_DIR = BASE_DIR / "document_chunks"
MODEL_DIR = BASE_DIR / "models" / "all-MiniLM-L6-v2"
OUTPUT_DIR = BASE_DIR / "embeddings"

MAX_LENGTH = 128
BATCH_SIZE = 16


def load_chunks():
    documents = []

    for file_path in sorted(CHUNKS_DIR.glob("*_chunks.txt")):
        text = file_path.read_text(encoding="utf-8")
        sections = text.split("--- CHUNK ")

        for section in sections[1:]:
            header, separator, content = section.partition("---")

            if not separator:
                continue

            chunk_text = content.strip()

            if chunk_text:
                documents.append({
                    "source": file_path.name.replace(
                        "_chunks.txt", ".txt"
                    ),
                    "chunk_id": header.strip(),
                    "text": chunk_text,
                })

    return documents


def mean_pool_and_normalize(token_embeddings, attention_mask):
    mask = attention_mask[..., None].astype(np.float32)

    summed = (token_embeddings * mask).sum(axis=1)
    counts = np.maximum(mask.sum(axis=1), 1e-9)

    pooled = summed / counts
    norms = np.linalg.norm(pooled, axis=1, keepdims=True)
    normalized = pooled / np.maximum(norms, 1e-12)

    return normalized.astype(np.float32)


def main():
    if not CHUNKS_DIR.exists():
        raise FileNotFoundError(
            f"Chunk directory not found: {CHUNKS_DIR}"
        )

    model_path = MODEL_DIR / "onnx" / "model.onnx"
    tokenizer_path = MODEL_DIR / "tokenizer.json"

    if not model_path.exists() or not tokenizer_path.exists():
        raise FileNotFoundError(
            "Model or tokenizer files are missing."
        )

    tokenizer = Tokenizer.from_file(str(tokenizer_path))
    tokenizer.enable_truncation(max_length=MAX_LENGTH)

    session = ort.InferenceSession(
        str(model_path),
        providers=["CPUExecutionProvider"],
    )

    input_names = {
        item.name for item in session.get_inputs()
    }

    documents = load_chunks()

    if not documents:
        raise ValueError("No chunks found to embed.")

    embeddings = []

    for start in range(0, len(documents), BATCH_SIZE):
        batch = documents[start:start + BATCH_SIZE]
        encoded_batch = [
            tokenizer.encode(item["text"]) for item in batch
        ]

        max_tokens = max(len(item.ids) for item in encoded_batch)

        input_ids = np.zeros(
            (len(batch), max_tokens), dtype=np.int64
        )
        attention_mask = np.zeros_like(input_ids)
        token_type_ids = np.zeros_like(input_ids)

        for index, encoded in enumerate(encoded_batch):
            length = len(encoded.ids)
            input_ids[index, :length] = encoded.ids
            attention_mask[index, :length] = encoded.attention_mask
            token_type_ids[index, :length] = encoded.type_ids

        inputs = {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
        }

        if "token_type_ids" in input_names:
            inputs["token_type_ids"] = token_type_ids

        outputs = session.run(None, inputs)
        token_embeddings = outputs[0]

        batch_embeddings = mean_pool_and_normalize(
            token_embeddings, attention_mask
        )

        embeddings.extend(batch_embeddings)

        completed = min(start + BATCH_SIZE, len(documents))
        print(f"Embedded {completed}/{len(documents)} chunks")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    matrix = np.stack(embeddings).astype(np.float32)

    np.save(OUTPUT_DIR / "document_embeddings.npy", matrix)

    metadata = [
        {
            "source": item["source"],
            "chunk_id": item["chunk_id"],
            "text": item["text"],
        }
        for item in documents
    ]

    with (OUTPUT_DIR / "metadata.json").open(
        "w", encoding="utf-8"
    ) as file:
        json.dump(metadata, file, ensure_ascii=False, indent=2)

    print("\nEmbedding generation complete!")
    print("Chunks:", len(documents))
    print("Embedding matrix shape:", matrix.shape)
    print("Saved embeddings to:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
