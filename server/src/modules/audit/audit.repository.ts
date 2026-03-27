import { pool } from '../../db/pool';

export type AuditLogRecord = {
  id: number;
  bizType: string;
  bizId: number;
  action: string;
  operatorId: number | null;
  remark: string | null;
  createdAt: string;
};

function mapAuditLog(row: Record<string, unknown>): AuditLogRecord {
  return {
    id: Number(row.id),
    bizType: String(row.biz_type),
    bizId: Number(row.biz_id),
    action: String(row.action),
    operatorId: row.operator_id ? Number(row.operator_id) : null,
    remark: row.remark ? String(row.remark) : null,
    createdAt: String(row.created_at)
  };
}

export async function ensureAuditLogTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGSERIAL PRIMARY KEY,
      biz_type VARCHAR(30) NOT NULL,
      biz_id BIGINT NOT NULL,
      action VARCHAR(50) NOT NULL,
      operator_id BIGINT,
      remark TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function createAuditLog(input: {
  bizType: string;
  bizId: number;
  action: string;
  operatorId?: number | null;
  remark?: string | null;
}) {
  const result = await pool.query(
    `INSERT INTO audit_logs (biz_type, biz_id, action, operator_id, remark)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, biz_type, biz_id, action, operator_id, remark, created_at`,
    [input.bizType, input.bizId, input.action, input.operatorId ?? null, input.remark ?? null]
  );

  return mapAuditLog(result.rows[0] as Record<string, unknown>);
}

export async function listAuditLogs(bizType: string, bizId: number) {
  const result = await pool.query(
    `SELECT id, biz_type, biz_id, action, operator_id, remark, created_at
     FROM audit_logs
     WHERE biz_type = $1 AND biz_id = $2
     ORDER BY id DESC`,
    [bizType, bizId]
  );

  return result.rows.map((row) => mapAuditLog(row as Record<string, unknown>));
}
