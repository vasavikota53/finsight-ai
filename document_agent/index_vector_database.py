
from pathlib import Path
import json

import chromadb
import numpy as np

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
EMBEDDINGS_DIR = BASE_DIR / "embeddings"
DB_DIR = BASE_DIR / "vector_db"

EMBEDDINGS_FILE = EMBEDDINGS_DIR / "document_embeddings.npy"
METADATA_FILE = EMBEDDINGS_DIR / "metadata.json"

COLLECTION_NAME = "finsight_documents"
BATCH_SIZE = 100


def main():
    # Check that the required files exist
    if not EMBEDDINGS_FILE.exists():
        raise FileNotFoundError(
            f"Missing embeddings: {EMBEDDINGS_FILE}"
        )

    if not METADATA_FILE.exists():
        raise FileNotFoundError(
            f"Missing metadata: {METADATA_FILE}"
        )

    # Load embeddings and metadata
    embeddings = np.load(EMBEDDINGS_FILE)

    with METADATA_FILE.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    if len(embeddings) != len(metadata):
        raise ValueError(
            f"Mismatch: {len(embeddings)} vectors but "
            f"{len(metadata)} metadata records."
        )

    if len(metadata) == 0:
        print("No document chunks to index.")
        return

    if embeddings.ndim != 2:
        raise ValueError("Embeddings must be a 2D array.")

    print("Loaded vectors:", embeddings.shape)
    print("Loaded metadata records:", len(metadata))

    # Connect to the persistent database
    client = chromadb.PersistentClient(path=str(DB_DIR))

    # Get the existing collection or create it if needed.
    # Never delete the collection.
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    before_count = collection.count()
    print("Existing indexed records:", before_count)

    # Validate metadata before writing anything
    for item in metadata:
        if not all(
            key in item for key in ("source", "chunk_id", "text")
        ):
            raise ValueError(
                "A metadata record is missing source, chunk_id, or text."
            )

    # Upsert inserts new chunks and updates matching IDs.
    # Existing records from other documents are preserved.
    for start in range(0, len(metadata), BATCH_SIZE):
        end = min(start + BATCH_SIZE, len(metadata))
        batch = metadata[start:end]

        ids = [
            f"{item['source']}__{item['chunk_id']}"
            for item in batch
        ]

        documents = [item["text"] for item in batch]

        metadatas = [
            {
                "source": item["source"],
                "chunk_id": str(item["chunk_id"]),
            }
            for item in batch
        ]

        vectors = embeddings[start:end].tolist()

        collection.upsert(
            ids=ids,
            embeddings=vectors,
            documents=documents,
            metadatas=metadatas,
        )

        print(f"Processed {end}/{len(metadata)} chunks")

    after_count = collection.count()

    print("\nIndexing complete!")
    print("Collection:", COLLECTION_NAME)
    print("Records before:", before_count)
    print("Records after:", after_count)
    print("Database folder:", DB_DIR)


if __name__ == "__main__":
    main()
