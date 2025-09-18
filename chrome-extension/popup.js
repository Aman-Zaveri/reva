/**
 * WaterlooWorks Resume Builder - Popup Script
 * Handles the extension popup UI and interactions
 */

// DOM elements
const elements = {
  status: document.getElementById('status'),
  jobInfo: document.getElementById('jobInfo'),
  jobTitle: document.getElementById('jobTitle'),
  companyName: document.getElementById('companyName'),
  summaryStatus: document.getElementById('summaryStatus'),
  responsibilitiesStatus: document.getElementById('responsibilitiesStatus'),
  skillsStatus: document.getElementById('skillsStatus'),
  createBtn: document.getElementById('createResumeBtn'),
  viewResumeBtn: document.getElementById('viewResumeBtn'),
  progressContainer: document.getElementById('progressContainer'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  notificationDot: document.getElementById('notificationDot')
};

// State
let currentJobData = null;
let isCreating = false;
let lastCreatedResume = null;
let isAuthenticated = false;
let authCheckInProgress = false;
let authRefreshInterval = null;

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', initializePopup);

/**
 * Initialize the popup
 */
async function initializePopup() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on WaterlooWorks
    if (!tab.url.includes('waterlooworks.uwaterloo.ca')) {
      updateStatus('This extension only works on WaterlooWorks', 'unavailable');
      return;
    }

    // First check authentication status
    await checkAuthenticationStatus();

    // If not authenticated, don't proceed with job detection
    if (!isAuthenticated) {
      return;
    }

    // Try to get job data from content script
    chrome.tabs.sendMessage(tab.id, { action: 'getJobData' }, handleJobDataResponse);
  } catch (error) {
    console.error('Error initializing popup:', error);
    updateStatus('Error loading extension', 'error');
  }
}

/**
 * Check authentication status with retry logic
 */
async function checkAuthenticationStatus(retryCount = 0) {
  if (authCheckInProgress) return;
  
  authCheckInProgress = true;
  updateStatus('Checking authentication...', 'loading');

  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      credentials: 'include', // Include session cookies
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      isAuthenticated = true;
      updateStatus('Ready to create resumes! 🎯', 'authenticated');
      
      // Remove any existing buttons
      const signInBtn = document.getElementById('signInBtn');
      const setupBtn = document.getElementById('setupProfileBtn');
      if (signInBtn) signInBtn.remove();
      if (setupBtn) setupBtn.remove();
      
      // Start periodic auth refresh during long operations
      startAuthRefresh();
    } else {
      isAuthenticated = false;
      showAuthenticationRequired();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    
    // Retry auth check once if it fails
    if (retryCount === 0) {
      console.log('Retrying authentication check...');
      setTimeout(() => {
        authCheckInProgress = false;
        checkAuthenticationStatus(1);
      }, 2000);
      return;
    }
    
    isAuthenticated = false;
    updateStatus('Cannot connect to Resume Manager. Is it running?', 'error');
  } finally {
    authCheckInProgress = false;
  }
}

/**
 * Start periodic authentication refresh during long operations
 */
function startAuthRefresh() {
  // Clear any existing interval
  if (authRefreshInterval) {
    clearInterval(authRefreshInterval);
  }
  
  // Check auth every 30 seconds during operations
  authRefreshInterval = setInterval(() => {
    if (isCreating) {
      checkAuthenticationStatus();
    }
  }, 30000); // 30 seconds
}

/**
 * Stop auth refresh when not needed
 */
function stopAuthRefresh() {
  if (authRefreshInterval) {
    clearInterval(authRefreshInterval);
    authRefreshInterval = null;
  }
}

/**
 * Show incomplete profile message with guidance
 */
function showIncompleteProfileMessage(errorMessage) {
  elements.jobInfo.classList.add('hidden');
  disableCreateButton();
  
  // Remove any existing buttons
  const existingBtn = document.getElementById('setupProfileBtn');
  if (existingBtn) {
    existingBtn.remove();
  }
  
  // Add setup profile button
  const setupBtn = document.createElement('button');
  setupBtn.id = 'setupProfileBtn';
  setupBtn.className = 'auth-btn';
  setupBtn.innerHTML = '📝 Complete Your Profile';
  setupBtn.title = errorMessage;
  setupBtn.onclick = () => {
    chrome.tabs.create({ url: 'http://localhost:3000/import-resume' });
  };
  
  elements.createBtn.parentNode.insertBefore(setupBtn, elements.createBtn.nextSibling);
}

/**
 * Show authentication required message
 */
