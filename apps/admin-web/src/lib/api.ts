import { ApiResponse, PaginatedData, Project, SetupList, WorkOrder } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

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

export function fetchWorkOrders() {
  return request<PaginatedData<WorkOrder>>('/api/work-orders');
}

export function fetchSetupLists() {
  return request<PaginatedData<SetupList>>('/api/setup-lists');
}
