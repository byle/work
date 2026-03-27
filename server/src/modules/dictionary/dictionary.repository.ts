import { pool } from '../../db/pool';

export type DictionaryItem = {
  id: number;
  dictType: string;
  itemValue: string;
  itemLabel: string;
  sortOrder: number;
  status: string;
};

function mapItem(row: Record<string, unknown>): DictionaryItem {
  return {
    id: Number(row.id),
    dictType: String(row.dict_type),
    itemValue: String(row.item_value),
    itemLabel: String(row.item_label),
    sortOrder: Number(row.sort_order),
    status: String(row.status)
  };
}

export async function ensureDictionaryTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dictionary_items (
      id BIGSERIAL PRIMARY KEY,
      dict_type VARCHAR(50) NOT NULL,
      item_value VARCHAR(50) NOT NULL,
      item_label VARCHAR(100) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uk_dictionary_items UNIQUE (dict_type, item_value)
    )
  `);
}

export async function seedDictionaryItems() {
  const items = [
    ['project_status', 'draft', '草稿', 1],
    ['project_status', 'in_progress', '进行中', 2],
    ['project_status', 'completed', '已完成', 3],
    ['project_status', 'cancelled', '已取消', 4],
    ['work_order_type', 'setup', '现场搭建', 1],
    ['work_order_type', 'survey', '现场勘察', 2],
    ['work_order_type', 'warehouse', '设备备货', 3],
    ['work_order_type', 'teardown', '撤场回收', 4],
    ['work_order_priority', 'high', '高', 1],
    ['work_order_priority', 'medium', '中', 2],
    ['work_order_priority', 'low', '低', 3],
    ['work_order_status', 'pending_assign', '待分配', 1],
    ['work_order_status', 'in_progress', '执行中', 2],
    ['work_order_status', 'pending_review', '待审核', 3],
    ['work_order_status', 'approved', '已通过', 4],
    ['work_order_status', 'rejected', '已驳回', 5],
    ['setup_list_status', 'draft', '草稿', 1],
    ['setup_list_status', 'in_progress', '进行中', 2],
    ['setup_list_status', 'completed', '已完成', 3],
    ['setup_item_status', 'pending', '待执行', 1],
    ['setup_item_status', 'in_progress', '执行中', 2],
    ['setup_item_status', 'done', '已完成', 3]
  ] as const;

  for (const [dictType, itemValue, itemLabel, sortOrder] of items) {
    await pool.query(
      `INSERT INTO dictionary_items (dict_type, item_value, item_label, sort_order, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (dict_type, item_value) DO UPDATE
       SET item_label = EXCLUDED.item_label,
           sort_order = EXCLUDED.sort_order,
           status = 'active',
           updated_at = CURRENT_TIMESTAMP`,
      [dictType, itemValue, itemLabel, sortOrder]
    );
  }
}

export async function listDictionaryItems(dictType?: string) {
  const result = await pool.query(
    `SELECT id, dict_type, item_value, item_label, sort_order, status
     FROM dictionary_items
     WHERE ($1::text IS NULL OR dict_type = $1::text)
     ORDER BY dict_type ASC, sort_order ASC, id ASC`,
    [dictType || null]
  );

  return result.rows.map((row) => mapItem(row as Record<string, unknown>));
}

export async function upsertDictionaryItem(input: {
  dictType: string;
  itemValue: string;
  itemLabel: string;
  sortOrder?: number;
  status?: string;
}) {
  const result = await pool.query(
    `INSERT INTO dictionary_items (dict_type, item_value, item_label, sort_order, status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (dict_type, item_value) DO UPDATE
     SET item_label = EXCLUDED.item_label,
         sort_order = EXCLUDED.sort_order,
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP
     RETURNING id, dict_type, item_value, item_label, sort_order, status`,
    [input.dictType, input.itemValue, input.itemLabel, input.sortOrder ?? 0, input.status ?? 'active']
  );

  return mapItem(result.rows[0] as Record<string, unknown>);
}
