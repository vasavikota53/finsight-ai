
from pathlib import Path


# Project folders
BASE_DIR = Path(__file__).resolve().parent.parent
EXTRACTED_DIR = BASE_DIR / "extracted_documents"
CHUNKS_DIR = BASE_DIR / "document_chunks"

# Chunk settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Split text into overlapping chunks."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and smaller than chunk_size")

    text = " ".join(text.split())

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])

        if end == len(text):
            break

        start = end - overlap

    return chunks


def process_documents():
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    documents = list(EXTRACTED_DIR.glob("*.txt"))

    if not documents:
        print("No extracted text files found.")
        print(f"Expected folder: {EXTRACTED_DIR}")
        return

    for document in documents:
        text = document.read_text(encoding="utf-8")
        chunks = chunk_text(text)

        output_file = CHUNKS_DIR / f"{document.stem}_chunks.txt"

        with output_file.open("w", encoding="utf-8") as file:
            for index, chunk in enumerate(chunks, start=1):
                file.write(f"\n--- CHUNK {index} ---\n")
                file.write(chunk)
                file.write("\n")

        print(f"Document: {document.name}")
        print(f"Chunks created: {len(chunks)}")
        print(f"Saved to: {output_file}\n")


if __name__ == "__main__":
    process_documents()
