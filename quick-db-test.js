// Quick test to verify database connectivity
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickDBTest() {
  try {
    console.log('Testing database connection...');
    
    // Check if jobs table exists and is accessible
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM jobs`;
    console.log('✅ Jobs table accessible. Current job count:', result[0].count);
    
    // Check for any existing jobs
    const jobs = await prisma.$queryRaw`SELECT id, title, company, source, "createdAt" FROM jobs ORDER BY "createdAt" DESC LIMIT 3`;
    console.log('Recent jobs:', jobs);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickDBTest();