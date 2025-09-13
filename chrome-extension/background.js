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
 * Create optimized resume from job data with robust error handling
 */
async function createResumeFromJobData(jobData) {
  let authRetryCount = 0;
  const maxAuthRetries = 3;
  
  while (authRetryCount < maxAuthRetries) {
    try {
      // First check if user is authenticated
      const authCheck = await checkAuthentication();
      if (!authCheck.authenticated) {
        throw new Error('Please sign in to your Resume Manager account first. Visit http://localhost:3000 to sign in.');
      }

      console.log('Starting resume creation process...');

      // 1. Load existing data and validate it's sufficient
      console.log('Loading existing profile data...');
      const profilesData = await apiCall('/profiles', 'GET');
      if (!profilesData.success || !profilesData.data) {
        throw new Error('No existing data found. Please create some experiences, skills, etc. in the Resume Manager first.');
      }

      const { profiles, data } = profilesData.data;

      // Validate that user has sufficient data to create a resume
      const validationResult = validateMasterData(data);
      if (!validationResult.isValid) {
        throw new Error(`Incomplete profile data: ${validationResult.message}`);
      }

      // 2. Create temporary profile
      console.log('Creating temporary profile...');
      const tempProfile = createTempProfile(jobData, data);

      // 3. Get AI optimization (this is the long-running operation)
      console.log('Starting AI optimization (this may take a moment)...');
      const optimizationData = await getAIOptimization(jobData, tempProfile, data);

      // 4. Create final optimized profile
      console.log('Creating optimized profile...');
      const optimizedProfile = createOptimizedProfile(tempProfile, optimizationData, jobData);

      // 5. Add new skills to master data AND update profile skill IDs
      const updatedData = addNewSkillsToData(data, optimizationData, jobData, optimizedProfile);

      // 6. Save everything
      console.log('Saving optimized profile...');
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
      
      // If it's an authentication error, retry up to maxAuthRetries
      if (error.message.includes('Authentication') || error.message.includes('sign in')) {
        authRetryCount++;
        if (authRetryCount < maxAuthRetries) {
          console.log(`Authentication failed, retrying... (attempt ${authRetryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          continue;
        }
      }
      
      // Log detailed error information
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        jobData: jobData,
        authRetryCount: authRetryCount
      });
      
      throw error;
    }
  }
  
  throw new Error('Authentication failed after multiple attempts. Please refresh the page and sign in again.');
}

/**
 * Check if user is authenticated with the main application
 */
async function checkAuthentication() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      credentials: 'include', // Include session cookies
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { authenticated: true, data };
    }
    
    return { authenticated: false, error: 'Not authenticated' };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

/**
 * Make API call to backend with session authentication and retry logic
 */
async function apiCall(endpoint, method, body = null, retryCount = 0) {
  const maxRetries = 2;
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      credentials: 'include', // Include session cookies for authentication
      headers: { 'Content-Type': 'application/json' },
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle authentication errors specifically
      if (response.status === 401) {
        // If we haven't retried yet, check auth status and retry once
        if (retryCount < maxRetries) {
          console.log(`API call failed with 401, retrying... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return apiCall(endpoint, method, body, retryCount + 1);
        }
        
        throw new Error('Authentication session expired. Please sign in to your Resume Manager account again.');
      }
      
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    if (error.message.includes('Authentication') || error.message.includes('401')) {
      throw error; // Re-throw auth errors without retry
    }
    
    // For other errors, retry if we haven't exceeded max retries
    if (retryCount < maxRetries) {
      console.log(`API call failed, retrying... (attempt ${retryCount + 1}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return apiCall(endpoint, method, body, retryCount + 1);
    }
    
    throw error;
  }
}

/**
 * Validate that user has sufficient master data to create a resume
 */
function validateMasterData(data) {
  const errors = [];
  
  // Check personal information
  if (!data.personalInfo) {
    errors.push('Personal information is missing');
  } else {
    if (!data.personalInfo.fullName || data.personalInfo.fullName.trim() === '') {
      errors.push('Full name is required');
    }
    if (!data.personalInfo.email || data.personalInfo.email.trim() === '') {
      errors.push('Email address is required');
    }
    if (!data.personalInfo.phone || data.personalInfo.phone.trim() === '') {
      errors.push('Phone number is required');
    }
    if (!data.personalInfo.location || data.personalInfo.location.trim() === '') {
      errors.push('Location is required');
    }
  }
  
  // Check experiences
  if (!data.experiences || data.experiences.length === 0) {
    errors.push('At least one work experience is required');
  } else {
    const invalidExperiences = data.experiences.filter(exp => 
      !exp.title || !exp.company || !exp.bullets || exp.bullets.length === 0
    );
    if (invalidExperiences.length > 0) {
      errors.push('All experiences must have title, company, and at least one bullet point');
    }
  }
  
  // Check skills
  if (!data.skills || data.skills.length === 0) {
    errors.push('At least one skill is required');
  }
  
  // Check education
  if (!data.education || data.education.length === 0) {
    errors.push('At least one education entry is required');
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      message: `Please complete your profile in Resume Manager first:\n• ${errors.join('\n• ')}\n\nVisit http://localhost:3000 to add this information.`
    };
  }
  
  return { isValid: true };
}

/**
 * Create temporary profile for optimization with data validation
 */
function createTempProfile(jobData, data) {
  // Ensure personal info has all required fields
  const personalInfo = {
    fullName: data.personalInfo?.fullName || 'Your Name',
    email: data.personalInfo?.email || 'your.email@example.com',
    phone: data.personalInfo?.phone || '(555) 123-4567',
    location: data.personalInfo?.location || 'Your City, State',
    linkedin: data.personalInfo?.linkedin,
    github: data.personalInfo?.github,
    website: data.personalInfo?.website,
    summary: data.personalInfo?.summary
  };

  return {
    id: Date.now().toString(),
    name: `${jobData.title} - ${jobData.company}`,
    personalInfo: personalInfo,
    experienceIds: (data.experiences || []).map(exp => exp.id),
    projectIds: (data.projects || []).map(proj => proj.id),
    skillIds: (data.skills || []).map(skill => skill.id),
    educationIds: (data.education || []).map(edu => edu.id),
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
    isAutomaticExtraction: true, // Flag to indicate this comes from Chrome extension auto-extraction
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
