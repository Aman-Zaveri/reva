/**
 * WaterlooWorks Resume Builder - Background Script
 * Handles resume creation via API calls
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
        throw new Error('Please sign in to your Resume Manager account first. Visit http://localhost:3000 to sign in, then try again.');
      }

      console.log('Starting resume creation process...');

      // 1. Create job record first (new step)
      console.log('Creating job record...');
      const jobRecord = await createJobRecord(jobData);

      // 2. Load existing data and validate it's sufficient
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

      // 3. Use AI Resume Builder Agent to intelligently select experiences and projects
      console.log('Using AI Resume Builder Agent for intelligent selection...');
      const aiSelections = await getAIResumeBuilderSelections(jobData, data);

      // 4. Create optimized temporary profile with AI selections
      console.log('Creating optimized profile with AI selections...');
      const tempProfile = createOptimizedTempProfile(jobData, data, jobRecord.id, aiSelections);

      // 5. Get AI optimization (this is the long-running operation)
      console.log('Starting AI optimization (this may take a moment)...');
      const optimizationData = await getAIOptimization(jobData, tempProfile, data, jobRecord.id);

      // 6. Create final optimized profile with AI selection metadata
      console.log('Creating final optimized profile...');
      const optimizedProfile = createOptimizedProfile(tempProfile, optimizationData, jobData, jobRecord.id, aiSelections);

      // 7. Add new skills to master data AND update profile skill IDs
      const updatedData = addNewSkillsToData(data, optimizationData, jobData, optimizedProfile);

      // 8. Save everything
      console.log('Saving optimized profile...');
      await saveOptimizedProfile(profiles, optimizedProfile, updatedData);

      // 9. Store result and show success notification
      await storeResult(optimizedProfile, optimizationData, jobData, updatedData, aiSelections);
      
      showNotification(
        'AI-Powered Resume Created!',
        `Intelligent resume for ${jobData.title} at ${jobData.company} is ready with optimized content and selections`
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
    console.log('Checking authentication status...');
    const response = await fetch(`${API_BASE}/../auth/session`, {
      method: 'GET',
      credentials: 'include', // Include session cookies
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Auth check response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Auth check result:', data);
      
      // Check if the session has a user
      if (data && data.user && data.user.id) {
        return { authenticated: true, data };
      }
      
      return { authenticated: false, error: 'No active session found' };
    }
    
    return { authenticated: false, error: 'Authentication check failed' };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false, error: error.message };
  }
}

/**
 * Make API call to backend with session authentication and retry logic
 */
async function apiCall(endpoint, method, body = null, retryCount = 0) {
  const maxRetries = 2;
  
  console.log(`Making API call: ${method} ${endpoint}`, { body: body ? 'present' : 'none', retryCount });
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      credentials: 'include', // Include session cookies for authentication
      headers: { 'Content-Type': 'application/json' },
      ...(body && { body: JSON.stringify(body) })
    });

    console.log(`API response status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API call failed: ${response.status} - ${errorText}`);
      
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

    const result = await response.json();
    console.log(`API call successful for ${endpoint}:`, { success: result.success });
    return result;
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
 * Create job record in database
 */
async function createJobRecord(jobData) {
  console.log('Creating job record with data:', {
    title: jobData.title,
    company: jobData.company,
    hasDescription: !!jobData.description,
    hasUrl: !!jobData.url,
    source: 'extension'
  });

  const jobRecord = await apiCall('/jobs', 'POST', {
    title: jobData.title,
    company: jobData.company,
    description: jobData.description,
    requirements: jobData.requirements,
    responsibilities: jobData.responsibilities,
    skills: jobData.skills,
    url: jobData.url,
    source: 'extension',
    extractedAt: new Date().toISOString()
  });

  console.log('Job creation API response:', jobRecord);

  if (!jobRecord.success) {
    console.error('Job creation failed with error:', jobRecord.error);
    throw new Error(`Failed to create job record: ${jobRecord.error}`);
  }

  console.log('Job record created successfully:', jobRecord.data);
  return jobRecord.data;
}

/**
 * Create temporary profile for optimization with data validation
 */
