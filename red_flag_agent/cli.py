"""
Command-Line Interface (CLI) for Red Flag Agent.
Provides interactive analysis and command-line execution for internship demonstrations.
"""

import argparse
import json
import sys
from pathlib import Path

# Add project root to path for direct invocation
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from red_flag_agent.agent import RedFlagAgent
from red_flag_agent.models import SeverityLevel
from red_flag_agent.report_generator import ReportGenerator
from red_flag_agent.sample_data import SAMPLE_CASES


# Ensure safe output encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def print_banner():
    banner = """
========================================================================
             [!] FINSIGHT AI -- RED FLAG FORENSIC AGENT
   Scans for Debt Distress, Margin Compression, Auditor Qualifications,
                and Unusual Financial Patterns Automatically
========================================================================
"""
    print(banner)


def format_terminal_report(report) -> None:
    """Prints a styled terminal summary."""
    print("\n" + "=" * 72)
    print(f" COMPANY AUDITED   : {report.company_name}")
    print(f" AUDIT TIMESTAMP   : {report.analyzed_at}")
    print(f" INPUT SOURCE      : {report.scan_source}")
    print(f" OVERALL RISK SCORE: {report.overall_risk_score} / 100")
    print(f" OVERALL RISK LEVEL: {report.overall_risk_level}")
    print("=" * 72)

    print("\n[EXECUTIVE SUMMARY]")
    print(report.executive_summary)

    print("\n[KEY TAKEAWAYS]")
    for item in report.key_takeaways:
        print(f"  * {item}")

    print("\n[RISK SEVERITY BREAKDOWN]")
    for sev, count in report.flags_count_by_severity.items():
        symbol = "[!]" if sev == "CRITICAL" else ("[*]" if sev == "HIGH" else ("[-]" if sev == "MEDIUM" else "[i]"))
        print(f"  {symbol} {sev:<10}: {count} flags")

    print("\n[CATEGORY BREAKDOWN]")
    for cat, count in report.flags_count_by_category.items():
        print(f"  • {cat:<48}: {count} flags")

    if report.ratios:
        r = report.ratios
        print("\n[KEY COMPUTED RATIOS & FORENSICS]")
        if r.debt_to_equity is not None:
            print(f"  • Debt-to-Equity (D/E)         : {r.debt_to_equity:.2f}x (Warning > 1.5x)")
        if r.interest_coverage is not None:
            print(f"  • Interest Coverage (EBIT/Int) : {r.interest_coverage:.2f}x (Distress < 1.0x)")
        if r.gross_margin_pct is not None:
            print(f"  • Gross Margin %               : {r.gross_margin_pct:.1f}%")
        if r.operating_margin_pct is not None:
            print(f"  • Operating Margin %           : {r.operating_margin_pct:.1f}%")
        if r.days_sales_outstanding is not None:
            print(f"  • Days Sales Outstanding (DSO) : {r.days_sales_outstanding:.1f} days")
        if r.days_inventory_outstanding is not None:
            print(f"  • Days Inventory Outstanding   : {r.days_inventory_outstanding:.1f} days")
        if r.operating_cash_flow_to_net_income is not None:
            print(f"  • CFO / Net Income             : {r.operating_cash_flow_to_net_income:.2f}x (Divergence < 0.4x)")
        if r.beneish_dsri is not None:
            print(f"  • Beneish DSRI (Receivables)   : {r.beneish_dsri:.2f} (Warning > 1.20)")
        if r.beneish_tata is not None:
            print(f"  • Beneish TATA (Accruals/Assets): {r.beneish_tata:.4f} (Warning > 0.07)")

    print("\n" + "=" * 72)
    print(f" DETAILED RED FLAGS ({report.total_flags} IDENTIFIED)")
    print("=" * 72)

    for idx, f in enumerate(report.flags, start=1):
        sev_sym = "[!] CRITICAL" if f.severity == SeverityLevel.CRITICAL else (
            "[*] HIGH" if f.severity == SeverityLevel.HIGH else (
                "[-] MEDIUM" if f.severity == SeverityLevel.MEDIUM else "[i] LOW"
            )
        )
        print(f"\n#{idx}. [{f.id}] {f.title}")
        print(f"    Severity   : {sev_sym}")
        print(f"    Category   : {f.category.value}")
        print(f"    Details    : {f.description}")
        if f.threshold_breached:
            print(f"    Breached   : {f.threshold_breached}")
        if f.evidence:
            first_line = f.evidence.strip().split("\n")[0]
            if len(first_line) > 120:
                first_line = first_line[:117] + "..."
            print(f"    Evidence   : {first_line}")
        print(f"    Forensic Risk: {f.implications}")
        if f.recommendations:
            print("    Auditor Steps:")
            for rec in f.recommendations[:2]:
                print(f"      - {rec}")

    print("\n" + "=" * 72 + "\n")


