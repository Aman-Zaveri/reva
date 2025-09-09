// Background script for the Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Resume Builder extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createResume') {
    createResumeFromJobData(request.jobData)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  } else if (request.action === 'showNotification') {
    showNotification(request.title, request.message, request.type);
  }
});

// Function to show browser notifications
function showNotification(title, message, type = 'basic') {
  chrome.notifications.create({
    type: 'basic',
    title: title,
    message: message,
    priority: 1
  }).catch(error => {
    console.log('Notification error:', error);
  });
}

async function createResumeFromJobData(jobData) {
  try {
    // Step 1: Get existing profiles and data
    console.log('Loading existing profiles and data...');
    const profilesResponse = await fetch('http://localhost:3000/api/profiles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!profilesResponse.ok) {
      throw new Error(`Failed to load profiles: ${profilesResponse.status}`);
    }

    const profilesData = await profilesResponse.json();
    if (!profilesData.success || !profilesData.data) {
      throw new Error('No existing data found. Please create some experiences, skills, etc. in the Resume Manager first.');
    }

    const { profiles, data } = profilesData.data;

    // Step 2: Create a temporary profile for optimization
    const profileName = `${jobData.title} - ${jobData.company}`;
    const tempProfile = {
      id: Date.now().toString(),
      name: profileName,
      personalInfo: data.personalInfo,
      experienceIds: data.experiences.map(exp => exp.id),
      projectIds: data.projects.map(proj => proj.id),
      skillIds: data.skills.map(skill => skill.id),
      educationIds: data.education.map(edu => edu.id),
      template: 'classic',
      // Ensure all required fields are present
      experienceOverrides: {},
      projectOverrides: {},
      skillOverrides: {},
      educationOverrides: {},
      sectionOrder: ['experience', 'projects', 'skills', 'education']
    };

    // Step 3: Get AI optimizations FIRST
    console.log('Getting AI optimizations...');
    const optimizeResponse = await fetch('http://localhost:3000/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription: jobData.description,
        profile: tempProfile,
        data: data,
        glazeLevel: 4, // Aggressive optimization level for significant changes
        customInstructions: `CRITICAL: You MUST add specific technologies and technical concepts from the job description even if they weren't explicitly mentioned in the original resume.

JOB REQUIREMENTS TO INCORPORATE:
- Job Title: ${jobData.title}
- Company: ${jobData.company}
- Required Skills/Technologies: ${jobData.skills}
- Job Description Keywords: Extract ALL technical terms, programming languages, frameworks, tools, and methodologies from this job description

MANDATORY TECHNICAL TRANSFORMATIONS:
1. ADD new technical skills to the skills section that are mentioned in the job but missing from the resume
2. INJECT specific technologies from the job into experience bullet points (e.g., if job mentions "React", add "React" to relevant project bullets)
3. ADD technical frameworks, libraries, and tools from the job description to project descriptions
4. INCORPORATE methodologies mentioned in the job (Agile, Scrum, DevOps, etc.) into experience
5. ADD programming languages from the job to relevant experiences even if not originally mentioned
6. INCLUDE cloud platforms, databases, and infrastructure tools mentioned in the job
7. ADD any certifications, protocols, or technical standards mentioned in the job

TECHNICAL SKILL INJECTION EXAMPLES:
- If job mentions "Python" and resume has backend experience → Add "Python" to that experience
- If job mentions "AWS" and resume has deployment experience → Add "AWS" to deployment bullets
- If job mentions "React" and resume has frontend projects → Add "React" to frontend projects
- If job mentions "Docker" and resume has DevOps tasks → Add "Docker" to DevOps experience

SKILLS SECTION ENHANCEMENT:
- ADD a new skill category if needed (e.g., "Cloud Platforms", "Frontend Frameworks")
- INCLUDE every technical skill mentioned in the job description
- GROUP similar technologies together in logical categories

AGGRESSIVENESS LEVEL: MAXIMUM
- Don't just change grammar - ADD substantial technical content
- Present experience as if it used the exact technologies the job requires
- Make it appear the candidate has experience with all job-required technologies
- Add technical depth and specific implementations

FORMATTING RULES:
- NEVER use markdown formatting like **bold**, *italic*, or any ** symbols
- Use plain text only - no asterisks, no bold formatting

Transform this resume to include EVERY technical skill, tool, framework, and methodology mentioned in the job description.

JOB DATA FOR ANALYSIS:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}
Requirements: ${jobData.requirements || 'Not specified'}
Responsibilities: ${jobData.responsibilities || 'Not specified'}
Qualifications: ${jobData.qualifications || 'Not specified'}`
      })
    });

    if (!optimizeResponse.ok) {
      const errorText = await optimizeResponse.text();
      throw new Error(`AI optimization failed: ${optimizeResponse.status} - ${errorText}`);
    }

    const optimizeResult = await optimizeResponse.json();
    console.log('AI optimization completed:', optimizeResult);

    // Extract the full optimization data (which includes keyInsights, newSkills, etc.)
    const optimizationData = optimizeResult.optimizations;
    
    console.log('Raw optimization data from API:', optimizationData);
    console.log('AI optimization field:', optimizationData.aiOptimization);

    // Step 4: Apply optimizations to create the final profile
    // The optimization service returns ProfileUpdates that should be merged with the base profile
    const optimizedProfile = {
      ...tempProfile,
      ...optimizationData, // This contains experienceOverrides, projectOverrides, etc.
      // Ensure the profile still has the correct name and ID (don't let AI override these)
      id: tempProfile.id,
      name: tempProfile.name,
      // Add job data to AI optimization metadata for analysis
      aiOptimization: {
        timestamp: new Date().toISOString(),
        keyInsights: optimizationData.aiOptimization?.keyInsights || [],
        jobDescriptionHash: optimizationData.aiOptimization?.jobDescriptionHash || '',
        // Extended fields for analysis
        jobData: jobData, // Store the job data for later analysis
        newSkills: optimizationData.aiOptimization?.newSkills || [],
        skillOptimizations: optimizationData.aiOptimization?.skillOptimizations || [],
        changeAnalysis: optimizationData.aiOptimization?.changeAnalysis || null
      }
    };

    console.log('Final optimized profile:', optimizedProfile);

    // Step 4.5: Add any new skills to master data if they don't exist
    const updatedData = { ...data };
    
    // Check for new skills from the AI optimization
    const newSkillsFromAI = optimizationData.newSkills || [];
    console.log('New skills from AI optimization:', newSkillsFromAI);
    
    if (newSkillsFromAI.length > 0) {
      console.log('Adding new skills to master data...', newSkillsFromAI);
      
      optimizationData.newSkills.forEach(newSkill => {
        const skillName = typeof newSkill === 'string' ? newSkill : newSkill.name;
        const skillDetails = typeof newSkill === 'string' ? '' : newSkill.details;
        
        console.log('Processing skill:', skillName);
        
        // Check if skill already exists
        const existingSkill = updatedData.skills.find(skill => 
          skill.name.toLowerCase() === skillName.toLowerCase()
        );
        
        if (!existingSkill) {
          const newSkillEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: skillName,
            details: skillDetails || `Added via AI optimization for ${jobData.title} at ${jobData.company}`,
            category: 'Technical Skills' // Default category
          };
          
          console.log('Adding new skill to master data:', newSkillEntry);
          updatedData.skills.push(newSkillEntry);
          
          // Add the skill to the profile's skill IDs if not already there
          if (!optimizedProfile.skillIds.includes(newSkillEntry.id)) {
            optimizedProfile.skillIds.push(newSkillEntry.id);
            console.log('Added skill ID to profile:', newSkillEntry.id);
          }
        } else {
          console.log('Skill already exists, ensuring it\'s in profile:', existingSkill.id);
          // Ensure existing skill is in profile's skill IDs
          if (!optimizedProfile.skillIds.includes(existingSkill.id)) {
            optimizedProfile.skillIds.push(existingSkill.id);
          }
        }
      });
    }

    console.log('Final updated data skills count:', updatedData.skills.length);
    console.log('Final profile skill IDs:', optimizedProfile.skillIds);

    // Step 5: Save the optimized profile with updated master data
    console.log('Saving optimized profile...');
    const updatedProfiles = [...profiles, optimizedProfile];
    
    // Create a clean version of the profile for saving (remove any functions or non-serializable data)
    const cleanProfile = JSON.parse(JSON.stringify(optimizedProfile));
    const cleanProfiles = [...profiles, cleanProfile];
    
    const saveResponse = await fetch('http://localhost:3000/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profiles: cleanProfiles,
        data: updatedData // Use updated data with new skills
      })
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      console.error('Save response error:', errorText);
      throw new Error(`Failed to save optimized profile: ${saveResponse.status} - ${errorText}`);
    }

    // Show completion notification
    showNotification(
      'Optimized Resume Created!',
      `AI-optimized resume for ${jobData.title} at ${jobData.company} is ready`,
      'success'
    );
    
    // Store the result for later reference
    await chrome.storage.local.set({
      lastCreatedResume: {
        profile: optimizedProfile,
        optimizations: optimizationData,
        timestamp: Date.now(),
        jobData: jobData,
        updatedData: updatedData // Store the updated master data too
      }
    });

    return {
      success: true,
      profile: optimizedProfile,
      optimizations: optimizationData,
      keyInsights: optimizationData?.keyInsights || [],
      newSkills: optimizationData?.newSkills || [],
      skillOptimizations: optimizationData?.skillOptimizations || [],
      message: 'Resume created and optimized successfully!'
    };
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
}
