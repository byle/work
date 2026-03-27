import { ApiResponse, Attachment, AuthUser, LoginResult, PaginatedData, TodoSummary, WorkOrder } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';
const TOKEN_KEY = 'stage-workflow-mobile-token';

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

  if (!headers.has('Content-Type') && options?.body) {
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

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (json.code !== 0) {
    throw new Error(json.message || 'Request failed');
  }

  return json.data;
}

export async function login(payload: { username: string; password: string }) {
  const result = await request<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, true);

  setToken(result.token);
  return result;
}

export function fetchMe() {
  return request<AuthUser | null>('/api/auth/me');
}

export function logout() {
  return request<boolean>('/api/auth/logout', { method: 'POST' });
}

export async function fetchTodoSummary(): Promise<TodoSummary> {
  const workOrders = await request<PaginatedData<WorkOrder>>('/api/work-orders?mine=true');

  return {
    totalPending: workOrders.list.filter((item) => item.status === 'pending' || item.status === 'pending_assign').length,
    totalInProgress: workOrders.list.filter((item) => item.status === 'in_progress').length,
    totalProjects: new Set(workOrders.list.map((item) => item.projectId)).size
  };
}

export function fetchMyWorkOrders() {
  return request<PaginatedData<WorkOrder>>('/api/work-orders?mine=true');
}

export function fetchWorkOrderDetail(workOrderId: number) {
  return request<WorkOrder>(`/api/work-orders/${workOrderId}`);
}

export function updateWorkOrderStatus(workOrderId: number, status: string) {
  return request<WorkOrder>(`/api/work-orders/${workOrderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function fetchAttachments(workOrderId: number) {
  return request<Attachment[]>(`/api/attachments/work_order/${workOrderId}`);
}

export function uploadAttachment(workOrderId: number, payload: { fileName: string; fileType?: string; contentBase64: string }) {
  return request<Attachment>(`/api/attachments/work_order/${workOrderId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
