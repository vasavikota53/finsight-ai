"""
Debt & Solvency Scanner.
Scans for rising debt levels, excessive financial leverage, deteriorating interest coverage,
covenant breach warnings, and debt maturity/liquidity squeezes.
"""

import re
from typing import List, Optional
from ..models import RedFlagItem, SeverityLevel, RiskCategory, FinancialPeriod
from ..config import DEBT_CONFIG


class DebtScanner:
    """Detects debt anomalies, rising leverage, and solvency red flags."""

    TEXT_PATTERNS = [
        (
            r"\b(?:breach(?:ed)?|violat(?:ed?|ion))\s+(?:of\s+)?(?:debt\s+)?covenants?\b",
            SeverityLevel.CRITICAL,
            "Debt Covenant Violation or Default Risk",
            "Disclosures indicate a breach or violation of loan agreements/debt covenants.",
            "Lenders may accelerate repayment, impose penalty rates, or freeze credit facilities.",
            ["Audit credit facility agreements", "Review waiver conditions and cross-default clauses"],
        ),
        (
            r"\b(?:default(?:ed)?\s+on|inability\s+to\s+(?:service|repay))\s+(?:indebtedness|debt|principal|interest)\b",
            SeverityLevel.CRITICAL,
            "Inability to Service Outstanding Debt Obligations",
            "Direct mention of payment default or inability to satisfy debt covenants/principal.",
            "Imminent solvency crisis or bankruptcy/restructuring exposure.",
            ["Assess senior vs subordinated debt structure", "Verify immediate cash reserves and standby facilities"],
        ),
        (
            r"\b(?:downgrade[d]?|rating\s+agency\s+downgraded?)\s+(?:credit\s+rating|to\s+junk|to\s+speculative)\b",
            SeverityLevel.HIGH,
            "Credit Rating Downgrade",
            "Credit rating downgraded by rating agencies, raising cost of capital and collateral demands.",
            "Higher borrowing costs, reduced access to commercial paper markets.",
            ["Review debt maturity schedule", "Inspect interest rate sensitivity"],
        ),
        (
            r"\b(?:restructur(?:ing|ed)\s+debt|debt\s+forbearance|amended\s+credit\s+facility\s+to\s+avoid\s+default)\b",
            SeverityLevel.HIGH,
            "Distressed Debt Restructuring or Forbearance",
            "Disclosures describe distressed debt restructuring or lender forbearance agreements.",
            "Indicates cash flow insolvency requiring concession from creditors.",
            ["Examine lender concession terms", "Check warrant dilution or equity pledges"],
        ),
    ]

    def scan_metrics(
        self,
        current: FinancialPeriod,
        previous: Optional[FinancialPeriod] = None,
    ) -> List[RedFlagItem]:
        """Examines financial statements for rising debt and leverage distress."""
        flags: List[RedFlagItem] = []

        total_debt = current.total_debt
        if total_debt is None:
            if current.short_term_debt is not None or current.long_term_debt is not None:
                total_debt = (current.short_term_debt or 0.0) + (current.long_term_debt or 0.0)

        equity = current.stockholders_equity
        assets = current.total_assets
        ebit = current.operating_income
        interest = current.interest_expense
        cash = current.cash_and_equivalents
        short_debt = current.short_term_debt

        # 1. Debt-to-Equity (D/E) Ratio
        if total_debt is not None and equity is not None:
            if equity <= 0:
                flags.append(
                    RedFlagItem(
                        id="RF-DEBT-01",
                        category=RiskCategory.DEBT_SOLVENCY,
                        severity=SeverityLevel.CRITICAL,
                        title="Negative Shareholder Equity with Substantial Debt",
                        description=f"Stockholders' equity is non-positive ({equity:,.2f}) while total debt stands at {total_debt:,.2f}.",
                        metric_name="Debt-to-Equity",
                        current_value=f"Debt: {total_debt:,.2f}, Equity: {equity:,.2f}",
                        threshold_breached="Equity <= 0 (Technically Insolvency Warning)",
                        evidence=f"Total Debt = {total_debt:,.2f}, Stockholders Equity = {equity:,.2f}",
                        implications="The company's liabilities exceed its assets; equity buffer is completely erased.",
                        recommendations=[
                            "Assess recapitalization options and liquidation preferences.",
                            "Verify going concern assumptions in audit footnotes.",
                        ],
                    )
                )
            else:
                de_ratio = total_debt / equity
                if de_ratio >= DEBT_CONFIG["de_ratio_critical"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-DEBT-02",
                            category=RiskCategory.DEBT_SOLVENCY,
                            severity=SeverityLevel.CRITICAL,
                            title=f"Critical Debt-to-Equity Ratio ({de_ratio:.2f}x)",
                            description=f"Debt-to-Equity ratio of {de_ratio:.2f}x exceeds critical ceiling of {DEBT_CONFIG['de_ratio_critical']}x.",
                            metric_name="Debt-to-Equity",
                            current_value=round(de_ratio, 2),
                            threshold_breached=f"> {DEBT_CONFIG['de_ratio_critical']}x",
                            evidence=f"Debt ({total_debt:,.2f}) / Equity ({equity:,.2f}) = {de_ratio:.2f}",
                            implications="Extreme financial leverage renders the company highly vulnerable to rate hikes or macro downturns.",
                            recommendations=[
                                "Check debt covenants for maximum permitted leverage ratios.",
                                "Analyze debt repayment schedule over the next 24 months.",
                            ],
                        )
                    )
                elif de_ratio >= DEBT_CONFIG["de_ratio_warning"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-DEBT-03",
                            category=RiskCategory.DEBT_SOLVENCY,
                            severity=SeverityLevel.MEDIUM,
                            title=f"Elevated Debt-to-Equity Ratio ({de_ratio:.2f}x)",
                            description=f"Debt-to-Equity ratio of {de_ratio:.2f}x is above the cautionary threshold of {DEBT_CONFIG['de_ratio_warning']}x.",
                            metric_name="Debt-to-Equity",
                            current_value=round(de_ratio, 2),
                            threshold_breached=f"> {DEBT_CONFIG['de_ratio_warning']}x",
                            evidence=f"Debt ({total_debt:,.2f}) / Equity ({equity:,.2f}) = {de_ratio:.2f}",
                            implications="High leverage increases financial risk and debt service claims ahead of equity holders.",
                            recommendations=["Monitor interest coverage and free cash flow generation."],
                        )
                    )

        # 2. YoY Surge in Debt / D/E
        if previous and total_debt is not None:
            prev_total_debt = previous.total_debt
            if prev_total_debt is None and (previous.short_term_debt is not None or previous.long_term_debt is not None):
                prev_total_debt = (previous.short_term_debt or 0.0) + (previous.long_term_debt or 0.0)

            if prev_total_debt and prev_total_debt > 0:
                debt_growth = ((total_debt - prev_total_debt) / prev_total_debt) * 100.0
                if debt_growth >= DEBT_CONFIG["total_debt_yoy_critical_pct"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-DEBT-04",
                            category=RiskCategory.DEBT_SOLVENCY,
                            severity=SeverityLevel.HIGH,
                            title=f"Aggressive Debt Surge (+{debt_growth:.1f}% YoY)",
                            description=f"Total debt surged from {prev_total_debt:,.2f} to {total_debt:,.2f} (+{debt_growth:.1f}%).",
                            metric_name="Total Debt Growth",
                            current_value=total_debt,
                            previous_value=prev_total_debt,
                            change_percent=round(debt_growth, 2),
                            threshold_breached=f"> +{DEBT_CONFIG['total_debt_yoy_critical_pct']}% YoY",
                            evidence=f"Prior Debt: {prev_total_debt:,.2f} -> Current Debt: {total_debt:,.2f}",
                            implications="Rapid accumulation of debt outpaces normal organic operations, pointing to reliance on external borrowing.",
                            recommendations=[
                                "Investigate use of proceeds: check whether new debt funded M&A, share buybacks, or operating deficits.",
                            ],
                        )
                    )
                elif debt_growth >= DEBT_CONFIG["total_debt_yoy_surge_pct"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-DEBT-05",
                            category=RiskCategory.DEBT_SOLVENCY,
                            severity=SeverityLevel.MEDIUM,
                            title=f"Rising Debt Level (+{debt_growth:.1f}% YoY)",
                            description=f"Total debt increased by {debt_growth:.1f}% year-over-year.",
                            metric_name="Total Debt Growth",
                            current_value=total_debt,
                            previous_value=prev_total_debt,
                            change_percent=round(debt_growth, 2),
                            threshold_breached=f"> +{DEBT_CONFIG['total_debt_yoy_surge_pct']}% YoY",
                            evidence=f"Prior Debt: {prev_total_debt:,.2f} -> Current Debt: {total_debt:,.2f}",
                            implications="Rising debt burden will increase annual interest payments and leverage exposure.",
                            recommendations=["Verify cash generation from deployed capital."],
                        )
                    )

        # 3. Interest Coverage Ratio (EBIT / Interest Expense)
        if ebit is not None and interest is not None and interest > 0:
            ic_ratio = ebit / interest
            if ic_ratio < DEBT_CONFIG["interest_coverage_distress"]:
                flags.append(
                    RedFlagItem(
                        id="RF-DEBT-06",
                        category=RiskCategory.DEBT_SOLVENCY,
                        severity=SeverityLevel.CRITICAL,
                        title=f"Severe Interest Coverage Distress ({ic_ratio:.2f}x)",
                        description=f"Operating earnings (EBIT: {ebit:,.2f}) fail to cover annual interest expense ({interest:,.2f}).",
                        metric_name="Interest Coverage Ratio",
                        current_value=round(ic_ratio, 2),
                        threshold_breached=f"< {DEBT_CONFIG['interest_coverage_distress']}x",
                        evidence=f"EBIT ({ebit:,.2f}) / Interest Expense ({interest:,.2f}) = {ic_ratio:.2f}",
                        implications="The business cannot service its debt from operating profits alone, necessitating asset sales or new borrowing.",
                        recommendations=[
                            "Assess immediate cash burn and liquidity runway.",
                            "Determine if interest is payment-in-kind (PIK) or cash-settled.",
                        ],
                    )
                )
            elif ic_ratio < DEBT_CONFIG["interest_coverage_critical"]:
                flags.append(
                    RedFlagItem(
                        id="RF-DEBT-07",
                        category=RiskCategory.DEBT_SOLVENCY,
                        severity=SeverityLevel.HIGH,
                        title=f"Deteriorating Interest Coverage ({ic_ratio:.2f}x)",
                        description=f"Interest coverage has dropped to {ic_ratio:.2f}x, below the safe threshold of {DEBT_CONFIG['interest_coverage_critical']}x.",
                        metric_name="Interest Coverage Ratio",
                        current_value=round(ic_ratio, 2),
                        threshold_breached=f"< {DEBT_CONFIG['interest_coverage_critical']}x",
                        evidence=f"EBIT ({ebit:,.2f}) / Interest Expense ({interest:,.2f}) = {ic_ratio:.2f}",
                        implications="Slim safety buffer; any minor decline in operating profit risks default.",
                        recommendations=["Inspect refinancing exposure and sensitivity to rate increases."],
                    )
                )

        # 4. Short-term Debt vs Cash Reserves (Refinancing Risk)
        if short_debt is not None and cash is not None:
            if short_debt > 0 and (cash <= 0 or (short_debt / max(cash, 1e-6) >= DEBT_CONFIG["short_term_debt_to_cash_critical"])):
                ratio = short_debt / max(cash, 1.0)
                flags.append(
                    RedFlagItem(
                        id="RF-DEBT-08",
                        category=RiskCategory.DEBT_SOLVENCY,
                        severity=SeverityLevel.HIGH,
                        title=f"Imminent Short-Term Refinancing Squeeze (Debt/Cash: {ratio:.1f}x)",
                        description=f"Short-term debt due within 12 months ({short_debt:,.2f}) significantly exceeds available cash ({cash:,.2f}).",
                        metric_name="Short-term Debt to Cash",
                        current_value=round(ratio, 2),
                        threshold_breached=f"> {DEBT_CONFIG['short_term_debt_to_cash_critical']}x",
                        evidence=f"Short-term Debt: {short_debt:,.2f} vs Cash & Equivalents: {cash:,.2f}",
                        implications="High vulnerability to rollover risk if credit markets tighten or lenders refuse renewal.",
                        recommendations=[
                            "Verify existence of committed undrawn revolving credit facilities.",
                            "Review upcoming debt maturity schedule by quarter.",
                        ],
                    )
                )

        return flags

    def scan_text(self, text: str) -> List[RedFlagItem]:
        """Scans disclosures and notes for qualitative debt and solvency warnings."""
        flags: List[RedFlagItem] = []
        for idx, (pattern, severity, title, desc, impl, recs) in enumerate(self.TEXT_PATTERNS, start=10):
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                # Grab surrounding excerpt (context)
                match = matches[0]
                start = max(0, match.start() - 80)
                end = min(len(text), match.end() + 100)
                snippet = "..." + " ".join(text[start:end].split()) + "..."

                flags.append(
                    RedFlagItem(
                        id=f"RF-DEBT-TXT-{idx}",
                        category=RiskCategory.DEBT_SOLVENCY,
                        severity=severity,
                        title=title,
                        description=desc,
                        evidence=snippet,
                        implications=impl,
                        recommendations=recs,
                    )
                )
        return flags
