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

export type DashboardSummary = {
  projectsTotal: number;
  projectsDraft: number;
  workOrdersTotal: number;
  workOrdersPending: number;
  workOrdersInProgress: number;
  workOrdersApproved: number;
  setupListsTotal: number;
};

export type AuthUser = {
  id: number;
  username: string;
  realName: string;
  roles: string[];
};

export type User = {
  id: number;
  username: string;
  realName: string;
  status: string;
  roles: string[];
};

export type LoginResult = {
  token: string;
  user: AuthUser;
};

export type ProjectMember = {
  id: number;
  userId: number;
  roleInProject: string;
};

export type ProjectTemplate = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  version: number;
  status: string;
  workOrderTemplates: WorkOrderTemplate[];
};

export type WorkOrderTemplate = {
  id: number;
  projectTemplateId: number | null;
  name: string;
  type: string;
  titleTemplate: string;
  descriptionTemplate: string | null;
  defaultPriority: string;
  sortOrder: number;
  status: string;
};

export type Project = {
  id: number;
  projectNo: string;
  name: string;
  location: string;
  eventDate: string;
  eventAt?: string | null;
  status: string;
  statusLabel?: string;
  templateId: number | null;
  sourceType: string;
  sourceTypeLabel?: string;
  managerId: number | null;
  members?: ProjectMember[];
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

export type SetupList = {
  id: number;
  projectId: number;
  title: string;
  projectNameSnapshot: string;
  locationSnapshot: string;
  eventDateSnapshot: string;
  moveInAtSnapshot: string | null;
  rehearsalAtSnapshot: string | null;
  moveOutAtSnapshot: string | null;
  remark: string | null;
  status: string;
  statusLabel?: string;
};

export type SetupListItem = {
  id: number;
  setupListId: number;
  parentId: number | null;
  sequenceNo: string | null;
  categoryName: string | null;
  itemName: string;
  specification: string | null;
  quantity: number;
  unit: string;
  remark: string | null;
  executeStatus: string;
  executeStatusLabel?: string;
  assigneeId: number | null;
  completedAt: string | null;
  sortOrder: number;
};

export type ImportResult = {
  totalCount: number;
  successCount: number;
  failCount: number;
  errors: string[];
};

export type DictionaryItem = {
  id: number;
  dictType: string;
  itemValue: string;
  itemLabel: string;
  sortOrder: number;
  status: string;
};
