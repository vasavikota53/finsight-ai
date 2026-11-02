"""
Configuration and forensic thresholds for the Red Flag Agent.
Calibrated according to standard corporate finance, GAAP/IFRS forensics,
and academic models (Beneish M-Score, Altman Z-Score factors).
"""

# Risk weight scoring matrix (points per severity level)
SEVERITY_WEIGHTS = {
    "CRITICAL": 25,
    "HIGH": 15,
    "MEDIUM": 8,
    "LOW": 3,
    "INFO": 0,
}

# Overall Risk Score Classification
RISK_LEVEL_THRESHOLDS = {
    "CRITICAL": 60.0,
    "HIGH": 35.0,
    "MODERATE": 15.0,
    "LOW": 0.0,
}

# ----------------------------------------------------
# 1. DEBT & SOLVENCY THRESHOLDS
# ----------------------------------------------------
DEBT_CONFIG = {
    # Debt-to-Equity (D/E)
    "de_ratio_warning": 1.5,
    "de_ratio_critical": 2.5,
    "de_ratio_yoy_growth_warning_pct": 25.0,
    "de_ratio_yoy_growth_critical_pct": 50.0,

    # Debt-to-Assets
    "debt_to_assets_warning": 0.50,
    "debt_to_assets_critical": 0.75,

    # Interest Coverage Ratio (EBIT / Interest Expense)
    "interest_coverage_warning": 3.0,
    "interest_coverage_critical": 1.5,
    "interest_coverage_distress": 1.0,

    # Total Debt YoY Growth
    "total_debt_yoy_surge_pct": 30.0,
    "total_debt_yoy_critical_pct": 60.0,

    # Refinancing & Liquidity
    "short_term_debt_to_cash_warning": 1.0,
    "short_term_debt_to_cash_critical": 2.0,
    "current_ratio_warning": 1.2,
    "current_ratio_critical": 0.9,
    "quick_ratio_warning": 0.8,
    "quick_ratio_critical": 0.5,
}

# ----------------------------------------------------
# 2. MARGIN & PROFITABILITY THRESHOLDS
# ----------------------------------------------------
MARGIN_CONFIG = {
    # Percentage points drop YoY (e.g. 5.0 = 500 bps)
    "gross_margin_drop_warning_pts": 2.0,
    "gross_margin_drop_critical_pts": 5.0,

    "operating_margin_drop_warning_pts": 2.5,
    "operating_margin_drop_critical_pts": 5.0,

    "net_margin_drop_warning_pts": 3.0,
    "net_margin_drop_critical_pts": 7.0,

    # Negative Operating Leverage
    # Spread between opex growth % and revenue growth %
    "negative_operating_leverage_spread_pct": 10.0,

    # Operating margin absolute levels
    "operating_margin_negative": 0.0,
}

# ----------------------------------------------------
# 3. FORENSIC PATTERNS & BENEISH M-SCORE INDICATORS
# ----------------------------------------------------
FORENSIC_CONFIG = {
    # Days Sales Outstanding (DSO) & Receivables growth vs Revenue growth
    "dso_warning_days": 75.0,
    "dso_yoy_increase_warning_days": 15.0,
    "receivables_growth_excess_warning_pct": 15.0,  # Rec growth - Rev growth > 15%
    "beneish_dsri_warning": 1.20,                   # Days Sales in Receivables Index

    # Days Inventory Outstanding (DIO) & Inventory buildup
    "dio_warning_days": 90.0,
    "dio_yoy_increase_warning_days": 20.0,
    "inventory_growth_excess_warning_pct": 15.0,   # Inv growth - Sales growth > 15%

    # Quality of Earnings / Accruals
    # Operating Cash Flow (CFO) vs Net Income
    "ocf_to_net_income_warning": 0.80,             # CFO should generally track or exceed Net Income
    "ocf_to_net_income_critical": 0.40,
    "beneish_tata_warning": 0.07,                  # Total Accruals to Total Assets

    # Gross Margin Index (GMI)
    "beneish_gmi_warning": 1.15,                   # Prior Gross Margin / Current Gross Margin

    # Asset Quality Index (AQI)
    "beneish_aqi_warning": 1.25,

    # Sales Growth Index (SGI)
    "beneish_sgi_warning": 1.50,                   # Hypergrowth often precedes accounting strain
}

# ----------------------------------------------------
# 4. AUDITOR QUALIFICATIONS & GOVERNANCE KEYWORDS
# ----------------------------------------------------
AUDITOR_PATTERNS = {
    "going_concern": [
        r"\bsubstantial doubt\b",
        r"\bcontinue as a going concern\b",
        r"\bgoing concern\b",
        r"\bability to continue as a going concern\b",
        r"\bliquidity deficiency\b",
        r"\bmaterial uncertainty related to going concern\b",
    ],
    "adverse_opinion": [
        r"\badverse opinion\b",
        r"\bdo not present fairly\b",
        r"\bnot present fairly\b",
    ],
    "disclaimer_of_opinion": [
        r"\bdisclaimer of opinion\b",
        r"\bdo not express an opinion\b",
        r"\bunable to obtain sufficient appropriate audit evidence\b",
    ],
    "qualified_opinion": [
        r"\bqualified opinion\b",
        r"\bexcept for the effects\b",
        r"\bexcept for the possible effects\b",
        r"\bwith the exception of\b",
    ],
    "material_weakness": [
        r"\bmaterial weakness(es)? in internal control\b",
        r"\bineffective internal control over financial reporting\b",
        r"\bdeficiency in internal control\b",
        r"\bmaterial weakness identified\b",
        r"\bsignificant deficiency\b",
    ],
    "auditor_resignation_change": [
        r"\bauditor (?:has )?resigned\b",
        r"\b(?:accounting\s+firm|auditor|auditing\s+firm|accountant)\s+resigned\b",
        r"\bresignation of independent registered\b",
        r"\bresigned as (?:the )?(?:company['’]?s )?certifying accountant\b",
        r"\bdismissal of (?:independent|auditor)\b",
        r"\bdisagreements? with (?:the )?(?:former )?accountant\b",
        r"\bchanges? in certifying accountant\b",
    ],
    "restatements_errors": [
        r"\brestatement of (?:previously issued|financial statements)\b",
        r"\bpreviously issued financial statements should no longer be relied upon\b",
        r"\bcorrection of (?:an? )?error\b",
        r"\bmaterial misstatement\b",
    ],
    "emphasis_of_matter": [
        r"\bemphasis of matter\b",
        r"\bwe draw attention to note\b",
        r"\bsignificant regulatory investigation\b",
        r"\bmaterial litigation\b",
        r"\bsubstantial contingency\b",
    ],
}
