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

export type AuthUser = {
  id: number;
  username: string;
  realName: string;
  roles: string[];
};

export type LoginResult = {
  token: string;
  user: AuthUser;
};

export type Attachment = {
  id: number;
  bizType: string;
  bizId: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedBy: number | null;
  createdAt: string;
};

export type WorkOrder = {
  id: number;
  workOrderNo: string;
  projectId: number;
  title: string;
  type: string;
  typeLabel?: string;
  priority: string;
  priorityLabel?: string;
  status: string;
  statusLabel?: string;
  assigneeId: number | null;
  reviewerId: number | null;
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
