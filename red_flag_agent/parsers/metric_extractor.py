"""
Financial Metric Extractor.
Extracts numerical financial line items from unstructured text or statements
using domain-specific financial regex patterns, accounting terminology, and unit scalers.
"""

import re
from typing import Dict, Optional, Tuple
from ..models import FinancialPeriod


class MetricExtractor:
    """Parses text for quantitative financial statement lines."""

    # Regex patterns for line items
    PATTERNS = {
        "revenue": [
            r"(?:total\s+(?:net\s+)?(?:revenues?|sales)|revenue)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
            r"net\s+sales\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "cost_of_goods_sold": [
            r"(?:cost\s+of\s+(?:goods\s+sold|sales|revenues?)|cogs)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "gross_profit": [
            r"gross\s+(?:profit|margin)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "operating_expenses": [
            r"total\s+operating\s+expenses\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
            r"operating\s+expenses\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "operating_income": [
            r"(?:operating\s+income|operating\s+profit|operating\s+loss|ebit)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
            r"income\s+(?:loss\s+)?from\s+operations\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "interest_expense": [
            r"(?:interest\s+expense|finance\s+costs?|interest\s+and\s+debt\s+expense)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "net_income": [
            r"(?:net\s+income|net\s+profit|net\s+loss|profit\s+after\s+tax|net\s+earnings)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "operating_cash_flow": [
            r"(?:net\s+cash\s+(?:provided\s+by|from)\s+operating\s+activities|operating\s+cash\s+flow|cash\s+from\s+operations)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "total_assets": [
            r"total\s+assets\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "current_assets": [
            r"total\s+current\s+assets\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "cash_and_equivalents": [
            r"(?:cash\s+and\s+cash\s+equivalents|cash\s+and\s+marketable\s+securities)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "accounts_receivable": [
            r"(?:accounts\s+receivable(?:,\s*net)?|trade\s+receivables?)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "inventory": [
            r"(?:inventories|total\s+inventor(?:y|ies))\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "total_debt": [
            r"(?:total\s+debt|total\s+borrowings)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "short_term_debt": [
            r"(?:short[- ]term\s+debt|current\s+portion\s+of\s+long[- ]term\s+debt|current\s+borrowings)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "long_term_debt": [
            r"(?:long[- ]term\s+debt(?:,\s*less\s+current\s+portion)?|long[- ]term\s+borrowings)\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "stockholders_equity": [
            r"total\s+(?:stockholders['’]?|shareholders['’]?|equity)\s+equity\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
            r"shareholders['’]?\s+funds\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
        "total_liabilities": [
            r"total\s+liabilities\s*[:\-\—]?\s*[\$€£₹]?\s*([\(\-]?[\d,]+(?:\.\d+)?[\)]?)",
        ],
    }

    def _parse_number(self, raw_str: str) -> Optional[float]:
        """Converts strings like '(1,234.5)' or '54,321' into float."""
        clean = raw_str.strip()
        is_negative = False
        if clean.startswith("(") and clean.endswith(")"):
            is_negative = True
            clean = clean[1:-1]
        elif clean.startswith("-"):
            is_negative = True
            clean = clean[1:]

        clean = clean.replace(",", "").replace("$", "").replace("€", "").replace("₹", "").strip()
        try:
            val = float(clean)
            return -val if is_negative else val
        except ValueError:
            return None

    def _detect_scale(self, text: str) -> float:
        """Determines if numbers are expressed in millions, billions, or thousands."""
        lower = text.lower()
        if "in millions" in lower or "(millions)" in lower or "$ in millions" in lower:
            return 1_000_000.0
        elif "in billions" in lower or "(billions)" in lower or "$ in billions" in lower:
            return 1_000_000_000.0
        elif "in thousands" in lower or "(thousands)" in lower or "$ in thousands" in lower:
            return 1_000.0
        return 1.0

    def extract_period(self, text: str, period_name: str = "Extracted") -> FinancialPeriod:
        """Extracts financial metrics from a block of text or statement table."""
        values: Dict[str, float] = {}

        for metric_name, regex_list in self.PATTERNS.items():
            for pattern in regex_list:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    parsed = self._parse_number(match.group(1))
                    if parsed is not None:
                        # If the matched line explicitly mentions 'loss', make sure it's negative
                        matched_full = match.group(0).lower()
                        if "loss" in matched_full and parsed > 0:
                            parsed = -parsed
                        values[metric_name] = parsed
                        break

        # If gross profit is missing but rev and cogs found
        if "gross_profit" not in values and "revenue" in values and "cost_of_goods_sold" in values:
            values["gross_profit"] = values["revenue"] - values["cost_of_goods_sold"]

        # If total debt missing but short and long debt found
        if "total_debt" not in values:
            s_debt = values.get("short_term_debt", 0.0)
            l_debt = values.get("long_term_debt", 0.0)
            if s_debt > 0 or l_debt > 0:
                values["total_debt"] = s_debt + l_debt

        return FinancialPeriod(period_name=period_name, **values)
