
from pathlib import Path

import chromadb
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

BASE_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BASE_DIR / "vector_db"
MODEL_DIR = BASE_DIR / "models" / "all-MiniLM-L6-v2"

COLLECTION_NAME = "finsight_documents"
MAX_LENGTH = 128


def embed_query(question):
    tokenizer = Tokenizer.from_file(
        str(MODEL_DIR / "tokenizer.json")
    )
    tokenizer.enable_truncation(max_length=MAX_LENGTH)

    model_path = MODEL_DIR / "onnx" / "model.onnx"

    session = ort.InferenceSession(
        str(model_path),
        providers=["CPUExecutionProvider"],
    )

    encoded = tokenizer.encode(question)

    input_ids = np.array([encoded.ids], dtype=np.int64)
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

    input_names = {
        item.name for item in session.get_inputs()
    }

    if "token_type_ids" in input_names:
        inputs["token_type_ids"] = token_type_ids

    token_embeddings = session.run(None, inputs)[0]

    mask = attention_mask[..., None].astype(np.float32)

    pooled = (token_embeddings * mask).sum(axis=1)
    pooled /= np.maximum(mask.sum(axis=1), 1e-9)

    norms = np.linalg.norm(pooled, axis=1, keepdims=True)

    normalized = pooled / np.maximum(norms, 1e-12)

    return normalized[0].tolist()


def main():
    # Connect to the existing ChromaDB database
    client = chromadb.PersistentClient(
        path=str(DB_DIR)
    )

    collection = client.get_collection(
        COLLECTION_NAME
    )

    print("=" * 60)
    print("       FINSIGHT AI - DOCUMENT SEARCH")
    print("=" * 60)

    print(f"Indexed records: {collection.count()}")

    # Get the user's question
    question = input(
        "\nEnter your question: "
    ).strip()

    if not question:
        print("Please enter a question.")
        return

    # Select the company
    company = input(
        "Enter company (Amazon or Apple): "
    ).strip().lower()

    if company == "amazon":
        source_file = "Amazon-2025-Annual-Report.txt"

    elif company == "apple":
        source_file = "Apple10-kfilling.txt"

    else:
        print(
            "Invalid company. Please enter Amazon or Apple."
        )
        return

    # Generate an embedding for the question
    print("\nGenerating question embedding...")

    query_vector = embed_query(question)

    # Search only the selected company's document
    print(f"Searching {company.title()} documents...")

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=5,
        where={"source": source_file},
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    if not documents:
        print("\nNo matching passages found.")
        return

    # Display the retrieved passages
    print("\n" + "=" * 60)
    print("             TOP MATCHING PASSAGES")
    print("=" * 60)

    for index, document in enumerate(documents, start=1):
        metadata = metadatas[index - 1]
        distance = distances[index - 1]

        print(f"\n{index}. Source: {metadata['source']}")
        print(f"   Chunk: {metadata['chunk_id']}")
        print(f"   Cosine distance: {distance:.4f}")
        print(f"   Text: {document[:500]}")
        print("-" * 60)

    print("\nSearch completed successfully!")


if __name__ == "__main__":
    main()