function showAuthenticationRequired() {
  updateStatus('Please sign in to Resume Manager first', 'auth-required');
  elements.jobInfo.classList.add('hidden');
  disableCreateButton();
  
  // Remove any existing buttons
  const existingSignInBtn = document.getElementById('signInBtn');
  const existingSetupBtn = document.getElementById('setupProfileBtn');
  if (existingSignInBtn) existingSignInBtn.remove();
  if (existingSetupBtn) existingSetupBtn.remove();
  
  // Add sign-in button
  const signInBtn = document.createElement('button');
  signInBtn.id = 'signInBtn';
  signInBtn.className = 'auth-btn';
  signInBtn.innerHTML = '🔐 Sign In to Resume Manager';
  signInBtn.onclick = () => {
    chrome.tabs.create({ url: 'http://localhost:3000/auth/signin' });
  };
  
  elements.createBtn.parentNode.insertBefore(signInBtn, elements.createBtn.nextSibling);
}
function handleJobDataResponse(response) {
  if (chrome.runtime.lastError) {
    updateStatus('Please refresh the page', 'unavailable');
    return;
  }

  if (response?.jobData) {
    showJobData(response.jobData);
    updateStatus('Job found! Ready to create resume', 'available');
    enableCreateButton();
  } else {
    // Try direct extraction
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' }, (extractResponse) => {
        if (extractResponse?.success && extractResponse.jobData) {
          showJobData(extractResponse.jobData);
          updateStatus('Job found! Ready to create resume', 'available');
          enableCreateButton();
        } else {
          restoreFromStorage();
        }
      });
    });
  }
}

/**
 * Restore state from storage when no current job is detected
 */
function restoreFromStorage() {
  chrome.storage.local.get(['popupState', 'lastCreatedResume'], (result) => {
    if (result.popupState?.currentJobData) {
      showJobData(result.popupState.currentJobData);
      updateStatus('Previous job data available', 'available');
      enableCreateButton();
    } else {
      updateStatus('Monitoring for job selection...', 'unavailable');
      disableCreateButton();
    }
    
    // Check if there's a recently created resume to show
    if (result.lastCreatedResume) {
      lastCreatedResume = result.lastCreatedResume;
      showViewResumeButton();
    }
  });
}

/**
 * Update status display
 */
function updateStatus(message, type) {
  elements.status.innerHTML = message;
  elements.status.className = `status ${type}`;
  
  // Show/hide notification dot
  if (type === 'available') {
    elements.notificationDot.classList.remove('hidden');
  } else {
    elements.notificationDot.classList.add('hidden');
  }
  
  // Handle authentication-specific styling
  if (type === 'auth-required') {
    elements.status.style.color = '#f59e0b';
    elements.status.style.fontWeight = 'bold';
  } else if (type === 'authenticated') {
    elements.status.style.color = '#10b981';
    elements.status.style.fontWeight = 'normal';
  } else if (type === 'loading') {
    elements.status.style.color = '#6b7280';
    elements.status.style.fontWeight = 'normal';
  }
  
  saveState();
}

/**
 * Show job data in the UI
 */
function showJobData(jobData) {
  currentJobData = jobData;
  
  elements.jobTitle.textContent = jobData.title || 'Unknown Position';
  elements.companyName.textContent = jobData.company || 'Unknown Company';
  
  // Update section status indicators
  updateSectionStatus('summaryStatus', jobData.sections?.rawDescription);
  updateSectionStatus('responsibilitiesStatus', jobData.sections?.rawResponsibilities);
  updateSectionStatus('skillsStatus', jobData.sections?.rawSkills);
  
  elements.jobInfo.classList.remove('hidden');
  saveState();
}

/**
 * Update section status indicator
 */
function updateSectionStatus(elementId, content) {
  const element = elements[elementId];
  if (!element) return;
  
  if (content && content.trim()) {
    element.textContent = 'Found';
    element.className = 'status-indicator found';
  } else {
    element.textContent = 'Not found';
    element.className = 'status-indicator not-found';
  }
}

/**
 * Enable create button
 */
function enableCreateButton() {
  elements.createBtn.disabled = false;
  elements.createBtn.textContent = 'Create Resume';
}

/**
 * Disable create button
 */
function disableCreateButton() {
  elements.createBtn.disabled = true;
  elements.createBtn.textContent = 'Create Resume';
}

/**
 * Show view resume button
 */
function showViewResumeButton() {
  elements.viewResumeBtn.classList.remove('hidden');
}

/**
 * Hide view resume button
 */
function hideViewResumeButton() {
  elements.viewResumeBtn.classList.add('hidden');
}

/**
 * Show loading state during resume creation
 */
function showLoading() {
  elements.createBtn.disabled = true;
  elements.createBtn.innerHTML = '<div class="loading-spinner"></div>Creating Resume...';
  updateStatus('Creating your optimized resume...', 'loading');
  
  showProgress();
  animateProgress();
}

/**
 * Hide loading state
 */
function hideLoading() {
  elements.createBtn.disabled = false;
  elements.createBtn.innerHTML = 'Create Resume';
  hideProgress();
}

/**
 * Show progress bar
 */
function showProgress() {
  elements.progressContainer.classList.remove('hidden');
}

/**
 * Hide progress bar
 */
function hideProgress() {
  elements.progressContainer.classList.add('hidden');
}

/**
 * Animate progress bar with steps including AI Resume Builder
 */
