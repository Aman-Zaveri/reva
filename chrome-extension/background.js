/**
 * WaterlooWorks Resume Builder - Background Script
 * Handles notifications and resume creation via API calls
 */

const API_BASE = 'http://localhost:3000/api';

// Extension installed listener
chrome.runtime.onInstalled.addListener(() => {
  console.log('Resume Builder extension installed');
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'createResume':
      createResumeFromJobData(request.jobData)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'showNotification':
      showNotification(request.title, request.message);
      break;
  }
});

/**
 * Show browser notification
 */
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    title: title,
    message: message,
    priority: 1
  }).catch(error => {
    console.log('Notification error:', error);
  });
}

/**
 * Create optimized resume from job data
 */
async function createResumeFromJobData(jobData) {
  try {
    // 1. Load existing data
    const profilesData = await apiCall('/profiles', 'GET');
    if (!profilesData.success || !profilesData.data) {
      throw new Error('No existing data found. Please create some experiences, skills, etc. in the Resume Manager first.');
    }

    const { profiles, data } = profilesData.data;

    // 2. Create temporary profile
    const tempProfile = createTempProfile(jobData, data);

    // 3. Get AI optimization
    const optimizationData = await getAIOptimization(jobData, tempProfile, data);

    // 4. Create final optimized profile
    const optimizedProfile = createOptimizedProfile(tempProfile, optimizationData, jobData);

    // 5. Add new skills to master data AND update profile skill IDs
    const updatedData = addNewSkillsToData(data, optimizationData, jobData, optimizedProfile);

    // 6. Save everything
    await saveOptimizedProfile(profiles, optimizedProfile, updatedData);

    // 7. Store result and show success notification
    await storeResult(optimizedProfile, optimizationData, jobData, updatedData);
    
    showNotification(
      'Resume Created!',
      `AI-optimized resume for ${jobData.title} at ${jobData.company} is ready`
    );

    return {
      success: true,
      profile: optimizedProfile,
      optimizations: optimizationData,
      message: 'Resume created successfully!'
    };

  } catch (error) {
    console.error('Error creating resume:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      jobData: jobData
    });
    throw error;
  }
}

/**
 * Make API call to backend
 */
async function apiCall(endpoint, method, body = null) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Create temporary profile for optimization
 */
function createTempProfile(jobData, data) {
  return {
    id: Date.now().toString(),
    name: `${jobData.title} - ${jobData.company}`,
    personalInfo: data.personalInfo,
    experienceIds: data.experiences.map(exp => exp.id),
    projectIds: data.projects.map(proj => proj.id),
    skillIds: data.skills.map(skill => skill.id),
    educationIds: data.education.map(edu => edu.id),
    template: 'classic',
    experienceOverrides: {},
    projectOverrides: {},
    skillOverrides: {},
    educationOverrides: {},
    sectionOrder: ['experience', 'projects', 'skills', 'education']
  };
}

/**
 * Get AI optimization from backend
 */
async function getAIOptimization(jobData, tempProfile, data) {
  const customInstructions = createCustomInstructions(jobData);
  
  const optimizeResult = await apiCall('/optimize-resume', 'POST', {
    jobDescription: jobData.description,
    profile: tempProfile,
    data: data,
    glazeLevel: 4,
    customInstructions
  });

  return optimizeResult.optimizations;
}

/**
 * Create custom instructions for AI optimization
 */
function createCustomInstructions(jobData) {
  return `CRITICAL: Add specific technologies from the job description to the resume.

JOB REQUIREMENTS:
- Title: ${jobData.title}
- Company: ${jobData.company}
- Skills: ${jobData.skills}
- Description: ${jobData.description}

INSTRUCTIONS:
1. ADD new technical skills mentioned in the job
2. INJECT job technologies into experience bullets
3. INCORPORATE methodologies (Agile, DevOps, etc.)
4. ADD programming languages and frameworks
5. INCLUDE cloud platforms and tools
6. Use plain text only - no markdown formatting

Transform this resume to include ALL technical requirements from the job.`;
}

/**
 * Create optimized profile from temporary profile and optimization data
 */
function createOptimizedProfile(tempProfile, optimizationData, jobData) {
  return {
    ...tempProfile,
    ...optimizationData,
    id: tempProfile.id,
    name: tempProfile.name,
    aiOptimization: {
      timestamp: new Date().toISOString(),
      keyInsights: optimizationData.aiOptimization?.keyInsights || [],
      jobDescriptionHash: optimizationData.aiOptimization?.jobDescriptionHash || '',
      jobData: jobData,
      newSkills: optimizationData.aiOptimization?.newSkills || [],
      skillOptimizations: optimizationData.aiOptimization?.skillOptimizations || [],
      changeAnalysis: optimizationData.aiOptimization?.changeAnalysis || null
    }
  };
}

/**
 * Add new skills from AI optimization to master data
 */
function addNewSkillsToData(data, optimizationData, jobData, optimizedProfile) {
  const updatedData = { ...data };
  const newSkills = optimizationData.newSkills || [];

  newSkills.forEach(newSkill => {
    const skillName = typeof newSkill === 'string' ? newSkill : newSkill.name;
    const skillExists = updatedData.skills.find(skill => 
      skill.name.toLowerCase() === skillName.toLowerCase()
    );

    if (!skillExists) {
      const newSkillEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: skillName,
        details: `Added via AI optimization for ${jobData.title} at ${jobData.company}`,
        category: 'Technical Skills'
      };
      
      updatedData.skills.push(newSkillEntry);
      
      // Add the new skill ID to the optimized profile's skillIds
      if (!optimizedProfile.skillIds.includes(newSkillEntry.id)) {
        optimizedProfile.skillIds.push(newSkillEntry.id);
      }
    } else {
      // Ensure existing skill is in profile's skill IDs
      if (!optimizedProfile.skillIds.includes(skillExists.id)) {
        optimizedProfile.skillIds.push(skillExists.id);
      }
    }
  });

  return updatedData;
}

/**
 * Save optimized profile to backend
 */
async function saveOptimizedProfile(profiles, optimizedProfile, updatedData) {
  // Validate that all skill IDs in the profile exist in the updated data
  const allSkillIds = updatedData.skills.map(skill => skill.id);
  const profileSkillIds = optimizedProfile.skillIds || [];
  
  // Filter out any invalid skill IDs
  const validSkillIds = profileSkillIds.filter(skillId => allSkillIds.includes(skillId));
  
  // Update the profile with only valid skill IDs
  const profileToSave = {
    ...optimizedProfile,
    skillIds: validSkillIds
  };
  
  console.log('Saving profile with skill IDs:', validSkillIds);
  console.log('Available skills in data:', allSkillIds);
  
  const cleanProfiles = [...profiles, JSON.parse(JSON.stringify(profileToSave))];
  
  await apiCall('/profiles', 'POST', {
    profiles: cleanProfiles,
    data: updatedData
  });
}

/**
 * Store result in local storage
 */
async function storeResult(optimizedProfile, optimizationData, jobData, updatedData) {
  await chrome.storage.local.set({
    lastCreatedResume: {
      profile: optimizedProfile,
      optimizations: optimizationData,
      timestamp: Date.now(),
      jobData: jobData,
      updatedData: updatedData
    }
  });
}
