"""
Statistical & Structural Anomaly Scanner.
Detects statistical YoY deviations, extreme spikes in volatile accounts,
balance sheet reconciliation discrepancies, executive turnover, and regulatory probes.
"""

import re
from typing import List, Optional
from ..models import RedFlagItem, SeverityLevel, RiskCategory, FinancialPeriod


class AnomalyScanner:
    """Detects statistical anomalies, sudden outliers, governance ruptures, and regulatory inquiries."""

    TEXT_PATTERNS = [
        (
            r"\b(?:sec\s+investigation|doj\s+subpoena|regulatory\s+inquiry|formal\s+order\s+of\s+investigation|civil\s+investigative\s+demand)\b",
            SeverityLevel.CRITICAL,
            "Government Regulatory or Enforcement Investigation",
            "Disclosures disclose an active formal investigation, subpoena, or inquiry by enforcement authorities (SEC, DOJ, or international regulators).",
            "Severe fines, disgorgement of profits, criminal/civil sanctions, or trading suspension.",
            ["Audit regulatory disclosure footnotes and legal defense accruals.", "Check for parallel shareholder derivative lawsuits."],
        ),
        (
            r"\b(?:whistleblower\s+(?:allegations?|complaints?|reports?)|internal\s+investigation\s+conducted\s+by\s+the\s+audit\s+committee)\b",
            SeverityLevel.CRITICAL,
            "Whistleblower Complaint or Audit Committee Investigation",
            "The audit committee initiated an internal inquiry in response to whistleblower allegations of accounting or misconduct.",
            "High probability of intentional irregularities, control bypass, or executive misconduct.",
            ["Determine scope of audit committee investigation and whether independent outside counsel was hired.", "Check if filing delays ensued."],
        ),
        (
            r"\b(?:sudden\s+departure|unexpected\s+resignation)\s+of\s+(?:the\s+)?(?:cfo|chief\s+financial\s+officer|ceo|chief\s+accounting\s+officer)\b",
            SeverityLevel.HIGH,
            "Sudden Resignation of CFO or Chief Accounting Officer",
            "Key finance executive (CFO or CAO) abruptly resigned outside standard succession planning.",
            "Strong statistical correlation with upcoming accounting restatements or earnings disagreements.",
            ["Check severance agreements and effective resignation dates.", "Review 8-K filings for reasons provided."],
        ),
        (
            r"\b(?:tax\s+dispute|underpaid\s+taxes|tax\s+authorit(?:y|ies)\s+(?:assessed|demanded)|audit\s+by\s+the\s+irs)\b",
            SeverityLevel.MEDIUM,
            "Material Tax Dispute or Unreconciled Tax Assessment",
            "Substantial disputes with tax authorities regarding aggressive transfer pricing or disallowed deductions.",
            "Potential cash outflow for back taxes, interest, and penalties.",
            ["Review unrecognized tax benefits (UTB) footnote.", "Assess adequacy of tax contingency reserves."],
        ),
    ]

    def scan_metrics(
        self,
        current: FinancialPeriod,
        previous: Optional[FinancialPeriod] = None,
    ) -> List[RedFlagItem]:
        """Detects statistical line-item jumps, cash burns, and structural reconciliation issues."""
        flags: List[RedFlagItem] = []

        # 1. Structural Sanity Checks
        # Balance Sheet Identity: Total Assets vs (Total Liabilities + Equity)
        if current.total_assets is not None and current.total_liabilities is not None and current.stockholders_equity is not None:
            liab_plus_equity = current.total_liabilities + current.stockholders_equity
            diff = abs(current.total_assets - liab_plus_equity)
            if diff > max(100.0, current.total_assets * 0.02):  # >2% discrepancy
                flags.append(
                    RedFlagItem(
                        id="RF-ANOM-01",
                        category=RiskCategory.STATISTICAL_ANOMALIES,
                        severity=SeverityLevel.HIGH,
                        title="Balance Sheet Accounting Discrepancy",
                        description=f"Total Assets ({current.total_assets:,.2f}) does not match Liabilities + Equity ({liab_plus_equity:,.2f}). Difference: {diff:,.2f}.",
                        metric_name="Balance Sheet Equality",
                        threshold_breached="Assets != Liabilities + Equity",
                        evidence=f"Assets: {current.total_assets:,.2f} vs (Liabilities: {current.total_liabilities:,.2f} + Equity: {current.stockholders_equity:,.2f})",
                        implications="Data entry error, missing line items, or unallocated balance sheet adjustments.",
                        recommendations=["Re-verify balance sheet line items and currency denominations."],
                    )
                )

        # 2. Extreme Cash Drain YoY (> 50% drop in cash and liquid reserves)
        if previous and current.cash_and_equivalents is not None and previous.cash_and_equivalents is not None:
            prev_cash = previous.cash_and_equivalents
            curr_cash = current.cash_and_equivalents
            if prev_cash > 0:
                cash_change = ((curr_cash - prev_cash) / prev_cash) * 100.0
                if cash_change <= -50.0:
                    flags.append(
                        RedFlagItem(
                            id="RF-ANOM-02",
                            category=RiskCategory.STATISTICAL_ANOMALIES,
                            severity=SeverityLevel.HIGH,
                            title=f"Severe Cash Drain ({cash_change:.1f}% YoY)",
                            description=f"Cash reserves plummeted from {prev_cash:,.2f} to {curr_cash:,.2f} ({cash_change:.1f}% decline).",
                            metric_name="Cash & Equivalents YoY",
                            current_value=curr_cash,
                            previous_value=prev_cash,
                            change_percent=round(cash_change, 1),
                            threshold_breached="Drop > 50% YoY",
                            evidence=f"Prior Cash: {prev_cash:,.2f} -> Current Cash: {curr_cash:,.2f}",
                            implications="Rapid depletion of liquid buffers, heightening dependence on near-term financing.",
                            recommendations=[
                                "Audit Statement of Cash Flows across Operating, Investing, and Financing activities.",
                                "Ascertain whether cash was spent on M&A, share buybacks, or funding operational losses.",
                            ],
                        )
                    )

        # 3. Sudden Surge in Operating Expenses without Revenue Growth
        if previous and current.operating_expenses is not None and previous.operating_expenses is not None:
            prev_opex = previous.operating_expenses
            curr_opex = current.operating_expenses
            if prev_opex > 0:
                opex_change = ((curr_opex - prev_opex) / prev_opex) * 100.0
                if opex_change >= 40.0:
                    flags.append(
                        RedFlagItem(
                            id="RF-ANOM-03",
                            category=RiskCategory.STATISTICAL_ANOMALIES,
                            severity=SeverityLevel.MEDIUM,
                            title=f"Anomalous Operating Expense Surge (+{opex_change:.1f}% YoY)",
                            description=f"Operating expenses spiked by {opex_change:.1f}% YoY from {prev_opex:,.2f} to {curr_opex:,.2f}.",
                            metric_name="Operating Expenses YoY",
                            current_value=curr_opex,
                            previous_value=prev_opex,
                            change_percent=round(opex_change, 1),
                            threshold_breached="Surge > 40% YoY",
                            evidence=f"Prior OpEx: {prev_opex:,.2f} -> Current OpEx: {curr_opex:,.2f}",
                            implications="Loss of cost control or absorption of extraordinary unbudgeted overheads.",
                            recommendations=["Deconstruct OpEx into administrative, legal, marketing, and R&D components."],
                        )
                    )

        return flags

    def scan_text(self, text: str) -> List[RedFlagItem]:
        """Scans disclosures for qualitative anomalies, whistleblower items, and probes."""
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
                        id=f"RF-ANOM-TXT-{idx}",
                        category=RiskCategory.STATISTICAL_ANOMALIES,
                        severity=severity,
                        title=title,
                        description=desc,
                        evidence=snippet,
                        implications=impl,
                        recommendations=recs,
                    )
                )
        return flags
