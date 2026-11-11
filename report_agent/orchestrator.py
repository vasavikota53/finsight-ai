
from pathlib import Path

from red_flag_agent.agent import RedFlagAgent
from report_agent.pdf_generator import generate_pdf


class FinancialResearchOrchestrator:
    """
    Coordinates available agents and generates the final research report.
    """

    def __init__(self):
        self.red_flag_agent = RedFlagAgent()

    def analyze_document(self, pdf_path, company_name=None):
        pdf_path = Path(pdf_path)

        if not pdf_path.exists():
            raise FileNotFoundError("Uploaded PDF was not found.")

        # Step 1: Run the existing Red Flag Agent
        red_flag_report = self.red_flag_agent.scan_document(
            file_path=pdf_path,
            company_name=company_name
        )

        # Step 2: Collect the available agent output
        report_data = {
            "company_name": red_flag_report.company_name,
            "analyzed_at": red_flag_report.analyzed_at,
            "scan_source": red_flag_report.scan_source,
            "risk_score": red_flag_report.overall_risk_score,
            "risk_level": red_flag_report.overall_risk_level,
            "executive_summary": red_flag_report.executive_summary,
            "key_takeaways": red_flag_report.key_takeaways,
            "total_flags": red_flag_report.total_flags,
            "flags": [
                flag.model_dump(mode="json")
                for flag in red_flag_report.flags
            ],
            "ratios": (
                red_flag_report.ratios.model_dump()
                if red_flag_report.ratios else {}
            ),
            "extracted_metrics": red_flag_report.extracted_metrics or {},
            "comparison": None,
        }

        # Step 3: Generate the final PDF
        output_dir = Path("generated_reports")
        output_dir.mkdir(exist_ok=True)

        pdf_path_output = output_dir / (
            f"{pdf_path.stem}_financial_report.pdf"
        )

        generate_pdf(report_data, pdf_path_output)

        return {
            "report_data": report_data,
            "pdf_path": str(pdf_path_output.resolve())
        }
