"""
FastAPI Router for Red Flag Forensic Agent.
Can be mounted directly into FastAPI applications without modifying existing routes.
"""

from pathlib import Path
import tempfile
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from .agent import RedFlagAgent
from .models import FinancialPeriod, RedFlagReport
from .sample_data import SAMPLE_CASES

router = APIRouter(prefix="/api/red-flags", tags=["Red Flag Forensic Agent"])
agent = RedFlagAgent()


class ScanTextRequest(BaseModel):
    text: str = Field(min_length=5, description="Financial narrative, audit report, or footnote text")
    company_name: Optional[str] = Field(default="Target Company", description="Target company name")


class ScanMetricsRequest(BaseModel):
    company_name: Optional[str] = Field(default="Target Company")
    current: FinancialPeriod = Field(description="Current reporting period financial figures")
    previous: Optional[FinancialPeriod] = Field(default=None, description="Prior comparative period figures")


class ScanHybridRequest(BaseModel):
    company_name: Optional[str] = Field(default="Target Company")
    text: Optional[str] = Field(default="", description="Narrative disclosures or footnote text")
    current: Optional[FinancialPeriod] = Field(default=None)
    previous: Optional[FinancialPeriod] = Field(default=None)


@router.get("/health")
def red_flag_health():
    """Returns the operational status of the Red Flag Forensic Agent."""
    return {
        "status": "ok",
        "service": "Finsight AI — Red Flag Forensic Agent",
        "version": "1.0.0",
        "scanners": [
            "Debt & Solvency Scanner",
            "Margin & Profitability Compression Scanner",
            "Auditor Qualifications & Governance Scanner",
            "Forensic Accounting & Beneish M-Score Scanner",
            "Statistical & Structural Anomaly Scanner",
        ],
    }


@router.get("/samples")
def list_samples():
    """Lists available realistic corporate benchmark case studies."""
    return [
        {
            "id": key,
            "name": val["name"],
            "company": val["company"],
            "description": val["description"],
        }
        for key, val in SAMPLE_CASES.items()
    ]


@router.get("/sample/{case_id}", response_model=RedFlagReport)
def run_sample_scan(case_id: str):
    """Executes a full forensic scan on a selected benchmark case."""
    if case_id not in SAMPLE_CASES:
        raise HTTPException(
            status_code=404,
            detail=f"Sample case '{case_id}' not found. Available: {list(SAMPLE_CASES.keys())}",
        )
    case = SAMPLE_CASES[case_id]
    report = agent.scan_hybrid(
        text=case["text"],
        current=case["current"],
        previous=case["previous"],
        company_name=case["company"],
        scan_source=f"Benchmark Case: {case['name']}",
    )
    return report


@router.post("/scan-text", response_model=RedFlagReport)
def scan_text_endpoint(req: ScanTextRequest):
    """Scans raw narrative disclosures, notes to financial statements, or auditor reports."""
    report = agent.scan_text(
        text=req.text,
        company_name=req.company_name or "Target Company",
    )
    return report


@router.post("/scan-metrics", response_model=RedFlagReport)
def scan_metrics_endpoint(req: ScanMetricsRequest):
    """Scans structured multi-period financial figures (Income, Balance Sheet, Cash Flow)."""
    report = agent.scan_financial_periods(
        current=req.current,
        previous=req.previous,
        company_name=req.company_name or "Target Company",
    )
    return report


@router.post("/scan-hybrid", response_model=RedFlagReport)
def scan_hybrid_endpoint(req: ScanHybridRequest):
    """Executes consolidated scan across narrative disclosures and quantitative statements."""
    report = agent.scan_hybrid(
        text=req.text or "",
        current=req.current,
        previous=req.previous,
        company_name=req.company_name or "Target Company",
    )
    return report


@router.post("/scan-pdf", response_model=RedFlagReport)
async def scan_pdf_endpoint(
    file: UploadFile = File(...),
    company_name: Optional[str] = Query(default=None),
):
    """Uploads a PDF financial document and automatically scans for all red flags."""
    if not file.filename or Path(file.filename).suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be a PDF document.",
        )

    contents = await file.read()
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid PDF document.",
        )

    # Save to a temporary file for parsing
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = Path(tmp.name)

    try:
        comp = company_name or Path(file.filename).stem.replace("_", " ").title()
        report = agent.scan_document(tmp_path, company_name=comp)
        # Update scan_source to reflect original filename
        report.scan_source = f"Uploaded PDF: {file.filename}"
        return report
    finally:
        tmp_path.unlink(missing_ok=True)