def interactive_menu(agent: RedFlagAgent):
    """Interactive CLI menu for demonstration."""
    while True:
        print_banner()
        print("Select an option:")
        print("  1. Run Scan on Case 1: TechCorp Inc. (Debt Distress & Solvency Crisis)")
        print("  2. Run Scan on Case 2: RetailChain Ltd. (Forensic Earnings Manipulation)")
        print("  3. Run Scan on Case 3: Apex Industrial (Healthy Clean Blue-Chip)")
        print("  4. Run Scan on Case 4: BioPharma Global (SEC Inquiry & Auditor Resignation)")
        print("  5. Scan a PDF or Text Document from Disk")
        print("  6. Enter Custom Financial Disclosures / Excerpt")
        print("  7. Exit")

        choice = input("\nEnter choice (1-7): ").strip()

        if choice == "1":
            case = SAMPLE_CASES["techcorp"]
            report = agent.scan_hybrid(
                text=case["text"],
                current=case["current"],
                previous=case["previous"],
                company_name=case["company"],
                scan_source="Benchmark: TechCorp Case",
            )
            format_terminal_report(report)
        elif choice == "2":
            case = SAMPLE_CASES["retailchain"]
            report = agent.scan_hybrid(
                text=case["text"],
                current=case["current"],
                previous=case["previous"],
                company_name=case["company"],
                scan_source="Benchmark: RetailChain Case",
            )
            format_terminal_report(report)
        elif choice == "3":
            case = SAMPLE_CASES["apex"]
            report = agent.scan_hybrid(
                text=case["text"],
                current=case["current"],
                previous=case["previous"],
                company_name=case["company"],
                scan_source="Benchmark: Apex Industrial Case",
            )
            format_terminal_report(report)
        elif choice == "4":
            case = SAMPLE_CASES["biopharma"]
            report = agent.scan_text(
                text=case["text"],
                company_name=case["company"],
            )
            format_terminal_report(report)
        elif choice == "5":
            file_path = input("Enter full path to PDF or TXT file: ").strip().strip('"')
            p = Path(file_path)
            if not p.exists():
                print(f"\n[Error] File not found: {file_path}\n")
                continue
            comp = input("Enter company name (or press Enter for filename): ").strip()
            report = agent.scan_document(p, company_name=comp or None)
            format_terminal_report(report)
        elif choice == "6":
            print("\nEnter or paste disclosures (type 'DONE' on a new line when finished):")
            lines = []
            while True:
                line = input()
                if line.strip() == "DONE":
                    break
                lines.append(line)
            raw_text = "\n".join(lines)
            if not raw_text.strip():
                print("No text entered.")
                continue
            comp = input("Enter company name: ").strip() or "Custom Company"
            report = agent.scan_text(raw_text, company_name=comp)
            format_terminal_report(report)
        elif choice == "7":
            print("\nExiting Red Flag Agent. Goodbye!")
            break
        else:
            print("Invalid selection. Please choose 1-7.")

        cont = input("Press Enter to return to main menu (or 'q' to quit): ").strip().lower()
        if cont == "q":
            break


def main():
    parser = argparse.ArgumentParser(
        description="Finsight AI — Red Flag Forensic Agent CLI"
    )
    parser.add_argument(
        "--sample",
        choices=["techcorp", "retailchain", "apex", "biopharma"],
        help="Run audit scan on built-in realistic benchmark cases",
    )
    parser.add_argument(
        "--pdf",
        type=str,
        help="Path to financial PDF report to scan",
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Path to text report to scan",
    )
    parser.add_argument(
        "--company",
        type=str,
        default=None,
        help="Company name for reporting",
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Save full Markdown audit report to this file path",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw structured JSON instead of text tables",
    )

    args = parser.parse_args()
    agent = RedFlagAgent()

    if not any([args.sample, args.pdf, args.file]):
        # No flags passed, run interactive mode
        interactive_menu(agent)
        return

    # Sample Case
    if args.sample:
        case = SAMPLE_CASES[args.sample]
        report = agent.scan_hybrid(
            text=case["text"],
            current=case["current"],
            previous=case["previous"],
            company_name=args.company or case["company"],
            scan_source=f"Benchmark Case: {args.sample}",
        )
    # PDF document
    elif args.pdf:
        pdf_path = Path(args.pdf)
        report = agent.scan_document(pdf_path, company_name=args.company)
    # Text document
    elif args.file:
        file_path = Path(args.file)
        report = agent.scan_document(file_path, company_name=args.company)

    if args.json:
        print(json.dumps(report.model_dump(), indent=2))
    else:
        format_terminal_report(report)

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        md = ReportGenerator.to_markdown(report)
        out_path.write_text(md, encoding="utf-8")
        print(f"Audit report saved successfully to: {out_path.resolve()}")


if __name__ == "__main__":
    main()
