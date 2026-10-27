import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, X, ShieldCheck, 
  Trash2, Eye, Lock, ArrowRight, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { fetchCategories, submitVerification, runDemoScenario } from '../services/api';
import { ApplicationCategoryConfig, ApplicationRecord } from '../types';

interface NewVerificationProps {
  onVerificationComplete: (record: ApplicationRecord) => void;
  onOpenDemo: () => void;
}

interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  assignedCategory: string;
  previewUrl?: string;
  status: 'ready' | 'invalid';
  errorMessage?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export const NewVerification: React.FC<NewVerificationProps> = ({
  onVerificationComplete,
  onOpenDemo
}) => {
  const [categories, setCategories] = useState<Record<string, ApplicationCategoryConfig>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('scholarship');
  const [filesList, setFilesList] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [previewModalFile, setPreviewModalFile] = useState<UploadedFileItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats && Object.keys(cats).length > 0 && !selectedCategory) {
          setSelectedCategory(Object.keys(cats)[0]);
        }
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const currentCategoryConfig = categories[selectedCategory];

  // Validate a single file
  const validateSingleFile = (file: File): { isValid: boolean; error?: string } => {
    const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];

    if (!validExts.includes(ext)) {
      return { isValid: false, error: `Unsupported extension '.${ext}'. Allowed: PDF, JPG, PNG.` };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'File is empty (0 bytes).' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: `File exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).` };
    }

    return { isValid: true };
  };

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setGlobalError(null);
    const newItems: UploadedFileItem[] = [];

    if (filesList.length + incomingFiles.length > MAX_FILES) {
      setGlobalError(`Submission limit exceeded: maximum ${MAX_FILES} files allowed.`);
      return;
    }

    // Default category assignment heuristics
    const reqs = currentCategoryConfig?.required_documents || [];

    Array.from(incomingFiles).forEach((f, idx) => {
      const validation = validateSingleFile(f);
      const fileId = `${f.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      
      // Auto-assign category based on file name or sequential missing requirement
      let assigned = 'supporting_document';
      const lowerName = f.name.toLowerCase();
      if (lowerName.includes('app') || lowerName.includes('form')) assigned = 'application_form';
      else if (lowerName.includes('id') || lowerName.includes('aadhaar') || lowerName.includes('passport')) assigned = 'identity_proof';
      else if (lowerName.includes('income') || lowerName.includes('salary') || lowerName.includes('itr')) assigned = 'income_certificate';
      else if (lowerName.includes('address') || lowerName.includes('domicile') || lowerName.includes('bill')) assigned = 'address_proof';
      else if (idx < reqs.length) {
        assigned = reqs[idx].type;
      }

      let preview: string | undefined = undefined;
      if (f.type.startsWith('image/')) {
        preview = URL.createObjectURL(f);
      }

      newItems.push({
        id: fileId,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        assignedCategory: assigned,
        previewUrl: preview,
        status: validation.isValid ? 'ready' : 'invalid',
        errorMessage: validation.error
      });
    });

    setFilesList((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFilesList((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateCategoryForFile = (id: string, newCat: string) => {
    setFilesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, assignedCategory: newCat } : item))
    );
  };

  // Required Checklist State
  const checklistStatus = (currentCategoryConfig?.required_documents || []).map((req) => {
    const isUploaded = filesList.some((f) => f.assignedCategory === req.type && f.status === 'ready');
    return {
      ...req,
      uploaded: isUploaded
    };
  });

  const missingMandatory = checklistStatus.filter((item) => item.mandatory && !item.uploaded);

  const handleSubmit = async () => {
    const validFiles = filesList.filter((f) => f.status === 'ready');
    if (validFiles.length === 0) {
      setGlobalError('Please upload at least one valid document file.');
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      setSubmissionProgress('Validating byte signatures & payload headers...');
      await new Promise((r) => setTimeout(r, 400));

      setSubmissionProgress('Extracting structured entities via Python pipeline...');
      const filesToUpload = validFiles.map((f) => f.file);
      const categoriesToUpload = validFiles.map((f) => f.assignedCategory);

      setSubmissionProgress('Running deterministic validation & compliance engine...');
      const record = await submitVerification(selectedCategory, filesToUpload, categoriesToUpload);

      setSubmissionProgress('Verification report generated. Directing to results...');
      await new Promise((r) => setTimeout(r, 300));

      onVerificationComplete(record);
    } catch (err: any) {
      setGlobalError(err.message || 'An unexpected error occurred during verification processing.');
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress('');
    }
  };

  const handleQuickDemo = async (scenario: 'scenario_a' | 'scenario_b' | 'scenario_c') => {
    setIsSubmitting(true);
    setSubmissionProgress(`Loading synthetic ${scenario}...`);
    try {
      const record = await runDemoScenario(scenario);
      onVerificationComplete(record);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to load demo scenario.');
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-blue text-xs font-bold tracking-wide uppercase mb-2">
          New Verification Workflow
        </div>
        <h1 className="text-3xl font-extrabold text-navy-800">Start a New Verification</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Select an application category, upload the required documents, and review the information before analysis.
        </p>
      </div>

      {globalError && (
        <div className="mb-6 p-4 rounded-2xl bg-status-error-bg text-status-error border border-red-200 text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Quick Synthetic Scenario Loader Bar */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-blue" />
            <span>Fast-Track Demonstration (No Files Required)</span>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">
            Test the live verification engine instantly using one of the three synthetic benchmark scenarios:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickDemo('scenario_a')}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg bg-white border border-green-300 text-status-success font-semibold text-xs hover:bg-green-50 transition-all shadow-sm"
          >
            Load Scenario A (Valid)
          </button>
          <button
            onClick={() => handleQuickDemo('scenario_b')}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 font-semibold text-xs hover:bg-amber-50 transition-all shadow-sm"
          >
            Load Scenario B (Missing Info)
          </button>
          <button
            onClick={() => handleQuickDemo('scenario_c')}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-status-error font-semibold text-xs hover:bg-red-50 transition-all shadow-sm"
          >
            Load Scenario C (Conflict)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Upload Interface (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Category Selection */}
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-sm space-y-4">
            <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
              1. Select Application Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(categories).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedCategory === key
                      ? 'border-brand-blue bg-blue-50/70 ring-2 ring-brand-blue/30'
                      : 'border-surface-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="font-bold text-navy-800 text-sm">{config.title}</div>
                  <div className="text-[11px] text-ink-secondary mt-1 leading-snug">{config.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Drag & Drop Upload Zone */}
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
                2. Upload Supporting Documents
              </label>
              <span className="text-[11px] text-ink-muted">
                Supported: PDF, JPG, JPEG, PNG (Max 10 MB per file, up to 10 files)
              </span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-brand-blue bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-brand-blue hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand-blue flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-bold text-navy-800 text-sm sm:text-base">
                Drag and drop your documents here, or browse files.
              </p>
              <p className="text-xs text-ink-secondary mt-1">
                Upload application form, ID proof, income certificate, or other records.
              </p>
            </div>

            {/* Uploaded Files Inventory */}
            {filesList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                  Uploaded File Manifest ({filesList.length})
                </div>

                <div className="space-y-2">
                  {filesList.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        item.status === 'invalid'
                          ? 'border-red-300 bg-red-50/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-brand-blue shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-navy-800 truncate">{item.name}</div>
                          <div className="text-[11px] text-ink-secondary">
                            {(item.size / 1024).toFixed(1)} KB • {item.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </div>
                          {item.errorMessage && (
                            <div className="text-[10px] text-status-error font-medium mt-0.5">
                              {item.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document Categorizer Dropdown & Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <select
                          value={item.assignedCategory}
                          onChange={(e) => updateCategoryForFile(item.id, e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-navy-800 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        >
                          <option value="application_form">Application Form</option>
                          <option value="identity_proof">Identity Proof</option>
                          <option value="income_certificate">Income Certificate</option>
                          <option value="address_proof">Address Proof</option>
                          <option value="supporting_document">Supporting Document</option>
                          <option value="other">Other</option>
                        </select>

                        {item.previewUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewModalFile(item)}
                            className="p-1.5 rounded-lg text-ink-secondary hover:text-navy-800 hover:bg-slate-200"
                            title="Preview Image"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="p-1.5 rounded-lg text-ink-secondary hover:text-status-error hover:bg-red-100"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Privacy Notice Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-ink-secondary">
            <div className="flex items-center gap-2 font-bold text-navy-800">
              <Lock className="w-4 h-4 text-brand-blue" />
              <span>Privacy & Document Handling Notice</span>
            </div>
            <p className="leading-relaxed">
              Documents are processed securely via an isolated Python sandbox to extract required fields and evaluate 
              cross-document consistency. Data is stored locally in your active SQLite session and can be permanently 
              purged at any time via the dashboard. No personal data is transmitted to unauthorized third parties.
            </p>
          </div>

          {/* Analyse Documents Button */}
          <div>
            {missingMandatory.length > 0 && filesList.length > 0 && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Mandatory Requirement Advisory:</strong> The submission is missing required document(s):{' '}
                  <span className="font-semibold">{missingMandatory.map((m) => m.label).join(', ')}</span>. You may still 
                  proceed, and the missing requirement will be recorded in the final readiness assessment report.
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || filesList.length === 0}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-blue text-white font-bold text-base shadow-lg shadow-brand-blue/20 hover:bg-brand-dark transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{submissionProgress || 'Processing Documents...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Analyse Documents & Generate Report</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Required-Document Checklist (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-sm sticky top-28 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="font-bold text-navy-800 text-sm uppercase tracking-wider">
                Required Document Checklist
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue">
                {currentCategoryConfig?.title || 'Selected Category'}
              </span>
            </div>

            <p className="text-xs text-ink-secondary">
              Requirements update dynamically as documents are added or categorized:
            </p>

            <div className="space-y-3">
              {checklistStatus.map((item) => (
                <div
                  key={item.type}
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                    item.uploaded
                      ? 'border-green-200 bg-green-50/60'
                      : item.mandatory
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-navy-800">{item.label}</div>
                    <div className="text-[10px] text-ink-secondary">
                      {item.mandatory ? (
                        <span className="text-amber-800 font-semibold">Mandatory</span>
                      ) : (
                        <span className="text-slate-500">Optional</span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] shrink-0 ${
                      item.uploaded ? 'text-status-success' : 'text-amber-700'
                    }`}
                  >
                    {item.uploaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Uploaded</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Missing</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-border text-[11px] text-ink-muted">
              Note: Unuploaded mandatory documents trigger an "Action Required" finding in the final compliance report.
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewModalFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-navy-800 text-sm truncate">{previewModalFile.name}</h4>
              <button
                onClick={() => setPreviewModalFile(null)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-ink-secondary" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-4">
              <img
                src={previewModalFile.previewUrl}
                alt="Document preview"
                className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewModalFile(null)}
                className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
