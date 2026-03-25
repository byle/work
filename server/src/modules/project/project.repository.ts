import { pool } from '../../db/pool';
import { CreateProjectInput, ProjectListItem, ProjectRecord } from './project.types';

type WorkOrderTemplateSeed = {
  id: number;
  type: string;
  titleTemplate: string;
  descriptionTemplate: string | null;
  defaultPriority: string;
};

function mapProject(row: Record<string, unknown>): ProjectRecord {
  return {
    id: Number(row.id),
    projectNo: String(row.project_no),
    name: String(row.name),
    location: String(row.location),
    eventDate: String(row.event_date),
    moveInAt: row.move_in_at ? String(row.move_in_at) : null,
    rehearsalAt: row.rehearsal_at ? String(row.rehearsal_at) : null,
    moveOutAt: row.move_out_at ? String(row.move_out_at) : null,
    status: String(row.status),
    templateId: row.template_id ? Number(row.template_id) : null,
    sourceType: String(row.source_type)
  };
}

function renderTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => values[key] ?? '');
}

async function listTemplateWorkOrders(templateId: number): Promise<WorkOrderTemplateSeed[]> {
  const result = await pool.query(
    `SELECT id, type, title_template, description_template, default_priority
     FROM work_order_templates
     WHERE project_template_id = $1 AND is_deleted = FALSE AND status = 'active'
     ORDER BY sort_order ASC, id ASC`,
    [templateId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    type: String(row.type),
    titleTemplate: String(row.title_template),
    descriptionTemplate: row.description_template ? String(row.description_template) : null,
    defaultPriority: String(row.default_priority)
  }));
}

async function createWorkOrdersFromTemplate(project: ProjectRecord) {
  if (!project.templateId) {
    return;
  }

  const templates = await listTemplateWorkOrders(project.templateId);

  for (const item of templates) {
    await pool.query(
      `INSERT INTO work_orders (
        work_order_no,
        project_id,
        title,
        type,
        priority,
        status,
        description,
        template_id
      ) VALUES (
        concat('WO-', to_char(CURRENT_DATE, 'YYYYMMDD'), '-', lpad(nextval('work_orders_id_seq')::text, 4, '0')),
        $1, $2, $3, $4, 'pending_assign', $5, $6
      )`,
      [
        project.id,
        renderTemplate(item.titleTemplate, {
          projectName: project.name,
          projectNo: project.projectNo,
          location: project.location,
          eventDate: project.eventDate
        }),
        item.type,
        item.defaultPriority,
        item.descriptionTemplate,
        item.id
      ]
    );
  }
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const result = await pool.query(
    `SELECT id, project_no, name, location, event_date, status, template_id, source_type
     FROM projects
     WHERE is_deleted = FALSE
     ORDER BY event_date DESC, id DESC
     LIMIT 100`
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    projectNo: String(row.project_no),
    name: String(row.name),
    location: String(row.location),
    eventDate: String(row.event_date),
    status: String(row.status),
    templateId: row.template_id ? Number(row.template_id) : null,
    sourceType: String(row.source_type)
  }));
}

export async function getProjectById(id: number): Promise<ProjectRecord | null> {
  const result = await pool.query(
    `SELECT id, project_no, name, location, event_date, move_in_at, rehearsal_at, move_out_at, status, template_id, source_type
     FROM projects
     WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapProject(result.rows[0] as Record<string, unknown>);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const result = await pool.query(
    `INSERT INTO projects (
      project_no,
      name,
      customer_name,
      location,
      event_date,
      move_in_at,
      rehearsal_at,
      move_out_at,
      manager_id,
      status,
      source_type,
      template_id,
      remark
    ) VALUES (
      concat('PRJ-', to_char(CURRENT_DATE, 'YYYYMMDD'), '-', lpad(nextval('projects_id_seq')::text, 4, '0')),
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    )
    RETURNING id, project_no, name, location, event_date, move_in_at, rehearsal_at, move_out_at, status, template_id, source_type`,
    [
      input.name,
      input.customerName ?? null,
      input.location,
      input.eventDate,
      input.moveInAt ?? null,
      input.rehearsalAt ?? null,
      input.moveOutAt ?? null,
      input.managerId ?? null,
      input.status ?? 'draft',
      input.sourceType ?? (input.templateId ? 'template' : 'manual'),
      input.templateId ?? null,
      input.remark ?? null
    ]
  );

  const project = mapProject(result.rows[0] as Record<string, unknown>);

  if (project.templateId) {
    await createWorkOrdersFromTemplate(project);
  }

  return project;
}
