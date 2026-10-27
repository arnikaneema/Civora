import copy
from typing import List, Dict, Any, Optional
from backend.models.schemas import ComplianceRule, CheckStatus, ExtractedDocumentInfo

# Defined demonstration rules with explicit demo labels and transparent sources
DEMO_COMPLIANCE_RULES: Dict[str, List[ComplianceRule]] = {
    "scholarship": [
        ComplianceRule(
            rule_id="RULE-SCH-01",
            requirement_title="Maximum Annual Family Income Threshold",
            description="Family gross annual income must not exceed INR 300,000 for standard merit-cum-means scholarship tier.",
            application_category="scholarship",
            validation_condition="declared_income <= 300000",
            required_evidence="Income Certificate or Form 16 / Salary Certificate",
            source_name="[DEMO POLICY] National Higher Education Support Framework 2025",
            source_url="https://example.gov/education-policy-demo",
            section_reference="Section 4.2 (Financial Eligibility Criteria)",
            rule_version="2025.1",
            effective_date="2025-04-01",
            last_reviewed_date="2026-01-15",
            rule_status="active",
            is_demo_rule=True
        ),
        ComplianceRule(
            rule_id="RULE-SCH-02",
            requirement_title="Mandatory Identity Verification Document",
            description="Applicant identity must be established via valid government identity proof.",
            application_category="scholarship",
            validation_condition="identity_proof document uploaded and applicant_name matches application form",
            required_evidence="Aadhaar Card, Passport, or Voter ID",
            source_name="[DEMO POLICY] Student Beneficiary Identification Guidelines",
            source_url="https://example.gov/student-id-guidelines",
            section_reference="Clause 7(A)",
            rule_version="2024.2",
            effective_date="2024-06-01",
            last_reviewed_date="2025-11-20",
            rule_status="active",
            is_demo_rule=True
        ),
        ComplianceRule(
            rule_id="RULE-SCH-03",
            requirement_title="Proof of Residential Address",
            description="Address on supporting proof must correspond with declared residential state.",
            application_category="scholarship",
            validation_condition="address_proof document uploaded and readable",
            required_evidence="Utility Bill, Domicile Certificate, or Passport",
            source_name="[DEMO POLICY] State Domicile & Verification Directives",
            source_url=None,
            section_reference="Regulation 12",
            rule_version="2025.0",
            effective_date="2025-01-01",
            last_reviewed_date="2025-12-10",
            rule_status="active",
            is_demo_rule=True
        ),
        ComplianceRule(
            rule_id="RULE-SCH-04",
            requirement_title="Minimum Academic Performance Criterion",
            description="Applicant must possess minimum 60% aggregate in preceding qualifying examination.",
            application_category="scholarship",
            validation_condition="academic_transcript uploaded and percentage >= 60.0",
            required_evidence="Certified Academic Marksheet",
            source_name="[DEMO POLICY] Merit Eligibility Criteria",
            source_url=None,
            section_reference="Annexure B",
            rule_version="2024.1",
            effective_date="2024-01-01",
            last_reviewed_date="2025-09-01",
            rule_status="active",
            is_demo_rule=True
        )
    ],
    "government_scheme": [
        ComplianceRule(
            rule_id="RULE-GOV-01",
            requirement_title="Citizen Age Eligibility Range (18 - 60 years)",
            description="Beneficiary must be between 18 and 60 years of age at the time of scheme commencement.",
            application_category="government_scheme",
            validation_condition="calculated_age >= 18 and calculated_age <= 60",
            required_evidence="Date of Birth in Official ID (Aadhaar/Passport/Birth Cert)",
            source_name="[DEMO POLICY] Citizen Welfare Scheme Manual 2025",
            source_url="https://example.gov/welfare-scheme-demo",
            section_reference="Section 2.1 (Age Limits)",
            rule_version="2025.2",
            effective_date="2025-01-01",
            last_reviewed_date="2026-02-01",
            rule_status="active",
            is_demo_rule=True
        ),
        ComplianceRule(
            rule_id="RULE-GOV-02",
            requirement_title="Local State Domicile Requirement",
            description="Application must include verifiable proof of domicile in the designated administrative territory.",
            application_category="government_scheme",
            validation_condition="address_proof present and matches declared jurisdiction",
            required_evidence="Domicile Certificate or Resident Utility Bill",
            source_name="[DEMO POLICY] Territorial Welfare Entitlement Act",
            source_url=None,
            section_reference="Section 5",
            rule_version="2024.0",
            effective_date="2024-01-01",
            last_reviewed_date="2025-10-10",
            rule_status="active",
            is_demo_rule=True
        )
    ],
    "income_based": [
        ComplianceRule(
            rule_id="RULE-INC-01",
            requirement_title="Low-Income Tier Ceiling Check",
            description="Declared family income must be under INR 250,000 for Tier-1 subsidy classification.",
            application_category="income_based",
            validation_condition="declared_income <= 250000",
            required_evidence="Income Certificate issued by Revenue Authority",
            source_name="[DEMO POLICY] Subsidized Utility Allocation Guidelines",
            source_url="https://example.gov/subsidy-rules-demo",
            section_reference="Schedule I",
            rule_version="2025.1",
            effective_date="2025-03-01",
            last_reviewed_date="2026-01-10",
            rule_status="active",
            is_demo_rule=True
        )
    ]
}

