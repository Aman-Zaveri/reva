/**
 * Test script to verify the AI optimization summary behavior
 */

async function testSummaryOptimization() {
  const testProfile = {
    id: 'test-profile',
    name: 'Test Profile',
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      location: 'San Francisco, CA',
      // Note: NO summary field - this should not get one after optimization
    },
    experienceIds: [],
    projectIds: [],
    skillIds: [],
    educationIds: []
  };

  const testData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      location: 'San Francisco, CA',
    },
    experiences: [],
    projects: [],
    skills: [],
    education: []
  };

  const jobDescription = `
We are looking for a Senior Software Engineer to join our team.
Requirements:
- 5+ years of experience in JavaScript/TypeScript
- Experience with React and Node.js
- Strong problem-solving skills
- Excellent communication abilities
  `;

  try {
    console.log('Testing AI optimization with no existing summary...');
    console.log('Original profile has summary:', !!testProfile.personalInfo.summary);

    const response = await fetch('http://localhost:3000/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        profile: testProfile,
        data: testData,
        glazeLevel: 2
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', result.error);
      return;
    }

    console.log('\n--- OPTIMIZATION RESULTS ---');
    console.log('Success:', result.success);
    console.log('Has personalInfo optimizations:', !!result.optimizations.personalInfo);
    console.log('Has summary optimization:', !!result.optimizations.personalInfo?.summary);
    
    if (result.optimizations.personalInfo?.summary) {
      console.log('⚠️  WARNING: Summary was generated despite original having none!');
      console.log('Generated summary:', result.optimizations.personalInfo.summary);
    } else {
      console.log('✅ GOOD: No summary generated for profile without existing summary');
    }

    // Test with profile that HAS a summary
    console.log('\n\n--- Testing with existing summary ---');
    const profileWithSummary = {
      ...testProfile,
      personalInfo: {
        ...testProfile.personalInfo,
        summary: 'Experienced software developer with strong technical skills.'
      }
    };

    console.log('Profile with summary has summary:', !!profileWithSummary.personalInfo.summary);

    const response2 = await fetch('http://localhost:3000/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        profile: profileWithSummary,
        data: testData,
        glazeLevel: 2
      })
    });

    const result2 = await response2.json();
    
    if (!response2.ok) {
      console.error('API Error:', result2.error);
      return;
    }

    console.log('Has summary optimization:', !!result2.optimizations.personalInfo?.summary);
    
    if (result2.optimizations.personalInfo?.summary) {
      console.log('✅ GOOD: Summary was optimized for profile with existing summary');
      console.log('Original:', profileWithSummary.personalInfo.summary);
      console.log('Optimized:', result2.optimizations.personalInfo.summary);
    } else {
      console.log('🤔 Unexpected: No summary optimization despite having existing summary');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSummaryOptimization();
