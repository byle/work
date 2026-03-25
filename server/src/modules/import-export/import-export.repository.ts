import { pool } from '../../db/pool';
import { createSetupListItem, listSetupListItems } from '../setup-list/setup-list.repository';

export type ImportRowInput = {
  sequenceNo?: string;
  categoryName?: string;
  itemName: string;
  specification?: string;
  quantity: number;
  unit: string;
  remark?: string;
  sortOrder?: number;
};

export async function exportSetupListItemsCsv(setupListId: number) {
  const items = await listSetupListItems(setupListId);
  const headers = ['sequenceNo', 'categoryName', 'itemName', 'specification', 'quantity', 'unit', 'remark', 'sortOrder'];

  const escapeCell = (value: string | number | null) => {
    const raw = value === null ? '' : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
  };

  const rows = items.map((item) =>
    [item.sequenceNo, item.categoryName, item.itemName, item.specification, item.quantity, item.unit, item.remark, item.sortOrder]
      .map(escapeCell)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export async function importSetupListItems(setupListId: number, rows: ImportRowInput[]) {
  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    try {
      if (!row.itemName || !row.unit || !row.quantity) {
        throw new Error('itemName, quantity, unit are required');
      }

      await createSetupListItem({
        setupListId,
        sequenceNo: row.sequenceNo,
        categoryName: row.categoryName,
        itemName: row.itemName,
        specification: row.specification,
        quantity: row.quantity,
        unit: row.unit,
        remark: row.remark,
        sortOrder: row.sortOrder ?? index + 1
      });

      successCount += 1;
    } catch (error) {
      failCount += 1;
      errors.push(`row ${index + 1}: ${(error as Error).message}`);
    }
  }

  await pool.query(
    `INSERT INTO import_tasks (biz_type, biz_id, file_name, file_url, status, total_count, success_count, fail_count, error_message)
     VALUES ('setup_list_items', $1, 'inline-json', 'inline-json', $2, $3, $4, $5, $6)`,
    [setupListId, failCount > 0 ? 'partial_success' : 'success', rows.length, successCount, failCount, errors.join('\n') || null]
  );

  return {
    totalCount: rows.length,
    successCount,
    failCount,
    errors
  };
}
