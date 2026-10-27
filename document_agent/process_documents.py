
from pathlib import Path
from pypdf import PdfReader


# Find the main Finsight project folder
PROJECT_DIR = Path(__file__).resolve().parent.parent

# Input and output folders
INPUT_DIR = PROJECT_DIR / "sample_documents"
OUTPUT_DIR = PROJECT_DIR / "extracted_documents"


def extract_pdf_text(pdf_path: Path) -> None:
    """Extract text from a PDF and save it as a text file."""

    print(f"\nProcessing: {pdf_path.name}")

    try:
        reader = PdfReader(str(pdf_path))

        # Extract text from each page
        extracted_pages = []

        for page_number, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text() or ""
            extracted_pages.append(
                f"\n--- Page {page_number} ---\n{page_text}"
            )

        full_text = "\n".join(extracted_pages)

        # Prepare output file
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_path = OUTPUT_DIR / f"{pdf_path.stem}.txt"

        # Save extracted text
        output_path.write_text(full_text, encoding="utf-8")

        print(f"Pages processed: {len(reader.pages)}")
        print(f"Characters extracted: {len(full_text):,}")
        print(f"Saved to: {output_path}")

        if not full_text.strip():
            print("Warning: No text extracted. This PDF may be scanned.")

        if reader.is_encrypted:
            print("Note: This PDF is encrypted.")

    except Exception as error:
        print(f"Error processing {pdf_path.name}: {error}")


def main() -> None:
    """Process all PDF files in the sample documents folder."""

    if not INPUT_DIR.exists():
        print(f"Input folder not found: {INPUT_DIR}")
        return

    pdf_files = sorted(INPUT_DIR.glob("*.pdf"))

    if not pdf_files:
        print(f"No PDF files found in: {INPUT_DIR}")
        return

    print("FINSIGHT AI - DOCUMENT AGENT")
    print("=" * 40)
    print(f"PDF files found: {len(pdf_files)}")

    for pdf_path in pdf_files:
        extract_pdf_text(pdf_path)

    print("\nDocument processing finished!")


if __name__ == "__main__":
    main()
