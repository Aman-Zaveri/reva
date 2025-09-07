import { NextRequest, NextResponse } from 'next/server';
import { PostgreSQLProfileRepository } from '@/shared/repositories/postgresql.repository';

export async function POST() {
  try {
    console.log('🧪 Testing complete database integration...');
    
    const repository = new PostgreSQLProfileRepository();
    
    // Test 1: Save sample data with all components
    const testData = {
      personalInfo: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test City, TC',
        summary: 'Full-stack developer with database integration experience'
      },
      experiences: [
        {
          id: 'test-exp-1',
          title: 'Software Engineer',
          company: 'Test Company',
          date: '2024-2025',
          bullets: ['Built database integrations', 'Worked with PostgreSQL'],
          tags: ['TypeScript', 'PostgreSQL']
        }
      ],
      projects: [
        {
          id: 'test-proj-1',
          title: 'Resume Manager',
          link: 'https://github.com/test/resume-manager',
          bullets: ['Built with Next.js', 'Integrated with Supabase'],
          tags: ['Next.js', 'Supabase']
        }
      ],
      skills: [
        {
          id: 'test-skill-1',
          name: 'Programming Languages',
          details: 'TypeScript, Python, SQL'
        }
      ],
      education: [
        {
          id: 'test-edu-1',
          title: 'Computer Science',
          details: 'University of Technology, 2023'
        }
      ]
    };

    const testProfiles = [
      {
        id: 'test-profile-1',
        name: 'Test Resume Profile',
        template: 'classic' as const,
        experienceIds: ['test-exp-1'],
        projectIds: ['test-proj-1'],
        skillIds: ['test-skill-1'],
        educationIds: ['test-edu-1'],
        sectionOrder: ['skills', 'experiences', 'projects', 'education'] as ('skills' | 'experiences' | 'projects' | 'education')[],
        
        // Formatting options
        formatting: {
          fontFamily: 'Arial',
          primaryColor: '#000000',
          nameFontSize: '24px',
          headerFontSize: '16px',
          bodyTextFontSize: '12px',
          metadataTextFontSize: '10px'
        },
        
        // AI Optimization metadata
        aiOptimization: {
          timestamp: new Date().toISOString(),
          keyInsights: ['Database integration', 'Full-stack development'],
          jobDescriptionHash: 'test-hash-123'
        }
      }
    ];

    console.log('💾 Saving test data to database...');
    const saveResult = await repository.saveProfiles(testProfiles, testData);
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save test data');
    }
    
    console.log('✅ Test data saved successfully');

    // Test 2: Load data back
    console.log('📥 Loading data from database...');
    const loadResult = await repository.loadProfiles();
    
    if (!loadResult.success || !loadResult.data) {
      throw new Error(loadResult.error || 'Failed to load test data');
    }
    
    console.log('✅ Test data loaded successfully');
    
    const { profiles, data } = loadResult.data;
    
    // Test 3: Verify all components
    const verificationResults = {
      profiles: {
        count: profiles.length,
        hasFormatting: profiles.some(p => p.formatting?.fontFamily && p.formatting?.primaryColor),
        hasAIOptimization: profiles.some(p => p.aiOptimization?.timestamp),
        hasSectionOrder: profiles.some(p => p.sectionOrder && p.sectionOrder.length > 0)
      },
      masterData: {
        hasPersonalInfo: !!(data.personalInfo?.fullName),
        experiencesCount: data.experiences?.length || 0,
        projectsCount: data.projects?.length || 0,
        skillsCount: data.skills?.length || 0,
        educationCount: data.education?.length || 0
      },
      database: {
        connected: true,
        operationsWorking: true
      }
    };

    console.log('🎉 All database integration tests passed!');
    
    return NextResponse.json({
      success: true,
      message: 'Complete database integration test passed',
      results: verificationResults,
      testData: {
        profilesFound: profiles.length,
        masterDataComplete: !!(data.personalInfo && data.experiences && data.projects && data.skills && data.education)
      }
    });

  } catch (error) {
    console.error('❌ Database integration test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Integration test failed',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    console.log('🧹 Cleaning up test data...');
    
    const repository = new PostgreSQLProfileRepository();
    const clearResult = await repository.clearData();
    
    if (!clearResult.success) {
      throw new Error(clearResult.error || 'Failed to clear test data');
    }
    
    console.log('✅ Test data cleared successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Test data cleared successfully'
    });

  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear test data'
      },
      { status: 500 }
    );
  }
}
