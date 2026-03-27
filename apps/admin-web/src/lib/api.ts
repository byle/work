import {
  ApiResponse,
  AuthUser,
  DashboardSummary,
  ImportResult,
  LoginResult,
  PaginatedData,
  Project,
  ProjectTemplate,
  SetupList,
  SetupListItem,
  User,
  WorkOrder
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';
const TOKEN_KEY = 'stage-workflow-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit, skipAuth = false): Promise<T> {
  const headers = new Headers(options?.headers || {});

  if (!headers.has('Content-Type') && options?.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth && getToken()) {
    headers.set('Authorization', `Bearer ${getToken()}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearToken();
    throw new Error('请先登录');
  }

  if (response.status === 403) {
    throw new Error('没有权限执行该操作');
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('text/csv')) {
    return (await response.text()) as T;
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (json.code !== 0) {
    throw new Error(json.message || 'Request failed');
  }

  return json.data;
}

export async function login(payload: { username: string; password: string }) {
  const result = await request<LoginResult>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    true
  );

  setToken(result.token);
  return result;
}

export function fetchMe() {
  return request<AuthUser | null>('/api/auth/me');
}

export function logout() {
  return request<boolean>('/api/auth/logout', { method: 'POST' });
}

export function fetchDashboardSummary() {
  return request<DashboardSummary>('/api/dashboard/summary');
}

export function fetchUsers() {
  return request<PaginatedData<User>>('/api/users');
}

export function createUser(payload: Record<string, unknown>) {
  return request<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchProjectTemplates() {
  return request<PaginatedData<ProjectTemplate>>('/api/project-templates');
}

export function createProjectTemplate(payload: Record<string, unknown>) {
  return request<ProjectTemplate>('/api/project-templates', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchProjects(keyword = '') {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  return request<PaginatedData<Project>>(`/api/projects${query}`);
}

export function fetchProjectDetail(projectId: number) {
  return request<Project>(`/api/projects/${projectId}`);
}

export function createProject(payload: Record<string, unknown>) {
  return request<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchWorkOrders(keyword = '', status = '') {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  if (status) params.set('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request<PaginatedData<WorkOrder>>(`/api/work-orders${query}`);
}

export function fetchWorkOrderDetail(workOrderId: number) {
  return request<WorkOrder>(`/api/work-orders/${workOrderId}`);
}

export function createWorkOrder(payload: Record<string, unknown>) {
  return request<WorkOrder>('/api/work-orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function assignWorkOrder(workOrderId: number, assigneeId: number | null, reviewerId?: number | null) {
  return request<WorkOrder>(`/api/work-orders/${workOrderId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigneeId, reviewerId: reviewerId ?? null })
  });
}

export function fetchSetupLists() {
  return request<PaginatedData<SetupList>>('/api/setup-lists');
}

export function createSetupList(payload: Record<string, unknown>) {
  return request<SetupList>('/api/setup-lists', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchSetupListItems(setupListId: number) {
  return request<SetupListItem[]>(`/api/setup-lists/${setupListId}/items`);
}

export function createSetupListItem(setupListId: number, payload: Record<string, unknown>) {
  return request<SetupListItem>(`/api/setup-lists/${setupListId}/items`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateSetupListItem(itemId: number, payload: Record<string, unknown>) {
  return request<SetupListItem>(`/api/setup-lists/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteSetupListItem(itemId: number) {
  return request<boolean>(`/api/setup-lists/items/${itemId}`, {
    method: 'DELETE'
  });
}

export function importSetupListItems(setupListId: number, rows: Record<string, unknown>[]) {
  return request<ImportResult>(`/api/import-export/setup-lists/${setupListId}/items/import`, {
    method: 'POST',
    body: JSON.stringify({ rows })
  });
}

export function exportSetupListItems(setupListId: number) {
  return request<string>(`/api/import-export/setup-lists/${setupListId}/items/export`);
}

export function fetchAuditLogs(bizType: string, bizId: number) {
  return request<Array<{ id: number; action: string; operatorId: number | null; remark: string | null; createdAt: string }>>(`/api/audit-logs/${bizType}/${bizId}`);
}


export function fetchDictionaryItems(dictType = '') {
  const query = dictType ? `?dictType=${encodeURIComponent(dictType)}` : '';
  return request<PaginatedData<{ id: number; dictType: string; itemValue: string; itemLabel: string; sortOrder: number; status: string }>>(`/api/dictionaries${query}`);
}

export function saveDictionaryItem(payload: Record<string, unknown>) {
  return request<{ id: number; dictType: string; itemValue: string; itemLabel: string; sortOrder: number; status: string }>(`/api/dictionaries`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
