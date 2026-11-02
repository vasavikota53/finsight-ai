"""
Red Flag Agent Package for Finsight AI.
Scans for financial anomalies, rising debt levels, falling margins,
auditor qualifications, and unusual financial patterns automatically.
"""

from .agent import RedFlagAgent
from .models import (
    RedFlagItem,
    RedFlagReport,
    FinancialPeriod,
    SeverityLevel,
    RiskCategory,
)

__all__ = [
    "RedFlagAgent",
    "RedFlagReport",
    "RedFlagItem",
    "FinancialPeriod",
    "SeverityLevel",
    "RiskCategory",
]
