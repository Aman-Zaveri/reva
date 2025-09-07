const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query execution
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database query test successful!');
    console.log('📊 PostgreSQL version:', result[0].version);
    
    // Test table existence
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('✅ Tables found in database:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Test Prisma models
    console.log('\n🔄 Testing Prisma models...');
    
    // Test PersonalInfo model
    const personalInfoCount = await prisma.personalInfo.count();
    console.log(`✅ PersonalInfo table accessible (${personalInfoCount} records)`);
    
    // Test Profile model  
    const profileCount = await prisma.profile.count();
    console.log(`✅ Profile table accessible (${profileCount} records)`);
    
    // Test Experience model
    const experienceCount = await prisma.experience.count();
    console.log(`✅ Experience table accessible (${experienceCount} records)`);
    
    // Test Project model
    const projectCount = await prisma.project.count();
    console.log(`✅ Project table accessible (${projectCount} records)`);
    
    // Test Skill model
    const skillCount = await prisma.skill.count();
    console.log(`✅ Skill table accessible (${skillCount} records)`);
    
    // Test Education model
    const educationCount = await prisma.education.count();
    console.log(`✅ Education table accessible (${educationCount} records)`);
    
    console.log('\n🎉 All database tests passed! Your Supabase connection is working properly.');
    
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error('Error details:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 This usually means:');
      console.error('   - Check your DATABASE_URL in .env file');
      console.error('   - Verify your Supabase project is running');
      console.error('   - Check your internet connection');
    } else if (error.code === 'P3009') {
      console.error('\n💡 This might mean your migrations need to be applied');
      console.error('   - Run: npx prisma migrate deploy');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