function createTempProfile(jobData, data, jobId) {
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
    jobId: jobId, // Link to the job record
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
 * Use AI Resume Builder Agent to intelligently select experiences and projects
 */
async function getAIResumeBuilderSelections(jobData, data) {
  console.log('Using AI Resume Builder Agent to select optimal experiences and projects...');
  
  // Prepare job description from all job data sections
  const jobDescriptionParts = [];
  if (jobData.description) jobDescriptionParts.push(jobData.description);
  if (jobData.skills) jobDescriptionParts.push(`Required Skills: ${jobData.skills}`);
  if (jobData.responsibilities) jobDescriptionParts.push(`Responsibilities: ${jobData.responsibilities}`);
  if (jobData.requirements) jobDescriptionParts.push(`Requirements: ${jobData.requirements}`);
  
  const fullJobDescription = jobDescriptionParts.join('\n\n');
  
  try {
    const response = await apiCall('/ai-agents/single-agent', 'POST', {
      agentId: 'resume-builder',
      input: {
        maxExperiences: 4, // Limit to top 4 most relevant experiences
        maxProjects: 3,    // Limit to top 3 most relevant projects
        enforceMinimums: true,
        selectionCriteria: `Focus on experiences and projects that demonstrate the technical skills and qualifications required for ${jobData.title} at ${jobData.company}.`
      },
      jobContext: {
        description: fullJobDescription,
        title: jobData.title,
        company: jobData.company
      },
      profileData: {
        profile: {},
        data: data
      },
      config: {
        prioritizeRecentExperience: true,
        includeProjectSelection: true,
        requireMinimumMatch: 70 // Minimum relevance score of 70%
      }
    });
    
    if (response.success && response.result) {
      console.log('AI Resume Builder selections completed successfully');
      return response.result;
    } else {
      console.warn('AI Resume Builder failed, falling back to all items');
      return null;
    }
  } catch (error) {
    console.error('AI Resume Builder Agent failed:', error);
    console.log('Falling back to including all experiences and projects');
    return null;
  }
}

/**
 * Create optimized profile using AI Resume Builder selections
 */
function createOptimizedTempProfile(jobData, data, jobId, aiSelections) {
  // Start with basic profile
  const baseProfile = createTempProfile(jobData, data, jobId);
  
  if (!aiSelections) {
    console.log('No AI selections available, using all items');
    return baseProfile;
  }
  
  // Apply AI-selected experiences
  if (aiSelections.selectedExperiences && aiSelections.selectedExperiences.length > 0) {
    // Sort by suggested order and extract IDs
    const selectedExpIds = aiSelections.selectedExperiences
      .sort((a, b) => a.suggestedOrder - b.suggestedOrder)
      .map(item => item.experience.id);
    
    baseProfile.experienceIds = selectedExpIds;
    console.log(`AI selected ${selectedExpIds.length} experiences (out of ${data.experiences?.length || 0} total)`);
  }
  
  // Apply AI-selected projects
  if (aiSelections.selectedProjects && aiSelections.selectedProjects.length > 0) {
    // Sort by suggested order and extract IDs
    const selectedProjIds = aiSelections.selectedProjects
      .sort((a, b) => a.suggestedOrder - b.suggestedOrder)
      .map(item => item.project.id);
    
    baseProfile.projectIds = selectedProjIds;
    console.log(`AI selected ${selectedProjIds.length} projects (out of ${data.projects?.length || 0} total)`);
  }
  
  // Log AI insights for debugging
  if (aiSelections.selectionAnalysis) {
    console.log('AI Selection Analysis:', {
      strategy: aiSelections.selectionAnalysis.selectionStrategy,
      keyFactors: aiSelections.selectionAnalysis.keyFactors,
      missingSkills: aiSelections.selectionAnalysis.missingSkillsNeeded
    });
  }
  
  if (aiSelections.recommendations) {
    console.log('AI Recommendations:', {
      experienceGaps: aiSelections.recommendations.experienceGaps,
      skillsToHighlight: aiSelections.recommendations.skillsToHighlight,
      improvements: aiSelections.recommendations.suggestedImprovements
    });
  }
  
  return baseProfile;
}

/**
 * Get AI optimization from backend
 */
async function getAIOptimization(jobData, tempProfile, data, jobId) {
  const customInstructions = createCustomInstructions(jobData);
  
  const optimizeResult = await apiCall('/optimize-resume', 'POST', {
    jobId: jobId, // Use job ID to fetch job data from database
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
function createOptimizedProfile(tempProfile, optimizationData, jobData, jobId, aiSelections = null) {
  const profile = {
    ...tempProfile,
    ...optimizationData,
    id: tempProfile.id,
    name: tempProfile.name,
    jobId: jobId, // Ensure the job link is preserved
    aiOptimization: {
      timestamp: new Date().toISOString(),
      keyInsights: optimizationData.aiOptimization?.keyInsights || [],
      jobDescriptionHash: optimizationData.aiOptimization?.jobDescriptionHash || '',
      jobData: jobData,
      newSkills: optimizationData.aiOptimization?.newSkills || [],
      skillOptimizations: optimizationData.aiOptimization?.skillOptimizations || [],
      changeAnalysis: optimizationData.aiOptimization?.changeAnalysis || null,
      // Add AI Resume Builder metadata
      aiSelections: aiSelections ? {
        selectedExperiences: aiSelections.selectedExperiences?.length || 0,
        selectedProjects: aiSelections.selectedProjects?.length || 0,
        selectionStrategy: aiSelections.selectionAnalysis?.selectionStrategy || 'Default selection',
        keyFactors: aiSelections.selectionAnalysis?.keyFactors || [],
        recommendations: aiSelections.recommendations || {}
      } : null
    }
  };
  
  return profile;
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
async function storeResult(optimizedProfile, optimizationData, jobData, updatedData, aiSelections = null) {
  await chrome.storage.local.set({
    lastCreatedResume: {
      profile: optimizedProfile,
      optimizations: optimizationData,
      timestamp: Date.now(),
      jobData: jobData,
      updatedData: updatedData,
      aiSelections: aiSelections
    }
  });
}
