import 'dotenv/config';
import pg from 'pg';

async function test() {
  const connectionString = process.env.DIRECT_URL;
  console.log('Testing connection to:', connectionString?.replace(/:[^:]+@/, ':****@'));
  
  const pool = new pg.Pool({ connectionString });
  
  try {
    const client = await pool.connect();
    console.log('Connected successfully!');
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in public schema:', res.rows.map(r => r.table_name));
    client.release();
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await pool.end();
  }
}

test();
