import { ApiResponse, PaginatedData, Project, SetupList, SetupListItem, WorkOrder } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (json.code !== 0) {
    throw new Error(json.message || 'Request failed');
  }

  return json.data;
}

export function fetchProjects() {
  return request<PaginatedData<Project>>('/api/projects');
}

export function createProject(payload: Record<string, unknown>) {
  return request<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchWorkOrders() {
  return request<PaginatedData<WorkOrder>>('/api/work-orders');
}

export function createWorkOrder(payload: Record<string, unknown>) {
  return request<WorkOrder>('/api/work-orders', {
    method: 'POST',
    body: JSON.stringify(payload)
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
