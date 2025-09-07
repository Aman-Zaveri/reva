const { PrismaClient } = require('@prisma/client');

async function testApiIntegration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testing API integration with database...');
    
    // Create a test personal info record
    const testPersonalInfo = await prisma.personalInfo.create({
      data: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test City, TC',
        summary: 'This is a test summary'
      }
    });
    console.log('✅ Successfully created test PersonalInfo record');
    
    // Create a test profile
    const testProfile = await prisma.profile.create({
      data: {
        name: 'Test Profile',
        template: 'classic',
        personalInfoId: testPersonalInfo.id,
        sectionOrder: ['skills', 'experiences', 'projects', 'education']
      }
    });
    console.log('✅ Successfully created test Profile record');
    
    // Test reading the data back
    const profiles = await prisma.profile.findMany({
      include: {
        personalInfo: true,
        experiences: {
          include: {
            experience: true
          }
        },
        projects: {
          include: {
            project: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        },
        education: {
          include: {
            education: true
          }
        }
      }
    });
    
    console.log('✅ Successfully read profile data back');
    console.log(`📊 Found ${profiles.length} profile(s)`);
    
    // Clean up test data
    await prisma.profile.delete({
      where: { id: testProfile.id }
    });
    
    await prisma.personalInfo.delete({
      where: { id: testPersonalInfo.id }
    });
    
    console.log('✅ Test data cleaned up successfully');
    console.log('\n🎉 API integration test passed! Your database operations are working correctly.');
    
  } catch (error) {
    console.error('❌ API integration test failed:');
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testApiIntegration();
