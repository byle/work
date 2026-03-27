import fs from 'fs/promises';
import path from 'path';
import { pool } from '../../db/pool';

export type AttachmentRecord = {
  id: number;
  bizType: string;
  bizId: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedBy: number | null;
  createdAt: string;
};

function mapAttachment(row: Record<string, unknown>): AttachmentRecord {
  return {
    id: Number(row.id),
    bizType: String(row.biz_type),
    bizId: Number(row.biz_id),
    fileName: String(row.file_name),
    fileUrl: String(row.file_url),
    fileType: row.file_type ? String(row.file_type) : null,
    fileSize: row.file_size ? Number(row.file_size) : null,
    uploadedBy: row.uploaded_by ? Number(row.uploaded_by) : null,
    createdAt: String(row.created_at)
  };
}

export async function listAttachments(bizType: string, bizId: number) {
  const result = await pool.query(
    `SELECT id, biz_type, biz_id, file_name, file_url, file_type, file_size, uploaded_by, created_at
     FROM attachments
     WHERE biz_type = $1 AND biz_id = $2
     ORDER BY id DESC`,
    [bizType, bizId]
  );

  return result.rows.map((row) => mapAttachment(row as Record<string, unknown>));
}

export async function createAttachment(input: {
  bizType: string;
  bizId: number;
  fileName: string;
  fileType?: string;
  contentBase64: string;
  uploadedBy?: number;
}) {
  const uploadsDir = path.resolve(process.cwd(), 'uploads', input.bizType, String(input.bizId));
  await fs.mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(input.contentBase64, 'base64');
  const safeName = `${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const targetPath = path.join(uploadsDir, safeName);
  await fs.writeFile(targetPath, buffer);

  const fileUrl = `/uploads/${input.bizType}/${input.bizId}/${safeName}`;

  const result = await pool.query(
    `INSERT INTO attachments (biz_type, biz_id, file_name, file_url, file_type, file_size, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, biz_type, biz_id, file_name, file_url, file_type, file_size, uploaded_by, created_at`,
    [input.bizType, input.bizId, input.fileName, fileUrl, input.fileType ?? null, buffer.length, input.uploadedBy ?? null]
  );

  return mapAttachment(result.rows[0] as Record<string, unknown>);
}
