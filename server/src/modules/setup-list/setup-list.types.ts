export type SetupListRecord = {
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

export type SetupListItemRecord = {
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
  assigneeId: number | null;
  completedAt: string | null;
  sortOrder: number;
};

export type CreateSetupListInput = {
  projectId: number;
  title: string;
  projectNameSnapshot: string;
  locationSnapshot: string;
  eventDateSnapshot: string;
  moveInAtSnapshot?: string;
  rehearsalAtSnapshot?: string;
  moveOutAtSnapshot?: string;
  remark?: string;
  status?: string;
};

export type CreateSetupListItemInput = {
  setupListId: number;
  parentId?: number;
  sequenceNo?: string;
  categoryName?: string;
  itemName: string;
  specification?: string;
  quantity: number;
  unit: string;
  remark?: string;
  assigneeId?: number;
  sortOrder?: number;
};
