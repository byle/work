import { pool } from '../../db/pool';
import {
  CreateProjectTemplateInput,
  CreateWorkOrderTemplateInput,
  ProjectTemplateRecord,
  WorkOrderTemplateRecord
} from './template.types';

function mapProjectTemplate(row: Record<string, unknown>): Omit<ProjectTemplateRecord, 'workOrderTemplates'> {
  return {
    id: Number(row.id),
    name: String(row.name),
    category: row.category ? String(row.category) : null,
    description: row.description ? String(row.description) : null,
    version: Number(row.version),
    status: String(row.status)
  };
}

function mapWorkOrderTemplate(row: Record<string, unknown>): WorkOrderTemplateRecord {
  return {
    id: Number(row.id),
    projectTemplateId: row.project_template_id ? Number(row.project_template_id) : null,
    name: String(row.name),
    type: String(row.type),
    titleTemplate: String(row.title_template),
    descriptionTemplate: row.description_template ? String(row.description_template) : null,
    defaultPriority: String(row.default_priority),
    sortOrder: Number(row.sort_order),
    status: String(row.status)
  };
}

async function listWorkOrderTemplatesByProjectTemplateIds(ids: number[]) {
  if (ids.length === 0) {
    return [];
  }

  const result = await pool.query(
    `SELECT id, project_template_id, name, type, title_template, description_template, default_priority, sort_order, status
     FROM work_order_templates
     WHERE project_template_id = ANY($1::bigint[]) AND is_deleted = FALSE
     ORDER BY sort_order ASC, id ASC`,
    [ids]
  );

  return result.rows.map((row) => mapWorkOrderTemplate(row as Record<string, unknown>));
}

export async function listProjectTemplates(): Promise<ProjectTemplateRecord[]> {
  const result = await pool.query(
    `SELECT id, name, category, description, version, status
     FROM project_templates
     WHERE is_deleted = FALSE
     ORDER BY id DESC
     LIMIT 100`
  );

  const templates = result.rows.map((row) => mapProjectTemplate(row as Record<string, unknown>));
  const workOrderTemplates = await listWorkOrderTemplatesByProjectTemplateIds(templates.map((item) => item.id));

  return templates.map((template) => ({
    ...template,
    workOrderTemplates: workOrderTemplates.filter((item) => item.projectTemplateId === template.id)
  }));
}

export async function getProjectTemplateById(id: number): Promise<ProjectTemplateRecord | null> {
  const result = await pool.query(
    `SELECT id, name, category, description, version, status
     FROM project_templates
     WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const template = mapProjectTemplate(result.rows[0] as Record<string, unknown>);
  const workOrderTemplates = await listWorkOrderTemplatesByProjectTemplateIds([id]);

  return {
    ...template,
    workOrderTemplates
  };
}

async function createWorkOrderTemplate(projectTemplateId: number, input: CreateWorkOrderTemplateInput) {
  await pool.query(
    `INSERT INTO work_order_templates (
      project_template_id,
      name,
      type,
      title_template,
      description_template,
      default_priority,
      sort_order,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      projectTemplateId,
      input.name,
      input.type,
      input.titleTemplate,
      input.descriptionTemplate ?? null,
      input.defaultPriority ?? 'medium',
      input.sortOrder ?? 0,
      input.status ?? 'active'
    ]
  );
}

export async function createProjectTemplate(input: CreateProjectTemplateInput): Promise<ProjectTemplateRecord> {
  const result = await pool.query(
    `INSERT INTO project_templates (name, category, description, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, category, description, version, status`,
    [input.name, input.category ?? null, input.description ?? null, input.status ?? 'active']
  );

  const template = mapProjectTemplate(result.rows[0] as Record<string, unknown>);

  for (const item of input.workOrderTemplates ?? []) {
    await createWorkOrderTemplate(template.id, item);
  }

  return (await getProjectTemplateById(template.id)) as ProjectTemplateRecord;
}

export async function seedDefaultTemplates() {
  const existing = await pool.query(`SELECT id FROM project_templates WHERE name = $1 AND is_deleted = FALSE LIMIT 1`, ['标准舞台搭建']);

  if (existing.rowCount && existing.rowCount > 0) {
    return;
  }

  const template = await createProjectTemplate({
    name: '标准舞台搭建',
    category: '舞台租赁',
    description: '适用于常规活动的标准舞台搭建项目模板',
    workOrderTemplates: [
      {
        name: '现场勘察',
        type: 'survey',
        titleTemplate: '{{projectName}}-现场勘察',
        descriptionTemplate: '确认场地尺寸、电力、进出场条件',
        defaultPriority: 'high',
        sortOrder: 1
      },
      {
        name: '设备备货',
        type: 'warehouse',
        titleTemplate: '{{projectName}}-设备备货',
        descriptionTemplate: '根据清单完成舞台、灯光、音响备货',
        defaultPriority: 'medium',
        sortOrder: 2
      },
      {
        name: '现场搭建',
        type: 'setup',
        titleTemplate: '{{projectName}}-现场搭建',
        descriptionTemplate: '按清单完成现场搭建与调试',
        defaultPriority: 'high',
        sortOrder: 3
      },
      {
        name: '撤场回收',
        type: 'teardown',
        titleTemplate: '{{projectName}}-撤场回收',
        descriptionTemplate: '活动结束后完成设备撤场和回库',
        defaultPriority: 'medium',
        sortOrder: 4
      }
    ]
  });

  return template;
}
