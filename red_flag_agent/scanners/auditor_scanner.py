"""
Auditor Qualifications & Governance Scanner.
Scans auditor opinions, going concern warnings, adverse/qualified opinions,
material weaknesses in internal controls, auditor resignations, restatements,
and emphasis of matter disclosures automatically.
"""

import re
from typing import List
from ..models import RedFlagItem, SeverityLevel, RiskCategory
from ..config import AUDITOR_PATTERNS


class AuditorScanner:
    """Audits the independent auditor's report, internal controls, and governance disclosures."""

    AUDITOR_RULES = [
        {
            "key": "going_concern",
            "severity": SeverityLevel.CRITICAL,
            "title": "Going Concern Warning Disclosed by Auditor/Management",
            "description": "Auditor or management flagged substantial doubt regarding the entity's ability to continue as a going concern.",
            "implications": "Severe bankruptcy risk within the next 12 months; company may fail to realize assets and extinguish liabilities in normal business course.",
            "recommendations": [
                "Review management's remediation and cash conservation plan.",
                "Verify debt maturities, available credit facilities, and liquidation value of collateral.",
                "Inspect whether debtor-in-possession (DIP) or distressed financing is being pursued.",
            ],
        },
        {
            "key": "adverse_opinion",
            "severity": SeverityLevel.CRITICAL,
            "title": "Adverse Auditor's Opinion Issued",
            "description": "The independent auditor stated that the financial statements do NOT present fairly the financial position or results of operations in conformity with GAAP/IFRS.",
            "implications": "Pervasive and material misstatements across the financial records; reported figures cannot be relied upon for investment or valuation decisions.",
            "recommendations": [
                "Suspend reliance on historical financial statements.",
                "Investigate areas of pervasive disagreement between auditor and management.",
            ],
        },
        {
            "key": "disclaimer_of_opinion",
            "severity": SeverityLevel.CRITICAL,
            "title": "Disclaimer of Auditor's Opinion",
            "description": "The independent auditor was unable to obtain sufficient appropriate audit evidence and explicitly declined to express an audit opinion.",
            "implications": "Severe limitation of audit scope or missing books and records, creating high risk of undetected material fraud or off-balance sheet exposure.",
            "recommendations": [
                "Determine why auditor was blocked or unable to verify transactions.",
                "Review audit committee meeting minutes and whistleblower reports.",
            ],
        },
        {
            "key": "qualified_opinion",
            "severity": SeverityLevel.HIGH,
            "title": "Qualified Auditor's Opinion ('Except For')",
            "description": "Auditor issued a qualified opinion, citing specific material misstatements or scope limitations (e.g., inventory valuation, litigation accrual).",
            "implications": "Specific financial statement line items are unreliable or deviate from standard accounting principles.",
            "recommendations": [
                "Isolate the specific qualification item referenced in the audit opinion.",
                "Quantify potential balance sheet and P&L adjustments needed.",
            ],
        },
        {
            "key": "material_weakness",
            "severity": SeverityLevel.HIGH,
            "title": "Material Weakness in Internal Control Over Financial Reporting (ICFR)",
            "description": "Management and/or independent auditor identified one or more material weaknesses in internal controls.",
            "implications": "Reasonable possibility that a material misstatement will not be prevented or detected on a timely basis; heightened risk of future restatements.",
            "recommendations": [
                "Review management's remediation roadmap and expected timeline to fix.",
                "Identify control domains affected (IT general controls, revenue recognition, journal entries).",
            ],
        },
        {
            "key": "auditor_resignation_change",
            "severity": SeverityLevel.HIGH,
            "title": "Auditor Resignation, Dismissal, or Disagreements Reported",
            "description": "Disclosures indicate the independent accounting firm resigned, was terminated, or had unresolved disagreements with management.",
            "implications": "'Auditor shopping' or refusal by the auditor to sign off on aggressive accounting maneuvers; classic historical fraud precursor.",
            "recommendations": [
                "Examine Form 8-K / Item 4.01 filings or local equivalent for letters from the former auditor.",
                "Check for disagreements on accounting estimates, asset impairments, or internal controls.",
            ],
        },
        {
            "key": "restatements_errors",
            "severity": SeverityLevel.HIGH,
            "title": "Accounting Restatement or Material Error Correction",
            "description": "The company disclosed that prior financial statements were erroneous and must be restated or can no longer be relied upon.",
            "implications": "Confirms historical inaccuracies in reported earnings, revenue, or assets; may trigger regulatory probes and class action litigation.",
            "recommendations": [
                "Quantify the cumulative net income and shareholder equity reduction caused by the restatement.",
                "Verify whether compensation clawback provisions apply to executives.",
            ],
        },
        {
            "key": "emphasis_of_matter",
            "severity": SeverityLevel.MEDIUM,
            "title": "Auditor Emphasis of Matter / Key Audit Uncertainty",
            "description": "The auditor included an Emphasis of Matter paragraph drawing attention to significant litigation, regulatory probes, or valuation uncertainties.",
            "implications": "Highlights high-stakes risks that could materially alter financial position if adverse outcomes materialize.",
            "recommendations": [
                "Read referenced footnote disclosures in full.",
                "Track court dockets and regulatory enforcement filings.",
            ],
        },
    ]

    def scan_text(self, text: str) -> List[RedFlagItem]:
        """Scans extracted report text, footnotes, and audit opinions for governance red flags."""
        flags: List[RedFlagItem] = []

        for rule in self.AUDITOR_RULES:
            key = rule["key"]
            patterns = AUDITOR_PATTERNS.get(key, [])

            matched_snippets = []
            for pattern in patterns:
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    start = max(0, match.start() - 100)
                    end = min(len(text), match.end() + 120)
                    snippet = "..." + " ".join(text[start:end].split()) + "..."
                    matched_snippets.append(snippet)
                    if len(matched_snippets) >= 2:
                        break
                if matched_snippets:
                    break

            if matched_snippets:
                flags.append(
                    RedFlagItem(
                        id=f"RF-AUDIT-{key.upper()}",
                        category=RiskCategory.AUDITOR_QUALIFICATIONS,
                        severity=rule["severity"],
                        title=rule["title"],
                        description=rule["description"],
                        evidence="\n\n".join(matched_snippets),
                        implications=rule["implications"],
                        recommendations=rule["recommendations"],
                    )
                )

        return flags
