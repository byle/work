import { createAuditLog } from '../audit/audit.repository';
import { getDictionaryLabelMap } from '../dictionary/dictionary.repository';
import { pool } from '../../db/pool';
import { CreateWorkOrderInput, UpdateWorkOrderStatusInput, WorkOrderListItem, WorkOrderRecord } from './work-order.types';



function mapWorkOrder(row: Record<string, unknown>, labels: { type: Record<string, string>; priority: Record<string, string>; status: Record<string, string> }): WorkOrderRecord {
  const type = String(row.type);
  const priority = String(row.priority);
  const status = String(row.status);

  return {
    id: Number(row.id),
    workOrderNo: String(row.work_order_no),
    projectId: Number(row.project_id),
    title: String(row.title),
    type,
    typeLabel: labels.type[type] || type,
    priority,
    priorityLabel: labels.priority[priority] || priority,
    status,
    statusLabel: labels.status[status] || status,
    assigneeId: row.assignee_id ? Number(row.assignee_id) : null,
    reviewerId: row.reviewer_id ? Number(row.reviewer_id) : null,
    plannedStartAt: row.planned_start_at ? String(row.planned_start_at) : null,
    plannedEndAt: row.planned_end_at ? String(row.planned_end_at) : null,
    actualStartAt: row.actual_start_at ? String(row.actual_start_at) : null,
    actualEndAt: row.actual_end_at ? String(row.actual_end_at) : null,
    description: row.description ? String(row.description) : null
  };
}

function mapWorkOrderListItem(row: Record<string, unknown>, labels: { type: Record<string, string>; priority: Record<string, string>; status: Record<string, string> }): WorkOrderListItem {
  const type = String(row.type);
  const priority = String(row.priority);
  const status = String(row.status);

  return {
    id: Number(row.id),
    workOrderNo: String(row.work_order_no),
    projectId: Number(row.project_id),
    title: String(row.title),
    type,
    typeLabel: labels.type[type] || type,
    priority,
    priorityLabel: labels.priority[priority] || priority,
    status,
    statusLabel: labels.status[status] || status,
    assigneeId: row.assignee_id ? Number(row.assignee_id) : null,
    reviewerId: row.reviewer_id ? Number(row.reviewer_id) : null
  };
}

async function getWorkOrderLabels() {
  return {
    type: await getDictionaryLabelMap('work_order_type'),
    priority: await getDictionaryLabelMap('work_order_priority'),
    status: await getDictionaryLabelMap('work_order_status')
  };
}

export async function listWorkOrders(keyword?: string, status?: string): Promise<WorkOrderListItem[]> {
  const [result, labels] = await Promise.all([pool.query(
    `SELECT id, work_order_no, project_id, title, type, priority, status, assignee_id, reviewer_id
     FROM work_orders
     WHERE is_deleted = FALSE
       AND ($1::text IS NULL OR title ILIKE concat('%', $1::text, '%') OR work_order_no ILIKE concat('%', $1::text, '%'))
       AND ($2::text IS NULL OR status = $2::text)
     ORDER BY id DESC
     LIMIT 100`,
    [keyword || null, status || null]
  ), getWorkOrderLabels()]);

  return result.rows.map((row) => mapWorkOrderListItem(row as Record<string, unknown>, labels));
}

export async function listMyWorkOrders(userId: number): Promise<WorkOrderListItem[]> {
  const [result, labels] = await Promise.all([pool.query(
    `SELECT id, work_order_no, project_id, title, type, priority, status, assignee_id, reviewer_id
     FROM work_orders
     WHERE is_deleted = FALSE AND (assignee_id = $1 OR reviewer_id = $1 OR assignee_id IS NULL)
     ORDER BY id DESC
     LIMIT 100`,
    [userId]
  ), getWorkOrderLabels()]);

  return result.rows.map((row) => mapWorkOrderListItem(row as Record<string, unknown>, labels));
}

