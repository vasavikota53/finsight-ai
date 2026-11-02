"""
Margin & Profitability Scanner.
Scans for falling margins, gross margin compression, operating margin decline,
negative operating leverage, and cost of goods sold (COGS) escalation.
"""

import re
from typing import List, Optional
from ..models import RedFlagItem, SeverityLevel, RiskCategory, FinancialPeriod
from ..config import MARGIN_CONFIG


class MarginScanner:
    """Detects profitability decay, margin erosion, and operational cost pressures."""

    TEXT_PATTERNS = [
        (
            r"\b(?:severe|significant|continued)\s+(?:margin\s+compression|erosion\s+of\s+margins?|contraction\s+in\s+(?:gross|operating)\s+margins?)\b",
            SeverityLevel.HIGH,
            "Documented Severe Margin Compression",
            "Disclosures highlight ongoing compression and erosion of operating or gross margins.",
            "Structural loss of pricing power or input cost inflation unable to be passed to customers.",
            ["Review unit economics and customer churn", "Assess raw material/supplier contract renewal terms"],
        ),
        (
            r"\b(?:inability\s+to\s+pass\s+(?:on\s+)?increased\s+costs?|pricing\s+pressure\s+from\s+competitors?)\b",
            SeverityLevel.MEDIUM,
            "Lack of Pricing Power and Competitive Pressure",
            "Management cites competitive discounting and inability to pass higher input costs to clients.",
            "Long-term threat to return on invested capital (ROIC) and earnings stability.",
            ["Benchmark gross margins against industry peers", "Examine product differentiation and IP defensibility"],
        ),
        (
            r"\b(?:substantial|material)\s+operating\s+losses?\b",
            SeverityLevel.HIGH,
            "Substantial Operating Losses Reported",
            "Disclosures disclose continuous substantial operating deficits from core business operations.",
            "Erodes working capital and accelerates reliance on dilutive capital raises or debt.",
            ["Calculate cash burn rate and monthly runway", "Evaluate cost-cutting and restructuring execution"],
        ),
    ]

    def scan_metrics(
        self,
        current: FinancialPeriod,
        previous: Optional[FinancialPeriod] = None,
    ) -> List[RedFlagItem]:
        """Examines financial statement figures for margin deterioration and cost spikes."""
        flags: List[RedFlagItem] = []

        rev = current.revenue
        cogs = current.cost_of_goods_sold
        gross_profit = current.gross_profit
        op_inc = current.operating_income
        net_inc = current.net_income
        opex = current.operating_expenses

        # Derive gross profit if missing
        if gross_profit is None and rev is not None and cogs is not None:
            gross_profit = rev - cogs

        # Current ratios
        gross_margin = (gross_profit / rev * 100.0) if (gross_profit is not None and rev and rev > 0) else None
        op_margin = (op_inc / rev * 100.0) if (op_inc is not None and rev and rev > 0) else None
        net_margin = (net_inc / rev * 100.0) if (net_inc is not None and rev and rev > 0) else None

        # 1. Negative Operating Margin
        if op_margin is not None and op_margin < MARGIN_CONFIG["operating_margin_negative"]:
            flags.append(
                RedFlagItem(
                    id="RF-MARG-01",
                    category=RiskCategory.MARGIN_PROFITABILITY,
                    severity=SeverityLevel.HIGH,
                    title=f"Negative Operating Margin ({op_margin:.1f}%)",
                    description=f"Operating margin is negative ({op_margin:.1f}%), indicating core operations are losing money (Operating Income: {op_inc:,.2f}).",
                    metric_name="Operating Margin",
                    current_value=round(op_margin, 2),
                    threshold_breached="< 0.0%",
                    evidence=f"Revenue: {rev:,.2f}, Operating Income: {op_inc:,.2f} -> Margin: {op_margin:.1f}%",
                    implications="The company is burning capital at the operating level before tax and financing costs.",
                    recommendations=[
                        "Inspect operating expense breakdown across R&D, Sales & Marketing, and G&A.",
                        "Ascertain contribution margin per customer/product segment.",
                    ],
                )
            )

        # 2. YoY Margin Comparisons
        if previous and previous.revenue and previous.revenue > 0:
            prev_rev = previous.revenue
            prev_cogs = previous.cost_of_goods_sold
            prev_gp = previous.gross_profit
            if prev_gp is None and prev_cogs is not None:
                prev_gp = prev_rev - prev_cogs

            prev_op_inc = previous.operating_income
            prev_net_inc = previous.net_income
            prev_opex = previous.operating_expenses

            prev_gm = (prev_gp / prev_rev * 100.0) if (prev_gp is not None) else None
            prev_om = (prev_op_inc / prev_rev * 100.0) if (prev_op_inc is not None) else None
            prev_nm = (prev_net_inc / prev_rev * 100.0) if (prev_net_inc is not None) else None

            # Gross margin drop
            if gross_margin is not None and prev_gm is not None:
                gm_drop = prev_gm - gross_margin
                if gm_drop >= MARGIN_CONFIG["gross_margin_drop_critical_pts"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-MARG-02",
                            category=RiskCategory.MARGIN_PROFITABILITY,
                            severity=SeverityLevel.CRITICAL,
                            title=f"Severe Gross Margin Contraction (-{gm_drop:.1f} percentage points)",
                            description=f"Gross margin collapsed from {prev_gm:.1f}% to {gross_margin:.1f}% (-{gm_drop:.1f} pp).",
                            metric_name="Gross Margin YoY",
                            current_value=round(gross_margin, 2),
                            previous_value=round(prev_gm, 2),
                            change_percent=round(-gm_drop, 2),
                            threshold_breached=f"Drop >= {MARGIN_CONFIG['gross_margin_drop_critical_pts']} pp",
                            evidence=f"Prior Gross Margin: {prev_gm:.1f}% -> Current: {gross_margin:.1f}%",
                            implications="Indicates severe cost inflation, aggressive price discounting, or write-downs in inventory costs.",
                            recommendations=[
                                "Investigate whether direct production costs escalated or product mix shifted unfavorably.",
                                "Analyze whether inventory impairment was bundled into COGS.",
                            ],
                        )
                    )
                elif gm_drop >= MARGIN_CONFIG["gross_margin_drop_warning_pts"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-MARG-03",
                            category=RiskCategory.MARGIN_PROFITABILITY,
                            severity=SeverityLevel.MEDIUM,
                            title=f"Deteriorating Gross Margin (-{gm_drop:.1f} percentage points)",
                            description=f"Gross margin decreased from {prev_gm:.1f}% to {gross_margin:.1f}%.",
                            metric_name="Gross Margin YoY",
                            current_value=round(gross_margin, 2),
                            previous_value=round(prev_gm, 2),
                            change_percent=round(-gm_drop, 2),
                            threshold_breached=f"Drop >= {MARGIN_CONFIG['gross_margin_drop_warning_pts']} pp",
                            evidence=f"Prior Gross Margin: {prev_gm:.1f}% -> Current: {gross_margin:.1f}%",
                            implications="Profitability at the production/fulfillment level is under pressure.",
                            recommendations=["Monitor procurement contracts and supplier pricing dynamics."],
                        )
                    )

            # Operating margin drop
            if op_margin is not None and prev_om is not None:
                om_drop = prev_om - op_margin
                if om_drop >= MARGIN_CONFIG["operating_margin_drop_critical_pts"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-MARG-04",
                            category=RiskCategory.MARGIN_PROFITABILITY,
                            severity=SeverityLevel.HIGH,
                            title=f"Sharp Operating Margin Decay (-{om_drop:.1f} percentage points)",
                            description=f"Operating margin fell from {prev_om:.1f}% to {op_margin:.1f}% (-{om_drop:.1f} pp).",
                            metric_name="Operating Margin YoY",
                            current_value=round(op_margin, 2),
                            previous_value=round(prev_om, 2),
                            change_percent=round(-om_drop, 2),
                            threshold_breached=f"Drop >= {MARGIN_CONFIG['operating_margin_drop_critical_pts']} pp",
                            evidence=f"Prior Operating Margin: {prev_om:.1f}% -> Current: {op_margin:.1f}%",
                            implications="Operational overhead is expanding relative to top-line revenue, dampening cash generation.",
                            recommendations=[
                                "Review SG&A line items for uncharacteristic surges.",
                                "Check if headcount or administrative costs grew ahead of revenue.",
                            ],
                        )
                    )

            # Net profit margin drop
            if net_margin is not None and prev_nm is not None:
                nm_drop = prev_nm - net_margin
                if nm_drop >= MARGIN_CONFIG["net_margin_drop_critical_pts"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-MARG-05",
                            category=RiskCategory.MARGIN_PROFITABILITY,
                            severity=SeverityLevel.HIGH,
                            title=f"Net Profit Margin Collapse (-{nm_drop:.1f} percentage points)",
                            description=f"Net profit margin contracted from {prev_nm:.1f}% to {net_margin:.1f}% (-{nm_drop:.1f} pp).",
                            metric_name="Net Profit Margin YoY",
                            current_value=round(net_margin, 2),
                            previous_value=round(prev_nm, 2),
                            change_percent=round(-nm_drop, 2),
                            threshold_breached=f"Drop >= {MARGIN_CONFIG['net_margin_drop_critical_pts']} pp",
                            evidence=f"Prior Net Margin: {prev_nm:.1f}% -> Current: {net_margin:.1f}%",
                            implications="Bottom-line earnings for shareholders are severely compressed.",
                            recommendations=["Check non-operating items, interest costs, and tax rate variations."],
                        )
                    )

            # Negative Operating Leverage (OpEx growth outstripping Revenue growth)
            if rev and prev_rev and opex and prev_opex and prev_opex > 0:
                rev_growth = ((rev - prev_rev) / prev_rev) * 100.0
                opex_growth = ((opex - prev_opex) / prev_opex) * 100.0
                spread = opex_growth - rev_growth

                if spread >= MARGIN_CONFIG["negative_operating_leverage_spread_pct"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-MARG-06",
                            category=RiskCategory.MARGIN_PROFITABILITY,
                            severity=SeverityLevel.MEDIUM,
                            title=f"Negative Operating Leverage (OpEx +{opex_growth:.1f}% vs Rev +{rev_growth:.1f}%)",
                            description=f"Operating expenses grew {spread:.1f}% faster than revenues (OpEx growth: {opex_growth:.1f}% vs Revenue growth: {rev_growth:.1f}%).",
                            metric_name="Operating Leverage",
                            current_value=round(spread, 1),
                            threshold_breached=f"Spread >= {MARGIN_CONFIG['negative_operating_leverage_spread_pct']}%",
                            evidence=f"OpEx Growth: {opex_growth:.1f}% vs Rev Growth: {rev_growth:.1f}%",
                            implications="Diminishing returns on operational expenditure; fixed costs are outpacing scale.",
                            recommendations=["Evaluate efficiency of sales and marketing investments."],
                        )
                    )

        return flags

    def scan_text(self, text: str) -> List[RedFlagItem]:
        """Scans notes and MD&A for qualitative margin issues."""
        flags: List[RedFlagItem] = []
        for idx, (pattern, severity, title, desc, impl, recs) in enumerate(self.TEXT_PATTERNS, start=10):
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                match = matches[0]
                start = max(0, match.start() - 80)
                end = min(len(text), match.end() + 100)
                snippet = "..." + " ".join(text[start:end].split()) + "..."

                flags.append(
                    RedFlagItem(
                        id=f"RF-MARG-TXT-{idx}",
                        category=RiskCategory.MARGIN_PROFITABILITY,
                        severity=severity,
                        title=title,
                        description=desc,
                        evidence=snippet,
                        implications=impl,
                        recommendations=recs,
                    )
                )
        return flags
