from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class FindingSeverity(str, Enum):
    INFORMATIONAL = "Informational"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class CheckStatus(str, Enum):
    PASSED = "Passed"
    FAILED = "Failed"
    NEEDS_REVIEW = "Needs Review"
    NOT_CHECKED = "Not Checked"
    NOT_APPLICABLE = "Not Applicable"

class OverallStatus(str, Enum):
    PASSED_CONFIGURED = "Passed Configured Checks"
    ACTION_REQUIRED = "Action Required"
    NEEDS_REVIEW = "Needs Review"
    INCOMPLETE = "Incomplete"
    PROCESSING_FAILED = "Processing Failed"
    PARTIALLY_CHECKED = "Partially Checked"

class ExtractedField(BaseModel):
    field_name: str
    value: str
    confidence: float = 1.0
    source_document: str
    page_number: int = 1
    raw_context: Optional[str] = None
    is_readable: bool = True

class ExtractedDocumentInfo(BaseModel):
    document_id: str
    filename: str
    category: str
    file_size_bytes: int
    page_count: int
    extracted_fields: Dict[str, ExtractedField] = {}
    raw_text_snippet: Optional[str] = None
    integrity_notes: List[str] = []
    extraction_status: str = "success"  # success, partial, unreadable

class ValidationFinding(BaseModel):
    finding_id: str
    check_name: str
    status: CheckStatus
    severity: FindingSeverity
    expected_value: Optional[str] = None
    observed_value: Optional[str] = None
    document_name: Optional[str] = None
    page_number: Optional[int] = None
    rule_id: Optional[str] = None
    supporting_evidence: str
    explanation: str
    recommended_action: str
    is_ai_assisted: bool = False
    needs_manual_review: bool = False

class ComplianceRule(BaseModel):
    rule_id: str
    requirement_title: str
    description: str
    application_category: str
    validation_condition: str
    required_evidence: str
    source_name: str
    source_url: Optional[str] = None
    section_reference: Optional[str] = None
    rule_version: str = "1.0"
    effective_date: str = "2026-01-01"
    last_reviewed_date: str = "2026-10-15"
    rule_status: str = "active"
    outcome: CheckStatus = CheckStatus.NOT_CHECKED
    outcome_reason: Optional[str] = None
    is_demo_rule: bool = True

class ReadinessItem(BaseModel):
    item_id: str
    potential_risk: str
    reason: str
    supporting_evidence: str
    applicable_rule: str
    recommended_action: str
    status: str  # Attention Needed, Satisfied, Pending Review
    severity: FindingSeverity

class HumanReviewEvent(BaseModel):
    review_id: str
    application_id: str
    finding_id: str
    decision: str  # Confirmed Issue, Resolved, False Positive, Requires Further Investigation
    reviewer_name: str
    notes: str
    timestamp: str

class ApplicationRecord(BaseModel):
    application_id: str
    category: str
    category_title: str
    submission_date: str
    processing_date: str
    overall_status: OverallStatus
    status_summary: str
    total_checks: int
    passed_checks: int
    failed_checks: int
    review_checks: int
    not_checked_checks: int
    findings: List[ValidationFinding] = []
    compliance_results: List[ComplianceRule] = []
    readiness_checklist: List[ReadinessItem] = []
    documents: List[ExtractedDocumentInfo] = []
    human_reviews: List[HumanReviewEvent] = []
    is_demo: bool = False
    scope_disclaimer: str = (
        "Official issuer verification was not performed. "
        "Results reflect algorithmic data validation, consistency comparison, and configured compliance rule evaluation."
    )

class ApplicationCreateResponse(BaseModel):
    application_id: str
    status: str
    message: str

class HumanReviewRequest(BaseModel):
    finding_id: str
    decision: str  # Confirmed Issue, Resolved, False Positive, Requires Further Investigation
    reviewer_name: str
    notes: str
