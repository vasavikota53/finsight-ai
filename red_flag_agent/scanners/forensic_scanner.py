"""
Unusual Financial Patterns & Forensic Accounting Scanner.
Detects earnings manipulation indicators, Beneish M-Score signals, cash flow divergences,
channel stuffing / DSO spikes, inventory hoarding, related-party risks, and aggressive accruals.
"""

import re
from typing import List, Optional
from ..models import RedFlagItem, SeverityLevel, RiskCategory, FinancialPeriod
from ..config import FORENSIC_CONFIG


class ForensicScanner:
    """Detects forensic accounting red flags and unusual financial patterns."""

    TEXT_PATTERNS = [
        (
            r"\b(?:related\s*party\s+transactions?|loans?\s+to\s+(?:officers?|directors?|affiliates?))\b",
            SeverityLevel.HIGH,
            "Significant Related-Party Transactions / Insider Loans",
            "Disclosures detail substantial business transactions or loans between the company and corporate insiders or affiliates.",
            "High risk of conflicts of interest, self-dealing, transfer pricing distortion, or siphon of corporate funds.",
            ["Audit related-party disclosure footnotes for fair market value justification.", "Review board approval records for insider transactions."],
        ),
        (
            r"\b(?:change\s+in\s+accounting\s+estimates?|extended\s+(?:the\s+)?useful\s+lives?\s+of\s+assets?|altered\s+depreciation\s+schedule)\b",
            SeverityLevel.MEDIUM,
            "Discretionary Changes in Accounting Estimates / Depreciation",
            "Management modified accounting estimates or extended the depreciable life of fixed assets.",
            "Artificially reduces annual depreciation expense to boost reported operating profits without cash improvements.",
            ["Calculate earnings boost contributed strictly by extended asset lives.", "Compare depreciation assumptions against direct industry peers."],
        ),
        (
            r"\b(?:off[- ]balance[- ]sheet\s+(?:arrangements?|obligations?|liabilities)|special\s+purpose\s+entit(?:y|ies)|variable\s+interest\s+entit(?:y|ies))\b",
            SeverityLevel.HIGH,
            "Off-Balance Sheet Arrangements or Complex Structured Entities",
            "Company maintains off-balance sheet commitments, guarantees, or variable interest entities (VIEs).",
            "Hidden debt or contingent liabilities that could revert back to the core balance sheet during distress.",
            ["Examine total maximum loss exposure under guarantee contracts.", "Review lease and unconsolidated affiliate obligations."],
        ),
        (
            r"\b(?:aggressive\s+revenue\s+recognition|premature\s+revenue\s+recognition|bill[- ]and[- ]hold\s+transactions?|channel\s+stuffing)\b",
            SeverityLevel.CRITICAL,
            "Aggressive / Premature Revenue Recognition Disclosures",
            "Disclosures identify risks or practices related to premature booking of revenue prior to delivery or customer acceptance.",
            "Risk of artificial revenue inflation followed by future chargebacks, returns, or revenue reversals.",
            ["Audit sales contracts around quarter-end for return rights and extended payment terms.", "Verify unearned / deferred revenue trends."],
        ),
        (
            r"\b(?:repeated\s+restructuring\s+charges?|goodwill\s+impairment\s+(?:charge|loss)|substantial\s+asset\s+write[- ]downs?)\b",
            SeverityLevel.MEDIUM,
            "Substantial Asset Impairments or Recurring Restructuring Charges",
            "Large non-cash impairments of goodwill, intangible assets, or recurring restructuring charges.",
            "Prior overpayment for acquisitions, overvalued balance sheet assets, or 'big bath' accounting maneuvers.",
            ["Determine if restructuring charges occur every year despite being labeled 'one-off'.", "Assess remaining goodwill as a percentage of total equity."],
        ),
    ]

    def scan_metrics(
        self,
        current: FinancialPeriod,
        previous: Optional[FinancialPeriod] = None,
    ) -> List[RedFlagItem]:
        """Runs quantitative forensic algorithms across income, balance sheet, and cash flow numbers."""
        flags: List[RedFlagItem] = []

        rev = current.revenue
        cogs = current.cost_of_goods_sold
        net_inc = current.net_income
        cfo = current.operating_cash_flow
        rec = current.accounts_receivable
        inv = current.inventory
        assets = current.total_assets

        # ----------------------------------------------------
        # 1. QUALITY OF EARNINGS: CFO vs NET INCOME DIVERGENCE
        # ----------------------------------------------------
        if net_inc is not None and cfo is not None:
            # Case A: Net Income positive, but Operating Cash Flow is Negative
            if net_inc > 0 and cfo < 0:
                flags.append(
                    RedFlagItem(
                        id="RF-FOR-01",
                        category=RiskCategory.FORENSIC_PATTERNS,
                        severity=SeverityLevel.CRITICAL,
                        title="Severe Earnings Quality Divergence (Positive Net Income vs Negative Cash Flow)",
                        description=f"Company reported positive Net Income ({net_inc:,.2f}) but burned cash in operations (CFO: {cfo:,.2f}).",
                        metric_name="Operating Cash Flow vs Net Income",
                        current_value=f"Net Income: {net_inc:,.2f}, CFO: {cfo:,.2f}",
                        threshold_breached="Net Income > 0 while Operating Cash Flow < 0",
                        evidence=f"Net Income: {net_inc:,.2f} vs Operating Cash Flow: {cfo:,.2f} (Gap: {abs(net_inc - cfo):,.2f})",
                        implications="Reported earnings are driven by non-cash accounting accruals rather than real customer cash collections. High risk of future earnings restatement.",
                        recommendations=[
                            "Inspect working capital cash flow reconciliation lines (receivables, inventory, payables).",
                            "Assess whether revenue is booked without actual collections.",
                        ],
                    )
                )
            # Case B: CFO is significantly lower than Net Income
            elif net_inc > 0 and cfo > 0:
                cfo_ratio = cfo / net_inc
                if cfo_ratio < FORENSIC_CONFIG["ocf_to_net_income_critical"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-FOR-02",
                            category=RiskCategory.FORENSIC_PATTERNS,
                            severity=SeverityLevel.HIGH,
                            title=f"Poor Quality of Earnings (CFO covers only {cfo_ratio*100:.1f}% of Net Income)",
                            description=f"Operating cash flow ({cfo:,.2f}) tracks significantly below reported net income ({net_inc:,.2f}).",
                            metric_name="CFO to Net Income Ratio",
                            current_value=round(cfo_ratio, 2),
                            threshold_breached=f"< {FORENSIC_CONFIG['ocf_to_net_income_critical']:.2f}",
                            evidence=f"CFO / Net Income = {cfo_ratio:.2f}",
                            implications="High proportion of accounting earnings tied up in unpaid invoices or non-cash paper gains.",
                            recommendations=["Audit the cash conversion cycle and bad debt reserves."],
                        )
                    )

        # ----------------------------------------------------
        # 2. DSO & RECEIVABLES SPIKE (CHANNEL STUFFING SIGNAL)
        # ----------------------------------------------------
        if previous and rev and previous.revenue and rec and previous.accounts_receivable:
            prev_rev = previous.revenue
            prev_rec = previous.accounts_receivable

            if prev_rev > 0 and prev_rec > 0:
                rev_growth = ((rev - prev_rev) / prev_rev) * 100.0
                rec_growth = ((rec - prev_rec) / prev_rec) * 100.0
                excess_growth = rec_growth - rev_growth

                # Days Sales Outstanding (DSO) calculation (assuming 365 days)
                current_dso = (rec / rev) * 365.0
                prev_dso = (prev_rec / prev_rev) * 365.0
                dso_change = current_dso - prev_dso

                # Beneish DSRI (Days Sales in Receivables Index)
                dsri = (rec / rev) / (prev_rec / prev_rev)

                if dsri >= FORENSIC_CONFIG["beneish_dsri_warning"] or excess_growth >= FORENSIC_CONFIG["receivables_growth_excess_warning_pct"]:
                    severity = SeverityLevel.HIGH if excess_growth >= 30.0 else SeverityLevel.MEDIUM
                    flags.append(
                        RedFlagItem(
                            id="RF-FOR-03",
                            category=RiskCategory.FORENSIC_PATTERNS,
                            severity=severity,
                            title=f"Receivables Outpacing Revenue (DSO +{dso_change:.1f} days / DSRI: {dsri:.2f})",
                            description=f"Accounts receivable grew by {rec_growth:.1f}% YoY, outstripping revenue growth of {rev_growth:.1f}% by {excess_growth:.1f}%. DSO lengthened from {prev_dso:.1f} to {current_dso:.1f} days.",
                            metric_name="Beneish DSRI / Receivables Growth",
                            current_value=round(dsri, 2),
                            previous_value=round(prev_dso, 1),
                            change_percent=round(excess_growth, 1),
                            threshold_breached=f"DSRI >= {FORENSIC_CONFIG['beneish_dsri_warning']} or Spread >= {FORENSIC_CONFIG['receivables_growth_excess_warning_pct']}%",
                            evidence=f"Receivables Growth: {rec_growth:.1f}% vs Revenue Growth: {rev_growth:.1f}%. DSO: {prev_dso:.1f} -> {current_dso:.1f} days.",
                            implications="Classic sign of aggressive revenue recognition, quarter-end channel stuffing, or customer inability to pay.",
                            recommendations=[
                                "Review aging schedule of accounts receivable (>90 days past due).",
                                "Verify allowance for doubtful accounts / credit loss provision trend.",
                            ],
                        )
                    )

        # ----------------------------------------------------
        # 3. DIO & INVENTORY HOARDING / OBSOLESCENCE
        # ----------------------------------------------------
        if previous and cogs and previous.cost_of_goods_sold and inv and previous.inventory:
            prev_cogs = previous.cost_of_goods_sold
            prev_inv = previous.inventory

            if prev_cogs > 0 and prev_inv > 0:
                cogs_growth = ((cogs - prev_cogs) / prev_cogs) * 100.0
                inv_growth = ((inv - prev_inv) / prev_inv) * 100.0
                excess_inv_growth = inv_growth - cogs_growth

                current_dio = (inv / cogs) * 365.0
                prev_dio = (prev_inv / prev_cogs) * 365.0
                dio_change = current_dio - prev_dio

                if dio_change >= FORENSIC_CONFIG["dio_yoy_increase_warning_days"] or excess_inv_growth >= FORENSIC_CONFIG["inventory_growth_excess_warning_pct"]:
                    flags.append(
                        RedFlagItem(
                            id="RF-FOR-04",
                            category=RiskCategory.FORENSIC_PATTERNS,
                            severity=SeverityLevel.MEDIUM,
                            title=f"Inventory Accumulation Outpacing Sales (DIO +{dio_change:.1f} days)",
                            description=f"Inventory surged by {inv_growth:.1f}% while COGS rose by only {cogs_growth:.1f}%. Days Inventory Outstanding expanded to {current_dio:.1f} days (+{dio_change:.1f} days).",
                            metric_name="Days Inventory Outstanding",
                            current_value=round(current_dio, 1),
                            previous_value=round(prev_dio, 1),
                            change_percent=round(excess_inv_growth, 1),
                            threshold_breached=f"DIO Increase >= {FORENSIC_CONFIG['dio_yoy_increase_warning_days']} days",
                            evidence=f"Inventory Growth: {inv_growth:.1f}% vs COGS Growth: {cogs_growth:.1f}%. DIO: {prev_dio:.1f} -> {current_dio:.1f} days.",
                            implications="High risk of obsolete or unsalable inventory, delayed inventory write-downs, or unabsorbed fixed overhead.",
                            recommendations=[
                                "Examine inventory write-down reserves and Lower of Cost or Net Realizable Value tests.",
                                "Analyze finished goods vs raw materials distribution.",
                            ],
                        )
                    )

        # ----------------------------------------------------
        # 4. BENEISH TATA (TOTAL ACCRUALS TO TOTAL ASSETS)
        # ----------------------------------------------------
        if net_inc is not None and cfo is not None and assets is not None and assets > 0:
            # Accruals = Net Income - Operating Cash Flow
            accruals = net_inc - cfo
            tata = accruals / assets
            if tata >= FORENSIC_CONFIG["beneish_tata_warning"]:
                flags.append(
                    RedFlagItem(
                        id="RF-FOR-05",
                        category=RiskCategory.FORENSIC_PATTERNS,
                        severity=SeverityLevel.HIGH,
                        title=f"Elevated Accounting Accruals (Beneish TATA: {tata:.3f})",
                        description=f"Total Accruals to Total Assets is {tata:.3f}, surpassing the forensic warning boundary of {FORENSIC_CONFIG['beneish_tata_warning']}.",
                        metric_name="Total Accruals to Total Assets (TATA)",
                        current_value=round(tata, 4),
                        threshold_breached=f"> {FORENSIC_CONFIG['beneish_tata_warning']}",
                        evidence=f"Total Accruals ({accruals:,.2f}) / Total Assets ({assets:,.2f}) = {tata:.3f}",
                        implications="Company relies heavily on accounting accruals rather than real cash flow to demonstrate profitability.",
                        recommendations=["Inspect discretionary accruals and capitalization of development/operating expenses."],
                    )
                )

        return flags

    def scan_text(self, text: str) -> List[RedFlagItem]:
        """Scans notes and narrative disclosures for qualitative forensic patterns."""
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
                        id=f"RF-FOR-TXT-{idx}",
                        category=RiskCategory.FORENSIC_PATTERNS,
                        severity=severity,
                        title=title,
                        description=desc,
                        evidence=snippet,
                        implications=impl,
                        recommendations=recs,
                    )
                )
        return flags
