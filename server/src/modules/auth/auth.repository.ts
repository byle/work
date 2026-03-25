import crypto from 'crypto';
import { pool } from '../../db/pool';

export type UserRecord = {
  id: number;
  username: string;
  realName: string;
  passwordHash: string;
  status: string;
  roles: string[];
};

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: Number(row.id),
    username: String(row.username),
    realName: String(row.real_name),
    passwordHash: String(row.password_hash),
    status: String(row.status),
    roles: Array.isArray(row.roles) ? row.roles.map(String) : []
  };
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const result = await pool.query(
    `SELECT u.id, u.username, u.real_name, u.password_hash, u.status,
            COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE u.username = $1 AND u.is_deleted = FALSE
     GROUP BY u.id`,
    [username]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapUser(result.rows[0] as Record<string, unknown>);
}

export async function findUserById(id: number): Promise<Omit<UserRecord, 'passwordHash'> | null> {
  const result = await pool.query(
    `SELECT u.id, u.username, u.real_name, u.status,
            COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE u.id = $1 AND u.is_deleted = FALSE
     GROUP BY u.id`,
    [id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0] as Record<string, unknown>;

  return {
    id: Number(row.id),
    username: String(row.username),
    realName: String(row.real_name),
    status: String(row.status),
    roles: Array.isArray(row.roles) ? row.roles.map(String) : []
  };
}

export async function validateUserPassword(username: string, password: string) {
  const user = await findUserByUsername(username);

  if (!user || user.status !== 'active') {
    return null;
  }

  if (user.passwordHash !== hashPassword(password)) {
    return null;
  }

  await pool.query(`UPDATE users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [user.id]);

  return {
    id: user.id,
    username: user.username,
    realName: user.realName,
    roles: user.roles
  };
}

export async function seedDefaultAdmin() {
  await pool.query(
    `INSERT INTO roles (code, name, description)
     VALUES ('admin', '管理员', '系统管理员'), ('dispatcher', '调度', '工单调度'), ('site', '现场', '现场执行')
     ON CONFLICT (code) DO NOTHING`
  );

  const adminPasswordHash = hashPassword('admin123');

  await pool.query(
    `INSERT INTO users (username, password_hash, real_name, status)
     VALUES ('admin', $1, '系统管理员', 'active')
     ON CONFLICT (username) DO NOTHING`,
    [adminPasswordHash]
  );

  await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT u.id, r.id
     FROM users u
     CROSS JOIN roles r
     WHERE u.username = 'admin' AND r.code = 'admin'
     ON CONFLICT (user_id, role_id) DO NOTHING`
  );
}