export async function getWorkOrderById(id: number): Promise<WorkOrderRecord | null> {
  const [result, labels] = await Promise.all([pool.query(
    `SELECT id, work_order_no, project_id, title, type, priority, status, assignee_id, reviewer_id,
            planned_start_at, planned_end_at, actual_start_at, actual_end_at, description
     FROM work_orders
     WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  ), getWorkOrderLabels()]);

  if (result.rowCount === 0) {
    return null;
  }

  return mapWorkOrder(result.rows[0] as Record<string, unknown>, labels);
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
      reviewer_id,
      planned_start_at,
      planned_end_at,
      description
    ) VALUES (
      concat('WO-', to_char(CURRENT_DATE, 'YYYYMMDD'), '-', lpad(nextval('work_orders_id_seq')::text, 4, '0')),
      $1, $2, $3, $4, 'pending_assign', $5, $6, $7, $8, $9
    )
    RETURNING id, work_order_no, project_id, title, type, priority, status, assignee_id, reviewer_id,
              planned_start_at, planned_end_at, actual_start_at, actual_end_at, description`,
    [
      input.projectId,
      input.title,
      input.type,
      input.priority ?? 'medium',
      input.assigneeId ?? null,
      input.reviewerId ?? null,
      input.plannedStartAt ?? null,
      input.plannedEndAt ?? null,
      input.description ?? null
    ]
  );

  const labels = await getWorkOrderLabels();
  const workOrder = mapWorkOrder(result.rows[0] as Record<string, unknown>, labels);
  await createAuditLog({ bizType: 'work_order', bizId: workOrder.id, action: 'create', remark: input.description ?? null });
  return workOrder;
}

export async function assignWorkOrder(id: number, assigneeId: number | null, reviewerId?: number | null): Promise<WorkOrderRecord | null> {
  const result = await pool.query(
    `UPDATE work_orders
     SET assignee_id = $2::bigint,
         reviewer_id = COALESCE($3::bigint, reviewer_id),
         status = CASE WHEN $2::bigint IS NULL THEN 'pending_assign' ELSE status END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_deleted = FALSE
     RETURNING id, work_order_no, project_id, title, type, priority, status, assignee_id, reviewer_id,
               planned_start_at, planned_end_at, actual_start_at, actual_end_at, description`,
    [id, assigneeId, reviewerId ?? null]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const labels = await getWorkOrderLabels();
  const workOrder = mapWorkOrder(result.rows[0] as Record<string, unknown>, labels);
  await createAuditLog({ bizType: 'work_order', bizId: id, action: 'assign', remark: `assignee=${assigneeId ?? 'null'}, reviewer=${reviewerId ?? 'keep'}` });
  return workOrder;
}

export async function updateWorkOrderStatus(id: number, input: UpdateWorkOrderStatusInput & { remark?: string }, userId: number): Promise<WorkOrderRecord | null> {
  const transitions: Record<string, string[]> = {
    pending_assign: ['in_progress'],
    in_progress: ['pending_review'],
    pending_review: ['approved', 'rejected'],
    rejected: ['in_progress'],
    approved: []
  };

  const current = await getWorkOrderById(id);

  if (!current) {
    return null;
  }

  if (!transitions[current.status]?.includes(input.status)) {
    throw new Error(`invalid status transition: ${current.status} -> ${input.status}`);
  }

  const actualStart = input.status === 'in_progress' && !current.actualStartAt ? 'CURRENT_TIMESTAMP' : 'actual_start_at';
  const actualEnd = input.status === 'approved' ? 'CURRENT_TIMESTAMP' : 'actual_end_at';

  const result = await pool.query(
    `UPDATE work_orders
     SET status = $2::text,
         assignee_id = COALESCE(assignee_id, $3),
         description = CASE WHEN $4::text IS NULL OR $4::text = '' THEN description ELSE concat(COALESCE(description, ''), CASE WHEN COALESCE(description, '') = '' THEN '' ELSE '\n' END, '[', $2::text, '] ', $4::text) END,
         actual_start_at = ${actualStart},
         actual_end_at = ${actualEnd},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_deleted = FALSE
     RETURNING id, work_order_no, project_id, title, type, priority, status, assignee_id, reviewer_id,
               planned_start_at, planned_end_at, actual_start_at, actual_end_at, description`,
    [id, input.status, userId, input.remark ?? null]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const labels = await getWorkOrderLabels();
  const workOrder = mapWorkOrder(result.rows[0] as Record<string, unknown>, labels);
  await createAuditLog({ bizType: 'work_order', bizId: id, action: `status:${input.status}`, operatorId: userId, remark: input.remark ?? null });
  return workOrder;
}
