// Test script to verify the summary optimization fix
import fetch from 'node-fetch';

// Test case 1: Profile WITH existing summary (should optimize)
const testDataWithSummary = {
  jobDescription: "We are looking for a Software Engineer with experience in React, Node.js, and TypeScript. You will be responsible for building scalable web applications and working with cross-functional teams.",
  profile: {
    id: "test-profile-1",
    name: "Test Profile With Summary",
    personalInfo: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA",
      summary: "Software engineer with 3 years of experience in building web applications"
    },
    experienceIds: ["exp1"],
    projectIds: ["proj1"],
    skillIds: ["skill1"],
    educationIds: ["edu1"]
  },
  data: {
    personalInfo: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA",
      summary: "Software engineer with 3 years of experience in building web applications"
    },
    experiences: [{
      id: "exp1",
      title: "Software Developer",
      company: "Tech Corp",
      date: "2021-2024",
      bullets: ["Developed web applications", "Fixed bugs"],
      tags: []
    }],
    projects: [{
      id: "proj1",
      title: "E-commerce App",
      bullets: ["Built React frontend", "Implemented REST API"],
      tags: []
    }],
    skills: [{
      id: "skill1",
      name: "Programming Languages",
      details: "JavaScript, Python, Java"
    }],
    education: [{
      id: "edu1",
      title: "Bachelor of Computer Science",
      details: "University of Technology, 2021"
    }]
  },
  glazeLevel: 2
};

// Test case 2: Profile WITHOUT existing summary (should NOT optimize summary)
const testDataWithoutSummary = {
  ...testDataWithSummary,
  profile: {
    ...testDataWithSummary.profile,
    id: "test-profile-2",
    name: "Test Profile Without Summary",
    personalInfo: {
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA"
      // No summary field
    }
  },
  data: {
    ...testDataWithSummary.data,
    personalInfo: {
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA"
      // No summary field
    }
  }
};

// Test case 3: Profile WITH empty summary (should NOT optimize summary)
const testDataWithEmptySummary = {
  ...testDataWithSummary,
  profile: {
    ...testDataWithSummary.profile,
    id: "test-profile-3",
    name: "Test Profile With Empty Summary",
    personalInfo: {
      fullName: "Bob Wilson",
      email: "bob@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA",
      summary: ""  // Empty summary
    }
  },
  data: {
    ...testDataWithSummary.data,
    personalInfo: {
      fullName: "Bob Wilson",
      email: "bob@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA",
      summary: ""  // Empty summary
    }
  }
};

async function testOptimization(testData, testName) {
  try {
    console.log(`\n=== ${testName} ===`);
    
    const response = await fetch('http://localhost:3001/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ API Error for ${testName}:`, error);
      return;
    }

    const result = await response.json();
    console.log(`✅ Success for ${testName}`);
    
    // Check if summary optimization was included
    const hasSummaryOptimization = result.optimizations?.personalInfo?.summary;
    console.log(`📝 Summary optimization included: ${hasSummaryOptimization ? 'YES' : 'NO'}`);
    
    if (hasSummaryOptimization) {
      console.log(`📄 Optimized summary: "${result.optimizations.personalInfo.summary}"`);
    }
    
    // Show experience and project optimizations count
    const expCount = result.optimizations?.experienceOptimizations?.length || 0;
    const projCount = result.optimizations?.projectOptimizations?.length || 0;
    console.log(`🔧 Experience optimizations: ${expCount}`);
    console.log(`🚀 Project optimizations: ${projCount}`);
    
  } catch (error) {
    console.error(`❌ Network error for ${testName}:`, error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Testing AI Optimization Summary Fix...\n');
  
  await testOptimization(testDataWithSummary, "Profile WITH existing summary");
  await testOptimization(testDataWithoutSummary, "Profile WITHOUT summary");
  await testOptimization(testDataWithEmptySummary, "Profile WITH empty summary");
  
  console.log('\n✨ All tests completed!');
  console.log('\nExpected results:');
  console.log('- Profile WITH existing summary: Should optimize summary');
  console.log('- Profile WITHOUT summary: Should NOT optimize summary');
  console.log('- Profile WITH empty summary: Should NOT optimize summary');
}

runAllTests().catch(console.error);
