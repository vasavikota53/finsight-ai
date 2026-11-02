"""
Data models and schemas for the Red Flag Agent.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class RiskCategory(str, Enum):
    DEBT_SOLVENCY = "Rising Debt & Solvency Distress"
    MARGIN_PROFITABILITY = "Falling Margins & Margin Compression"
    AUDITOR_QUALIFICATIONS = "Auditor Qualifications & Governance Risks"
    FORENSIC_PATTERNS = "Unusual Financial Patterns & Forensic Signals"
    STATISTICAL_ANOMALIES = "Statistical Anomalies & Trend Breaches"


class RedFlagItem(BaseModel):
    """Represents an individual detected financial red flag."""

    id: str = Field(description="Unique identifier for the flag, e.g. RF-DEBT-01")
    category: RiskCategory = Field(description="Core risk category")
    severity: SeverityLevel = Field(description="Severity classification")
    title: str = Field(description="Short human-readable summary")
    description: str = Field(description="Detailed explanation of the issue")
    metric_name: Optional[str] = Field(default=None, description="Relevant financial metric name")
    current_value: Optional[Any] = Field(default=None, description="Current value or status")
    previous_value: Optional[Any] = Field(default=None, description="Previous period value if comparative")
    change_percent: Optional[float] = Field(default=None, description="Percentage change YoY/QoQ")
    threshold_breached: Optional[str] = Field(default=None, description="Criteria or threshold violated")
    evidence: Optional[str] = Field(default=None, description="Text excerpt, citation or calculation details")
    implications: str = Field(description="Financial or governance risks if left unaddressed")
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommended forensic or auditing next steps for analysts",
    )


class FinancialPeriod(BaseModel):
    """Structured financial metrics for a single reporting period (annual or quarterly)."""

    period_name: str = Field(default="Current", description="e.g. FY2024, FY2023, Q3 2024")
    revenue: Optional[float] = Field(default=None, description="Total revenue / sales")
    cost_of_goods_sold: Optional[float] = Field(default=None, description="Cost of goods sold / COGS")
    gross_profit: Optional[float] = Field(default=None, description="Gross profit")
    operating_expenses: Optional[float] = Field(default=None, description="SG&A and other OpEx")
    operating_income: Optional[float] = Field(default=None, description="EBIT / Operating income")
    ebitda: Optional[float] = Field(default=None, description="EBITDA")
    interest_expense: Optional[float] = Field(default=None, description="Interest expense")
    net_income: Optional[float] = Field(default=None, description="Net income / profit after tax")
    operating_cash_flow: Optional[float] = Field(default=None, description="Cash flow from operating activities (CFO)")
    capital_expenditures: Optional[float] = Field(default=None, description="CapEx")
    total_assets: Optional[float] = Field(default=None, description="Total balance sheet assets")
    current_assets: Optional[float] = Field(default=None, description="Current assets")
    cash_and_equivalents: Optional[float] = Field(default=None, description="Cash & marketable securities")
    accounts_receivable: Optional[float] = Field(default=None, description="Trade receivables")
    inventory: Optional[float] = Field(default=None, description="Total inventory")
    total_liabilities: Optional[float] = Field(default=None, description="Total liabilities")
    current_liabilities: Optional[float] = Field(default=None, description="Current liabilities")
    short_term_debt: Optional[float] = Field(default=None, description="Short term debt / current portion of debt")
    long_term_debt: Optional[float] = Field(default=None, description="Long-term borrowings")
    total_debt: Optional[float] = Field(default=None, description="Short-term + Long-term debt")
    stockholders_equity: Optional[float] = Field(default=None, description="Shareholders equity / book value")
    depreciation_amortization: Optional[float] = Field(default=None, description="D&A")


class RatiosSummary(BaseModel):
    """Calculated financial ratios and forensic scores."""

    debt_to_equity: Optional[float] = None
    debt_to_assets: Optional[float] = None
    interest_coverage: Optional[float] = None
    gross_margin_pct: Optional[float] = None
    operating_margin_pct: Optional[float] = None
    net_margin_pct: Optional[float] = None
    days_sales_outstanding: Optional[float] = None
    days_inventory_outstanding: Optional[float] = None
    operating_cash_flow_to_net_income: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    beneish_dsri: Optional[float] = None
    beneish_gmi: Optional[float] = None
    beneish_aqi: Optional[float] = None
    beneish_sgi: Optional[float] = None
    beneish_tata: Optional[float] = None


class RedFlagReport(BaseModel):
    """Consolidated forensic report produced by Red Flag Agent."""

    company_name: str
    analyzed_at: str
    scan_source: str
    overall_risk_score: float = Field(
        ge=0.0,
        le=100.0,
        description="Comprehensive forensic risk score from 0 (pristine) to 100 (critical distress/fraud risk)",
    )
    overall_risk_level: str = Field(description="LOW, MODERATE, HIGH, or CRITICAL")
    flags_count_by_severity: Dict[str, int] = Field(default_factory=dict)
    flags_count_by_category: Dict[str, int] = Field(default_factory=dict)
    total_flags: int = 0
    flags: List[RedFlagItem] = Field(default_factory=list)
    ratios: Optional[RatiosSummary] = None
    extracted_metrics: Optional[Dict[str, Any]] = None
    executive_summary: str
    key_takeaways: List[str] = Field(default_factory=list)
