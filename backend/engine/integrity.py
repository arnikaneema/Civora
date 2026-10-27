from pathlib import Path
from typing import List, Dict, Any
import pypdf
from backend.models.schemas import ValidationFinding, FindingSeverity, CheckStatus

def check_pdf_integrity(file_path: Path, filename: str) -> List[ValidationFinding]:
    findings: List[ValidationFinding] = []
    
    try:
        reader = pypdf.PdfReader(str(file_path))
        meta = reader.metadata or {}
        
        # 1. Inspect PDF structure
        if reader.is_encrypted:
            findings.append(ValidationFinding(
                finding_id=f"INT-{filename[:6]}-01",
                check_name="Document Encryption Check",
                status=CheckStatus.NEEDS_REVIEW,
                severity=FindingSeverity.MEDIUM,
                expected_value="Unencrypted, readable PDF",
                observed_value="Encrypted / Password-protected PDF",
                document_name=filename,
                page_number=1,
                supporting_evidence=f"File {filename} is marked as encrypted in PDF catalogue.",
                explanation="Encrypted files prevent automated compliance parsing.",
                recommended_action="Provide an unencrypted or digitally signed version of the document.",
                needs_manual_review=True
            ))

        # 2. Check metadata timestamps (CreationDate vs ModDate)
        creation = str(meta.get("/CreationDate", ""))
        mod = str(meta.get("/ModDate", ""))
        if creation and mod and creation != mod:
            findings.append(ValidationFinding(
                finding_id=f"INT-{filename[:6]}-02",
                check_name="Document Modification Metadata",
                status=CheckStatus.NEEDS_REVIEW,
                severity=FindingSeverity.LOW,
                expected_value="Original unmodified document stream",
                observed_value=f"Modified after creation (Created: {creation[:10]}, Mod: {mod[:10]})",
                document_name=filename,
                page_number=1,
                supporting_evidence=f"PDF metadata reflects modification timestamp different from creation.",
                explanation="Modifications can be routine (e.g., scanner compression or resaving), but may warrant review if unexpected.",
                recommended_action="Inspect document visually to ensure text and numbers were not altered post-issuance.",
                needs_manual_review=True
            ))

        # 3. Check for digital signatures or form fields
        has_signatures = False
        try:
            fields = reader.get_fields()
            if fields:
                for k, v in fields.items():
                    if v.get("/FT") == "/Sig":
                        has_signatures = True
                        break
        except Exception:
            pass

        if has_signatures:
            findings.append(ValidationFinding(
                finding_id=f"INT-{filename[:6]}-03",
                check_name="Digital Signature Presence",
                status=CheckStatus.PASSED,
                severity=FindingSeverity.INFORMATIONAL,
                expected_value="Signature present",
                observed_value="Cryptographic digital signature field detected",
                document_name=filename,
                page_number=1,
                supporting_evidence="PDF cryptographic signature container detected in document catalogue.",
                explanation="Cryptographic signature detected. Note: Root CA certificate chain must still be validated against official authority trust store.",
                recommended_action="No action needed. Digital signature recorded.",
                needs_manual_review=False
            ))
        else:
            findings.append(ValidationFinding(
                finding_id=f"INT-{filename[:6]}-04",
                check_name="Official Issuer Verification Scope",
                status=CheckStatus.NOT_CHECKED,
                severity=FindingSeverity.INFORMATIONAL,
                expected_value="Authoritative Issuer Registry Lookup",
                observed_value="Official issuer verification was not performed.",
                document_name=filename,
                page_number=1,
                supporting_evidence="No live government registry or trust-chain verification API integrated for this document.",
                explanation="Official issuer verification was not performed. Document is assessed on internal consistency and completeness.",
                recommended_action="Verify against physical original or issuer portal if required by high-security protocol.",
                needs_manual_review=False
            ))

    except Exception as e:
        findings.append(ValidationFinding(
            finding_id=f"INT-{filename[:6]}-ERR",
            check_name="Document File Integrity",
            status=CheckStatus.FAILED,
            severity=FindingSeverity.HIGH,
            expected_value="Valid PDF specification",
            observed_value=f"Corrupt or unreadable structure: {str(e)}",
            document_name=filename,
            page_number=1,
            supporting_evidence=f"PDF reader failed to parse file headers.",
            explanation="The uploaded PDF file appears damaged or incomplete.",
            recommended_action="Re-scan or export the document and re-upload.",
            needs_manual_review=True
        ))

    return findings
