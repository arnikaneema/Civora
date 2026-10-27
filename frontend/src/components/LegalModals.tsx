import React from 'react';
import { X, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-surface-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-brand-blue" />
            <h3 className="text-xl font-bold text-navy-800">Privacy & Data Governance Notice</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-secondary hover:bg-surface-hover">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-ink-primary leading-relaxed">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <strong>Demonstration Notice:</strong> This privacy notice reflects the implemented data governance and 
            retention safeguards of the Docusure AI technical platform.
          </div>

          <h4 className="font-semibold text-navy-800 text-base">1. Document Usage & Purpose Limitation</h4>
          <p>
            Documents submitted to Docusure AI are utilized strictly to evaluate application completeness, 
            perform cross-document integrity comparisons, and calculate rule-based compliance against selected schemas. 
            Uploaded files are never utilized for model retraining or unauthorized commercial distribution.
          </p>

          <h4 className="font-semibold text-navy-800 text-base">2. Localized Controlled Processing</h4>
          <p>
            Uploaded PDFs and images are processed in isolated backend sandbox worker threads. File signatures 
            and byte headers are verified before stream execution. Content is isolated from privileged system services.
          </p>

          <h4 className="font-semibold text-navy-800 text-base">3. Data Retention & On-Demand Purging</h4>
          <p>
            Users and administrators can immediately delete any submitted application and purge all associated document 
            streams from the database and storage filesystem by using the <strong>Purge Record</strong> action in the dashboard.
          </p>

          <h4 className="font-semibold text-navy-800 text-base">4. Minimal Logging & Sensitive Field Quarantine</h4>
          <p>
            Server application logs do not store document full-text payloads, personally identifiable government ID numbers, 
            or biometric images. Only cryptographic hashes and structured finding identifiers are retained for audit trail compliance.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-blue text-white font-medium text-sm hover:bg-brand-dark transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-surface-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-status-success" />
            <h3 className="text-xl font-bold text-navy-800">Terms of Service & Verification Scope</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-secondary hover:bg-surface-hover">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-ink-primary leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Non-Authoritative Verification Disclaimer:</strong> Docusure AI reports provide automated preliminary 
              evaluations based on configured rules and submitted file streams. They do not constitute official statutory decisions.
            </div>
          </div>

          <h4 className="font-semibold text-navy-800 text-base">1. Scope of Verification</h4>
          <p>
            Docusure AI performs deterministic cross-document consistency checks, date validity calculations, and completeness 
            scoring against predefined eligibility rules. Unless explicitly integrated with an official government API, 
            <strong> official issuer verification is not claimed or performed</strong>.
          </p>

          <h4 className="font-semibold text-navy-800 text-base">2. Inconsistencies vs. Fraud Intent</h4>
          <p>
            Detected discrepancies (such as character variations, typographical differences, or OCR misalignments) are flagged 
            as <em>Potential Application Risks</em> requiring human review. They are not to be construed as conclusive proof of fraud.
          </p>

          <h4 className="font-semibold text-navy-800 text-base">3. Demonstration Rules</h4>
          <p>
            Rules marked as <em>[DEMO RULE]</em> represent illustrative scenarios created for technical benchmarking and 
            academic demonstration. They do not supersede official regulatory publications.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-blue text-white font-medium text-sm hover:bg-brand-dark transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
