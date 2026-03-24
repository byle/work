export type ProjectRecord = {
  id: number;
  projectNo: string;
  name: string;
  location: string;
  eventDate: string;
  moveInAt: string | null;
  rehearsalAt: string | null;
  moveOutAt: string | null;
  status: string;
};

export type ProjectListItem = {
  id: number;
  projectNo: string;
  name: string;
  location: string;
  eventDate: string;
  status: string;
};

export type CreateProjectInput = {
  name: string;
  customerName?: string;
  location: string;
  eventDate: string;
  moveInAt?: string;
  rehearsalAt?: string;
  moveOutAt?: string;
  managerId?: number;
  remark?: string;
  status?: string;
};
