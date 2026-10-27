import re
from datetime import datetime
from difflib import SequenceMatcher
from typing import List, Dict, Any, Tuple
from backend.config import APPLICATION_CATEGORIES
from backend.models.schemas import (
    ValidationFinding, FindingSeverity, CheckStatus,
    ExtractedDocumentInfo, ReadinessItem
)

def string_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def parse_date(date_str: str) -> Tuple[bool, Any]:
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%m/%d/%Y",
        "%d.%m.%Y", "%Y.%m.%d", "%d/%m/%y", "%d-%b-%Y"
    ]
    cleaned = date_str.strip()
    for fmt in formats:
        try:
            return True, datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    return False, None

def validate_application(
    category: str,
    extracted_docs: List[ExtractedDocumentInfo]
) -> Tuple[List[ValidationFinding], List[ReadinessItem], Dict[str, Any]]:
    findings: List[ValidationFinding] = []
    readiness_items: List[ReadinessItem] = []
    consolidated_fields: Dict[str, Any] = {}

    category_config = APPLICATION_CATEGORIES.get(category, APPLICATION_CATEGORIES["custom"])
    required_docs = category_config.get("required_documents", [])

    # Map uploaded docs by category
    uploaded_by_cat: Dict[str, ExtractedDocumentInfo] = {}
    for doc in extracted_docs:
        uploaded_by_cat[doc.category] = doc

    # -------------------------------------------------------------
    # 1. DOCUMENT COMPLETENESS CHECKS
    # -------------------------------------------------------------
    for req in required_docs:
        req_type = req["type"]
        req_label = req["label"]
        mandatory = req.get("mandatory", True)

        if req_type in uploaded_by_cat:
            doc = uploaded_by_cat[req_type]
            findings.append(ValidationFinding(
                finding_id=f"DOC-REQ-{req_type}",
                check_name=f"Document Presence: {req_label}",
                status=CheckStatus.PASSED,
                severity=FindingSeverity.INFORMATIONAL,
                expected_value=f"Uploaded: {req_label}",
                observed_value=f"Present ({doc.filename})",
                document_name=doc.filename,
                page_number=1,
                supporting_evidence=f"Document corresponding to '{req_label}' was successfully uploaded and registered.",
                explanation="The application contains the necessary document record for this requirement.",
                recommended_action="No action required.",
                needs_manual_review=False
            ))
        else:
            if mandatory:
                findings.append(ValidationFinding(
                    finding_id=f"DOC-REQ-{req_type}",
                    check_name=f"Missing Mandatory Document: {req_label}",
                    status=CheckStatus.FAILED,
                    severity=FindingSeverity.HIGH,
                    expected_value=f"Uploaded {req_label}",
                    observed_value="Not Uploaded / Missing",
                    supporting_evidence=f"Submission bundle does not include a document assigned to category '{req_type}'.",
                    explanation=f"The application cannot be completely verified because mandatory document '{req_label}' is missing.",
                    recommended_action=f"Upload a valid '{req_label}' to satisfy this requirement.",
                    needs_manual_review=False
                ))
                readiness_items.append(ReadinessItem(
                    item_id=f"RISK-DOC-{req_type}",
                    potential_risk=f"Missing Mandatory Document ({req_label})",
                    reason=f"Processing will be halted or rejected by the receiving agency due to an absent {req_label}.",
                    supporting_evidence="No corresponding file attached in the submission package.",
                    applicable_rule=f"Required Submission Checklist ({category_config['title']})",
                    recommended_action=f"Attach a legible PDF or image copy of your {req_label}.",
                    status="Attention Needed",
                    severity=FindingSeverity.HIGH
                ))
            else:
                findings.append(ValidationFinding(
                    finding_id=f"DOC-REQ-{req_type}",
                    check_name=f"Optional Document: {req_label}",
                    status=CheckStatus.NOT_CHECKED,
                    severity=FindingSeverity.INFORMATIONAL,
                    expected_value=f"Optional: {req_label}",
                    observed_value="Not Provided",
                    supporting_evidence=f"Optional document '{req_label}' was not included in this submission.",
                    explanation=f"This is an optional document under {category_config['title']} guidelines.",
                    recommended_action="Submit if required for additional scoring or verification tiers.",
                    needs_manual_review=False
                ))

    # -------------------------------------------------------------
    # 2. FIELD COMPLETENESS & DATA CONSOLIDATION
    # -------------------------------------------------------------
    names_found: List[Tuple[str, str, int]] = []  # (value, doc_name, page)
    dobs_found: List[Tuple[str, str, int]] = []
    incomes_found: List[Tuple[str, str, int]] = []
    addresses_found: List[Tuple[str, str, int]] = []
    issue_dates: List[Tuple[str, str, int]] = []
    expiry_dates: List[Tuple[str, str, int]] = []

    for doc in extracted_docs:
        for fname, fobj in doc.extracted_fields.items():
            if fname == "applicant_name":
                names_found.append((fobj.value, doc.filename, fobj.page_number))
            elif fname == "dob":
                dobs_found.append((fobj.value, doc.filename, fobj.page_number))
            elif fname == "declared_income":
                incomes_found.append((fobj.value, doc.filename, fobj.page_number))
            elif fname == "address":
                addresses_found.append((fobj.value, doc.filename, fobj.page_number))
            elif fname == "issue_date":
                issue_dates.append((fobj.value, doc.filename, fobj.page_number))
            elif fname == "expiry_date":
                expiry_dates.append((fobj.value, doc.filename, fobj.page_number))

    # Set consolidated fields
    if names_found:
        consolidated_fields["applicant_name"] = names_found[0][0]
    if dobs_found:
        consolidated_fields["dob"] = dobs_found[0][0]
    if incomes_found:
        consolidated_fields["declared_income"] = incomes_found[0][0]
    if addresses_found:
        consolidated_fields["address"] = addresses_found[0][0]

    # Mandatory field check: Applicant Name
    if not names_found:
        findings.append(ValidationFinding(
            finding_id="FLD-NAME-MISSING",
            check_name="Mandatory Field: Applicant Name",
            status=CheckStatus.FAILED,
            severity=FindingSeverity.HIGH,
            expected_value="Legible Applicant Full Name",
            observed_value="Not Extracted / Absent",
            supporting_evidence="No applicant name could be recognized in the submitted documents.",
            explanation="Applicant name is a fundamental identifying attribute required across all application schemas.",
            recommended_action="Ensure documents contain clearly printed applicant details without heavy occlusion.",
            needs_manual_review=True
        ))
        readiness_items.append(ReadinessItem(
            item_id="RISK-NAME-01",
            potential_risk="Unidentified Applicant Details",
            reason="Automated verification could not extract an applicant name.",
            supporting_evidence="Extraction results returned empty name fields across all files.",
            applicable_rule="Identity Integrity Standard",
            recommended_action="Verify uploaded documents are not blank or corrupted.",
            status="Attention Needed",
            severity=FindingSeverity.HIGH
        ))
    else:
        findings.append(ValidationFinding(
            finding_id="FLD-NAME-PRESENT",
            check_name="Mandatory Field: Applicant Name Extracted",
            status=CheckStatus.PASSED,
            severity=FindingSeverity.INFORMATIONAL,
            expected_value="Applicant Full Name",
            observed_value=names_found[0][0],
            document_name=names_found[0][1],
            page_number=names_found[0][2],
            supporting_evidence=f"Recognized '{names_found[0][0]}' in {names_found[0][1]}.",
            explanation="Applicant name is present and successfully extracted.",
            recommended_action="No action required.",
            needs_manual_review=False
        ))

    # -------------------------------------------------------------
    # 3. CROSS-DOCUMENT CONSISTENCY CHECKS
    # -------------------------------------------------------------
    # A. Name Consistency Across Multiple Documents
    if len(names_found) > 1:
        primary_name, primary_doc, primary_page = names_found[0]
        for other_name, other_doc, other_page in names_found[1:]:
            sim = string_similarity(primary_name, other_name)
            if sim == 1.0:
                findings.append(ValidationFinding(
                    finding_id=f"CROSS-NAME-MATCH-{other_doc[:8]}",
                    check_name="Cross-Document Name Consistency",
                    status=CheckStatus.PASSED,
                    severity=FindingSeverity.INFORMATIONAL,
                    expected_value=primary_name,
                    observed_value=other_name,
                    document_name=f"{primary_doc} & {other_doc}",
                    page_number=primary_page,
                    supporting_evidence=f"Exact match between '{primary_doc}' ('{primary_name}') and '{other_doc}' ('{other_name}').",
                    explanation="Applicant name is 100% consistent across submitted documents.",
                    recommended_action="No action required.",
                    needs_manual_review=False
                ))
            elif sim >= 0.75:
                # Name variation (e.g. initials or slight spelling difference)
                findings.append(ValidationFinding(
                    finding_id=f"CROSS-NAME-VAR-{other_doc[:8]}",
                    check_name="Cross-Document Name Variation",
                    status=CheckStatus.NEEDS_REVIEW,
                    severity=FindingSeverity.MEDIUM,
                    expected_value=primary_name,
                    observed_value=other_name,
                    document_name=f"{primary_doc} & {other_doc}",
                    page_number=primary_page,
                    supporting_evidence=f"Document A ({primary_doc}) states '{primary_name}', whereas Document B ({other_doc}) states '{other_name}' (similarity: {sim:.0%}).",
                    explanation="The extracted names differ slightly. This may represent an acceptable abbreviation, middle name omission, or clerical typo.",
                    recommended_action="Inspect both documents to confirm they belong to the same individual. Provide an affidavit or gazette notification if names legitimately differ.",
                    needs_manual_review=True
                ))
                readiness_items.append(ReadinessItem(
                    item_id=f"RISK-NAME-VAR-{other_doc[:8]}",
                    potential_risk="Name Spelling Discrepancy",
                    reason=f"Mismatch detected between '{primary_name}' and '{other_name}'.",
                    supporting_evidence=f"Found in {primary_doc} and {other_doc}.",
                    applicable_rule="Cross-Document Identity Consistency",
                    recommended_action="Clarify name variation with official supporting identity proof.",
                    status="Pending Review",
                    severity=FindingSeverity.MEDIUM
                ))
            else:
                # Substantial mismatch
                findings.append(ValidationFinding(
                    finding_id=f"CROSS-NAME-MISMATCH-{other_doc[:8]}",
                    check_name="Cross-Document Name Mismatch",
                    status=CheckStatus.FAILED,
                    severity=FindingSeverity.HIGH,
                    expected_value=primary_name,
                    observed_value=other_name,
                    document_name=f"{primary_doc} & {other_doc}",
                    page_number=primary_page,
                    supporting_evidence=f"Primary document '{primary_doc}' has name '{primary_name}', but '{other_doc}' has '{other_name}' (similarity: {sim:.0%}).",
                    explanation="Significant discrepancy found between names across documents. This could indicate mismatched identity documents.",
                    recommended_action="Review uploaded documents to ensure all files pertain to the same applicant.",
                    needs_manual_review=True
                ))
                readiness_items.append(ReadinessItem(
                    item_id=f"RISK-NAME-MISMATCH-{other_doc[:8]}",
                    potential_risk="Severe Identity Mismatch",
                    reason=f"Applicant name '{primary_name}' in {primary_doc} completely differs from '{other_name}' in {other_doc}.",
                    supporting_evidence=f"Extracted values: '{primary_name}' vs '{other_name}'.",
                    applicable_rule="Identity Verification Standard",
                    recommended_action="Re-upload correct documents belonging solely to the primary applicant.",
                    status="Attention Needed",
                    severity=FindingSeverity.HIGH
                ))

    # B. Income Cross-Verification
    if len(incomes_found) > 1:
        inc_val1, inc_doc1, p1 = incomes_found[0]
        inc_val2, inc_doc2, p2 = incomes_found[1]
        try:
            n1 = float(inc_val1)
            n2 = float(inc_val2)
            if abs(n1 - n2) < 1.0:
                findings.append(ValidationFinding(
                    finding_id="CROSS-INC-MATCH",
                    check_name="Declared vs Certified Income Consistency",
                    status=CheckStatus.PASSED,
                    severity=FindingSeverity.INFORMATIONAL,
                    expected_value=f"INR {n1:,.2f}",
                    observed_value=f"INR {n2:,.2f}",
                    document_name=f"{inc_doc1} & {inc_doc2}",
                    page_number=p1,
                    supporting_evidence=f"Declared income in '{inc_doc1}' matches certified figure in '{inc_doc2}'.",
                    explanation="Income amounts match consistently across application and certificate.",
                    recommended_action="No action required.",
                    needs_manual_review=False
                ))
            else:
                findings.append(ValidationFinding(
                    finding_id="CROSS-INC-CONFLICT",
                    check_name="Income Discrepancy Across Documents",
                    status=CheckStatus.FAILED,
                    severity=FindingSeverity.HIGH,
                    expected_value=f"INR {n1:,.2f} ({inc_doc1})",
                    observed_value=f"INR {n2:,.2f} ({inc_doc2})",
                    document_name=f"{inc_doc1} & {inc_doc2}",
                    page_number=p1,
                    supporting_evidence=f"Document '{inc_doc1}' declared INR {n1:,.2f}, while '{inc_doc2}' shows INR {n2:,.2f}.",
                    explanation="Conflicting financial figures detected. Subsidies or scholarships with strict ceilings will flag this discrepancy.",
                    recommended_action="Provide clarifying tax return or employer endorsement reconciling the difference.",
                    needs_manual_review=True
                ))
                readiness_items.append(ReadinessItem(
                    item_id="RISK-INC-CONFLICT",
                    potential_risk="Conflicting Financial Declaration",
                    reason=f"Application declared INR {n1:,.2f} but certificate shows INR {n2:,.2f}.",
                    supporting_evidence=f"Mismatch between {inc_doc1} and {inc_doc2}.",
                    applicable_rule="Financial Means Verification",
                    recommended_action="Submit latest ITR acknowledgement or updated salary certificate.",
                    status="Attention Needed",
                    severity=FindingSeverity.HIGH
                ))
        except ValueError:
            pass

    # -------------------------------------------------------------
    # 4. DATE AND RANGE CHECKS
    # -------------------------------------------------------------
    # A. Expiry date check
    for exp_str, doc_name, pnum in expiry_dates:
        valid_date, dt = parse_date(exp_str)
        if valid_date:
            now = datetime.now()
            if dt < now:
                findings.append(ValidationFinding(
                    finding_id=f"DATE-EXP-{doc_name[:8]}",
                    check_name="Document Validity & Expiry Check",
                    status=CheckStatus.FAILED,
                    severity=FindingSeverity.HIGH,
                    expected_value=f"Valid on or after {now.strftime('%d-%b-%Y')}",
                    observed_value=f"Expired on {dt.strftime('%d-%b-%Y')}",
                    document_name=doc_name,
                    page_number=pnum,
                    supporting_evidence=f"Document '{doc_name}' exhibits an expiry date '{exp_str}' preceding current date.",
                    explanation="Submitted document is past its official validity term.",
                    recommended_action="Upload a renewed or currently valid version of the document.",
                    needs_manual_review=True
                ))
                readiness_items.append(ReadinessItem(
                    item_id=f"RISK-EXP-{doc_name[:8]}",
                    potential_risk="Expired Supporting Credential",
                    reason=f"Document expired on {dt.strftime('%d-%b-%Y')}.",
                    supporting_evidence=f"Found in {doc_name}.",
                    applicable_rule="Document Currency and Validity Standard",
                    recommended_action="Renew the expired document and upload the current endorsement.",
                    status="Attention Needed",
                    severity=FindingSeverity.HIGH
                ))
            else:
                findings.append(ValidationFinding(
                    finding_id=f"DATE-EXP-VALID-{doc_name[:8]}",
                    check_name="Document Validity & Expiry Check",
                    status=CheckStatus.PASSED,
                    severity=FindingSeverity.INFORMATIONAL,
                    expected_value="Currently valid",
                    observed_value=f"Valid until {dt.strftime('%d-%b-%Y')}",
                    document_name=doc_name,
                    page_number=pnum,
                    supporting_evidence=f"Document '{doc_name}' is valid until {dt.strftime('%d-%b-%Y')}.",
                    explanation="Document validity falls within permitted time horizon.",
                    recommended_action="No action required.",
                    needs_manual_review=False
                ))

    # B. Chronological sequence check (Issue date vs Expiry date)
    if issue_dates and expiry_dates:
        v_iss, dt_iss = parse_date(issue_dates[0][0])
        v_exp, dt_exp = parse_date(expiry_dates[0][0])
        if v_iss and v_exp and dt_exp < dt_iss:
            findings.append(ValidationFinding(
                finding_id="DATE-SEQ-IMPOSSIBLE",
                check_name="Chronological Sequence Validity",
                status=CheckStatus.FAILED,
                severity=FindingSeverity.HIGH,
                expected_value="Expiry date must succeed Issue date",
                observed_value=f"Issue: {dt_iss.strftime('%d-%b-%Y')}, Expiry: {dt_exp.strftime('%d-%b-%Y')}",
                document_name=issue_dates[0][1],
                page_number=issue_dates[0][2],
                supporting_evidence=f"Recorded issue date is after recorded expiry date.",
                explanation="Impossible temporal sequence detected, indicating potential OCR misread or typographic anomaly on source document.",
                recommended_action="Review the original physical document and confirm the printed dates.",
                needs_manual_review=True
            ))

    return findings, readiness_items, consolidated_fields
