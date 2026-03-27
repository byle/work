import { getDictionaryLabelMap } from '../dictionary/dictionary.repository';
import { pool } from '../../db/pool';
import {
  CreateSetupListInput,
  CreateSetupListItemInput,
  SetupListItemRecord,
  SetupListRecord
} from './setup-list.types';

function mapSetupList(row: Record<string, unknown>, labels: { status: Record<string, string> }): SetupListRecord {
  const status = String(row.status);

  return {
    id: Number(row.id),
    projectId: Number(row.project_id),
    title: String(row.title),
    projectNameSnapshot: String(row.project_name_snapshot),
    locationSnapshot: String(row.location_snapshot),
    eventDateSnapshot: String(row.event_date_snapshot),
    moveInAtSnapshot: row.move_in_at_snapshot ? String(row.move_in_at_snapshot) : null,
    rehearsalAtSnapshot: row.rehearsal_at_snapshot ? String(row.rehearsal_at_snapshot) : null,
    moveOutAtSnapshot: row.move_out_at_snapshot ? String(row.move_out_at_snapshot) : null,
    remark: row.remark ? String(row.remark) : null,
    status,
    statusLabel: labels.status[status] || status
  };
}

function mapSetupListItem(row: Record<string, unknown>, labels: { executeStatus: Record<string, string> }): SetupListItemRecord {
  const executeStatus = String(row.execute_status);

  return {
    id: Number(row.id),
    setupListId: Number(row.setup_list_id),
    parentId: row.parent_id ? Number(row.parent_id) : null,
    sequenceNo: row.sequence_no ? String(row.sequence_no) : null,
    categoryName: row.category_name ? String(row.category_name) : null,
    itemName: String(row.item_name),
    specification: row.specification ? String(row.specification) : null,
    quantity: Number(row.quantity),
    unit: String(row.unit),
    remark: row.remark ? String(row.remark) : null,
    executeStatus,
    executeStatusLabel: labels.executeStatus[executeStatus] || executeStatus,
    assigneeId: row.assignee_id ? Number(row.assignee_id) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    sortOrder: Number(row.sort_order)
  };
}

async function getSetupListLabels() {
  return {
    status: await getDictionaryLabelMap('setup_list_status'),
    executeStatus: await getDictionaryLabelMap('setup_item_status')
  };
}

export async function listSetupLists(): Promise<SetupListRecord[]> {
  const [result, labels] = await Promise.all([pool.query(
    `SELECT id, project_id, title, project_name_snapshot, location_snapshot, event_date_snapshot,
            move_in_at_snapshot, rehearsal_at_snapshot, move_out_at_snapshot, remark, status
     FROM setup_lists
     WHERE is_deleted = FALSE
     ORDER BY id DESC
     LIMIT 100`
  ), getSetupListLabels()]);

  return result.rows.map((row) => mapSetupList(row as Record<string, unknown>, labels));
}

export async function getSetupListById(id: number): Promise<SetupListRecord | null> {
  const [result, labels] = await Promise.all([pool.query(
    `SELECT id, project_id, title, project_name_snapshot, location_snapshot, event_date_snapshot,
            move_in_at_snapshot, rehearsal_at_snapshot, move_out_at_snapshot, remark, status
     FROM setup_lists
     WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  ), getSetupListLabels()]);

  if (result.rowCount === 0) {
    return null;
  }

  return mapSetupList(result.rows[0] as Record<string, unknown>, labels);
}

export async function listSetupListItems(setupListId: number): Promise<SetupListItemRecord[]> {
  const [result, labels] = await Promise.all([pool.query(
    `SELECT id, setup_list_id, parent_id, sequence_no, category_name, item_name, specification,
            quantity, unit, remark, execute_status, assignee_id, completed_at, sort_order
     FROM setup_list_items
     WHERE setup_list_id = $1 AND is_deleted = FALSE
     ORDER BY sort_order ASC, id ASC`,
    [setupListId]
  ), getSetupListLabels()]);

  return result.rows.map((row) => mapSetupListItem(row as Record<string, unknown>, labels));
}

export async function createSetupList(input: CreateSetupListInput): Promise<SetupListRecord> {
  const result = await pool.query(
    `INSERT INTO setup_lists (
      project_id,
      title,
      project_name_snapshot,
      location_snapshot,
      event_date_snapshot,
      move_in_at_snapshot,
      rehearsal_at_snapshot,
      move_out_at_snapshot,
      remark,
      status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )
    RETURNING id, project_id, title, project_name_snapshot, location_snapshot, event_date_snapshot,
              move_in_at_snapshot, rehearsal_at_snapshot, move_out_at_snapshot, remark, status`,
    [
      input.projectId,
      input.title,
      input.projectNameSnapshot,
      input.locationSnapshot,
      input.eventDateSnapshot,
      input.moveInAtSnapshot ?? null,
      input.rehearsalAtSnapshot ?? null,
      input.moveOutAtSnapshot ?? null,
      input.remark ?? null,
      input.status ?? 'draft'
    ]
  );

  const labels = await getSetupListLabels();
  return mapSetupList(result.rows[0] as Record<string, unknown>, labels);
}

export async function createSetupListItem(input: CreateSetupListItemInput): Promise<SetupListItemRecord> {
  const result = await pool.query(
    `INSERT INTO setup_list_items (
      setup_list_id,
      parent_id,
      sequence_no,
      category_name,
      item_name,
      specification,
      quantity,
      unit,
      remark,
      execute_status,
      assignee_id,
      sort_order
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11
    )
    RETURNING id, setup_list_id, parent_id, sequence_no, category_name, item_name, specification,
              quantity, unit, remark, execute_status, assignee_id, completed_at, sort_order`,
    [
      input.setupListId,
      input.parentId ?? null,
      input.sequenceNo ?? null,
      input.categoryName ?? null,
      input.itemName,
      input.specification ?? null,
      input.quantity,
      input.unit,
      input.remark ?? null,
      input.assigneeId ?? null,
      input.sortOrder ?? 0
    ]
  );

  const labels = await getSetupListLabels();
  return mapSetupListItem(result.rows[0] as Record<string, unknown>, labels);
}

export async function updateSetupListItem(
  id: number,
  input: Omit<CreateSetupListItemInput, 'setupListId'>
): Promise<SetupListItemRecord | null> {
  const result = await pool.query(
    `UPDATE setup_list_items
     SET parent_id = $2,
         sequence_no = $3,
         category_name = $4,
         item_name = $5,
         specification = $6,
         quantity = $7,
         unit = $8,
         remark = $9,
         assignee_id = $10,
         sort_order = $11,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_deleted = FALSE
     RETURNING id, setup_list_id, parent_id, sequence_no, category_name, item_name, specification,
               quantity, unit, remark, execute_status, assignee_id, completed_at, sort_order`,
    [
      id,
      input.parentId ?? null,
      input.sequenceNo ?? null,
      input.categoryName ?? null,
      input.itemName,
      input.specification ?? null,
      input.quantity,
      input.unit,
      input.remark ?? null,
      input.assigneeId ?? null,
      input.sortOrder ?? 0
    ]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const labels = await getSetupListLabels();
  return mapSetupListItem(result.rows[0] as Record<string, unknown>, labels);
}

export async function deleteSetupListItem(id: number): Promise<boolean> {
  const result = await pool.query(
    `UPDATE setup_list_items
     SET is_deleted = TRUE,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );

  return (result.rowCount ?? 0) > 0;
}
