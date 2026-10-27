export type FindingSeverity = 'Informational' | 'Low' | 'Medium' | 'High';

export type CheckStatus = 'Passed' | 'Failed' | 'Needs Review' | 'Not Checked' | 'Not Applicable';

export type OverallStatus = 
  | 'Passed Configured Checks'
  | 'Action Required'
  | 'Needs Review'
  | 'Incomplete'
  | 'Processing Failed'
  | 'Partially Checked';

export interface ExtractedField {
  field_name: string;
  value: string;
  confidence: number;
  source_document: string;
  page_number: number;
  raw_context?: string;
  is_readable: boolean;
}

export interface ExtractedDocumentInfo {
  document_id: string;
  filename: string;
  category: string;
  file_size_bytes: number;
  page_count: number;
  extracted_fields: Record<string, ExtractedField>;
  raw_text_snippet?: string;
  integrity_notes: string[];
  extraction_status: 'success' | 'partial' | 'unreadable';
}

export interface ValidationFinding {
  finding_id: string;
  check_name: string;
  status: CheckStatus;
  severity: FindingSeverity;
  expected_value?: string;
  observed_value?: string;
  document_name?: string;
  page_number?: number;
  rule_id?: string;
  supporting_evidence: string;
  explanation: string;
  recommended_action: string;
  is_ai_assisted: boolean;
  needs_manual_review: boolean;
}

export interface ComplianceRule {
  rule_id: string;
  requirement_title: string;
  description: string;
  application_category: string;
  validation_condition: string;
  required_evidence: string;
  source_name: string;
  source_url?: string;
  section_reference?: string;
  rule_version: string;
  effective_date: string;
  last_reviewed_date: string;
  rule_status: string;
  outcome: CheckStatus;
  outcome_reason?: string;
  is_demo_rule: boolean;
}

export interface ReadinessItem {
  item_id: string;
  potential_risk: string;
  reason: string;
  supporting_evidence: string;
  applicable_rule: string;
  recommended_action: string;
  status: string;
  severity: FindingSeverity;
}

export interface HumanReviewEvent {
  review_id: string;
  application_id: string;
  finding_id: string;
  decision: string;
  reviewer_name: string;
  notes: string;
  timestamp: string;
}

export interface ApplicationRecord {
  application_id: string;
  category: string;
  category_title: string;
  submission_date: string;
  processing_date: string;
  overall_status: OverallStatus;
  status_summary: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  review_checks: number;
  not_checked_checks: number;
  findings: ValidationFinding[];
  compliance_results: ComplianceRule[];
  readiness_checklist: ReadinessItem[];
  documents: ExtractedDocumentInfo[];
  human_reviews: HumanReviewEvent[];
  is_demo: boolean;
  scope_disclaimer: string;
}

export interface ApplicationListItem {
  application_id: string;
  category: string;
  category_title: string;
  submission_date: string;
  processing_date: string;
  overall_status: OverallStatus;
  total_checks: number;
  failed_checks: number;
  review_checks: number;
  is_demo: boolean;
}

export interface DocumentRequirement {
  type: string;
  label: string;
  mandatory: boolean;
}

export interface ApplicationCategoryConfig {
  title: string;
  description: string;
  required_documents: DocumentRequirement[];
}
