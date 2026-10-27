import pytest
from backend.engine.validator import validate_application, string_similarity, parse_date
from backend.models.schemas import ExtractedDocumentInfo, ExtractedField, CheckStatus, FindingSeverity

def test_string_similarity():
    assert string_similarity("Aarav Sharma", "Aarav Sharma") == 1.0
    assert string_similarity("Aarav Sharma", "aarav sharma") == 1.0
    assert string_similarity("Arun Kumar Sharma", "Arun K. Verma") < 0.75
    assert string_similarity("Priya Nair", "Priya K. Nair") >= 0.75

def test_parse_date():
    valid, dt = parse_date("14/08/2004")
    assert valid is True
    assert dt.year == 2004 and dt.month == 8 and dt.day == 14

    invalid, _ = parse_date("not-a-date")
    assert invalid is False

def test_completeness_missing_mandatory_doc():
    # Only upload application form, but scholarship requires identity_proof, income_cert, address_proof
    doc = ExtractedDocumentInfo(
        document_id="doc1",
        filename="app.pdf",
        category="application_form",
        file_size_bytes=1000,
        page_count=1,
        extracted_fields={
            "applicant_name": ExtractedField(field_name="applicant_name", value="Test User", confidence=1.0, source_document="app.pdf", page_number=1)
        }
    )
    findings, risks, fields = validate_application("scholarship", [doc])
    
    # Missing mandatory identity_proof should produce a FAILED finding
    missing_id_findings = [f for f in findings if f.finding_id == "DOC-REQ-identity_proof"]
    assert len(missing_id_findings) == 1
    assert missing_id_findings[0].status == CheckStatus.FAILED
    assert missing_id_findings[0].severity == FindingSeverity.HIGH

def test_cross_document_name_mismatch():
    doc1 = ExtractedDocumentInfo(
        document_id="doc1",
        filename="app.pdf",
        category="application_form",
        file_size_bytes=1000,
        page_count=1,
        extracted_fields={
            "applicant_name": ExtractedField(field_name="applicant_name", value="Aarav Sharma", confidence=1.0, source_document="app.pdf", page_number=1)
        }
    )
    doc2 = ExtractedDocumentInfo(
        document_id="doc2",
        filename="id.pdf",
        category="identity_proof",
        file_size_bytes=1000,
        page_count=1,
        extracted_fields={
            "applicant_name": ExtractedField(field_name="applicant_name", value="Rajesh Gupta", confidence=1.0, source_document="id.pdf", page_number=1)
        }
    )
    findings, risks, fields = validate_application("scholarship", [doc1, doc2])
    
    mismatch_findings = [f for f in findings if "CROSS-NAME-MISMATCH" in f.finding_id]
    assert len(mismatch_findings) == 1
    assert mismatch_findings[0].status == CheckStatus.FAILED
    assert mismatch_findings[0].severity == FindingSeverity.HIGH
