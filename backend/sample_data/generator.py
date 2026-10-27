import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

SAMPLE_DIR = Path(__file__).resolve().parent

def create_simple_pdf(filepath: Path, title: str, fields: dict, doc_type: str):
    doc = SimpleDocTemplate(str(filepath), pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()
    
    t_style = ParagraphStyle('T', fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=colors.HexColor('#10233F'))
    sub_style = ParagraphStyle('Sub', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#2563EB'))
    b_style = ParagraphStyle('B', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#172033'))
    
    elements = [
        Paragraph(title.upper(), t_style),
        Paragraph(f"Official Document Category: {doc_type} | [SYNTHETIC DEMO SAMPLE]", sub_style),
        Spacer(1, 15)
    ]
    
    table_data = []
    for k, v in fields.items():
        table_data.append([
            Paragraph(f"<b>{k}:</b>", b_style),
            Paragraph(str(v), b_style)
        ])
        
    t = Table(table_data, colWidths=[180, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t)
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(
        "<b>Notice:</b> This document was generated exclusively for algorithmic demonstration and testing purposes. "
        "It contains synthetic sample data.",
        ParagraphStyle('Notice', fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor('#64748B'))
    ))
    
    doc.build(elements)

def generate_scenario_files():
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    
    # -------------------------------------------------------------
    # Scenario A: Complete Application (Scholarship)
    # -------------------------------------------------------------
    # 1. Application Form
    create_simple_pdf(
        SAMPLE_DIR / "demo_a_app_form.pdf",
        "National Scholarship Application Form",
        {
            "Applicant Name": "Aarav Rajesh Sharma",
            "Date of Birth": "14/08/2004",
            "Application ID": "SCH-2026-9901",
            "Declared Income": "INR 240,000",
            "Permanent Address": "Flat 402, Lotus Heights, MG Road, Bengaluru, Karnataka 560001",
            "Issue Date": "10/01/2026",
            "Course Enrolled": "B.Tech Computer Science (Year 2)"
        },
        "Application Form"
    )
    
    # 2. Identity Proof (Passport / National ID)
    create_simple_pdf(
        SAMPLE_DIR / "demo_a_id_proof.pdf",
        "Government Identity Proof",
        {
            "Applicant Name": "Aarav Rajesh Sharma",
            "Date of Birth": "14/08/2004",
            "Document Reference No": "ID-IND-7782914",
            "Address": "Flat 402, Lotus Heights, MG Road, Bengaluru, Karnataka 560001",
            "Issue Date": "15/05/2022",
            "Expiry Date": "14/05/2032"
        },
        "Identity Proof"
    )

    # 3. Income Certificate
    create_simple_pdf(
        SAMPLE_DIR / "demo_a_income_cert.pdf",
        "Competent Revenue Authority Income Certificate",
        {
            "Applicant Name": "Aarav Rajesh Sharma",
            "Annual Income": "INR 240,000",
            "Certificate No": "REV-INC-2025-412",
            "Issue Date": "05/11/2025",
            "Valid Till": "31/03/2027"
        },
        "Income Certificate"
    )

    # 4. Address Proof
    create_simple_pdf(
        SAMPLE_DIR / "demo_a_address_proof.pdf",
        "Resident Domicile & Address Proof",
        {
            "Applicant Name": "Aarav Rajesh Sharma",
            "Permanent Address": "Flat 402, Lotus Heights, MG Road, Bengaluru, Karnataka 560001",
            "Document Ref No": "DOM-KAR-88912",
            "Issue Date": "12/04/2023"
        },
        "Address Proof"
    )

    # -------------------------------------------------------------
    # Scenario B: Missing Information (Scholarship)
    # Missing Income Certificate and missing DOB
    # -------------------------------------------------------------
    create_simple_pdf(
        SAMPLE_DIR / "demo_b_app_form.pdf",
        "Scholarship Application Form",
        {
            "Applicant Name": "Priya Nair",
            "Application ID": "SCH-2026-4421",
            "Permanent Address": "12 Ocean View, Marine Drive, Kochi, Kerala 682001",
            "Issue Date": "15/01/2026"
            # Missing Date of Birth & Declared Income
        },
        "Application Form"
    )
    create_simple_pdf(
        SAMPLE_DIR / "demo_b_id_proof.pdf",
        "Identity Proof Document",
        {
            "Applicant Name": "Priya Nair",
            "Document Reference No": "ID-KL-992381",
            "Issue Date": "20/08/2023",
            "Expiry Date": "19/08/2033"
        },
        "Identity Proof"
    )

    # -------------------------------------------------------------
    # Scenario C: Inconsistent Information (Scholarship)
    # Name mismatch (Arun Kumar Sharma vs Arun K. Verma) & Income conflict
    # -------------------------------------------------------------
    create_simple_pdf(
        SAMPLE_DIR / "demo_c_app_form.pdf",
        "Scholarship Application Form",
        {
            "Applicant Name": "Arun Kumar Sharma",
            "Date of Birth": "22/11/2003",
            "Application ID": "SCH-2026-6612",
            "Declared Income": "INR 180,000",
            "Permanent Address": "House 14, Civil Lines, Jaipur, Rajasthan 302006",
            "Issue Date": "02/02/2026"
        },
        "Application Form"
    )
    create_simple_pdf(
        SAMPLE_DIR / "demo_c_id_proof.pdf",
        "Government Identity Document",
        {
            # Mismatched name
            "Applicant Name": "Arun K. Verma",
            "Date of Birth": "22/11/2003",
            "Document Reference No": "ID-RJ-441290",
            "Issue Date": "10/06/2021",
            "Expiry Date": "09/06/2031"
        },
        "Identity Proof"
    )
    create_simple_pdf(
        SAMPLE_DIR / "demo_c_income_cert.pdf",
        "Income Certificate",
        {
            "Applicant Name": "Arun Kumar Sharma",
            # Conflicting higher income (exceeding ceiling)
            "Annual Income": "INR 450,000",
            "Certificate No": "INC-2025-9923",
            "Issue Date": "14/12/2025",
            "Valid Till": "31/12/2026"
        },
        "Income Certificate"
    )
    create_simple_pdf(
        SAMPLE_DIR / "demo_c_address_proof.pdf",
        "Resident Address Certificate",
        {
            "Applicant Name": "Arun Kumar Sharma",
            "Address": "House 14, Civil Lines, Jaipur, Rajasthan 302006",
            "Ref No": "DOM-RJ-3312",
            "Issue Date": "01/03/2023"
        },
        "Address Proof"
    )

if __name__ == "__main__":
    generate_scenario_files()
    print("Synthetic demo scenario PDFs successfully created.")
