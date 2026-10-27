import { ApplicationRecord, ApplicationListItem, ApplicationCategoryConfig } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch system health');
  return res.json();
}

export async function fetchCategories(): Promise<Record<string, ApplicationCategoryConfig>> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchApplications(params?: { category?: string; status?: string; search?: string }): Promise<ApplicationListItem[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.status && params.status !== 'all') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/applications?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function fetchApplication(id: string): Promise<ApplicationRecord> {
  const res = await fetch(`${API_BASE}/applications/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch application' }));
    throw new Error(err.detail || 'Application not found');
  }
  return res.json();
}

export async function submitVerification(
  category: string,
  files: File[],
  categories: string[]
): Promise<ApplicationRecord> {
  const formData = new FormData();
  formData.append('category', category);
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  categories.forEach((cat) => {
    formData.append('categories', cat);
  });

  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Submission failed' }));
    throw new Error(err.detail || 'Failed to verify application');
  }

  return res.json();
}

export async function runDemoScenario(scenarioKey: 'scenario_a' | 'scenario_b' | 'scenario_c'): Promise<ApplicationRecord> {
  const res = await fetch(`${API_BASE}/demo/run/${scenarioKey}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Demo run failed' }));
    throw new Error(err.detail || 'Failed to execute demo scenario');
  }

  return res.json();
}

export async function submitHumanReview(
  applicationId: string,
  data: {
    finding_id: string;
    decision: string;
    reviewer_name: string;
    notes: string;
  }
): Promise<ApplicationRecord> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit review' }));
    throw new Error(err.detail || 'Failed to submit review');
  }

  return res.json();
}

export async function deleteApplication(applicationId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Deletion failed' }));
    throw new Error(err.detail || 'Failed to delete application');
  }
}

export function getReportDownloadUrl(applicationId: string): string {
  return `${API_BASE}/applications/${applicationId}/report.pdf`;
}
