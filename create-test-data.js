// Test script to create a job and then create a profile linked to it
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestJobAndProfile() {
  try {
    console.log('Creating test job and profile...');
    
    // First, get the user ID (assuming there's at least one user)
    const users = await prisma.$queryRaw`SELECT id FROM users LIMIT 1`;
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user account first.');
      return;
    }
    
    const userId = users[0].id;
    console.log('✅ Found user ID:', userId);
    
    // Create a test job
    const jobId = `test-job-${Date.now()}`;
    await prisma.$executeRaw`
      INSERT INTO jobs (
        id, "userId", title, company, description, requirements, 
        responsibilities, skills, url, source, "extractedAt", "createdAt", "updatedAt"
      ) VALUES (
        ${jobId}, ${userId}, 'Test Software Engineer', 'Test Company Inc', 
        'We are looking for a talented software engineer to join our team. You will work with React, TypeScript, and Node.js to build amazing applications.',
        'Bachelor''s degree in Computer Science, 3+ years React experience, Strong TypeScript skills',
        'Develop front-end applications, Collaborate with design team, Write clean code, Participate in code reviews',
        'React, TypeScript, Node.js, JavaScript, HTML, CSS, Git, REST APIs',
        'https://example.com/job-posting', 'extension', 
        NOW(), NOW(), NOW()
      )
    `;
    
    console.log('✅ Created test job with ID:', jobId);
    
    // Create a test profile linked to this job
    const profileId = `test-profile-${Date.now()}`;
    await prisma.$executeRaw`
      INSERT INTO profiles (
        id, "userId", "profileName", "jobId", "createdAt", "updatedAt"
      ) VALUES (
        ${profileId}, ${userId}, 'Test Profile for Test Job', ${jobId}, NOW(), NOW()
      )
    `;
    
    console.log('✅ Created test profile with ID:', profileId);
    console.log('✅ Profile linked to job ID:', jobId);
    
    // Verify the relationship
    const linkedProfile = await prisma.$queryRaw`
      SELECT p.id, p."profileName", p."jobId", j.title, j.company 
      FROM profiles p 
      JOIN jobs j ON p."jobId" = j.id 
      WHERE p.id = ${profileId}
    `;
    
    if (linkedProfile.length > 0) {
      console.log('✅ Successfully linked profile to job:');
      console.log('  Profile:', linkedProfile[0].profileName);
      console.log('  Job:', linkedProfile[0].title, 'at', linkedProfile[0].company);
    }
    
    console.log('\n🎉 Test data created! You can now test the JobInfoModal with this profile.');
    console.log('   Profile ID to look for:', profileId);
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestJobAndProfile();