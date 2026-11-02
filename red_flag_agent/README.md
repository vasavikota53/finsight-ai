# 🚩 Finsight AI — Red Flag Forensic Agent

An enterprise-grade, automated financial due diligence agent designed to scan corporate annual reports, financial statements, and regulatory filings for critical warning signs, accounting anomalies, solvency stress, and earnings manipulation.

Developed as a core agent role for the **Infosys Internship Project (Finsight AI)**.

---

## 📌 Core Capabilities & Scanners

The Red Flag Agent automatically inspects financial disclosures across **5 forensic pillars**:

### 1. 📉 Rising Debt & Solvency Distress (`DebtScanner`)
- **Debt-to-Equity (D/E) Escalation**: Flags high leverage ($> 1.5\text{x}$) and extreme insolvency risk ($> 2.5\text{x}$ or negative shareholder equity).
- **YoY Debt Accumulation**: Detects aggressive borrowing spikes ($> +30\%$ or $> +60\%$ YoY).
- **Interest Coverage Deterioration**: Evaluates $\text{EBIT} / \text{Interest Expense}$ against distress thresholds ($< 1.5\text{x}$ warning, $< 1.0\text{x}$ default distress).
- **Short-Term Refinancing Squeeze**: Detects when debt maturing within 12 months exceeds liquid cash reserves ($> 2.0\text{x}$).
- **Debt Covenants & Default Disclosures**: Textually flags loan breaches, lender forbearance, and rating downgrades.

### 2. 🔻 Falling Margins & Margin Compression (`MarginScanner`)
- **Gross Margin Contraction**: Flags severe drops ($\ge 200\text{ bps}$ warning, $\ge 500\text{ bps}$ critical) indicating raw material cost spikes or aggressive discounting.
- **Operating Margin Decay**: Tracks core operating profitability drops ($\ge 250\text{ bps}$) and negative operating margins.
- **Negative Operating Leverage**: Detects when operational overhead (OpEx) outpaces revenue growth by $\ge 10\%$.
- **Pricing Pressure & Substantial Operating Losses**: Scans narrative disclosures for structural margin erosion.

### 3. 🔍 Auditor Qualifications & Governance Risks (`AuditorScanner`)
- **Going Concern Warnings**: Identifies "substantial doubt about the entity's ability to continue as a going concern."
- **Modified Audit Opinions**: Detects Qualified Opinions ("except for..."), Adverse Opinions ("do not present fairly"), and Disclaimers of Opinion.
- **Internal Control Deficiencies (ICFR)**: Flags material weaknesses and significant deficiencies under SOX 404.
- **Auditor Resignation / Turnover**: Uncovers auditor resignations, dismissals, or disputes over accounting estimates ("auditor shopping" precursor).
- **Accounting Restatements & Error Corrections**: Flags corrections of prior period financial statements.
- **Emphasis of Matter**: Pinpoints significant litigation, valuation uncertainties, or regulatory actions.

### 4. 🕵️ Unusual Financial Patterns & Forensic Signals (`ForensicScanner`)
- **Earnings Quality & Accrual Divergence**: Flags companies reporting positive Net Income while burning Operating Cash Flow ($\text{CFO} < 0$).
- **Beneish M-Score Indicators**:
  - **DSRI (Days Sales in Receivables Index)**: Identifies accounts receivable outpacing sales ($\text{DSRI} > 1.20$ or DSO spikes $> 15\text{ days}$), signaling channel stuffing or premature revenue recognition.
  - **TATA (Total Accruals to Total Assets)**: Detects heavy reliance on non-cash accounting accruals ($> 0.07$).
- **Inventory Buildup (DIO)**: Detects inventory expansion outstripping sales, signaling inventory obsolescence or unrecorded write-downs.
- **Related-Party Transactions**: Flags insider loans, director dealings, and off-balance-sheet entities.
- **Accounting Estimate Tampering**: Flags discretionary extensions of asset useful lives or changes in depreciation schedules.

### 5. 📊 Statistical & Structural Anomalies (`AnomalyScanner`)
- **Balance Sheet Identity Validation**: Checks $\text{Total Assets} = \text{Total Liabilities} + \text{Equity}$.
- **Severe Cash Burn**: Flags sudden drops in cash reserves ($> 50\%$ YoY).
- **Formal Regulatory Investigations**: Detects active SEC subpoenas, DOJ probes, and whistleblower complaints.
- **Abrupt Executive Departures**: Flags unexpected resignations of CFOs or Chief Accounting Officers.

---

## 🏗️ Architecture

