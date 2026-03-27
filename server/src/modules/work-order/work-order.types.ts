export type WorkOrderRecord = {
  id: number;
  workOrderNo: string;
  projectId: number;
  title: string;
  type: string;
  typeLabel: string;
  priority: string;
  priorityLabel: string;
  status: string;
  statusLabel: string;
  assigneeId: number | null;
  reviewerId: number | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  description: string | null;
};

export type WorkOrderListItem = {
  id: number;
  workOrderNo: string;
  projectId: number;
  title: string;
  type: string;
  typeLabel: string;
  priority: string;
  priorityLabel: string;
  status: string;
  statusLabel: string;
  assigneeId: number | null;
  reviewerId: number | null;
};

export type CreateWorkOrderInput = {
  projectId: number;
  title: string;
  type: string;
  priority?: string;
  assigneeId?: number;
  reviewerId?: number;
  plannedStartAt?: string;
  plannedEndAt?: string;
  description?: string;
};

export type UpdateWorkOrderStatusInput = {
  status: string;
};
