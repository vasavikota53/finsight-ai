"""
PDF Parser module for extracting text and segmenting financial reports.
"""

from pathlib import Path
from typing import Dict, List, Optional
from pypdf import PdfReader


class PDFParser:
    """Extracts text from PDF documents and identifies key financial sections."""

    SECTION_INDICATORS = {
        "auditor_report": [
            "report of independent registered public accounting firm",
            "independent auditor's report",
            "auditor's report",
            "statutory auditor report",
        ],
        "financial_statements": [
            "consolidated balance sheets",
            "consolidated statements of operations",
            "consolidated statements of income",
            "consolidated statements of cash flows",
            "balance sheet",
            "income statement",
            "statement of financial position",
        ],
        "notes": [
            "notes to consolidated financial statements",
            "notes to financial statements",
            "accompanying notes",
        ],
        "mda": [
            "management's discussion and analysis",
            "mda",
            "operating and financial review",
        ],
        "risk_factors": [
            "item 1a. risk factors",
            "risk factors",
            "principal risks",
        ],
    }

    def extract_text_and_sections(self, pdf_path: str | Path) -> Dict[str, str]:
        """Extracts text and segments it into categorized sections."""
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        reader = PdfReader(str(pdf_path))
        if len(reader.pages) == 0:
            raise ValueError(f"PDF file has no pages: {pdf_path}")

        full_pages: List[str] = []
        for i, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            full_pages.append(text)

        full_text = "\n\n".join(full_pages)

        # Segment into sections if identifiable
        sections: Dict[str, str] = {
            "full_text": full_text,
            "auditor_report": "",
            "financial_statements": "",
            "notes": "",
            "mda": "",
            "risk_factors": "",
        }

        # Scan text for section headings
        lower_text = full_text.lower()
        for section_key, keywords in self.SECTION_INDICATORS.items():
            for kw in keywords:
                pos = lower_text.find(kw)
                if pos != -1:
                    # Grab next 8000 characters as section sample
                    sample = full_text[pos : pos + 10000]
                    sections[section_key] = sample
                    break

        return sections
