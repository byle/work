export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type PaginatedData<T> = {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type WorkOrder = {
  id: number;
  workOrderNo: string;
  projectId: number;
  title: string;
  type: string;
  priority: string;
  status: string;
  assigneeId: number | null;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  description?: string | null;
};

export type TodoSummary = {
  totalPending: number;
  totalInProgress: number;
  totalProjects: number;
};
