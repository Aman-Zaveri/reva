const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres.lrdgewgbzllklbesbdck:ResumeManager@123@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query executed:', result.rows[0]);
    
    await client.end();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();