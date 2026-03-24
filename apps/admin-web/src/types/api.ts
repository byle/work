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

export type Project = {
  id: number;
  projectNo: string;
  name: string;
  location: string;
  eventDate: string;
  status: string;
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
};
