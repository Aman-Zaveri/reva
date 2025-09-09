// Content script that runs on WaterlooWorks pages
console.log('WaterlooWorks Resume Builder content script loaded');

// Configuration object for selectors
const SELECTORS = {
  jobTitle: '.dashboard-header__posting-title h2', // Job title selector
  company: '.font--14 span', // Company name selector
  jobPopup: '.dashboard-header--mini__content' // Job popup container selector
};

// Section titles to look for (case-insensitive)
const SECTION_TITLES = {
  description: ['job summary', 'description', 'overview', 'about', 'job description'],
  responsibilities: ['responsibilities', 'duties', 'requirements', 'what you will do', 'key responsibilities'],
  skills: ['skills', 'qualifications', 'requirements', 'technical skills', 'desired skills', 'required skills']
};

// Track if a job is currently open
let isJobOpen = false;
let currentJobData = null;
let lastNotificationTime = 0;

// Function to check if job selectors are available
function checkJobAvailability() {
  const jobPopup = document.querySelector(SELECTORS.jobPopup);
  const jobTitle = document.querySelector(SELECTORS.jobTitle);
  const company = document.querySelector(SELECTORS.company);
  
  // Consider job available if we have title AND (popup OR company)
  // This is more flexible for different page states
  const jobAvailable = jobTitle && (jobPopup || company);
  
  console.log('Job availability check:', {
    jobAvailable,
    jobPopup: !!jobPopup,
    jobTitle: !!jobTitle,
    jobTitleText: jobTitle?.textContent?.trim(),
    company: !!company,
    companyText: company?.textContent?.trim()
  });
  
  if (jobAvailable !== isJobOpen) {
    isJobOpen = jobAvailable;
    
    if (isJobOpen) {
      // Job just opened - show notification
      showJobDetectedNotification();
      currentJobData = extractJobData();
    } else {
      // Job closed
      currentJobData = null;
    }
    
    // Send message to popup about job availability
    chrome.runtime.sendMessage({
      action: 'jobAvailabilityChanged',
      available: isJobOpen,
      jobData: currentJobData
    });
  }
  
  return jobAvailable;
}

// Function to show notification when job is detected
function showJobDetectedNotification() {
  const now = Date.now();
  // Prevent spam notifications (max 1 per 3 seconds)
  if (now - lastNotificationTime < 3000) {
    return;
  }
  lastNotificationTime = now;

  // Send message to background script to show notification
  chrome.runtime.sendMessage({
    action: 'showNotification',
    type: 'jobDetected',
    title: 'Job Detected!',
    message: 'Click the extension to create a resume for this job.'
  });
}

// Function to find content by section title
function findContentByTitle(sectionType, container = document) {
  const titleVariations = SECTION_TITLES[sectionType] || [sectionType];
  
  // Find all span elements that might contain section titles
  const spans = container.querySelectorAll('span');
  
  for (const span of spans) {
    const spanText = span.textContent?.trim().toLowerCase();
    if (!spanText) continue;
    
    // Check if this span contains any of the title variations
    const matchesTitle = titleVariations.some(title => 
      spanText.includes(title.toLowerCase())
    );
    
    if (matchesTitle) {
      console.log(`Found title span for ${sectionType}:`, span.textContent?.trim());
      
      // Found the title span, now collect content from direct sibling p tags
      let content = '';
      let nextElement = span.nextElementSibling;
      
      while (nextElement) {
        // Only process p tags
        if (nextElement.tagName?.toLowerCase() === 'p') {
          const pText = nextElement.textContent?.trim();
          if (pText) {
            // Check if this p tag contains another section title (stop if so)
            const isAnotherTitle = Object.values(SECTION_TITLES).flat().some(title => {
              const lowerText = pText.toLowerCase();
              return lowerText.includes(title.toLowerCase()) && pText.length < 150;
            });
            
            if (isAnotherTitle) break;
            
            content += pText + '\n\n';
          }
        }
        // If we hit another span (likely another section title), stop
        else if (nextElement.tagName?.toLowerCase() === 'span') {
          const spanText = nextElement.textContent?.trim().toLowerCase();
          const isAnotherTitle = Object.values(SECTION_TITLES).flat().some(title => 
            spanText.includes(title.toLowerCase())
          );
          if (isAnotherTitle) break;
        }
        
        nextElement = nextElement.nextElementSibling;
      }
      
      if (content.trim()) {
        console.log(`Found content for ${sectionType} (${content.length} chars):`, content.trim().substring(0, 200) + '...');
        return content.trim();
      }
    }
  }
  
  console.log(`No content found for section: ${sectionType}`);
  return '';
}

// Function to extract job data from the page
function extractJobData() {
  try {
    const title = document.querySelector(SELECTORS.jobTitle)?.textContent?.trim() || '';
    const company = document.querySelector(SELECTORS.company)?.textContent?.trim() || '';
    
    console.log('Extracting job data for:', title, 'at', company);
    
    // Extract content by section types using our flexible approach
    const description = findContentByTitle('description');
    const responsibilities = findContentByTitle('responsibilities');
    const skills = findContentByTitle('skills');

    // Combine description and responsibilities for a complete job description
    let fullDescription = '';
    if (description) {
      fullDescription += 'Job Summary:\n' + description + '\n\n';
    }
    if (responsibilities && responsibilities !== description) {
      fullDescription += 'Key Responsibilities:\n' + responsibilities + '\n\n';
    }
    
    // Use the combined description, or fall back to either section
    const finalDescription = fullDescription.trim() || description || responsibilities || 'No job description available';

    const jobData = {
      title,
      company,
      description: finalDescription,
      skills: skills || 'No specific skills listed',
      url: window.location.href,
      extractedAt: new Date().toISOString(),
      sections: {
        rawDescription: description,
        rawResponsibilities: responsibilities,
        rawSkills: skills
      }
    };

    console.log('Successfully extracted job data:', {
      title: jobData.title,
      company: jobData.company,
      descriptionLength: jobData.description.length,
      skillsLength: jobData.skills.length
    });
    
    currentJobData = jobData;
    return jobData;
  } catch (error) {
    console.error('Error extracting job data:', error);
    return null;
  }
}

// Set up mutation observer to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
  // Debounce the check to avoid excessive calls
  clearTimeout(window.jobCheckTimeout);
  window.jobCheckTimeout = setTimeout(checkJobAvailability, 500);
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial check
setTimeout(checkJobAvailability, 1000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobData') {
    sendResponse({
      available: isJobOpen,
      jobData: currentJobData
    });
  } else if (request.action === 'extractJobData') {
    const jobData = extractJobData();
    sendResponse({
      success: !!jobData,
      jobData: jobData
    });
  }
  
  return true;
});

// Periodic check every 2 seconds
setInterval(checkJobAvailability, 2000);