function animateProgress() {
  const steps = [
    { percentage: 10, text: 'Extracting job data...' },
    { percentage: 25, text: 'Analyzing requirements...' },
    { percentage: 35, text: 'AI selecting best experiences...' },
    { percentage: 50, text: 'AI selecting relevant projects...' },
    { percentage: 65, text: 'Optimizing content...' },
    { percentage: 80, text: 'Generating sections...' },
    { percentage: 90, text: 'Finalizing resume...' },
    { percentage: 95, text: 'Almost done...' }
  ];

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      updateProgress(step.percentage, step.text);
      currentStep++;
    } else {
      clearInterval(interval);
    }
  }, 1000);
}

/**
 * Update progress bar
 */
function updateProgress(percentage, text) {
  elements.progressFill.style.width = `${percentage}%`;
  elements.progressText.textContent = text;
}

/**
 * Save current state to storage
 */
function saveState() {
  chrome.storage.local.set({
    popupState: {
      currentJobData,
      timestamp: Date.now()
    }
  });
}

/**
 * Create resume button click handler
 */
elements.createBtn.addEventListener('click', async function() {
  if (isCreating || !currentJobData) return;

  // Double-check authentication before creating resume
  if (!isAuthenticated) {
    await checkAuthenticationStatus();
    if (!isAuthenticated) {
      updateStatus('Please sign in first to create resumes', 'auth-required');
      return;
    }
  }

  isCreating = true;
  showLoading();

  try {
    chrome.runtime.sendMessage({
      action: 'createResume',
      jobData: currentJobData
    }, (response) => {
      isCreating = false;
      hideLoading();

      if (chrome.runtime.lastError) {
        updateStatus('Error: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      if (response?.success) {
        updateProgress(100, 'AI-powered resume created successfully!');
        setTimeout(() => {
          updateStatus('✅ AI Resume created! Click below to view', 'success');
          hideProgress();
          stopAuthRefresh(); // Stop auth refresh since operation is complete
          
          // Store the created resume data and show view button
          lastCreatedResume = response.data;
          chrome.storage.local.set({
            lastCreatedResume: {
              profile: response.data.profile,
              optimizations: response.data.optimizations,
              timestamp: Date.now(),
              jobData: currentJobData,
              aiSelections: response.data.aiSelections || null
            }
          });
          
          showViewResumeButton();
        }, 1000);
      } else {
        const errorMessage = response?.error || 'Unknown error';
        
        // Handle authentication errors specifically
        if (errorMessage.includes('sign in') || errorMessage.includes('authenticated')) {
          isAuthenticated = false;
          updateStatus('❌ Authentication expired. Please sign in again', 'auth-required');
          showAuthenticationRequired();
        } else if (errorMessage.includes('Incomplete profile data') || errorMessage.includes('Please complete your profile')) {
          updateStatus('❌ Profile incomplete. Please add your info first', 'auth-required');
          showIncompleteProfileMessage(errorMessage);
        } else {
          updateStatus('❌ Failed: ' + errorMessage, 'error');
        }
      }
    });
  } catch (error) {
    isCreating = false;
    hideLoading();
    stopAuthRefresh(); // Stop auth refresh on error
    
    // Handle authentication errors
    if (error.message.includes('sign in') || error.message.includes('authenticated')) {
      isAuthenticated = false;
      updateStatus('❌ Please sign in to Resume Manager first', 'auth-required');
      showAuthenticationRequired();
    } else if (error.message.includes('Incomplete profile data') || error.message.includes('Please complete your profile')) {
      updateStatus('❌ Profile incomplete. Please add your info first', 'auth-required');
      showIncompleteProfileMessage(error.message);
    } else {
      updateStatus('❌ Error: ' + error.message, 'error');
    }
  }
});

/**
 * View resume button click handler
 */
elements.viewResumeBtn.addEventListener('click', function() {
  if (!lastCreatedResume) return;
  
  const profileId = lastCreatedResume.profile?.id;
  if (!profileId) return;
  
  // Open the resume builder page with the profile ID and show AI analysis
  const url = `http://localhost:3000/builder/${profileId}?showAnalysis=true`;
  chrome.tabs.create({ url: url });
});

/**
 * Listen for job availability changes from content script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'jobAvailabilityChanged') {
    // Only process job changes if authenticated
    if (!isAuthenticated) {
      updateStatus('Please sign in to Resume Manager first', 'auth-required');
      return;
    }
    
    if (request.available && request.jobData) {
      showJobData(request.jobData);
      updateStatus('Job detected! Ready to create resume', 'available');
      enableCreateButton();
    } else {
      updateStatus('Monitoring for job selection...', 'unavailable');
      disableCreateButton();
      elements.jobInfo.classList.add('hidden');
      currentJobData = null;
    }
  }
  
  // Handle authentication status updates
  if (request.action === 'authenticationChanged') {
    if (request.authenticated) {
      isAuthenticated = true;
      updateStatus('Authentication restored! 🎯', 'authenticated');
      // Remove sign-in button if it exists
      const signInBtn = document.getElementById('signInBtn');
      if (signInBtn) {
        signInBtn.remove();
      }
    } else {
      isAuthenticated = false;
      showAuthenticationRequired();
    }
  }
});

/**
 * Refresh functionality (Ctrl+R or F5)
 */
document.addEventListener('keydown', function(e) {
  if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault();
    initializePopup();
  }
});
