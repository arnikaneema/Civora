import React from 'react';
import { 
  ShieldCheck, FileCheck, CheckCircle2, AlertTriangle, ArrowRight, 
  Sparkles, Layers, Cpu, Search, FileSpreadsheet, Lock, HelpCircle,
  Clock, CheckCircle, FileText, ExternalLink, ChevronRight, Scale
} from 'lucide-react';

interface HomePageProps {
  onStartVerification: () => void;
  onOpenDemo: () => void;
  onViewSampleReport: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartVerification,
  onOpenDemo,
  onViewSampleReport,
}) => {
  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-surface-bg border-b border-surface-border">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-light/60 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-100/40 rounded-full blur-2xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-light border border-blue-200 text-brand-blue text-xs font-bold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-4 h-4 text-brand-blue" />
                <span>AI-POWERED DOCUMENT INTELLIGENCE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-navy-800 tracking-tight leading-[1.15]">
                Every Application Deserves a{' '}
                <span className="text-brand-blue relative inline-block">
                  Clearer Verification
                  <span className="absolute bottom-1 left-0 w-full h-1.5 bg-brand-blue/15 rounded-full"></span>
                </span>{' '}
                Process.
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-xl">
                Docusure AI brings application validation, document analysis, and compliance checks into one intelligent 
                workflow, helping you identify missing information, understand inconsistencies, and take the right next steps.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onStartVerification}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-brand-blue text-white font-semibold text-base shadow-xl shadow-brand-blue/25 hover:bg-brand-dark transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Start Verification</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-navy-800 font-semibold text-base border border-surface-border shadow-sm hover:bg-surface-hover hover:border-slate-300 transition-all duration-200 active:scale-95"
                >
                  <span>Explore How It Works</span>
                  <ChevronRight className="w-4 h-4 text-ink-secondary" />
                </button>
              </div>

              {/* Value Propositions */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-800">
                  <div className="w-2 h-2 rounded-full bg-brand-blue" />
                  <span>Evidence-based findings</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-800">
                  <div className="w-2 h-2 rounded-full bg-status-success" />
                  <span>Transparent verification checks</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-800">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>Human review when needed</span>
                </div>
              </div>
            </div>

            {/* Right Column: Original Product Software Illustration */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Main Software Dashboard Card Container */}
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
                  {/* Mock Window Controls Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-[11px] font-mono text-ink-secondary ml-2">DOCUSURE-PIPELINE // AUDIT-CORE</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                      LIVE ENGINE
                    </span>
                  </div>

                  {/* Component 1: Document Preview & Extracted Entity Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 text-brand-blue">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-navy-800">Income_Certificate_2025.pdf</div>
                        <div className="text-[10px] text-ink-secondary">Extracted: Annual Family Gross = INR 240,000</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-status-success text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Legible</span>
                    </span>
                  </div>

                  {/* Component 2: Cross-Document Consistency Indicator */}
                  <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-navy-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-brand-blue" />
                        Cross-Document Consistency Analysis
                      </span>
                      <span className="text-status-success font-bold text-[11px]">100% Exact Match</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg text-ink-secondary">
                      <div>Doc A (Form): <strong className="text-navy-800">Aarav R. Sharma</strong></div>
                      <div>Doc B (Govt ID): <strong className="text-navy-800">Aarav R. Sharma</strong></div>
                    </div>
                  </div>

                  {/* Component 3: Verification Checklist */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                      Automated Verification Checklist
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="flex items-center gap-2 text-ink-primary font-medium">
                          <CheckCircle2 className="w-4 h-4 text-status-success" />
                          Mandatory Documents Uploaded
                        </span>
                        <span className="text-[10px] font-bold text-status-success">3 of 3 Present</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="flex items-center gap-2 text-ink-primary font-medium">
                          <CheckCircle2 className="w-4 h-4 text-status-success" />
                          Income Ceiling Compliance (&lt; INR 300k)
                        </span>
                        <span className="text-[10px] font-bold text-status-success">Passed</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="flex items-center gap-2 text-ink-primary font-medium">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Official Issuer API Lookup
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">Not Integrated (Manual)</span>
                      </div>
                    </div>
                  </div>

                  {/* Component 4: Compliance Status & Report Badge */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                      <span className="font-bold text-navy-800">Overall: Passed Configured Checks</span>
                    </div>
                    <button
                      onClick={onOpenDemo}
                      className="text-xs font-bold text-brand-blue hover:text-brand-dark flex items-center gap-1"
                    >
                      <span>Test Demo Scenarios</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Floating Decorative Badges */}
                <div className="absolute -bottom-5 -left-5 bg-navy-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-navy-700 animate-bounce duration-1000">
                  <div className="p-2 rounded-xl bg-brand-blue text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Deterministic Engine</div>
                    <div className="text-[10px] text-slate-300">Evidence-Backed Audit Log</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FEATURES SECTION                                          */}
      {/* ========================================================= */}
      <section id="features" className="py-20 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-blue text-xs font-bold tracking-wide uppercase">
              Robust Feature Set
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
              Everything You Need to Review an Application
            </h2>
            <p className="text-base text-ink-secondary">
              One streamlined platform for identifying issues before they become bigger problems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Feature 1 */}
            <div className="group p-7 rounded-3xl bg-surface-bg border border-surface-border hover:border-brand-blue hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center mb-5 group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">Application Validation</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Identify missing fields, incomplete submissions, and inconsistencies between application details.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onStartVerification}
                  className="text-xs font-bold text-brand-blue group-hover:text-brand-dark flex items-center gap-1"
                >
                  <span>Validate an Application</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group p-7 rounded-3xl bg-surface-bg border border-surface-border hover:border-brand-blue hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">Document Analysis</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Extract relevant information from supported PDFs and images and compare details across documents.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onStartVerification}
                  className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Extract & Compare</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group p-7 rounded-3xl bg-surface-bg border border-surface-border hover:border-brand-blue hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-green-100 text-status-success flex items-center justify-center mb-5 group-hover:bg-status-success group-hover:text-white transition-colors duration-300">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">Regulatory Compliance</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Evaluate applications against configured requirements and display the evidence behind each finding.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => {
                    const el = document.getElementById('compliance');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-status-success group-hover:text-green-800 flex items-center gap-1"
                >
                  <span>View Policy Engine</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group p-7 rounded-3xl bg-surface-bg border border-surface-border hover:border-brand-blue hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">Explainable Reports</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Understand what was detected, why it matters, and what action may resolve it.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onViewSampleReport}
                  className="text-xs font-bold text-amber-600 group-hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Inspect Sample Report</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HOW IT WORKS SECTION                                      */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 bg-surface-bg border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-brand-blue text-xs font-bold tracking-wide uppercase">
              Streamlined Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
              From Upload to Actionable Insights
            </h2>
            <p className="text-base text-ink-secondary">
              A 4-step transparent pipeline ensuring every document is thoroughly inspected with zero guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-white border border-surface-border shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-blue font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-navy-800 text-base">Upload Documents</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Upload an application and its supporting documents (PDF, JPG, PNG) under configured categories.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-white border border-surface-border shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-blue font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-navy-800 text-base">Extract Information</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Extract readable text, key application fields, dates, and track exact source document and page references.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-white border border-surface-border shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-blue font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-navy-800 text-base">Run Verification</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Perform completeness checks, cross-document comparisons, and applicable source-backed compliance checks.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-3xl bg-white border border-surface-border shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-blue font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-navy-800 text-base">Review Results</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Inspect evidence, understand potential issues, audit findings, and download a verification PDF report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* BENEFITS SECTION                                          */}
      {/* ========================================================= */}
      <section className="py-20 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
              Verification That Goes Beyond a Simple Pass or Fail
            </h2>
            <p className="text-base text-ink-secondary">
              Built specifically to empower applicants and administrators with clarity rather than opaque rejections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-brand-blue shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy-800 text-base mb-1">Clear explanations instead of unexplained results</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  No mysterious error codes or arbitrary scoring. Every finding explicitly explains what was detected and why it matters.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy-800 text-base mb-1">Evidence-linked findings for easier investigation</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Direct citation of document name, extracted text snippet, and page number so reviewers don't have to search manually.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-green-100 text-status-success shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy-800 text-base mb-1">Configurable, source-backed compliance rules</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Rules explicitly list version numbers, policy references, and effective dates. Fictional demo rules are clearly labelled.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy-800 text-base mb-1">Human review for uncertain or significant findings</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Provides a structured audit interface for authorised humans to confirm issues, resolve ambiguities, or mark false positives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SAMPLE REPORT SECTION                                     */}
      {/* ========================================================= */}
      <section className="py-20 bg-surface-bg border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold tracking-wide uppercase mb-2">
                  ILLUSTRATIVE DEMONSTRATION
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-800">
                  Verification Report Sample Preview
                </h2>
                <p className="text-sm text-ink-secondary mt-1">
                  Illustrative representation of synthetic evaluation output generated by Docusure AI.
                </p>
              </div>

              <button
                onClick={onViewSampleReport}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm shadow-md hover:bg-brand-dark transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>View Sample Report</span>
              </button>
            </div>

            {/* Example Info Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-2xl font-extrabold text-navy-800">3 of 4</div>
                <div className="text-xs font-medium text-ink-secondary mt-1">Required Documents Present</div>
              </div>
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
                <div className="text-2xl font-extrabold text-status-error">1</div>
                <div className="text-xs font-medium text-red-700 mt-1">Missing Mandatory Field</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-2xl font-extrabold text-status-warning">1</div>
                <div className="text-xs font-medium text-amber-700 mt-1">Cross-Doc Inconsistency</div>
              </div>
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                <div className="text-2xl font-extrabold text-status-success">4 Passed</div>
                <div className="text-xs font-medium text-green-700 mt-1">1 Needs Manual Review</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECURITY & TRANSPARENCY SECTION                           */}
      {/* ========================================================= */}
      <section id="compliance" className="py-20 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-brand-blue text-xs font-bold tracking-wide uppercase">
              Trust & Governance
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
              Know What Was Checked. Understand What Wasn’t.
            </h2>
            <p className="text-base text-ink-secondary">
              Docusure AI is engineered on radical transparency, explicit scope boundaries, and responsible verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-3xl bg-surface-bg border border-surface-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="font-bold text-navy-800 text-sm">Explicit Check Enumeration</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Displays exact criteria tested: format validation, field presence, chronological sequence, and income thresholds.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-bg border border-surface-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="font-bold text-navy-800 text-sm">Evidence-Backed Assertions</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Shows exact character matches, page numbers, and snippet quotes directly from submitted documents.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-bg border border-surface-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="font-bold text-navy-800 text-sm">Inconsistency vs. Fraud Distinction</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Identifies typographic or name mismatches as potential risks requiring human review rather than making unsupported fraud claims.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-bg border border-surface-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="font-bold text-navy-800 text-sm">Identifies Unassessed Requirements</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                If a rule cannot be evaluated due to missing evidence or unintegrated APIs, it is marked as Not Checked, never passed silently.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-bg border border-surface-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="font-bold text-navy-800 text-sm">No False Authenticity Claims</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Does not claim official authenticity verification unless an actual authoritative government verification mechanism was contacted.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-bg border border-surface-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="font-bold text-navy-800 text-sm">Prompt Injection Protection</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Document text is treated as untrusted data in sandboxed containers. Content cannot manipulate verification rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL CALL TO ACTION                                      */}
      {/* ========================================================= */}
      <section className="py-20 bg-navy-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Make Your Next Application Easier to Verify.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Start with your documents, identify what needs attention, and get a clearer picture of your application’s readiness.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartVerification}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-blue text-white font-bold text-base shadow-xl shadow-brand-blue/30 hover:bg-brand-dark transition-all duration-200 active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Start a Verification</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
