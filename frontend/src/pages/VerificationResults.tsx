import React, { useState } from 'react';
import { ApplicationRecord, ValidationFinding, FindingSeverity, CheckStatus } from '../types';
import { getReportDownloadUrl, submitHumanReview } from '../services/api';
import { ReviewModal } from '../components/ReviewModal';
import { 
  ShieldCheck, Download, CheckCircle2, AlertTriangle, HelpCircle, 
  AlertCircle, ChevronDown, ChevronUp, FileText, Layers, Scale, 
  UserCheck, ArrowLeft, RefreshCw, Cpu, ExternalLink, Filter
} from 'lucide-react';

interface VerificationResultsProps {
  record: ApplicationRecord;
  onBackToDashboard: () => void;
  onRecordUpdated: (updatedRecord: ApplicationRecord) => void;
}

export const VerificationResults: React.FC<VerificationResultsProps> = ({
  record,
  onBackToDashboard,
  onRecordUpdated
}) => {
  const [selectedFindingForReview, setSelectedFindingForReview] = useState<ValidationFinding | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'findings' | 'compliance' | 'readiness' | 'documents' | 'audit'>('findings');
  
  // Severity / Status filter for findings
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const toggleFindingExpand = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenReview = (f: ValidationFinding) => {
    setSelectedFindingForReview(f);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (data: { finding_id: string; decision: string; reviewer_name: string; notes: string }) => {
    const updated = await submitHumanReview(record.application_id, data);
    onRecordUpdated(updated);
  };

  // Filtered findings
  const filteredFindings = record.findings.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    return true;
  });

  const isPassed = record.overall_status.includes('Passed');
  const isAction = record.overall_status.includes('Action');
  const isReview = record.overall_status.includes('Review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-secondary hover:text-navy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <a
            href={getReportDownloadUrl(record.application_id)}
            download
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-dark transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Verification Report (PDF)</span>
          </a>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="p-8 rounded-3xl bg-white border border-surface-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-navy-800 border border-slate-200">
                {record.application_id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-brand-blue">
                {record.category_title}
              </span>
              {record.is_demo && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Illustrative Demonstration
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-navy-800">
              Verification Results
            </h1>

            <p className="text-xs text-ink-secondary">
              Processed on <strong>{record.processing_date}</strong> • Algorithmic verification completed across{' '}
              <strong>{record.documents.length} document(s)</strong>.
            </p>
          </div>

          {/* Overall Status Badge */}
          <div className="flex flex-col items-start md:items-end">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm ${
                isPassed
                  ? 'bg-status-success-bg text-status-success border border-green-300'
                  : isAction
                  ? 'bg-status-error-bg text-status-error border border-red-300'
                  : 'bg-status-review-bg text-status-review border border-indigo-300'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
              <span>{record.overall_status}</span>
            </div>
            <p className="text-[11px] text-ink-secondary mt-1.5 max-w-xs md:text-right">
              {record.status_summary}
            </p>
          </div>
        </div>

        {/* Executive Summary Metrics Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-surface-border">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs text-ink-secondary font-medium">Total Checks</div>
            <div className="text-2xl font-extrabold text-navy-800 mt-1">{record.total_checks}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-green-50/70 border border-green-200 text-center">
            <div className="text-xs text-green-800 font-medium">Passed Checks</div>
            <div className="text-2xl font-extrabold text-status-success mt-1">{record.passed_checks}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 text-center">
            <div className="text-xs text-red-800 font-medium">Failed Checks</div>
            <div className="text-2xl font-extrabold text-status-error mt-1">{record.failed_checks}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center">
            <div className="text-xs text-indigo-800 font-medium">Requires Review</div>
            <div className="text-2xl font-extrabold text-status-review mt-1">{record.review_checks}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-600 font-medium">Not Checked</div>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">{record.not_checked_checks}</div>
          </div>
        </div>
      </div>

      {/* Scope Disclaimer Callout */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <strong>Transparent Verification Scope:</strong> {record.scope_disclaimer} Flagged items highlight 
          inconsistencies or rule gaps for human review, and do not constitute legal determinations of intentional fraud.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-surface-border text-sm font-semibold gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('findings')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'findings'
              ? 'border-b-2 border-brand-blue text-brand-blue'
              : 'text-ink-secondary hover:text-navy-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Detailed Findings ({record.findings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'compliance'
              ? 'border-b-2 border-brand-blue text-brand-blue'
              : 'text-ink-secondary hover:text-navy-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Regulatory Compliance ({record.compliance_results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('readiness')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'readiness'
              ? 'border-b-2 border-brand-blue text-brand-blue'
              : 'text-ink-secondary hover:text-navy-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Readiness & Risk Checklist ({record.readiness_checklist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'documents'
              ? 'border-b-2 border-brand-blue text-brand-blue'
              : 'text-ink-secondary hover:text-navy-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Processed Documents ({record.documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'border-b-2 border-brand-blue text-brand-blue'
              : 'text-ink-secondary hover:text-navy-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Human Review Audit Log ({record.human_reviews.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DETAILED FINDINGS                                  */}
      {/* ========================================================= */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Findings Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-surface-border text-xs">
            <div className="flex items-center gap-2 text-ink-secondary font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Findings:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-ink-secondary">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-surface-border bg-white text-navy-800"
                >
                  <option value="all">All</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Not Checked">Not Checked</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-ink-secondary">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-surface-border bg-white text-navy-800"
                >
                  <option value="all">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Informational">Informational</option>
                </select>
              </div>
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="p-8 text-center text-ink-secondary bg-white rounded-3xl border border-surface-border">
              No findings match the selected filters.
            </div>
          ) : (
            filteredFindings.map((f) => {
              const isExpanded = expandedFindings[f.finding_id] ?? false;
              const fColor =
                f.status === 'Passed'
                  ? 'border-l-status-success bg-green-50/20'
                  : f.status === 'Failed'
                  ? 'border-l-status-error bg-red-50/20'
                  : 'border-l-status-review bg-indigo-50/20';

              return (
                <div
                  key={f.finding_id}
                  className={`bg-white rounded-2xl border border-surface-border border-l-4 ${fColor} shadow-sm overflow-hidden transition-all`}
                >
                  {/* Finding Title & Top Row */}
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-ink-muted">
                          {f.finding_id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            f.status === 'Passed'
                              ? 'bg-green-100 text-status-success'
                              : f.status === 'Failed'
                              ? 'bg-red-100 text-status-error'
                              : 'bg-indigo-100 text-status-review'
                          }`}
                        >
                          {f.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {f.severity} Severity
                        </span>
                        {f.is_ai_assisted && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            <span>AI-Assisted Explanation</span>
                          </span>
                        )}
                        {f.needs_manual_review && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            <span>Review Recommended</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-navy-800">{f.check_name}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {f.needs_manual_review && (
                        <button
                          onClick={() => handleOpenReview(f)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-brand-blue" />
                          <span>Review Decision</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleFindingExpand(f.finding_id)}
                        className="p-1.5 rounded-lg text-ink-secondary hover:bg-surface-hover"
                        title={isExpanded ? 'Collapse Evidence' : 'Expand Evidence'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Core Finding Body */}
                  <div className="px-5 pb-5 space-y-3 text-xs leading-relaxed border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                      <div>
                        <span className="text-ink-secondary block font-medium">Expected Value / Requirement:</span>
                        <span className="font-semibold text-navy-800">{f.expected_value || 'None specified'}</span>
                      </div>
                      <div>
                        <span className="text-ink-secondary block font-medium">Observed Value:</span>
                        <span className="font-semibold text-navy-800">{f.observed_value || 'Not present'}</span>
                      </div>
                    </div>

                    <div>
                      <strong className="text-navy-800">Why It Matters:</strong> {f.explanation}
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-50/60 text-blue-950 font-medium">
                      <strong>Recommended Corrective Action:</strong> {f.recommended_action}
                    </div>

                    {/* Expandable Supporting Evidence & Page Context */}
                    {isExpanded && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 space-y-2 animate-fadeIn">
                        <div className="font-bold text-navy-800 uppercase text-[10px] tracking-wider">
                          Supporting Evidence & Source Reference
                        </div>
                        <p className="text-ink-primary font-mono text-[11px] leading-relaxed">
                          {f.supporting_evidence}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-ink-secondary pt-1">
                          <span>Document: <strong>{f.document_name || 'Multiple Files'}</strong></span>
                          <span>Page Reference: <strong>{f.page_number ? `Page ${f.page_number}` : 'Global'}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: REGULATORY COMPLIANCE                              */}
      {/* ========================================================= */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-navy-800">Regulatory Compliance Audit Matrix</h3>
              <p className="text-xs text-ink-secondary mt-1">
                Evaluation of extracted applicant credentials against configured legal and scheme criteria. 
                Demonstration rules are explicitly labeled.
              </p>
            </div>

            <div className="space-y-4">
              {record.compliance_results.map((c) => {
                const cPassed = c.outcome === 'Passed';
                const cFailed = c.outcome === 'Failed';

                return (
                  <div
                    key={c.rule_id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-blue transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink-muted">{c.rule_id}</span>
                        <h4 className="font-bold text-navy-800 text-sm">{c.requirement_title}</h4>
                        {c.is_demo_rule && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">
                            Demo Rule
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          cPassed
                            ? 'bg-status-success-bg text-status-success'
                            : cFailed
                            ? 'bg-status-error-bg text-status-error'
                            : 'bg-status-review-bg text-status-review'
                        }`}
                      >
                        {cPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{c.outcome}</span>
                      </span>
                    </div>

                    <p className="text-xs text-ink-secondary leading-relaxed">{c.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <strong className="text-navy-800">Source Authority:</strong> {c.source_name}{' '}
                        {c.section_reference && <span className="text-ink-secondary">({c.section_reference})</span>}
                      </div>
                      <div>
                        <strong className="text-navy-800">Evaluated Condition:</strong>{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">{c.validation_condition}</code>
                      </div>
                    </div>

                    <div className="text-xs p-2.5 rounded-lg bg-blue-50/60 text-blue-900">
                      <strong>Audit Finding Rationale:</strong> {c.outcome_reason || 'Rule evaluation completed.'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: READINESS & RISK CHECKLIST                         */}
      {/* ========================================================= */}
      {activeTab === 'readiness' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-navy-800">Application Readiness & Potential Risk Checklist</h3>
              <p className="text-xs text-ink-secondary mt-1">
                Potential application risks that may delay institutional processing or affect statutory eligibility.
              </p>
            </div>

            {record.readiness_checklist.length === 0 ? (
              <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-200 text-status-success font-semibold text-sm">
                No potential application risks detected. The submission satisfies all readiness standards.
              </div>
            ) : (
              <div className="space-y-3">
                {record.readiness_checklist.map((r) => (
                  <div
                    key={r.item_id}
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <h4 className="font-bold text-navy-800 text-sm">{r.potential_risk}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {r.severity} Risk
                      </span>
                    </div>

                    <p className="text-ink-secondary">
                      <strong>Reason for Flag:</strong> {r.reason}
                    </p>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-ink-primary font-medium">
                      <strong>Corrective Recommendation:</strong> {r.recommended_action}
                    </div>

                    <div className="text-[10px] text-ink-muted">
                      Rule Benchmark: <strong>{r.applicable_rule}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PROCESSED DOCUMENTS                                */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-navy-800">Processed Document Inventory</h3>
              <p className="text-xs text-ink-secondary mt-1">
                Inspect structured entities extracted by PyMuPDF and Pillow from submitted files.
              </p>
            </div>

            <div className="space-y-6">
              {record.documents.map((d) => (
                <div key={d.filename} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white text-brand-blue border border-slate-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-800 text-sm">{d.filename}</h4>
                        <div className="text-[11px] text-ink-secondary">
                          Category: <strong>{d.category.replace('_', ' ').toUpperCase()}</strong> • Pages: {d.page_count} • Size: {(d.file_size_bytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-green-100 text-status-success font-bold text-xs">
                      {d.extraction_status.toUpperCase()}
                    </span>
                  </div>

                  {/* Extracted Fields Table */}
                  {Object.keys(d.extracted_fields).length > 0 ? (
                    <div>
                      <div className="text-[10px] font-bold text-navy-800 uppercase tracking-wider mb-2">
                        Extracted Key-Value Entities
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(d.extracted_fields).map(([k, f]) => (
                          <div key={k} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                            <span className="text-[10px] font-semibold text-ink-secondary uppercase">{f.field_name}</span>
                            <div className="font-bold text-navy-800 text-xs">{f.value}</div>
                            <span className="text-[9px] text-ink-muted">Page {f.page_number} • Confidence: {(f.confidence * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-ink-secondary italic p-2 bg-white rounded-lg border border-slate-200">
                      No matching predefined regex entities recognized in this document.
                    </div>
                  )}

                  {/* Integrity Notes */}
                  {d.integrity_notes.length > 0 && (
                    <div className="text-xs text-ink-secondary space-y-1">
                      <div className="font-bold text-navy-800 text-[10px] uppercase">Integrity Inspection Notes:</div>
                      {d.integrity_notes.map((note, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-blue-50 text-blue-900 text-[11px]">
                          • {note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: HUMAN REVIEW AUDIT LOG                             */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy-800">Authorised Human Review Audit Trail</h3>
                <p className="text-xs text-ink-secondary mt-1">
                  Immutable record of reviewer interventions, resolving findings without modifying the original automated data.
                </p>
              </div>
            </div>

            {record.human_reviews.length === 0 ? (
              <div className="p-8 text-center text-ink-secondary bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                No human review events have been committed for this application yet.
              </div>
            ) : (
              <div className="space-y-3">
                {record.human_reviews.map((rev) => (
                  <div
                    key={rev.review_id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-brand-blue" />
                        <span className="font-bold text-navy-800">{rev.reviewer_name}</span>
                        <span className="font-mono text-ink-muted">({rev.review_id})</span>
                      </div>
                      <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-brand-blue text-[10px]">
                        {rev.decision}
                      </span>
                    </div>

                    <p className="text-ink-primary font-medium pl-6">"{rev.notes}"</p>

                    <div className="flex items-center justify-between pl-6 text-[10px] text-ink-secondary pt-1">
                      <span>Target Finding: <strong>{rev.finding_id}</strong></span>
                      <span>Timestamp: <strong>{rev.timestamp}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Human Review Modal Dialog */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        finding={selectedFindingForReview}
        applicationId={record.application_id}
        onSubmitReview={handleReviewSubmit}
      />
    </div>
  );
};
