import { pool } from '../../db/pool';
import { CreateProjectInput, ProjectListItem, ProjectRecord } from './project.types';

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
    status: String(row.status)
  };
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const result = await pool.query(
    `SELECT id, project_no, name, location, event_date, status
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
    status: String(row.status)
  }));
}

export async function getProjectById(id: number): Promise<ProjectRecord | null> {
  const result = await pool.query(
    `SELECT id, project_no, name, location, event_date, move_in_at, rehearsal_at, move_out_at, status
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
      remark
    ) VALUES (
      concat('PRJ-', to_char(CURRENT_DATE, 'YYYYMMDD'), '-', lpad(nextval('projects_id_seq')::text, 4, '0')),
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )
    RETURNING id, project_no, name, location, event_date, move_in_at, rehearsal_at, move_out_at, status`,
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
      input.remark ?? null
    ]
  );

  return mapProject(result.rows[0] as Record<string, unknown>);
}
