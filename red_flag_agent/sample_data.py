"""
Sample Corporate Datasets & Realistic Case Studies for Red Flag Agent.
Provides multi-period financial statements and real-world audit disclosures
for benchmarking and demonstrating the Red Flag Agent in internship reviews.
"""

from .models import FinancialPeriod

# ==============================================================================
# CASE 1: SOLVENCY & MARGIN DISTRESS (TechCorp Inc.)
# Features: Exploding debt (+88%), collapsing gross & operating margins,
# negative shareholder equity, interest coverage failing (<1.0x), going concern note.
# ==============================================================================
TECHCORP_PRIOR = FinancialPeriod(
    period_name="FY2023",
    revenue=120000000.0,
    cost_of_goods_sold=72000000.0,
    gross_profit=48000000.0,
    operating_expenses=32000000.0,
    operating_income=16000000.0,
    interest_expense=4000000.0,
    net_income=9500000.0,
    operating_cash_flow=14000000.0,
    total_assets=150000000.0,
    cash_and_equivalents=28000000.0,
    accounts_receivable=15000000.0,
    inventory=18000000.0,
    total_debt=45000000.0,
    short_term_debt=8000000.0,
    long_term_debt=37000000.0,
    total_liabilities=85000000.0,
    stockholders_equity=65000000.0,
)

TECHCORP_CURRENT = FinancialPeriod(
    period_name="FY2024",
    revenue=110000000.0,             # Top-line decline (-8.3%)
    cost_of_goods_sold=77000000.0,   # COGS increased (Gross margin: 40% -> 30%)
    gross_profit=33000000.0,
    operating_expenses=42000000.0,   # OpEx surged (Negative operating leverage)
    operating_income=-9000000.0,     # Operating Loss (-8.2% margin)
    interest_expense=12500000.0,     # Interest surged (ICR = -0.72x)
    net_income=-24000000.0,
    operating_cash_flow=-16000000.0, # Negative CFO
    total_assets=135000000.0,
    cash_and_equivalents=6500000.0,  # Cash drained from 28M to 6.5M (-76.8%)
    accounts_receivable=22000000.0,  # Receivables grew despite falling sales
    inventory=25000000.0,
    total_debt=85000000.0,           # Total debt exploded from 45M to 85M (+88.8%)
    short_term_debt=24000000.0,      # Short-term debt (24M) dwarfs cash (6.5M)
    long_term_debt=61000000.0,
    total_liabilities=145000000.0,
    stockholders_equity=-10000000.0, # Negative equity (Liabilities > Assets)
)

TECHCORP_AUDIT_TEXT = """
REPORT OF INDEPENDENT REGISTERED PUBLIC ACCOUNTING FIRM
To the Shareholders and the Board of Directors of TechCorp Inc.:

Opinion on the Consolidated Financial Statements
We have audited the accompanying consolidated balance sheets of TechCorp Inc. (the "Company")
as of December 31, 2024 and 2023. In our opinion, the consolidated financial statements present fairly,
in all material respects, the financial position of the Company.

Substantial Doubt About the Entity's Ability to Continue as a Going Concern
The accompanying consolidated financial statements have been prepared assuming that the Company will continue
as a going concern. As discussed in Note 2 to the consolidated financial statements, the Company has incurred
substantial operating losses and negative cash flows from operations of $16.0 million during the year ended
December 31, 2024, and has significant debt maturities of $24.0 million due within the next twelve months that
exceed available cash reserves. These matters raise substantial doubt about the Company's ability to continue
as a going concern. Management's plans in regard to these matters are also described in Note 2.

Covenant Compliance and Borrowing Facilities
As detailed in Note 8 (Debt Obligations), the Company was in breach of debt covenants under its Senior Revolving
Credit Facility regarding minimum interest coverage ratios as of December 31, 2024. While the lenders have entered
into a temporary forbearance agreement through March 31, 2025, default on indebtedness may occur if long-term
recapitalization terms are not concluded.
"""

