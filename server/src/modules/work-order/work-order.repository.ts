import { pool } from '../../db/pool';
import { CreateWorkOrderInput, UpdateWorkOrderStatusInput, WorkOrderListItem, WorkOrderRecord } from './work-order.types';

function mapWorkOrder(row: Record<string, unknown>): WorkOrderRecord {
  return {
    id: Number(row.id),
    workOrderNo: String(row.work_order_no),
    projectId: Number(row.project_id),
    title: String(row.title),
    type: String(row.type),
    priority: String(row.priority),
    status: String(row.status),
    assigneeId: row.assignee_id ? Number(row.assignee_id) : null,
    plannedStartAt: row.planned_start_at ? String(row.planned_start_at) : null,
    plannedEndAt: row.planned_end_at ? String(row.planned_end_at) : null,
    actualStartAt: row.actual_start_at ? String(row.actual_start_at) : null,
    actualEndAt: row.actual_end_at ? String(row.actual_end_at) : null,
    description: row.description ? String(row.description) : null
  };
}

function mapWorkOrderListItem(row: Record<string, unknown>): WorkOrderListItem {
  return {
    id: Number(row.id),
    workOrderNo: String(row.work_order_no),
    projectId: Number(row.project_id),
    title: String(row.title),
    type: String(row.type),
    priority: String(row.priority),
    status: String(row.status),
    assigneeId: row.assignee_id ? Number(row.assignee_id) : null
  };
}

export async function listWorkOrders(): Promise<WorkOrderListItem[]> {
  const result = await pool.query(
    `SELECT id, work_order_no, project_id, title, type, priority, status, assignee_id
     FROM work_orders
     WHERE is_deleted = FALSE
     ORDER BY id DESC
     LIMIT 100`
  );

  return result.rows.map((row) => mapWorkOrderListItem(row as Record<string, unknown>));
}

export async function listMyWorkOrders(userId: number): Promise<WorkOrderListItem[]> {
  const result = await pool.query(
    `SELECT id, work_order_no, project_id, title, type, priority, status, assignee_id
     FROM work_orders
     WHERE is_deleted = FALSE AND (assignee_id = $1 OR assignee_id IS NULL)
     ORDER BY id DESC
     LIMIT 100`,
    [userId]
  );

  return result.rows.map((row) => mapWorkOrderListItem(row as Record<string, unknown>));
}

export async function getWorkOrderById(id: number): Promise<WorkOrderRecord | null> {
  const result = await pool.query(
    `SELECT id, work_order_no, project_id, title, type, priority, status, assignee_id,
            planned_start_at, planned_end_at, actual_start_at, actual_end_at, description
     FROM work_orders
     WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapWorkOrder(result.rows[0] as Record<string, unknown>);
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrderRecord> {
  const result = await pool.query(
    `INSERT INTO work_orders (
      work_order_no,
      project_id,
      title,
      type,
      priority,
      status,
      assignee_id,
      planned_start_at,
      planned_end_at,
      description
    ) VALUES (
      concat('WO-', to_char(CURRENT_DATE, 'YYYYMMDD'), '-', lpad(nextval('work_orders_id_seq')::text, 4, '0')),
      $1, $2, $3, $4, 'pending_assign', $5, $6, $7, $8
    )
    RETURNING id, work_order_no, project_id, title, type, priority, status, assignee_id,
              planned_start_at, planned_end_at, actual_start_at, actual_end_at, description`,
    [
      input.projectId,
      input.title,
      input.type,
      input.priority ?? 'medium',
      input.assigneeId ?? null,
      input.plannedStartAt ?? null,
      input.plannedEndAt ?? null,
      input.description ?? null
    ]
  );

  return mapWorkOrder(result.rows[0] as Record<string, unknown>);
}

export async function assignWorkOrder(id: number, assigneeId: number | null): Promise<WorkOrderRecord | null> {
  const result = await pool.query(
    `UPDATE work_orders
     SET assignee_id = $2::bigint,
         status = CASE WHEN $2::bigint IS NULL THEN 'pending_assign' ELSE status END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_deleted = FALSE
     RETURNING id, work_order_no, project_id, title, type, priority, status, assignee_id,
               planned_start_at, planned_end_at, actual_start_at, actual_end_at, description`,
    [id, assigneeId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapWorkOrder(result.rows[0] as Record<string, unknown>);
}

export async function updateWorkOrderStatus(id: number, input: UpdateWorkOrderStatusInput, userId: number): Promise<WorkOrderRecord | null> {
  const setActualStart = input.status === 'in_progress' ? 'CURRENT_TIMESTAMP' : 'actual_start_at';
  const setActualEnd = input.status === 'done' ? 'CURRENT_TIMESTAMP' : 'actual_end_at';

  const result = await pool.query(
    `UPDATE work_orders
     SET status = $2,
         assignee_id = COALESCE(assignee_id, $3),
         actual_start_at = ${setActualStart},
         actual_end_at = ${setActualEnd},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_deleted = FALSE
     RETURNING id, work_order_no, project_id, title, type, priority, status, assignee_id,
               planned_start_at, planned_end_at, actual_start_at, actual_end_at, description`,
    [id, input.status, userId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapWorkOrder(result.rows[0] as Record<string, unknown>);
}
