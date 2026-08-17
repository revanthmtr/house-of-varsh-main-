const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

let pool = null;
let sqliteDb = null;
let usePostgres = false;

if (process.env.DATABASE_URL) {
  usePostgres = true;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });

  // Auto-migrate schema additions for PostgreSQL
  pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ;
  `).catch(err => console.error('[DATABASE] PostgreSQL auto-migration notice:', err.message));

  console.log('[DATABASE] Initialized PostgreSQL connection pool.');
} else {
  console.log('[DATABASE] DATABASE_URL not set. Falling back to local SQLite database.');
  const sqlite3 = require('sqlite3').verbose();
  const DB_PATH = path.join(__dirname, '..', '..', 'chinni.db');
  sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err.message);
    } else {
      console.log('Connected to SQLite database at:', DB_PATH);
      sqliteDb.run('ALTER TABLE users ADD COLUMN reset_password_token TEXT', () => {});
      sqliteDb.run('ALTER TABLE users ADD COLUMN reset_password_expires TEXT', () => {});
    }
  });
}


/**
 * Transforms standard SQLite-style SQL statements into PostgreSQL-compliant queries:
 * 1. Replaces ? placeholders with $1, $2, $3...
 * 2. Replaces datetime('now') with NOW()
 * 3. Appends RETURNING id to INSERT queries if not already present
 */
function formatPostgresSql(sql, isInsert = false) {
  let paramIndex = 1;
  let formattedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  formattedSql = formattedSql.replace(/datetime\('now'\)/gi, 'NOW()');

  if (isInsert && !/RETURNING\s+/i.test(formattedSql)) {
    formattedSql += ' RETURNING id';
  }
  return formattedSql;
}

const queryAll = async (sql, params = []) => {
  if (usePostgres) {
    const formattedSql = formatPostgresSql(sql);
    const result = await pool.query(formattedSql, params);
    return result.rows || [];
  }

  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const queryGet = async (sql, params = []) => {
  if (usePostgres) {
    const formattedSql = formatPostgresSql(sql);
    const result = await pool.query(formattedSql, params);
    return result.rows[0] || null;
  }

  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
};

const queryRun = async (sql, params = []) => {
  if (usePostgres) {
    const isInsert = /^\s*INSERT\s+INTO/i.test(sql);
    const formattedSql = formatPostgresSql(sql, isInsert);
    const result = await pool.query(formattedSql, params);
    const lastID = result.rows && result.rows[0] ? result.rows[0].id : null;
    return { lastID, changes: result.rowCount };
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const withTransaction = async (callback) => {
  if (usePostgres) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const txQueryAll = async (sql, params = []) => {
        const formattedSql = formatPostgresSql(sql);
        const result = await client.query(formattedSql, params);
        return result.rows || [];
      };
      const txQueryGet = async (sql, params = []) => {
        const formattedSql = formatPostgresSql(sql);
        const result = await client.query(formattedSql, params);
        return result.rows[0] || null;
      };
      const txQueryRun = async (sql, params = []) => {
        const isInsert = /^\s*INSERT\s+INTO/i.test(sql);
        const formattedSql = formatPostgresSql(sql, isInsert);
        const result = await client.query(formattedSql, params);
        const lastID = result.rows && result.rows[0] ? result.rows[0].id : null;
        return { lastID, changes: result.rowCount };
      };

      const result = await callback({
        queryAll: txQueryAll,
        queryGet: txQueryGet,
        queryRun: txQueryRun,
      });

      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // SQLite fallback transaction
  try {
    await queryRun('BEGIN TRANSACTION');
    const result = await callback({ queryAll, queryGet, queryRun });
    await queryRun('COMMIT');
    return result;
  } catch (err) {
    try {
      await queryRun('ROLLBACK');
    } catch (_rbErr) {}
    throw err;
  }
};

module.exports = {
  pool,
  db: sqliteDb,
  queryAll,
  queryGet,
  queryRun,
  withTransaction,
};