# ==============================================================================
# CASE 2: FORENSIC PATTERNS & REVENUE MANIPULATION (RetailChain Ltd.)
# Features: Beneish DSRI anomaly (Receivables up +55% on 5% sales),
# Net Income positive but CFO strongly negative, Material Weakness in ICFR,
# Related-party loan to CEO.
# ==============================================================================
RETAILCHAIN_PRIOR = FinancialPeriod(
    period_name="FY2023",
    revenue=500000000.0,
    cost_of_goods_sold=325000000.0,
    gross_profit=175000000.0,
    operating_expenses=120000000.0,
    operating_income=55000000.0,
    interest_expense=8000000.0,
    net_income=38000000.0,
    operating_cash_flow=42000000.0,
    total_assets=450000000.0,
    cash_and_equivalents=55000000.0,
    accounts_receivable=48000000.0,
    inventory=62000000.0,
    total_debt=90000000.0,
    stockholders_equity=240000000.0,
)

RETAILCHAIN_CURRENT = FinancialPeriod(
    period_name="FY2024",
    revenue=525000000.0,             # Modest 5% revenue increase
    cost_of_goods_sold=360000000.0,  # Gross margin down to 31.4%
    gross_profit=165000000.0,
    operating_expenses=115000000.0,
    operating_income=50000000.0,
    interest_expense=10000000.0,
    net_income=32000000.0,           # Reported positive net income of $32M!
    operating_cash_flow=-18000000.0, # But operating cash flow is -$18M (Severe divergence!)
    total_assets=510000000.0,
    cash_and_equivalents=22000000.0,
    accounts_receivable=78000000.0,  # AR surged +62.5%! (Channel stuffing)
    inventory=94000000.0,            # Inventory surged +51.6%! (Unsold stock)
    total_debt=130000000.0,
    stockholders_equity=255000000.0,
)

RETAILCHAIN_AUDIT_TEXT = """
INDEPENDENT AUDITOR'S REPORT
To the Board of Directors and Stockholders of RetailChain Ltd.:

Report on Internal Control Over Financial Reporting
We have audited RetailChain Ltd.'s internal control over financial reporting as of December 31, 2024.
In our opinion, the Company did not maintain, in all material respects, effective internal control over financial reporting
as of December 31, 2024, due to the presence of material weaknesses in internal control identified in the revenue
recognition process and cut-off accounting at regional fulfillment centers. Specifically, controls over bill-and-hold
arrangements and quarter-end sales returns were ineffective.

Related-Party Disclosures
During fiscal 2024, as disclosed in Note 16, the Company extended unsecured loans to officers amounting to $12.5 million,
primarily to an entity controlled by the Chief Executive Officer, for commercial property acquisitions.
"""

# ==============================================================================
# CASE 3: HEALTHY BLUE-CHIP CORPORATION (Apex Industrial)
# Features: Pristine ratios, expanding margins, cash flow tracks earnings, clean audit.
# ==============================================================================
APEX_PRIOR = FinancialPeriod(
    period_name="FY2023",
    revenue=850000000.0,
    cost_of_goods_sold=467500000.0,
    gross_profit=382500000.0,
    operating_income=187000000.0,
    interest_expense=9500000.0,
    net_income=138000000.0,
    operating_cash_flow=165000000.0,
    total_assets=920000000.0,
    cash_and_equivalents=140000000.0,
    accounts_receivable=72000000.0,
    inventory=58000000.0,
    total_debt=110000000.0,
    short_term_debt=15000000.0,
    stockholders_equity=620000000.0,
)

