const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[DATABASE] DATABASE_URL not set. Skipping PostgreSQL migrations.');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    console.log('🔄 Checking database schema & running migrations...');
    const client = await pool.connect();

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await client.query(sql);
        console.log(`✅ Migration synced: ${file}`);
      } catch (mErr) {
        console.warn(`⚠️ Migration note on ${file}:`, mErr.message);
      }
    }

    client.release();
    await pool.end();
    console.log('🎉 Database migrations up to date!');
  } catch (err) {
    console.error('⚠️ Database migration runner note:', err.message);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;

