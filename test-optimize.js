// Test script to debug the optimize API
import fetch from 'node-fetch';

const testData = {
  jobDescription: "We are looking for a Software Engineer with experience in React, Node.js, and TypeScript. You will be responsible for building scalable web applications and working with cross-functional teams.",
  profile: {
    id: "test-profile",
    name: "Test Profile",
    personalInfo: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "San Francisco, CA",
      summary: "Software engineer with 3 years of experience"
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
      summary: "Software engineer with 3 years of experience"
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

async function testOptimize() {
  try {
    console.log('Testing optimize API...');
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('API Error:', result);
    } else {
      console.log('Success!', result);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

testOptimize();
