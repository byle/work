export type WorkOrderRecord = {
  id: number;
  workOrderNo: string;
  projectId: number;
  title: string;
  type: string;
  priority: string;
  status: string;
  assigneeId: number | null;
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
  priority: string;
  status: string;
  assigneeId: number | null;
};

export type CreateWorkOrderInput = {
  projectId: number;
  title: string;
  type: string;
  priority?: string;
  assigneeId?: number;
  plannedStartAt?: string;
  plannedEndAt?: string;
  description?: string;
};
