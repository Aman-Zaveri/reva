import { NextRequest, NextResponse } from 'next/server';
import { wordExportService } from '@/shared/services/word-export.service';
import type { Profile, DataBundle } from '@/shared/lib/types';

// Test endpoint to verify Word export functionality
export async function GET() {
  try {
    // Create a test profile and data
    const testProfile: Profile = {
      id: 'test-profile',
      name: 'Test Profile',
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        website: 'johndoe.dev',
        summary: 'Experienced software developer with 5+ years of experience in full-stack development.'
      },
      experienceIds: ['exp1'],
      projectIds: ['proj1'],
      skillIds: ['skill1'],
      educationIds: ['edu1'],
      sectionOrder: ['experiences', 'projects', 'skills', 'education'],
    };

    const testData: DataBundle = {
      personalInfo: testProfile.personalInfo!,
      experiences: [{
        id: 'exp1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        date: 'Jan 2020 - Present',
        bullets: [
          'Led development of scalable web applications serving 100k+ users',
          'Implemented CI/CD pipelines reducing deployment time by 60%',
          'Mentored junior developers and conducted code reviews'
        ]
      }],
      projects: [{
        id: 'proj1',
        title: 'E-commerce Platform',
        link: 'github.com/johndoe/ecommerce',
        bullets: [
          'Built full-stack e-commerce platform using React and Node.js',
          'Integrated payment processing with Stripe API',
          'Implemented real-time inventory management system'
        ]
      }],
      skills: [{
        id: 'skill1',
        name: 'Programming Languages',
        details: 'JavaScript, TypeScript, Python, Java, Go'
      }],
      education: [{
        id: 'edu1',
        title: 'Bachelor of Science in Computer Science',
        details: 'University of Technology, 2015-2019, GPA: 3.8/4.0'
      }]
    };

    // Test the Word export service
    const doc = await wordExportService.exportToWord(testProfile, testData, {
      fileName: 'test-resume.docx'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Word export service is working correctly',
      testData: {
        profileName: testProfile.name,
        personalInfoName: testProfile.personalInfo?.fullName,
        sectionsCount: {
          experiences: testData.experiences.length,
          projects: testData.projects.length,
          skills: testData.skills.length,
          education: testData.education.length
        }
      }
    });
  } catch (error) {
    console.error('Word export test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Word export test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
