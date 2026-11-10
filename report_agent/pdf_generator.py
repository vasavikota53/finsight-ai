
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def safe_text(value):
    """Safely convert dynamic values into ReportLab paragraph text."""
    if value is None:
        return "Not available"
    return escape(str(value))


def generate_pdf(data, output_path):

    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#17365D"),
        spaceAfter=15
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#17365D"),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = styles["BodyText"]

    story = []

    # Title
    story.append(Paragraph("FINSIGHT AI", title_style))

    story.append(
        Paragraph("Financial Research Analysis Report", styles["Heading2"])
    )

    story.append(Spacer(1, 15))

    # Company details
    story.append(
        Paragraph(
            f"<b>Company:</b> {safe_text(data.get('company_name'))}",
            body_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Analysis Date:</b> {safe_text(data.get('analyzed_at'))}",
            body_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Source:</b> {safe_text(data.get('scan_source'))}",
            body_style
        )
    )

    # 1. Executive Summary
    story.append(
        Paragraph("1. Executive Summary", heading_style)
    )

    story.append(
        Paragraph(
            safe_text(data.get("executive_summary")),
            body_style
        )
    )

    # 2. Key Financials
    story.append(
        Paragraph("2. Key Financials", heading_style)
    )

    ratios = data.get("ratios") or {}

    ratio_rows = [["Financial Metric", "Value"]]

    for metric, value in ratios.items():

        display_name = str(metric).replace("_", " ").title()

        display_value = (
            "Not available" if value is None else str(value)
        )

        ratio_rows.append([
            safe_text(display_name),
            safe_text(display_value)
        ])

    if len(ratio_rows) == 1:
        ratio_rows.append([
            "Financial ratios",
            "Not available"
        ])

    ratio_table = Table(
        ratio_rows,
        colWidths=[3.5 * inch, 2 * inch]
    )

    ratio_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#17365D")
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.grey
            ),
            (
                "PADDING",
                (0, 0),
                (-1, -1),
                7
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
        ])
    )

    story.append(ratio_table)

    # 3. Red Flag Analysis
    story.append(
        Paragraph("3. Red Flag Analysis", heading_style)
    )

    story.append(
        Paragraph(
            f"<b>Overall Risk Score:</b> "
            f"{safe_text(data.get('risk_score'))} / 100",
            body_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Risk Level:</b> "
            f"{safe_text(data.get('risk_level'))}",
            body_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Red Flags:</b> "
            f"{safe_text(data.get('total_flags'))}",
            body_style
        )
    )

    flags = data.get("flags") or []

    if flags:

        for index, flag in enumerate(flags, start=1):

            story.append(Spacer(1, 8))

            story.append(
                Paragraph(
                    f"<b>{index}. "
                    f"{safe_text(flag.get('title'))}</b>",
                    body_style
                )
            )

            story.append(
                Paragraph(
                    f"Severity: {safe_text(flag.get('severity'))}",
                    body_style
                )
            )

            story.append(
                Paragraph(
                    f"Description: "
                    f"{safe_text(flag.get('description'))}",
                    body_style
                )
            )

            if flag.get("evidence"):

                story.append(
                    Paragraph(
                        f"Evidence: "
                        f"{safe_text(flag.get('evidence'))}",
                        body_style
                    )
                )

            story.append(
                Paragraph(
                    f"Implications: "
                    f"{safe_text(flag.get('implications'))}",
                    body_style
                )
            )

            recommendations = flag.get("recommendations") or []

            for recommendation in recommendations:

                story.append(
                    Paragraph(
                        f"- {safe_text(recommendation)}",
                        body_style
                    )
                )

    else:

        story.append(
            Paragraph(
                "No red flags were returned by the analysis agent.",
                body_style
            )
        )

    # 4. Company Comparison
    story.append(
        Paragraph("4. Company Comparison", heading_style)
    )

    story.append(
        Paragraph(
            "Comparison results are not available yet. "
            "This section will be populated when the "
            "Comparison Agent is integrated.",
            body_style
        )
    )

    # 5. Outlook
    story.append(
        Paragraph("5. Outlook", heading_style)
    )

    takeaways = data.get("key_takeaways") or []

    if takeaways:

        for takeaway in takeaways:

            story.append(
                Paragraph(
                    f"- {safe_text(takeaway)}",
                    body_style
                )
            )

    else:

        story.append(
            Paragraph(
                "No additional outlook observations were "
                "returned by the analysis agent.",
                body_style
            )
        )

    # Disclaimer
    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "Generated by Finsight AI. Automated analysis "
            "should be reviewed by a qualified financial "
            "professional.",
            styles["Italic"]
        )
    )

    # Generate PDF
    document.build(story)

    return output_path
