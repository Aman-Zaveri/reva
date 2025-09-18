/**
 * WaterlooWorks Resume Builder - Content Script
 * Automatically detects job postings and extracts job data
 */

// Constants
const SELECTORS = {
  jobTitle: '.dashboard-header__posting-title h2',
  company: '.font--14 span',
  jobPopup: '.dashboard-header--mini__content'
};

const SECTION_TITLES = {
  description: 'Job Summary',
  responsibilities: 'Job Responsibilities',
  skills: 'Required Skills'
};

const NOTIFICATION_COOLDOWN = 3000; // 3 seconds

// State
let isJobOpen = false;
let currentJobData = null;
let lastNotificationTime = 0;

/**
 * Check if a job is currently available on the page
 */
function isJobAvailable() {
  const jobTitle = document.querySelector(SELECTORS.jobTitle);
  const jobPopup = document.querySelector(SELECTORS.jobPopup);
  const company = document.querySelector(SELECTORS.company);
  
  return jobTitle && (jobPopup || company);
}

/**
 * Extract content for a specific section type
 */
function extractSectionContent(sectionType) {
  const titleToFind = SECTION_TITLES[sectionType];
  if (!titleToFind) return '';

  const spans = document.querySelectorAll('span');

  for (const span of spans) {
    const spanText = span.textContent?.trim().toLowerCase();
    if (!spanText || !spanText.includes(titleToFind.toLowerCase())) continue;

    let content = '';
    let nextElement = span.nextElementSibling;

    while (nextElement) {
      const tag = nextElement.tagName?.toLowerCase();

      if (tag === 'p') {
        const pText = nextElement.textContent?.trim();
        if (pText) content += pText + '\n\n';
      } 
      else if (tag === 'ul') {
        const items = Array.from(nextElement.querySelectorAll('li'))
          .map(li => '- ' + li.textContent.trim())
          .join('\n');
        if (items) content += items + '\n\n';
      } 
      else if (tag === 'span' || tag === 'strong') {
        // Treat these as the start of the next section
        break;
      }

      nextElement = nextElement.nextElementSibling;
    }

    return content.trim();
  }

  return '';
}


/**
 * Extract job data from the current page
 */
function extractJobData() {
  try {
    const title = document.querySelector(SELECTORS.jobTitle)?.textContent?.trim() || '';
    const company = document.querySelector(SELECTORS.company)?.textContent?.trim() || '';
    
    if (!title || !company) return null;
    
    const description = extractSectionContent('description');
    const responsibilities = extractSectionContent('responsibilities');
    const skills = extractSectionContent('skills');

    console.log('Extracted job data:', { title, company, description, responsibilities, skills });

    // Combine sections for full description
    let fullDescription = '';
    if (description) fullDescription += `Job Summary:\n${description}\n\n`;
    if (responsibilities && responsibilities !== description) {
      fullDescription += `Key Responsibilities:\n${responsibilities}\n\n`;
    }
    
    const finalDescription = fullDescription.trim() || description || responsibilities || 'No description available';

    return {
      title,
      company,
      description: finalDescription,
      skills: skills || 'No skills listed',
      url: window.location.href,
      extractedAt: new Date().toISOString(),
      sections: {
        rawDescription: description,
        rawResponsibilities: responsibilities,
        rawSkills: skills
      }
    };
  } catch (error) {
    console.error('Error extracting job data:', error);
    return null;
  }
}

/**
 * Show notification when job is detected (with cooldown)
 */
function showJobNotification() {
  const now = Date.now();
  if (now - lastNotificationTime < NOTIFICATION_COOLDOWN) return;
  
  lastNotificationTime = now;
  chrome.runtime.sendMessage({
    action: 'showNotification',
    title: 'Job Detected!',
    message: 'Click the extension to create a resume for this job.'
  });
}

/**
 * Check job availability and update state
 */
function checkJobAvailability() {
  const jobAvailable = isJobAvailable();
  
  if (jobAvailable !== isJobOpen) {
    isJobOpen = jobAvailable;
    
    if (isJobOpen) {
      showJobNotification();
      currentJobData = extractJobData();
    } else {
      currentJobData = null;
    }
    
    // Notify popup of state change
    chrome.runtime.sendMessage({
      action: 'jobAvailabilityChanged',
      available: isJobOpen,
      jobData: currentJobData
    });
  }
}

// Debounced check function
function debouncedCheck() {
  clearTimeout(window.jobCheckTimeout);
  window.jobCheckTimeout = setTimeout(checkJobAvailability, 500);
}

// Set up DOM observer
const observer = new MutationObserver(debouncedCheck);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Message listener for popup requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getJobData':
      sendResponse({
        available: isJobOpen,
        jobData: currentJobData
      });
      break;
      
    case 'extractJobData':
      const jobData = extractJobData();
      sendResponse({
        success: !!jobData,
        jobData: jobData
      });
      break;
  }
  return true;
});

// Initialize
setTimeout(checkJobAvailability, 1000);
setInterval(checkJobAvailability, 2000);

console.log('WaterlooWorks Resume Builder loaded');
