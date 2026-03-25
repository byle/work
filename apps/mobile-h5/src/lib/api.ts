import { ApiResponse, PaginatedData, TodoSummary, WorkOrder } from '../types/api';

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

export async function fetchTodoSummary(): Promise<TodoSummary> {
  const workOrders = await request<PaginatedData<WorkOrder>>('/api/work-orders');

  return {
    totalPending: workOrders.list.filter((item) => item.status === 'pending' || item.status === 'pending_assign').length,
    totalInProgress: workOrders.list.filter((item) => item.status === 'in_progress').length,
    totalProjects: new Set(workOrders.list.map((item) => item.projectId)).size
  };
}

export function fetchMyWorkOrders() {
  return request<PaginatedData<WorkOrder>>('/api/work-orders');
}

export function fetchWorkOrderDetail(workOrderId: number) {
  return request<WorkOrder>(`/api/work-orders/${workOrderId}`);
}
