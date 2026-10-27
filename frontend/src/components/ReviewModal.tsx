import React, { useState } from 'react';
import { ValidationFinding } from '../types';
import { X, UserCheck, ShieldAlert, CheckCircle2, HelpCircle, AlertOctagon } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: ValidationFinding | null;
  applicationId: string;
  onSubmitReview: (data: { finding_id: string; decision: string; reviewer_name: string; notes: string }) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  finding,
  applicationId,
  onSubmitReview
}) => {
  if (!isOpen || !finding) return null;

  const [decision, setDecision] = useState('Confirmed Issue');
  const [reviewerName, setReviewerName] = useState('Senior Auditor (Review Team)');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide a review rationale note before submitting.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmitReview({
        finding_id: finding.finding_id,
        decision,
        reviewer_name: reviewerName,
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record review action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-surface-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-slate-50">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-brand-blue" />
            <div>
              <h3 className="text-lg font-bold text-navy-800">Authorised Human Review</h3>
              <p className="text-xs text-ink-secondary">Application: {applicationId} • Finding: {finding.finding_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-secondary hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Finding Summary Preview */}
        <div className="p-6 border-b border-surface-border space-y-2 text-sm bg-blue-50/50">
          <div className="font-semibold text-navy-800">{finding.check_name}</div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            <strong>Evidence:</strong> {finding.supporting_evidence}
          </p>
          <div className="text-xs text-ink-secondary">
            <strong>Initial Finding Status:</strong> <span className="font-semibold text-status-warning">{finding.status}</span> ({finding.severity} Severity)
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-status-error-bg text-status-error text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-ink-secondary tracking-wider mb-2">
              Review Action Decision
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Confirmed Issue', desc: 'Discrepancy confirmed valid', icon: AlertOctagon, color: 'text-status-error' },
                { label: 'Resolved', desc: 'Acceptable justification provided', icon: CheckCircle2, color: 'text-status-success' },
                { label: 'False Positive', desc: 'Algorithmic or OCR parsing error', icon: ShieldAlert, color: 'text-brand-blue' },
                { label: 'Requires Further Investigation', desc: 'Escalate to institutional authority', icon: HelpCircle, color: 'text-amber-700' },
              ].map((opt) => (
                <label
                  key={opt.label}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    decision === opt.label
                      ? 'border-brand-blue bg-blue-50/60 ring-1 ring-brand-blue'
                      : 'border-surface-border hover:bg-surface-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={opt.label}
                    checked={decision === opt.label}
                    onChange={(e) => setDecision(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-ink-primary flex items-center gap-1">
                      <opt.icon className={`w-3.5 h-3.5 ${opt.color}`} />
                      <span>{opt.label}</span>
                    </div>
                    <div className="text-[10px] text-ink-secondary">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-ink-secondary tracking-wider mb-1">
              Reviewer Name / Identifier
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-ink-secondary tracking-wider mb-1">
              Audit Review Note & Rationale
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Explain the investigative basis for this decision..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
              required
            />
          </div>

          <p className="text-[11px] text-ink-muted">
            The original automated algorithmic findings will remain preserved. This review decision will be appended 
            as an immutable audit event in the official verification report.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-hover rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-dark rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Recording Review...' : 'Commit Review Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
