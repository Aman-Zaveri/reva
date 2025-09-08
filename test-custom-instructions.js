/**
 * Test script to verify custom instructions feature in AI optimization
 */

async function testCustomInstructions() {
  const testProfile = {
    id: 'test-profile',
    name: 'Test Profile',
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      location: 'San Francisco, CA',
      summary: 'Software developer with experience in web development.'
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

  const customInstructions = "Focus heavily on leadership experience and emphasize any team collaboration skills. Make the summary sound more confident and assertive.";

  try {
    console.log('Testing AI optimization with custom instructions...');
    console.log('Custom instructions:', customInstructions);

    const response = await fetch('http://localhost:3000/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        profile: testProfile,
        data: testData,
        glazeLevel: 2,
        customInstructions
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', result.error);
      console.error('Details:', result.details);
      return;
    }

    console.log('\n--- OPTIMIZATION RESULTS WITH CUSTOM INSTRUCTIONS ---');
    console.log('Success:', result.success);
    console.log('Has personalInfo optimizations:', !!result.optimizations.personalInfo);
    console.log('Has summary optimization:', !!result.optimizations.personalInfo?.summary);
    
    if (result.optimizations.personalInfo?.summary) {
      console.log('\n📝 SUMMARY COMPARISON:');
      console.log('Original:', testProfile.personalInfo.summary);
      console.log('Optimized:', result.optimizations.personalInfo.summary);
      
      // Check if the custom instructions had an effect
      const optimizedSummary = result.optimizations.personalInfo.summary.toLowerCase();
      const hasLeadershipFocus = optimizedSummary.includes('lead') || optimizedSummary.includes('team') || optimizedSummary.includes('collaboration');
      const soundsConfident = optimizedSummary.includes('proven') || optimizedSummary.includes('expert') || optimizedSummary.includes('skilled');
      
      console.log('\n🔍 CUSTOM INSTRUCTIONS ANALYSIS:');
      console.log('Leadership/Team focus detected:', hasLeadershipFocus ? '✅' : '❌');
      console.log('Confident language detected:', soundsConfident ? '✅' : '❌');
    }

    if (result.optimizations.aiOptimization?.keyInsights) {
      console.log('\n💡 KEY INSIGHTS:');
      result.optimizations.aiOptimization.keyInsights.forEach((insight, index) => {
        console.log(`${index + 1}. ${insight}`);
      });
    }

    // Test without custom instructions for comparison
    console.log('\n\n--- TESTING WITHOUT CUSTOM INSTRUCTIONS (for comparison) ---');
    
    const response2 = await fetch('http://localhost:3000/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        profile: testProfile,
        data: testData,
        glazeLevel: 2
        // No customInstructions
      })
    });

    const result2 = await response2.json();
    
    if (response2.ok && result2.optimizations.personalInfo?.summary) {
      console.log('Without custom instructions:', result2.optimizations.personalInfo.summary);
      
      console.log('\n📊 COMPARISON:');
      console.log('With custom instructions:   ', result.optimizations.personalInfo.summary);
      console.log('Without custom instructions:', result2.optimizations.personalInfo.summary);
      
      if (result.optimizations.personalInfo.summary !== result2.optimizations.personalInfo.summary) {
        console.log('✅ Custom instructions created different results!');
      } else {
        console.log('⚠️  Results are identical - custom instructions may not have had effect');
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCustomInstructions();
