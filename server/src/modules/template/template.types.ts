export type ProjectTemplateRecord = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  version: number;
  status: string;
  workOrderTemplates: WorkOrderTemplateRecord[];
};

export type WorkOrderTemplateRecord = {
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

export type CreateProjectTemplateInput = {
  name: string;
  category?: string;
  description?: string;
  status?: string;
  workOrderTemplates?: CreateWorkOrderTemplateInput[];
};

export type CreateWorkOrderTemplateInput = {
  name: string;
  type: string;
  titleTemplate: string;
  descriptionTemplate?: string;
  defaultPriority?: string;
  sortOrder?: number;
  status?: string;
};
