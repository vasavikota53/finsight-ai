
from pathlib import Path
import json

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = BASE_DIR / "models" / "all-MiniLM-L6-v2"
EMBEDDINGS_DIR = BASE_DIR / "embeddings"

MAX_LENGTH = 128
TOP_K = 5


# --------------------------------------------------
# CREATE NORMALIZED EMBEDDINGS
# --------------------------------------------------

def mean_pool_and_normalize(token_embeddings, attention_mask):
    mask = attention_mask[..., None].astype(np.float32)

    summed = (token_embeddings * mask).sum(axis=1)
    counts = np.maximum(mask.sum(axis=1), 1e-9)

    pooled = summed / counts
    norms = np.linalg.norm(pooled, axis=1, keepdims=True)

    normalized = pooled / np.maximum(norms, 1e-12)

    return normalized.astype(np.float32)


# --------------------------------------------------
# LOAD DOCUMENTS, EMBEDDINGS, AND MODEL
# --------------------------------------------------

def load_search_engine():

    embeddings_path = (
        EMBEDDINGS_DIR / "document_embeddings.npy"
    )
    metadata_path = EMBEDDINGS_DIR / "metadata.json"

    model_path = MODEL_DIR / "onnx" / "model.onnx"
    tokenizer_path = MODEL_DIR / "tokenizer.json"

    required_files = [
        embeddings_path,
        metadata_path,
        model_path,
        tokenizer_path,
    ]

    for path in required_files:
        if not path.exists():
            raise FileNotFoundError(
                f"Required file not found: {path}\n"
                "Please check your project files."
            )

    embeddings = np.load(embeddings_path)

    with metadata_path.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    if len(embeddings) != len(metadata):
        raise ValueError(
            "Embedding count does not match metadata count."
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

    print(f"Loaded {len(metadata)} document chunks.")

    return (
        embeddings,
        metadata,
        tokenizer,
        session,
        input_names,
    )


# --------------------------------------------------
# CONVERT QUESTION INTO AN EMBEDDING
# --------------------------------------------------

def embed_query(query, tokenizer, session, input_names):

    encoded = tokenizer.encode(query)

    input_ids = np.array(
        [encoded.ids], dtype=np.int64
    )

    attention_mask = np.array(
        [encoded.attention_mask], dtype=np.int64
    )

    token_type_ids = np.array(
        [encoded.type_ids], dtype=np.int64
    )

    inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
    }

    if "token_type_ids" in input_names:
        inputs["token_type_ids"] = token_type_ids

    outputs = session.run(None, inputs)

    query_embedding = mean_pool_and_normalize(
        outputs[0],
        attention_mask,
    )

    return query_embedding[0]


# --------------------------------------------------
# SEARCH DOCUMENTS WITH OPTIONAL COMPANY FILTER
# --------------------------------------------------

def search_documents(
    query,
    embeddings,
    metadata,
    tokenizer,
    session,
    input_names,
    top_k=TOP_K,
    company=None,
):

    query_embedding = embed_query(
        query,
        tokenizer,
        session,
        input_names,
    )

    # Calculate similarity against all document chunks.
    scores = embeddings @ query_embedding

    # Begin with all documents.
    candidate_indices = np.arange(len(metadata))

    # Filter using the source filename when requested.
    if company:

        company = company.lower().strip()

        candidate_indices = np.array(
            [
                i
                for i, item in enumerate(metadata)
                if company in item["source"].lower()
            ],
            dtype=int,
        )

        if len(candidate_indices) == 0:
            print(
                f"No documents found with "
                f"'{company}' in the filename."
            )
            return []

    # Select the highest-scoring matching chunks.
    ranked_positions = np.argsort(
        scores[candidate_indices]
    )[::-1][:top_k]

    top_indices = candidate_indices[ranked_positions]

    results = []

    for index in top_indices:

        item = metadata[int(index)]

        results.append({
            "source": item["source"],
            "chunk_id": item["chunk_id"],
            "score": float(scores[index]),
            "text": item["text"],
        })

    return results


# --------------------------------------------------
# DISPLAY SEARCH RESULTS
# --------------------------------------------------

def display_results(results):

    if not results:
        print("\nNo matching document chunks found.\n")
        return

    print("\nMost relevant document chunks:\n")

    for rank, result in enumerate(results, start=1):

        print("=" * 75)
        print(f"Result {rank}")
        print(f"Source: {result['source']}")
        print(f"Chunk ID: {result['chunk_id']}")
        print(f"Similarity: {result['score']:.4f}")
        print("-" * 75)
        print(result["text"])
        print()

    print("=" * 75)


# --------------------------------------------------
# MAIN PROGRAM
# --------------------------------------------------

def main():

    print("\n========================================")
    print("       FINSIGHT AI DOCUMENT AGENT")
    print("========================================\n")

    print("Loading search engine...\n")

    (
        embeddings,
        metadata,
        tokenizer,
        session,
        input_names,
    ) = load_search_engine()

    print("\nSearch engine ready!")
    print("Enter a company name to filter its documents.")
    print("Examples: Amazon, Apple")
    print("Leave the company field empty to search all.")
    print("Type 'exit' to close the program.\n")

    while True:

        company = input(
            "Company filter: "
        ).strip()

        if company.lower() in {"exit", "quit"}:
            print("\nFinsight AI search closed.")
            break

        if not company:
            company = None

        query = input(
            "Your question: "
        ).strip()

        if query.lower() in {"exit", "quit"}:
            print("\nFinsight AI search closed.")
            break

        if not query:
            print("Please enter a question.\n")
            continue

        results = search_documents(
            query=query,
            embeddings=embeddings,
            metadata=metadata,
            tokenizer=tokenizer,
            session=session,
            input_names=input_names,
            top_k=TOP_K,
            company=company,
        )

        display_results(results)


if __name__ == "__main__":
    main()
