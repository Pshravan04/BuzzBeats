const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:GauriBuzzBeats@db.mfbtxpxehwziyvdhlcyz.supabase.co:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    const sqlPath = path.join(__dirname, 'src', 'lib', 'supabase', 'schema.sql');
    console.log(`Reading SQL from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL...');
    await client.query(sql);
    console.log('SQL execution completed successfully.');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
