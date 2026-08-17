const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined in environment variables.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL.');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`\n⏳ Running migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`✅ Completed: ${file}`);
    }

    client.release();
    await pool.end();
    console.log('\n🎉 All database migrations executed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
