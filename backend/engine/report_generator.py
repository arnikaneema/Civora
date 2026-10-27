import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from backend.models.schemas import ApplicationRecord
from backend.config import REPORT_DIR

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        # Header
        self.drawString(54, 750, "DOCUSURE AI — Verification & Compliance Report")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Footer
        self.line(54, 45, 558, 45)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.drawString(54, 32, "Confidential — Evaluated under configured rules. Not an official issuer certificate.")
        self.restoreState()

def generate_pdf_report(record: ApplicationRecord) -> Path:
    pdf_path = REPORT_DIR / f"{record.application_id}_report.pdf"

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#10233F')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#2563EB')
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#10233F'),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#172033')
    )

    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("DOCUSURE AI", title_style))
    elements.append(Paragraph("Application Validation, Document Authentication & Regulatory Compliance Report", subtitle_style))
    elements.append(Spacer(1, 10))

    # Demo Banner if synthetic
    if record.is_demo:
        demo_banner = Table(
            [[Paragraph("<b>ILLUSTRATIVE DEMONSTRATION RECORD:</b> Generated for technical validation testing. Not a live legal document.", body_style)]],
            colWidths=[504]
        )
        demo_banner.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF3C7')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#B45309')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(demo_banner)
        elements.append(Spacer(1, 10))

    # Meta Overview Box
    status_bg = "#DCFCE7" if "Passed" in record.overall_status.value else ("#FEE2E2" if "Action" in record.overall_status.value else "#E0E7FF")
    status_fg = "#15803D" if "Passed" in record.overall_status.value else ("#B91C1C" if "Action" in record.overall_status.value else "#4338CA")

    meta_data = [
        [
            Paragraph("<b>Application ID:</b>", body_style), Paragraph(record.application_id, body_style),
            Paragraph("<b>Processing Date:</b>", body_style), Paragraph(record.processing_date, body_style)
        ],
        [
            Paragraph("<b>Application Category:</b>", body_style), Paragraph(record.category_title, body_style),
            Paragraph("<b>Submission Date:</b>", body_style), Paragraph(record.submission_date, body_style)
        ],
        [
            Paragraph("<b>Overall Status:</b>", body_style),
            Paragraph(f"<b><font color='{status_fg}'>{record.overall_status.value}</font></b>", body_style),
            Paragraph("<b>Verification Scope:</b>", body_style), Paragraph("Algorithmic Rules & Evidence", body_style)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[110, 142, 110, 142])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # Executive Summary Counts
    summary_data = [
        [
            Paragraph("<b>Total Checks</b>", body_style),
            Paragraph("<b>Passed Checks</b>", body_style),
            Paragraph("<b>Requires Review</b>", body_style),
            Paragraph("<b>Failed / Missing</b>", body_style),
            Paragraph("<b>Not Checked</b>", body_style),
        ],
        [
            Paragraph(f"<b>{record.total_checks}</b>", body_style),
            Paragraph(f"<font color='#15803D'><b>{record.passed_checks}</b></font>", body_style),
            Paragraph(f"<font color='#4338CA'><b>{record.review_checks}</b></font>", body_style),
            Paragraph(f"<font color='#B91C1C'><b>{record.failed_checks}</b></font>", body_style),
            Paragraph(f"<b>{record.not_checked_checks}</b>", body_style),
        ]
    ]
    sum_table = Table(summary_data, colWidths=[100, 100, 100, 104, 100])
    sum_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#10233F')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BACKGROUND', (0,1), (-1,1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10233F')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(sum_table)
    elements.append(Spacer(1, 14))

    # Documents Processed Section
    elements.append(Paragraph("1. Processed Document Inventory", h2_style))
    doc_rows = [[
        Paragraph("<b>Document Name</b>", body_style),
        Paragraph("<b>Category</b>", body_style),
        Paragraph("<b>Pages</b>", body_style),
        Paragraph("<b>Readability Status</b>", body_style)
    ]]
    for d in record.documents:
        status_label = "<font color='#15803D'>Legible / Processed</font>" if d.extraction_status == "success" else "<font color='#B45309'>Partial OCR</font>"
        doc_rows.append([
            Paragraph(d.filename, body_style),
            Paragraph(d.category.replace('_', ' ').title(), body_style),
            Paragraph(str(d.page_count), body_style),
            Paragraph(status_label, body_style)
        ])
    doc_table = Table(doc_rows, colWidths=[180, 140, 64, 120])
    doc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(doc_table)
    elements.append(Spacer(1, 14))

    # Detailed Findings Table
    elements.append(Paragraph("2. Detailed Verification Findings", h2_style))
    if record.findings:
        f_rows = [[
            Paragraph("<b>Check / Finding</b>", body_style),
            Paragraph("<b>Status</b>", body_style),
            Paragraph("<b>Severity</b>", body_style),
            Paragraph("<b>Supporting Evidence & Action</b>", body_style)
        ]]
        for f in record.findings:
            f_color = "#15803D" if f.status.value == "Passed" else ("#B91C1C" if f.status.value == "Failed" else "#4338CA")
            desc_text = (
                f"<b>Evidence:</b> {f.supporting_evidence}<br/>"
                f"<b>Explanation:</b> {f.explanation}<br/>"
                f"<b>Action:</b> {f.recommended_action}"
            )
            f_rows.append([
                Paragraph(f"<b>{f.check_name}</b><br/><font color='#64748B'>{f.finding_id}</font>", body_style),
                Paragraph(f"<font color='{f_color}'><b>{f.status.value}</b></font>", body_style),
                Paragraph(f.severity.value, body_style),
                Paragraph(desc_text, body_style)
            ])
        f_table = Table(f_rows, colWidths=[130, 70, 70, 234])
        f_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(f_table)
    else:
        elements.append(Paragraph("No specific findings recorded.", body_style))
    elements.append(Spacer(1, 14))

    # Regulatory Compliance Section
    elements.append(Paragraph("3. Regulatory Compliance Evaluation", h2_style))
    comp_rows = [[
        Paragraph("<b>Requirement Title & Rule ID</b>", body_style),
        Paragraph("<b>Outcome</b>", body_style),
        Paragraph("<b>Source / Authority Reference</b>", body_style),
        Paragraph("<b>Evaluated Evidence & Reason</b>", body_style)
    ]]
    for c in record.compliance_results:
        c_color = "#15803D" if c.outcome.value == "Passed" else ("#B91C1C" if c.outcome.value == "Failed" else "#4338CA")
        comp_rows.append([
            Paragraph(f"<b>{c.requirement_title}</b><br/><font color='#64748B'>v{c.rule_version} • {c.rule_id}</font>", body_style),
            Paragraph(f"<font color='{c_color}'><b>{c.outcome.value}</b></font>", body_style),
            Paragraph(f"{c.source_name}<br/><font color='#64748B'>{c.section_reference or ''}</font>", body_style),
            Paragraph(c.outcome_reason or c.description, body_style)
        ])
    comp_table = Table(comp_rows, colWidths=[140, 70, 130, 164])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(comp_table)
    elements.append(Spacer(1, 14))

    # Readiness & Risk Section
    if record.readiness_checklist:
        elements.append(Paragraph("4. Application Readiness & Risk Checklist", h2_style))
        r_rows = [[
            Paragraph("<b>Identified Potential Risk</b>", body_style),
            Paragraph("<b>Severity</b>", body_style),
            Paragraph("<b>Applicable Rule</b>", body_style),
            Paragraph("<b>Corrective Recommendation</b>", body_style)
        ]]
        for r in record.readiness_checklist:
            r_rows.append([
                Paragraph(f"<b>{r.potential_risk}</b><br/><font color='#64748B'>{r.reason}</font>", body_style),
                Paragraph(r.severity.value, body_style),
                Paragraph(r.applicable_rule, body_style),
                Paragraph(r.recommended_action, body_style)
            ])
        r_table = Table(r_rows, colWidths=[150, 60, 120, 174])
        r_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(r_table)
        elements.append(Spacer(1, 14))

    # Human Review Log
    if record.human_reviews:
        elements.append(Paragraph("5. Authorised Human Review Audit Trail", h2_style))
        h_rows = [[
            Paragraph("<b>Finding ID</b>", body_style),
            Paragraph("<b>Review Decision</b>", body_style),
            Paragraph("<b>Reviewer</b>", body_style),
            Paragraph("<b>Notes & Timestamp</b>", body_style)
        ]]
        for h in record.human_reviews:
            h_rows.append([
                Paragraph(h.finding_id, body_style),
                Paragraph(f"<b>{h.decision}</b>", body_style),
                Paragraph(h.reviewer_name, body_style),
                Paragraph(f"{h.notes}<br/><font color='#64748B'>{h.timestamp}</font>", body_style)
            ])
        h_table = Table(h_rows, colWidths=[100, 110, 100, 194])
        h_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(h_table)
        elements.append(Spacer(1, 14))

    # Important Verification Limitations & Caveats
    elements.append(Paragraph("Important Verification Scope and System Limitations", h2_style))
    disclaimer_text = (
        "<b>LEGAL & COMPLIANCE CAVEATS:</b><br/>"
        "1. <b>Official Issuer Verification Scope:</b> Official issuer verification was not performed. "
        "Docusure AI evaluates internal cross-document consistency, cryptographic document structure, and configured rule constraints. "
        "This report does NOT constitute an authoritative certificate of document genuineness.<br/>"
        "2. <b>Discrepancies vs. Fraud:</b> Flagged inconsistencies indicate information variance or typographical mismatches; "
        "they do not constitute definitive proof of fraudulent intent without independent administrative review.<br/>"
        "3. <b>Demonstration Rules:</b> Any rules designated as demo rules represent illustrative algorithmic scenarios and are not intended "
        "as binding legal regulations."
    )
    disclaimer_box = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[504])
    disclaimer_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(disclaimer_box)

    doc.build(elements, canvasmaker=NumberedCanvas)
    return pdf_path
