export type ProjectMember = {
  id: number;
  userId: number;
  roleInProject: string;
};

export type ProjectRecord = {
  id: number;
  projectNo: string;
  name: string;
  location: string;
  eventDate: string;
  eventAt: string | null;
  moveInAt: string | null;
  rehearsalAt: string | null;
  moveOutAt: string | null;
  status: string;
  statusLabel: string;
  templateId: number | null;
  sourceType: string;
  sourceTypeLabel: string;
  managerId: number | null;
  members?: ProjectMember[];
};

export type ProjectListItem = {
  id: number;
  projectNo: string;
  name: string;
  location: string;
  eventDate: string;
  eventAt: string | null;
  status: string;
  statusLabel: string;
  templateId: number | null;
  sourceType: string;
  sourceTypeLabel: string;
  managerId: number | null;
};

export type CreateProjectInput = {
  name: string;
  customerName?: string;
  location: string;
  eventDate?: string;
  eventAt?: string;
  moveInAt?: string;
  rehearsalAt?: string;
  moveOutAt?: string;
  managerId?: number;
  remark?: string;
  status?: string;
  templateId?: number;
  sourceType?: string;
  members?: Array<{ userId: number; roleInProject: string }>;
};
