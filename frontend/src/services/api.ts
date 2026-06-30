const BASE_URL = 'http://localhost:8000';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string; // super_admin, department_coordinator, faculty_inventor, management_viewer
  department_id?: number;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface Inventor {
  id: number;
  patent_id: number;
  inventor_name: string;
  user_id?: number;
  is_primary: boolean;
}

export interface PatentDocument {
  id: number;
  patent_id: number;
  document_type: string;
  filename: string;
  filepath: string;
  uploaded_by: number;
  uploaded_at: string;
  version: number;
}

export interface StatusHistory {
  id: number;
  patent_id: number;
  status: string;
  notes?: string;
  updated_by: number;
  changed_at: string;
}

export interface NotificationResponse {
  id: number;
  user_id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Patent {
  id: number;
  title: string;
  application_number?: string;
  publication_number?: string;
  grant_number?: string;
  domain?: string;
  category?: string;
  description?: string;
  status: string;
  filing_date?: string;
  publication_date?: string;
  grant_date?: string;
  department_id: number;
  created_at: string;
  updated_at: string;
}

export interface PatentDetail extends Patent {
  inventors: Inventor[];
  documents: PatentDocument[];
  status_history: StatusHistory[];
}

export interface KPIStats {
  total_patents: number;
  active_patents: number;
  published_patents: number;
  granted_patents: number;
  pending_patents: number;
  rejected_patents: number;
}

export interface DepartmentPerformance {
  department_id: number;
  department_name: string;
  department_code: string;
  total_patents: number;
  filed_patents: number;
  published_patents: number;
  granted_patents: number;
  pending_patents: number;
  success_rate: number;
  innovation_score: number;
}

export interface InventorPerformance {
  user_id?: number;
  inventor_name: string;
  total_patents: number;
  granted_patents: number;
  primary_patents: number;
  innovation_index: number;
}

export interface RiskDetail {
  patent_id: number;
  title: string;
  status: string;
  days_in_status: number;
  risk_level: string; // Low, Medium, High
  reasons: string[];
  action_items: string[];
}

export interface ForecastItem {
  year: number;
  predicted_filings: number;
  predicted_grants: number;
}

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Auto-set application/json if not sending FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Network error occurred' }));
    throw new Error(errData.detail || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth API
  login: async (username: string, password: string): Promise<{ access_token: string, token_type: string }> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return request('/api/auth/login', {
      method: 'POST',
      body: formData
    });
  },
  
  getMe: async (): Promise<User> => {
    return request('/api/auth/me');
  },

  // Patents API
  getPatents: async (filters: { search?: string, status_filter?: string, department_id?: number, domain_filter?: string } = {}): Promise<Patent[]> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status_filter) params.append('status_filter', filters.status_filter);
    if (filters.department_id) params.append('department_id', String(filters.department_id));
    if (filters.domain_filter) params.append('domain_filter', filters.domain_filter);
    
    const query = params.toString();
    return request(`/api/patents${query ? `?${query}` : ''}`);
  },

  getPatentDetail: async (id: number): Promise<PatentDetail> => {
    return request(`/api/patents/${id}`);
  },

  createPatent: async (data: Omit<Patent, 'id' | 'created_at' | 'updated_at'> & { inventors: Omit<Inventor, 'id' | 'patent_id'>[] }): Promise<Patent> => {
    return request('/api/patents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updatePatent: async (id: number, data: Partial<Patent>): Promise<Patent> => {
    return request(`/api/patents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  transitionStatus: async (id: number, statusVal: string, notes?: string): Promise<Patent> => {
    const formData = new FormData();
    formData.append('status_val', statusVal);
    if (notes) formData.append('notes', notes);
    return request(`/api/patents/${id}/status`, {
      method: 'POST',
      body: formData
    });
  },

  uploadDocument: async (id: number, documentType: string, file: File): Promise<PatentDocument> => {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    return request(`/api/patents/${id}/documents`, {
      method: 'POST',
      body: formData
    });
  },

  getDownloadUrl: (patentId: number, docId: number): string => {
    return `${BASE_URL}/api/patents/${patentId}/documents/${docId}/download`;
  },

  aiSuggestDomain: async (title: string, description?: string): Promise<{ predicted_domain: string, confidence: number }> => {
    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);
    return request('/api/patents/ai-categorize', {
      method: 'POST',
      body: formData
    });
  },

  getAiRiskAssessment: async (id: number): Promise<RiskDetail> => {
    return request(`/api/patents/${id}/ai-risk`);
  },

  // Departments API
  getDepartments: async (): Promise<Department[]> => {
    return request('/api/departments');
  },

  getDepartmentPerformance: async (id: number): Promise<DepartmentPerformance> => {
    return request(`/api/departments/${id}/performance`);
  },

  createDepartment: async (name: string, code: string): Promise<Department> => {
    return request('/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name, code })
    });
  },

  // Users API
  getUsers: async (departmentId?: number): Promise<User[]> => {
    const url = departmentId ? `/api/users?department_id=${departmentId}` : '/api/users';
    return request(url);
  },

  createUser: async (data: Omit<User, 'id' | 'created_at'> & { password: string }): Promise<User> => {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getInventors: async (): Promise<User[]> => {
    return request('/api/users/inventors');
  },

  getNotifications: async (): Promise<NotificationResponse[]> => {
    return request('/api/users/notifications');
  },

  markNotificationRead: async (notifId: number): Promise<{ status: string }> => {
    return request(`/api/users/notifications/${notifId}/read`, {
      method: 'POST'
    });
  },

  // Analytics API
  getKPIs: async (): Promise<KPIStats> => {
    return request('/api/analytics/kpis');
  },

  getYearlyTrends: async (): Promise<{ year: number, filings: number, grants: number }[]> => {
    return request('/api/analytics/yearly-trends');
  },

  getDomainDistribution: async (): Promise<{ domain: string, count: number }[]> => {
    return request('/api/analytics/domain-distribution');
  },

  getDepartmentComparison: async (): Promise<DepartmentPerformance[]> => {
    return request('/api/analytics/department-comparison');
  },

  getFacultyRankings: async (): Promise<InventorPerformance[]> => {
    return request('/api/analytics/faculty-rankings');
  },

  getAIForecast: async (): Promise<ForecastItem[]> => {
    return request('/api/analytics/ai-forecast');
  },

  getAIRisks: async (): Promise<RiskDetail[]> => {
    return request('/api/analytics/ai-risks');
  }
};
