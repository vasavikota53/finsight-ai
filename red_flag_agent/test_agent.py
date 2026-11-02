import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient
from red_flag_agent.agent import RedFlagAgent
from red_flag_agent.api_service import app
from red_flag_agent.models import FinancialPeriod, SeverityLevel, RiskCategory
from red_flag_agent.report_generator import ReportGenerator
from red_flag_agent.sample_data import TECHCORP_CURRENT, TECHCORP_PRIOR, TECHCORP_AUDIT_TEXT


def test_debt_scanner():
    agent = RedFlagAgent()
    curr = FinancialPeriod(
        total_debt=100000.0,
        stockholders_equity=20000.0,  # D/E = 5.0x (Critical)
        operating_income=5000.0,
        interest_expense=10000.0,     # ICR = 0.5x (Critical)
        short_term_debt=50000.0,
        cash_and_equivalents=10000.0, # ST Debt / Cash = 5.0x (High)
    )
    prev = FinancialPeriod(
        total_debt=50000.0,
        stockholders_equity=30000.0,
    )
    report = agent.scan_financial_periods(curr, prev, company_name="DebtTest")
    assert report.overall_risk_score > 50.0
    assert report.overall_risk_level in ["HIGH", "CRITICAL"]

    debt_flags = [f for f in report.flags if f.category == RiskCategory.DEBT_SOLVENCY]
    assert len(debt_flags) >= 3


def test_margin_scanner():
    agent = RedFlagAgent()
    prev = FinancialPeriod(
        revenue=100000.0,
        cost_of_goods_sold=50000.0, # GM = 50%
        operating_income=20000.0,   # OM = 20%
        operating_expenses=30000.0,
    )
    curr = FinancialPeriod(
        revenue=90000.0,
        cost_of_goods_sold=60000.0, # GM = 33.3% (-16.7 pp drop)
        operating_income=-5000.0,   # OM = -5.5% (Negative operating margin)
        operating_expenses=35000.0,
    )
    report = agent.scan_financial_periods(curr, prev, company_name="MarginTest")
    margin_flags = [f for f in report.flags if f.category == RiskCategory.MARGIN_PROFITABILITY]
    assert len(margin_flags) >= 2


def test_auditor_scanner():
    agent = RedFlagAgent()
    sample_text = """
    We conducted our audit and issued a qualified opinion except for the valuation of obsolete inventory.
    Furthermore, substantial doubt exists about the entity's ability to continue as a going concern.
    Management identified a material weakness in internal control over financial reporting.
    """
    report = agent.scan_text(sample_text, company_name="AuditorTest")
    audit_flags = [f for f in report.flags if f.category == RiskCategory.AUDITOR_QUALIFICATIONS]
    assert len(audit_flags) >= 3
    severities = [f.severity for f in audit_flags]
    assert SeverityLevel.CRITICAL in severities


def test_forensic_scanner():
    agent = RedFlagAgent()
    prev = FinancialPeriod(
        revenue=100000.0,
        accounts_receivable=10000.0,
        cost_of_goods_sold=50000.0,
        inventory=10000.0,
    )
    curr = FinancialPeriod(
        revenue=105000.0,             # Rev +5%
        accounts_receivable=20000.0,  # AR +100% (Beneish DSRI spike)
        cost_of_goods_sold=55000.0,   # COGS +10%
        inventory=25000.0,            # Inv +150% (DIO spike)
        net_income=25000.0,           # Net Income +25K
        operating_cash_flow=-15000.0, # But CFO -15K (Severe divergence)
        total_assets=200000.0,
    )
    report = agent.scan_financial_periods(curr, prev, company_name="ForensicTest")
    forensic_flags = [f for f in report.flags if f.category == RiskCategory.FORENSIC_PATTERNS]
    assert len(forensic_flags) >= 3


def test_report_generator_markdown():
    agent = RedFlagAgent()
    report = agent.scan_hybrid(
        text=TECHCORP_AUDIT_TEXT,
        current=TECHCORP_CURRENT,
        previous=TECHCORP_PRIOR,
        company_name="TechCorp Inc.",
    )
    md = ReportGenerator.to_markdown(report)
    assert "# 🚩 Finsight AI — Red Flag Forensic Audit Report" in md
    assert "TechCorp Inc." in md
    assert "CRITICAL RISK" in md
    assert len(report.flags) > 5


def test_api_endpoints():
    client = TestClient(app)

    # Health
    res = client.get("/api/red-flags/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    # Samples list
    res = client.get("/api/red-flags/samples")
    assert res.status_code == 200
    assert len(res.json()) >= 4

    # Sample scan
    res = client.get("/api/red-flags/sample/techcorp")
    assert res.status_code == 200
    data = res.json()
    assert data["overall_risk_level"] == "CRITICAL"
    assert data["overall_risk_score"] >= 80.0

    # Scan text endpoint
    res = client.post(
        "/api/red-flags/scan-text",
        json={
            "text": "The auditor expressed substantial doubt about the company's ability to continue as a going concern.",
            "company_name": "GoingConcernCo",
        },
    )
    assert res.status_code == 200
    assert res.json()["overall_risk_level"] == "CRITICAL"


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("Running Red Flag Agent Test Suite...")
    test_debt_scanner()
    print("  [OK] Debt Scanner tests passed")
    test_margin_scanner()
    print("  [OK] Margin Scanner tests passed")
    test_auditor_scanner()
    print("  [OK] Auditor Scanner tests passed")
    test_forensic_scanner()
    print("  [OK] Forensic Scanner tests passed")
    test_report_generator_markdown()
    print("  [OK] Report Generator tests passed")
    test_api_endpoints()
    print("  [OK] FastAPI Endpoints tests passed")
    print("\nALL TESTS PASSED SUCCESSFULLY! (6/6)")
