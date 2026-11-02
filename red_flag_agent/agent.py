"""
Red Flag Agent Core Orchestrator.
Automates financial anomaly scanning, debt escalation detection, margin collapse tracking,
auditor qualification inspection, and forensic accounting pattern analysis.
"""

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from .config import RISK_LEVEL_THRESHOLDS, SEVERITY_WEIGHTS
from .models import (
    FinancialPeriod,
    RatiosSummary,
    RedFlagItem,
    RedFlagReport,
    RiskCategory,
    SeverityLevel,
)
from .parsers.metric_extractor import MetricExtractor
from .parsers.pdf_parser import PDFParser
from .scanners.anomaly_scanner import AnomalyScanner
from .scanners.auditor_scanner import AuditorScanner
from .scanners.debt_scanner import DebtScanner
from .scanners.forensic_scanner import ForensicScanner
from .scanners.margin_scanner import MarginScanner


class RedFlagAgent:
    """Enterprise Red Flag Forensic Agent for automated financial due diligence."""

    def __init__(self):
        self.debt_scanner = DebtScanner()
        self.margin_scanner = MarginScanner()
        self.auditor_scanner = AuditorScanner()
        self.forensic_scanner = ForensicScanner()
        self.anomaly_scanner = AnomalyScanner()
        self.pdf_parser = PDFParser()
        self.metric_extractor = MetricExtractor()

    def scan_document(
        self,
        file_path: Union[str, Path],
        company_name: Optional[str] = None,
    ) -> RedFlagReport:
        """Scans a PDF or TXT file directly and executes forensic analysis."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Target document not found: {path}")

        comp_name = company_name or path.stem.replace("_", " ").title()

        if path.suffix.lower() == ".pdf":
            parsed = self.pdf_parser.extract_text_and_sections(path)
            full_text = parsed["full_text"]
        else:
            full_text = path.read_text(encoding="utf-8", errors="ignore")

        # Attempt to extract quantitative metrics from the document
        extracted_period = self.metric_extractor.extract_period(full_text, period_name="Current")

        return self.scan_hybrid(
            text=full_text,
            current=extracted_period,
            previous=None,
            company_name=comp_name,
            scan_source=f"Document: {path.name}",
        )

    def scan_text(
        self,
        text: str,
        company_name: str = "Company Under Review",
    ) -> RedFlagReport:
        """Scans raw financial disclosures or footnote text."""
        extracted_period = self.metric_extractor.extract_period(text, period_name="Current")
        return self.scan_hybrid(
            text=text,
            current=extracted_period,
            previous=None,
            company_name=company_name,
            scan_source="Raw Text Disclosures",
        )

    def scan_financial_periods(
        self,
        current: Union[FinancialPeriod, Dict[str, Any]],
        previous: Optional[Union[FinancialPeriod, Dict[str, Any]]] = None,
        company_name: str = "Company Under Review",
    ) -> RedFlagReport:
        """Scans structured multi-period financial statement figures."""
        curr_obj = current if isinstance(current, FinancialPeriod) else FinancialPeriod(**current)
        prev_obj = (
            previous
            if (previous is None or isinstance(previous, FinancialPeriod))
            else FinancialPeriod(**previous)
        )

        return self.scan_hybrid(
            text="",
            current=curr_obj,
            previous=prev_obj,
            company_name=company_name,
            scan_source="Financial Statements Data",
        )

    def scan_hybrid(
        self,
        text: str,
        current: Optional[FinancialPeriod] = None,
        previous: Optional[FinancialPeriod] = None,
        company_name: str = "Target Corporation",
        scan_source: str = "Automated Hybrid Scan",
    ) -> RedFlagReport:
        """Executes full diagnostic scan across both qualitative narrative and financial data."""
        all_flags: List[RedFlagItem] = []

        # 1. Textual scanning across all domain engines
        if text.strip():
            all_flags.extend(self.auditor_scanner.scan_text(text))
            all_flags.extend(self.debt_scanner.scan_text(text))
            all_flags.extend(self.margin_scanner.scan_text(text))
            all_flags.extend(self.forensic_scanner.scan_text(text))
            all_flags.extend(self.anomaly_scanner.scan_text(text))

        # 2. Metric scanning across quantitative engines
        if current is not None:
            all_flags.extend(self.debt_scanner.scan_metrics(current, previous))
            all_flags.extend(self.margin_scanner.scan_metrics(current, previous))
            all_flags.extend(self.forensic_scanner.scan_metrics(current, previous))
            all_flags.extend(self.anomaly_scanner.scan_metrics(current, previous))

        # Deduplicate flags by ID
        unique_flags: List[RedFlagItem] = []
        seen_ids = set()
        for f in all_flags:
            if f.id not in seen_ids:
                seen_ids.add(f.id)
                unique_flags.append(f)

        # 3. Compute Risk Score & Counts
        severity_counts = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
            "INFO": 0,
        }
        category_counts = {cat.value: 0 for cat in RiskCategory}

        raw_score = 0.0
        for f in unique_flags:
            sev_key = f.severity.value
            severity_counts[sev_key] = severity_counts.get(sev_key, 0) + 1
            cat_key = f.category.value
            category_counts[cat_key] = category_counts.get(cat_key, 0) + 1
            raw_score += SEVERITY_WEIGHTS.get(sev_key, 0)

        # Cap overall score at 100
        overall_score = min(100.0, round(raw_score, 1))

        # Determine Risk Level
        if overall_score >= RISK_LEVEL_THRESHOLDS["CRITICAL"] or severity_counts["CRITICAL"] > 0:
            risk_level = "CRITICAL"
        elif overall_score >= RISK_LEVEL_THRESHOLDS["HIGH"] or severity_counts["HIGH"] >= 2:
            risk_level = "HIGH"
        elif overall_score >= RISK_LEVEL_THRESHOLDS["MODERATE"] or severity_counts["MEDIUM"] >= 1:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # 4. Compute Financial Ratios Summary
        ratios = self._calculate_ratios(current, previous)

        # 5. Build Executive Summary & Key Takeaways
        exec_summary, takeaways = self._build_narrative(
            company_name=company_name,
            overall_score=overall_score,
            risk_level=risk_level,
            flags=unique_flags,
            severity_counts=severity_counts,
            ratios=ratios,
        )

        extracted_dict = current.model_dump(exclude_none=True) if current else None

        return RedFlagReport(
            company_name=company_name,
            analyzed_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            scan_source=scan_source,
            overall_risk_score=overall_score,
            overall_risk_level=risk_level,
            flags_count_by_severity=severity_counts,
            flags_count_by_category=category_counts,
            total_flags=len(unique_flags),
            flags=unique_flags,
            ratios=ratios,
            extracted_metrics=extracted_dict,
            executive_summary=exec_summary,
            key_takeaways=takeaways,
        )

    def _calculate_ratios(
        self,
        current: Optional[FinancialPeriod],
        previous: Optional[FinancialPeriod],
    ) -> RatiosSummary:
        """Computes key financial ratios for reporting."""
        ratios = RatiosSummary()
        if not current:
            return ratios

        # Debt ratios
        total_debt = current.total_debt
        if total_debt is None and (current.short_term_debt is not None or current.long_term_debt is not None):
            total_debt = (current.short_term_debt or 0.0) + (current.long_term_debt or 0.0)

        if total_debt is not None:
            if current.stockholders_equity and current.stockholders_equity > 0:
                ratios.debt_to_equity = round(total_debt / current.stockholders_equity, 2)
            if current.total_assets and current.total_assets > 0:
                ratios.debt_to_assets = round(total_debt / current.total_assets, 2)

        # Interest coverage
        if current.operating_income is not None and current.interest_expense and current.interest_expense > 0:
            ratios.interest_coverage = round(current.operating_income / current.interest_expense, 2)

        # Margins
        if current.revenue and current.revenue > 0:
            rev = current.revenue
            gp = current.gross_profit
            if gp is None and current.cost_of_goods_sold is not None:
                gp = rev - current.cost_of_goods_sold
            if gp is not None:
                ratios.gross_margin_pct = round((gp / rev) * 100.0, 2)
            if current.operating_income is not None:
                ratios.operating_margin_pct = round((current.operating_income / rev) * 100.0, 2)
            if current.net_income is not None:
                ratios.net_margin_pct = round((current.net_income / rev) * 100.0, 2)
            if current.accounts_receivable is not None:
                ratios.days_sales_outstanding = round((current.accounts_receivable / rev) * 365.0, 1)

        # Inventory DIO
        if current.cost_of_goods_sold and current.cost_of_goods_sold > 0 and current.inventory is not None:
            ratios.days_inventory_outstanding = round((current.inventory / current.cost_of_goods_sold) * 365.0, 1)

        # Quality of Earnings
        if current.operating_cash_flow is not None and current.net_income and current.net_income != 0:
            ratios.operating_cash_flow_to_net_income = round(current.operating_cash_flow / current.net_income, 2)

        # Beneish Indices (if comparative period exists)
        if previous and current.revenue and previous.revenue and previous.revenue > 0:
            # DSRI
            if current.accounts_receivable and previous.accounts_receivable and previous.accounts_receivable > 0:
                curr_dsr = current.accounts_receivable / current.revenue
                prev_dsr = previous.accounts_receivable / previous.revenue
                ratios.beneish_dsri = round(curr_dsr / prev_dsr, 2)

            # SGI
            ratios.beneish_sgi = round(current.revenue / previous.revenue, 2)

        # TATA
        if current.net_income is not None and current.operating_cash_flow is not None and current.total_assets and current.total_assets > 0:
            accruals = current.net_income - current.operating_cash_flow
            ratios.beneish_tata = round(accruals / current.total_assets, 4)

        return ratios

    def _build_narrative(
        self,
        company_name: str,
        overall_score: float,
        risk_level: str,
        flags: List[RedFlagItem],
        severity_counts: Dict[str, int],
        ratios: RatiosSummary,
    ) -> tuple[str, List[str]]:
        """Generates executive summary and bullet points."""
        crit_count = severity_counts.get("CRITICAL", 0)
        high_count = severity_counts.get("HIGH", 0)
        med_count = severity_counts.get("MEDIUM", 0)

        if risk_level == "CRITICAL":
            exec_summary = (
                f"ALERT: {company_name} presents a CRITICAL overall forensic risk score of {overall_score}/100. "
                f"The scan triggered {crit_count} Critical and {high_count} High severity red flags. "
                f"Immediate forensic scrutiny is required due to severe vulnerabilities regarding capital solvency, "
                f"earnings credibility, or auditor qualifications."
            )
        elif risk_level == "HIGH":
            exec_summary = (
                f"WARNING: {company_name} exhibits a HIGH forensic risk profile (Score: {overall_score}/100) "
                f"with {high_count} High and {med_count} Medium severity flags detected. "
                f"Material pressure is observed across debt serviceability, operational margin contraction, "
                f"or forensic accounting indicators."
            )
        elif risk_level == "MODERATE":
            exec_summary = (
                f"NOTICE: {company_name} maintains a MODERATE forensic risk rating (Score: {overall_score}/100). "
                f"A total of {len(flags)} warning signals were identified, primarily consisting of cautionary "
                f"leverage trends or margin shifts that warrant ongoing monitoring."
            )
        else:
            exec_summary = (
                f"PASS: {company_name} demonstrates a LOW forensic risk profile (Score: {overall_score}/100). "
                f"No critical auditor qualifications, anomalous debt spikes, or severe margin impairments were detected."
            )

        takeaways = []
        # Highlight top 4 most severe flags
        sorted_flags = sorted(
            flags,
            key=lambda x: SEVERITY_WEIGHTS.get(x.severity.value, 0),
            reverse=True,
        )
        for f in sorted_flags[:5]:
            takeaways.append(f"[{f.severity.value}] {f.title}: {f.description}")

        if not takeaways:
            takeaways.append("All primary financial ratios and governance indicators are within normal operating thresholds.")

        return exec_summary, takeaways
