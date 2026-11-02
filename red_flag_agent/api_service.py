"""
Standalone FastAPI Service for Red Flag Agent.
Can be run independently via:
    python -m uvicorn red_flag_agent.api_service:app --port 8001 --reload
"""

import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from red_flag_agent.router import router as red_flag_router

app = FastAPI(
    title="Finsight AI — Red Flag Forensic Agent API",
    description="Automated financial anomaly detection, debt distress analysis, margin erosion monitoring, and auditor qualifications audit engine.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(red_flag_router)


@app.get("/")
def root():
    return {
        "service": "Finsight AI — Red Flag Forensic Agent API",
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "health": "/api/red-flags/health",
            "samples": "/api/red-flags/samples",
            "scan_sample": "/api/red-flags/sample/{case_id}",
            "scan_text": "/api/red-flags/scan-text",
            "scan_metrics": "/api/red-flags/scan-metrics",
            "scan_hybrid": "/api/red-flags/scan-hybrid",
            "scan_pdf": "/api/red-flags/scan-pdf",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("red_flag_agent.api_service:app", host="127.0.0.1", port=8001, reload=True)
