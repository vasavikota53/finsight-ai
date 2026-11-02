"""
Report Generator for Red Flag Agent.
Generates comprehensive Markdown audit reports, terminal summaries, and structured outputs.
"""

from typing import Optional
from .models import RedFlagReport, SeverityLevel


class ReportGenerator:
    """Formats RedFlagReport into professional Markdown, text, and visual formats."""

    @staticmethod
    def to_markdown(report: RedFlagReport) -> str:
        """Produces an audit-grade Markdown report."""
        risk_emoji = {
            "CRITICAL": "🔴 CRITICAL RISK",
            "HIGH": "🟠 HIGH RISK",
            "MODERATE": "🟡 MODERATE RISK",
            "LOW": "🟢 LOW RISK",
        }.get(report.overall_risk_level, report.overall_risk_level)

        lines = [
            f"# Finsight AI — Red Flag Forensic Audit Report",
            f"**Target Company:** {report.company_name}  ",
            f"**Audit Timestamp:** {report.analyzed_at}  ",
            f"**Source Document / Input:** {report.scan_source}  ",
            f"**Overall Forensic Risk Assessment:** `[{report.overall_risk_level} RISK]`  ",
            f"**Forensic Risk Score:** `{report.overall_risk_score} / 100`  ",
            "",
            "---",
            "",
            "## 1. Executive Summary",
            "",
            report.executive_summary,
            "",
            "### Key Takeaways",
            "",
        ]

        for item in report.key_takeaways:
            lines.append(f"- {item}")

        lines.extend([
            "",
            "---",
            "",
            "## 2. Risk Distribution Overview",
            "",
            "| Severity Level | Count | Status Description |",
            "| :--- | :---: | :--- |",
            f"| **CRITICAL** | {report.flags_count_by_severity.get('CRITICAL', 0)} | Immediate default, qualification, or pervasive manipulation risk |",
            f"| **HIGH** | {report.flags_count_by_severity.get('HIGH', 0)} | Serious solvency, margin erosion, or control deficiency |",
            f"| **MEDIUM** | {report.flags_count_by_severity.get('MEDIUM', 0)} | Cautionary operational or working capital divergence |",
            f"| **LOW / INFO** | {report.flags_count_by_severity.get('LOW', 0) + report.flags_count_by_severity.get('INFO', 0)} | Informational observation |",
            f"| **TOTAL FLAGS** | **{report.total_flags}** | |",
            "",
            "### Breakdown by Forensic Category",
            "",
            "| Forensic Category | Detected Flags |",
            "| :--- | :---: |",
        ])

        for cat, count in report.flags_count_by_category.items():
            lines.append(f"| {cat} | {count} |")

        if report.ratios:
            r = report.ratios
            lines.extend([
                "",
                "---",
                "",
                "## 3. Computed Financial & Forensic Ratios",
                "",
                "| Financial Ratio / Metric | Value | Reference Benchmark / Warning Band |",
                "| :--- | :---: | :--- |",
                f"| **Debt-to-Equity (D/E)** | {f'{r.debt_to_equity}x' if r.debt_to_equity is not None else 'N/A'} | Caution > 1.5x, Critical > 2.5x |",
                f"| **Interest Coverage (EBIT / Interest)** | {f'{r.interest_coverage}x' if r.interest_coverage is not None else 'N/A'} | Warning < 3.0x, Distress < 1.0x |",
                f"| **Gross Margin %** | {f'{r.gross_margin_pct}%' if r.gross_margin_pct is not None else 'N/A'} | Contraction > 200 bps |",
                f"| **Operating Margin %** | {f'{r.operating_margin_pct}%' if r.operating_margin_pct is not None else 'N/A'} | Operating loss if < 0.0% |",
                f"| **Net Profit Margin %** | {f'{r.net_margin_pct}%' if r.net_margin_pct is not None else 'N/A'} | Negative signals bottom-line deficit |",
                f"| **Days Sales Outstanding (DSO)** | {f'{r.days_sales_outstanding} days' if r.days_sales_outstanding is not None else 'N/A'} | Spike > 15 days indicates channel stuffing |",
                f"| **Days Inventory Outstanding (DIO)** | {f'{r.days_inventory_outstanding} days' if r.days_inventory_outstanding is not None else 'N/A'} | Spike > 20 days indicates obsolescence |",
                f"| **Operating Cash Flow to Net Income** | {f'{r.operating_cash_flow_to_net_income}x' if r.operating_cash_flow_to_net_income is not None else 'N/A'} | Healthy >= 1.0x, Poor quality < 0.4x |",
                f"| **Beneish DSRI (Receivables Index)** | {f'{r.beneish_dsri}' if r.beneish_dsri is not None else 'N/A'} | Flagged if > 1.20 |",
                f"| **Beneish TATA (Accruals to Assets)** | {f'{r.beneish_tata}' if r.beneish_tata is not None else 'N/A'} | Flagged if > 0.07 |",
            ])

        lines.extend([
            "",
            "---",
            "",
            "## 4. Itemized Forensic Red Flags & Detailed Findings",
            "",
        ])

        if not report.flags:
            lines.append("*No red flags identified during the automated audit scan.*")
        else:
            for idx, flag in enumerate(report.flags, start=1):
                lines.extend([
                    f"### #{idx}. [{flag.id}] {flag.title}",
                    f"- **Severity:** **{flag.severity.value}**",
                    f"- **Category:** `{flag.category.value}`",
                    f"- **Issue Description:** {flag.description}",
                ])

                if flag.threshold_breached:
                    lines.append(f"- **Threshold Violated:** `{flag.threshold_breached}`")
                if flag.evidence:
                    lines.append(f"- **Document Citation / Calculation:**\n  > {flag.evidence.replace(chr(10), ' ')}")

                lines.append(f"- **Forensic Risk Implications:** {flag.implications}")

                if flag.recommendations:
                    lines.append("- **Recommended Auditor & Analyst Next Steps:**")
                    for rec in flag.recommendations:
                        lines.append(f"  - [ ] {rec}")

                lines.append("")

        lines.extend([
            "---",
            "*Report generated automatically by Finsight AI — Red Flag Agent.*",
        ])

        return "\n".join(lines)