```
red_flag_agent/
├── __init__.py               # Package exports (RedFlagAgent, models)
├── agent.py                  # Core orchestrator uniting all scanners & metric extractors
├── config.py                 # Calibrated forensic thresholds, weights, and regex rules
├── models.py                 # Pydantic schemas (RedFlagItem, FinancialPeriod, RedFlagReport)
├── report_generator.py       # Professional Markdown audit report generator
├── cli.py                    # Interactive terminal runner and benchmark tester
├── router.py                 # FastAPI router for plug-and-play API integration
├── api_service.py            # Standalone FastAPI service
├── sample_data.py            # Realistic corporate test cases (TechCorp, RetailChain, Apex, BioPharma)
├── test_agent.py             # Complete test suite (6/6 tests passing)
├── parsers/
│   ├── __init__.py
│   ├── pdf_parser.py         # Multi-page PDF text extraction and section segmentation
│   └── metric_extractor.py   # Regex extraction of financial lines ($ / commas / negatives / scale)
└── scanners/
    ├── __init__.py
    ├── debt_scanner.py       # Solvency, leverage, and covenant scanner
    ├── margin_scanner.py     # Margin compression & operating leverage scanner
    ├── auditor_scanner.py    # Auditor qualifications & governance scanner
    ├── forensic_scanner.py   # Beneish indicators, DSO/DIO, earnings quality scanner
    └── anomaly_scanner.py    # Statistical jumps, cash burns, and regulatory probes
```

---

## 🚀 Quickstart & Usage

### 1. Interactive Terminal Mode
Run the interactive console to test sample cases, inspect custom disclosures, or scan documents:

```powershell
python -m red_flag_agent.cli
```

### 2. Run Direct Benchmark Scans
Test against realistic corporate scenarios:

```powershell
# Case 1: High Debt Distress & Solvency Crisis (Score: 100/100, CRITICAL)
python -m red_flag_agent.cli --sample techcorp

# Case 2: Forensic Earnings Manipulation & ICFR Weakness (Score: 78/100, CRITICAL)
python -m red_flag_agent.cli --sample retailchain

# Case 3: Clean Blue-Chip Corporation (Score: 0/100, LOW RISK)
python -m red_flag_agent.cli --sample apex

# Case 4: SEC Regulatory Probe & Auditor Resignation (Score: 65/100, CRITICAL)
python -m red_flag_agent.cli --sample biopharma
```

### 3. Scan a PDF Financial Report
```powershell
python -m red_flag_agent.cli --pdf "path/to/annual_report.pdf" --company "Acme Corp"
```

### 4. Export Audit Report as Markdown
```powershell
python -m red_flag_agent.cli --sample techcorp --output "techcorp_audit_report.md"
```

### 5. Run as Standalone REST API
Start the FastAPI server:

```powershell
python red_flag_agent/api_service.py
```
Default URL: `http://127.0.0.1:8001`  
Interactive Swagger Docs: `http://127.0.0.1:8001/docs`

Available Endpoints:
- `POST /api/red-flags/scan-text`: Ingest raw text or financial excerpt
- `POST /api/red-flags/scan-pdf`: Upload PDF file and audit automatically
- `POST /api/red-flags/scan-metrics`: Ingest multi-period financial figures
- `POST /api/red-flags/scan-hybrid`: Combined text + structured data scan
- `GET /api/red-flags/samples`: List all built-in benchmark cases
- `GET /api/red-flags/sample/{case_id}`: Run scan on a benchmark case
- `GET /api/red-flags/health`: Operational status

### 6. Python Code Integration
```python
from red_flag_agent import RedFlagAgent, FinancialPeriod

agent = RedFlagAgent()

# Scan structured financial statements
current = FinancialPeriod(
    period_name="FY2024",
    revenue=100000000.0,
    cost_of_goods_sold=70000000.0,
    operating_income=-5000000.0,
    total_debt=80000000.0,
    stockholders_equity=15000000.0,
    operating_cash_flow=-8000000.0,
    net_income=-12000000.0,
)

report = agent.scan_financial_periods(current=current, company_name="TestCorp")
print(f"Risk Score: {report.overall_risk_score} / 100")
print(f"Risk Level: {report.overall_risk_level}")
for flag in report.flags:
    print(f"- [{flag.severity.value}] {flag.title}")
```

### 7. Run Test Suite
```powershell
python red_flag_agent/test_agent.py
```
Output:
```
Running Red Flag Agent Test Suite...
  [OK] Debt Scanner tests passed
  [OK] Margin Scanner tests passed
  [OK] Auditor Scanner tests passed
  [OK] Forensic Scanner tests passed
  [OK] Report Generator tests passed
  [OK] FastAPI Endpoints tests passed

ALL TESTS PASSED SUCCESSFULLY! (6/6)
```

---

## 👥 Project Information
- **Project Name:** Finsight AI
- **Assigned Module:** Red Flag Agent
- **Target Internship:** Infosys Internship