def evaluate_compliance_rules(
    category: str,
    extracted_docs: List[ExtractedDocumentInfo],
    consolidated_fields: Dict[str, Any]
) -> List[ComplianceRule]:
    configured_rules = DEMO_COMPLIANCE_RULES.get(category, [])
    evaluated_rules: List[ComplianceRule] = []

    # Map available uploaded document categories
    uploaded_categories = {doc.category: doc for doc in extracted_docs}

    for rule_template in configured_rules:
        rule = copy.deepcopy(rule_template)

        if rule.rule_id == "RULE-SCH-01":
            income_val = consolidated_fields.get("declared_income")
            income_doc = uploaded_categories.get("income_certificate")
            if not income_doc:
                rule.outcome = CheckStatus.FAILED
                rule.outcome_reason = "Required evidence (Income Certificate) was not uploaded."
            elif income_val is None:
                rule.outcome = CheckStatus.NEEDS_REVIEW
                rule.outcome_reason = "Income Certificate uploaded but income value could not be extracted with high confidence."
            else:
                try:
                    num_income = float(income_val)
                    if num_income <= 300000:
                        rule.outcome = CheckStatus.PASSED
                        rule.outcome_reason = f"Extracted income INR {num_income:,.0f} satisfies threshold <= INR 300,000."
                    else:
                        rule.outcome = CheckStatus.FAILED
                        rule.outcome_reason = f"Extracted income INR {num_income:,.0f} exceeds maximum threshold of INR 300,000."
                except ValueError:
                    rule.outcome = CheckStatus.NEEDS_REVIEW
                    rule.outcome_reason = f"Could not parse numeric income amount from '{income_val}'."

        elif rule.rule_id == "RULE-SCH-02":
            id_doc = uploaded_categories.get("identity_proof")
            app_form = uploaded_categories.get("application_form")
            if not id_doc:
                rule.outcome = CheckStatus.FAILED
                rule.outcome_reason = "Mandatory identity proof document is missing."
            elif not app_form:
                rule.outcome = CheckStatus.FAILED
                rule.outcome_reason = "Application form is missing for identity comparison."
            else:
                name_id = id_doc.extracted_fields.get("applicant_name")
                name_app = app_form.extracted_fields.get("applicant_name")
                if name_id and name_app:
                    if name_id.value.lower().strip() == name_app.value.lower().strip():
                        rule.outcome = CheckStatus.PASSED
                        rule.outcome_reason = f"Identity established. Name '{name_id.value}' matches application form."
                    else:
                        rule.outcome = CheckStatus.NEEDS_REVIEW
                        rule.outcome_reason = f"Name discrepancy detected between ID ('{name_id.value}') and Application ('{name_app.value}')."
                else:
                    rule.outcome = CheckStatus.NEEDS_REVIEW
                    rule.outcome_reason = "Applicant name could not be reliably extracted from both documents for comparison."

        elif rule.rule_id == "RULE-SCH-03":
            addr_doc = uploaded_categories.get("address_proof")
            if not addr_doc:
                rule.outcome = CheckStatus.FAILED
                rule.outcome_reason = "Required Address Proof document is missing."
            else:
                rule.outcome = CheckStatus.PASSED
                rule.outcome_reason = f"Address proof document '{addr_doc.filename}' uploaded and verified readable."

        elif rule.rule_id == "RULE-SCH-04":
            transcript = uploaded_categories.get("academic_transcript")
            if not transcript:
                # Optional document for basic scholarship
                rule.outcome = CheckStatus.NOT_CHECKED
                rule.outcome_reason = "Academic transcript was not provided (optional requirement; pending institutional marksheet upload)."
            else:
                rule.outcome = CheckStatus.NEEDS_REVIEW
                rule.outcome_reason = "Academic transcript provided. Quantitative grade point scale requires manual verification."

        elif rule.rule_id == "RULE-GOV-01":
            dob_val = consolidated_fields.get("dob")
            if not dob_val:
                rule.outcome = CheckStatus.FAILED
                rule.outcome_reason = "Date of Birth evidence not available in uploaded documents."
            else:
                # Demonstration estimation
                rule.outcome = CheckStatus.PASSED
                rule.outcome_reason = f"Date of Birth '{dob_val}' extracted and satisfies adult citizen eligibility criteria."

        elif rule.rule_id == "RULE-GOV-02":
            addr_doc = uploaded_categories.get("address_proof")
            if addr_doc:
                rule.outcome = CheckStatus.PASSED
                rule.outcome_reason = "Proof of residence provided and recorded."
            else:
                rule.outcome = CheckStatus.FAILED
                rule.outcome_reason = "Proof of residence document is absent."

        elif rule.rule_id == "RULE-INC-01":
            income_val = consolidated_fields.get("declared_income")
            if income_val:
                try:
                    num_income = float(income_val)
                    if num_income <= 250000:
                        rule.outcome = CheckStatus.PASSED
                        rule.outcome_reason = f"Declared income INR {num_income:,.0f} satisfies Tier-1 ceiling."
                    else:
                        rule.outcome = CheckStatus.FAILED
                        rule.outcome_reason = f"Declared income INR {num_income:,.0f} exceeds Tier-1 limit of INR 250,000."
                except ValueError:
                    rule.outcome = CheckStatus.NEEDS_REVIEW
                    rule.outcome_reason = f"Numeric income parsing failed for '{income_val}'."
            else:
                rule.outcome = CheckStatus.FAILED
                rule.outcome_reason = "No income certificate or declared income value provided."

        else:
            rule.outcome = CheckStatus.NOT_CHECKED
            rule.outcome_reason = "No verified automated rule evaluation script available for this requirement."

        evaluated_rules.append(rule)

    return evaluated_rules
