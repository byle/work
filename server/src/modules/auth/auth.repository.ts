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

export type UserListItem = {
  id: number;
  username: string;
  realName: string;
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

function mapUserListItem(row: Record<string, unknown>): UserListItem {
  return {
    id: Number(row.id),
    username: String(row.username),
    realName: String(row.real_name),
    status: String(row.status),
    roles: Array.isArray(row.roles) ? row.roles.map(String) : []
  };
}

export async function listUsers(): Promise<UserListItem[]> {
  const result = await pool.query(
    `SELECT u.id, u.username, u.real_name, u.status,
            COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     WHERE u.is_deleted = FALSE
     GROUP BY u.id
     ORDER BY u.id ASC`
  );

  return result.rows.map((row) => mapUserListItem(row as Record<string, unknown>));
}

export async function createUser(input: { username: string; password: string; realName: string; roleCodes: string[] }) {
  const passwordHash = hashPassword(input.password);

  const userResult = await pool.query(
    `INSERT INTO users (username, password_hash, real_name, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING id`,
    [input.username, passwordHash, input.realName]
  );

  const userId = Number(userResult.rows[0].id);

  for (const roleCode of input.roleCodes) {
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, id FROM roles WHERE code = $2
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, roleCode]
    );
  }

  return findUserById(userId);
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

  const seedUsers = [
    { username: 'admin', realName: '系统管理员', password: 'admin123', roles: ['admin'] },
    { username: 'dispatcher', realName: '调度员', password: 'dispatcher123', roles: ['dispatcher'] },
    { username: 'site01', realName: '现场执行1', password: 'site123', roles: ['site'] }
  ];

  for (const item of seedUsers) {
    const passwordHash = hashPassword(item.password);

    await pool.query(
      `INSERT INTO users (username, password_hash, real_name, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (username) DO NOTHING`,
      [item.username, passwordHash, item.realName]
    );

    for (const roleCode of item.roles) {
      await pool.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT u.id, r.id
         FROM users u
         CROSS JOIN roles r
         WHERE u.username = $1 AND r.code = $2
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [item.username, roleCode]
      );
    }
  }
}