APEX_CURRENT = FinancialPeriod(
    period_name="FY2024",
    revenue=960000000.0,             # +12.9% revenue growth
    cost_of_goods_sold=508800000.0,
    gross_profit=451200000.0,        # Gross margin improved to 47.0%
    operating_income=225000000.0,    # Operating margin: 23.4%
    interest_expense=8200000.0,      # Interest coverage: 27.4x
    net_income=168000000.0,
    operating_cash_flow=195000000.0, # Robust cash generation (1.16x Net Income)
    total_assets=1050000000.0,
    cash_and_equivalents=185000000.0,# Cash buffer expanding
    accounts_receivable=79000000.0,  # DSO steady at 30 days
    inventory=61000000.0,
    total_debt=95000000.0,           # Debt reduced (-13.6%)
    short_term_debt=12000000.0,
    stockholders_equity=740000000.0, # D/E low at 0.13x
)

APEX_AUDIT_TEXT = """
REPORT OF INDEPENDENT REGISTERED PUBLIC ACCOUNTING FIRM
To the Shareholders of Apex Industrial:

Opinion on the Financial Statements
We have audited the accompanying consolidated balance sheets of Apex Industrial as of December 31, 2024 and 2023,
and the related consolidated statements of income, comprehensive income, and cash flows.
In our opinion, the consolidated financial statements present fairly, in all material respects,
the financial position of the Company in conformity with U.S. generally accepted accounting principles.
We also have audited the Company's internal control over financial reporting and express an unqualified opinion thereon.
"""

# ==============================================================================
# CASE 4: REGULATORY PROBES & GOVERNANCE CRISIS (BioPharma Global)
# Features: SEC investigation, whistleblower complaint, auditor resignation,
# severe cash drain (-74%).
# ==============================================================================
BIOPHARMA_TEXT = """
Item 3. Legal Proceedings and Regulatory Inquiries
On November 14, 2024, the Company received a formal order of investigation and SEC subpoena from the Division
of Enforcement regarding revenue recognition practices and clinical milestone accounting for our lead oncology compound.
Concurrently, the Audit Committee initiated an internal investigation conducted by independent counsel following
whistleblower allegations regarding irregularities in channel inventory bookings.

Item 4.01 Changes in Certifying Accountant
On December 5, 2024, our independent registered public accounting firm resigned as the Company's certifying accountant.
During the two most recent fiscal years, there were disagreements with the former accountant concerning revenue
recognition timing and the valuation of goodwill.

Financial Highlights (in thousands)
Total Revenues: $45,000
Cost of Goods Sold: $38,000
Operating Expenses: $62,000
Operating Loss: ($55,000)
Cash and Cash Equivalents: $12,000 (down from $48,000 in the prior year)
Total Debt: $75,000
Short-Term Debt: $32,000
"""

SAMPLE_CASES = {
    "techcorp": {
        "name": "TechCorp Inc. (Debt & Solvency Distress)",
        "company": "TechCorp Inc.",
        "current": TECHCORP_CURRENT,
        "previous": TECHCORP_PRIOR,
        "text": TECHCORP_AUDIT_TEXT,
        "description": "High leverage (D/E negative), falling margins, interest coverage crisis, going concern warning.",
    },
    "retailchain": {
        "name": "RetailChain Ltd. (Forensic Earnings Manipulation)",
        "company": "RetailChain Ltd.",
        "current": RETAILCHAIN_CURRENT,
        "previous": RETAILCHAIN_PRIOR,
        "text": RETAILCHAIN_AUDIT_TEXT,
        "description": "Beneish DSRI/receivables anomaly, positive net income vs negative CFO, material weakness in ICFR.",
    },
    "apex": {
        "name": "Apex Industrial (Clean Blue-Chip Benchmark)",
        "company": "Apex Industrial",
        "current": APEX_CURRENT,
        "previous": APEX_PRIOR,
        "text": APEX_AUDIT_TEXT,
        "description": "Healthy margins, low debt, pristine cash conversion, unmodified clean audit opinion.",
    },
    "biopharma": {
        "name": "BioPharma Global (Regulatory Probe & Auditor Resignation)",
        "company": "BioPharma Global",
        "current": None,
        "previous": None,
        "text": BIOPHARMA_TEXT,
        "description": "SEC subpoena, whistleblower inquiry, auditor resignation, severe cash drain.",
    },
}
