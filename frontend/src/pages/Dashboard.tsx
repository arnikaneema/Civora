import React, { useState, useEffect } from 'react';
import { ApplicationListItem, OverallStatus } from '../types';
import { fetchApplications, deleteApplication, getReportDownloadUrl } from '../services/api';
import { 
  LayoutDashboard, PlusCircle, FileText, CheckCircle2, AlertTriangle, 
  HelpCircle, Trash2, Download, Search, Filter, RefreshCw, Eye,
  ShieldCheck, AlertCircle, FileCheck
} from 'lucide-react';

interface DashboardProps {
  onNewVerification: () => void;
  onOpenApplication: (appId: string) => void;
  onOpenDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNewVerification,
  onOpenApplication,
  onOpenDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'reports' | 'settings' | 'help'>('overview');
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplications({
        category: categoryFilter,
        status: statusFilter,
        search: searchTerm,
      });
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load application records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to permanently purge application ${id} and all related document streams?`)) {
      try {
        await deleteApplication(id);
        setApplications(applications.filter((a) => a.application_id !== id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete record');
      }
    }
  };

  // Metrics computed dynamically from live database records
  const totalApps = applications.length;
  const completedChecks = applications.reduce((acc, curr) => acc + (curr.total_checks || 0), 0);
  const requiresReviewCount = applications.filter(
    (a) => a.overall_status === 'Needs Review' || (a.review_checks && a.review_checks > 0)
  ).length;
  const incompleteCount = applications.filter(
    (a) => a.overall_status === 'Action Required' || a.overall_status === 'Incomplete' || (a.failed_checks && a.failed_checks > 0)
  ).length;

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col md:flex-row">
      {/* ========================================================= */}
      {/* DESKTOP SAAS SIDEBAR                                      */}
      {/* ========================================================= */}
      <aside className="w-full md:w-64 bg-white border-r border-surface-border p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-3">
              Console Navigation
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-brand-light text-brand-blue'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={onNewVerification}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-brand-blue hover:bg-brand-light transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-brand-blue" />
                <span>New Verification</span>
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'applications'
                    ? 'bg-brand-light text-brand-blue'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Applications</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-brand-light text-brand-blue'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-brand-light text-brand-blue'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Rule Engine Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'help'
                    ? 'bg-brand-light text-brand-blue'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Guides</span>
              </button>
            </nav>
          </div>

          {/* Quick Sandbox Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
            <div className="font-bold text-navy-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-blue" />
              <span>Sandbox Demonstration</span>
            </div>
            <p className="text-ink-secondary text-[11px] leading-relaxed">
              Run test scenarios with preloaded synthetic application packages.
            </p>
            <button
              onClick={onOpenDemo}
              className="w-full py-1.5 px-3 rounded-lg bg-brand-blue text-white font-semibold text-xs hover:bg-brand-dark transition-all text-center block"
            >
              Open Test Scenarios
            </button>
          </div>
        </div>

        {/* User / Session State */}
        <div className="pt-4 border-t border-surface-border text-xs text-ink-secondary flex items-center justify-between">
          <span>Active Session</span>
          <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-navy-800">
            Local SQLite
          </span>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN DASHBOARD CONTENT AREA                               */}
      {/* ========================================================= */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800">
              Applications Dashboard
            </h1>
            <p className="text-sm text-ink-secondary mt-1">
              Live repository of application verification runs, compliance audits, and downloadable reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-white border border-surface-border text-ink-secondary hover:text-navy-800 hover:bg-surface-hover transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onNewVerification}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold shadow-md hover:bg-brand-dark transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Verification</span>
            </button>
          </div>
        </div>

        {/* Live Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-secondary mb-2">
              <span>Total Applications</span>
              <FileText className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="text-3xl font-extrabold text-navy-800">{totalApps}</div>
            <div className="text-[11px] text-ink-muted mt-1">Stored in local database</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-secondary mb-2">
              <span>Checks Completed</span>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <div className="text-3xl font-extrabold text-status-success">{completedChecks}</div>
            <div className="text-[11px] text-ink-muted mt-1">Evaluated across all submissions</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-secondary mb-2">
              <span>Requires Review</span>
              <HelpCircle className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-700">{requiresReviewCount}</div>
            <div className="text-[11px] text-ink-muted mt-1">Flagged for human confirmation</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-secondary mb-2">
              <span>Action Required</span>
              <AlertTriangle className="w-4 h-4 text-status-error" />
            </div>
            <div className="text-3xl font-extrabold text-status-error">{incompleteCount}</div>
            <div className="text-[11px] text-ink-muted mt-1">Missing docs or failed limits</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-surface-border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by ID or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-surface-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs text-ink-secondary">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-surface-border bg-white text-xs text-navy-800 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              >
                <option value="all">All Statuses</option>
                <option value="Passed Configured Checks">Passed Configured Checks</option>
                <option value="Action Required">Action Required</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table / Records Display */}
        {loading ? (
          <div className="p-12 text-center text-ink-secondary bg-white rounded-3xl border border-surface-border">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-blue mb-3" />
            <p className="text-sm">Loading application repository...</p>
          </div>
        ) : applications.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-surface-border shadow-sm max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-800">No applications yet</h3>
            <p className="text-sm text-ink-secondary max-w-sm mx-auto mt-2 mb-6 leading-relaxed">
              Start your first verification to see your automated results and compliance reports here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onNewVerification}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold shadow-md hover:bg-brand-dark transition-all"
              >
                Start New Verification
              </button>
              <button
                onClick={onOpenDemo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-bg border border-surface-border text-navy-800 text-sm font-semibold hover:bg-surface-hover transition-all"
              >
                Load Demo Scenario
              </button>
            </div>
          </div>
        ) : (
          /* Table of Actual Records */
          <div className="bg-white rounded-3xl border border-surface-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-surface-border text-ink-secondary uppercase tracking-wider font-semibold">
                    <th className="py-4 px-6">Application ID</th>
                    <th className="py-4 px-6">Application Type</th>
                    <th className="py-4 px-6">Submission Date</th>
                    <th className="py-4 px-6">Verification Status</th>
                    <th className="py-4 px-6">Issues Found</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {applications.map((app) => {
                    const isPassed = app.overall_status.includes('Passed');
                    const isAction = app.overall_status.includes('Action');
                    const issuesCount = (app.failed_checks || 0) + (app.review_checks || 0);

                    return (
                      <tr key={app.application_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-navy-800">
                          <button
                            onClick={() => onOpenApplication(app.application_id)}
                            className="hover:text-brand-blue hover:underline flex items-center gap-1.5"
                          >
                            <span>{app.application_id}</span>
                            {app.is_demo && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                                Demo
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-6 font-medium text-ink-primary">
                          {app.category_title}
                        </td>

                        <td className="py-4 px-6 text-ink-secondary">
                          {app.submission_date}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                              isPassed
                                ? 'bg-status-success-bg text-status-success'
                                : isAction
                                ? 'bg-status-error-bg text-status-error'
                                : 'bg-status-review-bg text-status-review'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{app.overall_status}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 font-medium">
                          {issuesCount > 0 ? (
                            <span className="text-status-error font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{issuesCount} detected</span>
                            </span>
                          ) : (
                            <span className="text-status-success flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>0 issues</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onOpenApplication(app.application_id)}
                              className="p-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-100 transition-colors"
                              title="View Result Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <a
                              href={getReportDownloadUrl(app.application_id)}
                              download
                              className="p-1.5 rounded-lg bg-slate-100 text-ink-secondary hover:text-navy-800 hover:bg-slate-200 transition-colors"
                              title="Download Verification PDF Report"
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleDelete(app.application_id)}
                              className="p-1.5 rounded-lg text-ink-muted hover:text-status-error hover:bg-red-50 transition-colors"
                              title="Purge Record (Data Retention Compliance)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
