import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Play, FileText, ArrowRight } from 'lucide-react';
import { runDemoScenario } from '../services/api';
import { ApplicationRecord } from '../types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioSuccess: (record: ApplicationRecord) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onScenarioSuccess }) => {
  if (!isOpen) return null;

  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (key: 'scenario_a' | 'scenario_b' | 'scenario_c') => {
    setLoadingScenario(key);
    setError(null);
    try {
      const record = await runDemoScenario(key);
      onScenarioSuccess(record);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process demonstration scenario.');
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-surface-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-brand-blue font-semibold text-xs tracking-wide uppercase mb-1">
              Synthetic Testing Sandbox
            </div>
            <h3 className="text-xl font-bold text-navy-800">Demonstration Verification Scenarios</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Experience the end-to-end extraction, validation engine, and compliance auditing without uploading personal data.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-secondary hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 rounded-xl bg-status-error-bg text-status-error text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Scenarios Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Scenario A */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-blue hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-green-50 text-status-success shrink-0 mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy-800 text-base">Scenario A: Complete Valid Application</h4>
                    <span className="px-2 py-0.5 rounded-md bg-green-100 text-status-success text-[10px] font-bold uppercase tracking-wider">
                      Passes All Rules
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">
                    Application Form, Govt ID, Income Certificate (&lt; INR 300,000 threshold), and Address Proof.
                  </p>
                  <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <div><strong>Applicant:</strong> Aarav Rajesh Sharma • <strong>Declared Income:</strong> INR 240,000</div>
                    <div><strong>Outcome:</strong> Verified completeness, internal cross-document match, compliance ceiling satisfied.</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRun('scenario_a')}
                disabled={loadingScenario !== null}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-dark transition-all disabled:opacity-50"
              >
                {loadingScenario === 'scenario_a' ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <span>Run Scenario A</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scenario B */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-status-warning shrink-0 mt-0.5">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy-800 text-base">Scenario B: Missing Mandatory Information</h4>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">
                    Application contains missing mandatory Income Certificate and absent Date of Birth field.
                  </p>
                  <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <div><strong>Applicant:</strong> Priya Nair • <strong>Issue:</strong> Absent proof of financial qualification.</div>
                    <div><strong>Outcome:</strong> Flags incomplete submission checklist and records risks in readiness audit.</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRun('scenario_b')}
                disabled={loadingScenario !== null}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-all disabled:opacity-50"
              >
                {loadingScenario === 'scenario_b' ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <span>Run Scenario B</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scenario C */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-red-400 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-50 text-status-error shrink-0 mt-0.5">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy-800 text-base">Scenario C: Cross-Document Inconsistencies</h4>
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-status-error text-[10px] font-bold uppercase tracking-wider">
                      Discrepancies Detected
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">
                    Name mismatch across ID (Arun K. Verma vs Arun Kumar Sharma) and declared income conflicts with salary certificate.
                  </p>
                  <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <div><strong>Conflict:</strong> Declared INR 180,000 in form vs Certified INR 450,000 (exceeds INR 300,000 rule ceiling).</div>
                    <div><strong>Outcome:</strong> Highlights exact discrepancies, flags evidence for human review, and details corrective actions.</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRun('scenario_c')}
                disabled={loadingScenario !== null}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {loadingScenario === 'scenario_c' ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <span>Run Scenario C</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border bg-slate-50 flex items-center justify-between text-xs text-ink-secondary">
          <span>All demonstration files are processed live via the Python FastAPI pipeline.</span>
          <button onClick={onClose} className="font-semibold text-navy-800 hover:text-brand-blue">
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
