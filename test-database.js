// Test database connection and jobs table
// Run this as a Node.js script to test database connectivity

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if jobs table exists
    console.log('Checking jobs table structure...');
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      ORDER BY ordinal_position;
    `;
    
    console.log('Jobs table structure:', result);
    
    // Test inserting a job
    console.log('Testing job insertion...');
    const testUserId = 'test-user-id'; // Replace with a real user ID from your database
    
    const insertResult = await prisma.$executeRaw`
      INSERT INTO jobs (
        id, "userId", title, company, description, requirements, 
        responsibilities, skills, url, source, "extractedAt", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${testUserId}, 'Test Job', 'Test Company', 
        'Test description', NULL, NULL, NULL, NULL, 'extension', 
        NOW(), NOW(), NOW()
      )
    `;
    
    console.log('✅ Job insertion result:', insertResult);
    
    // Fetch the created job
    const jobs = await prisma.$queryRaw`
      SELECT * FROM jobs WHERE "userId" = ${testUserId} ORDER BY "createdAt" DESC LIMIT 1
    `;
    
    console.log('✅ Created job:', jobs);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();