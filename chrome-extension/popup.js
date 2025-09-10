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

    // Try to get job data from content script
    chrome.tabs.sendMessage(tab.id, { action: 'getJobData' }, handleJobDataResponse);
  } catch (error) {
    console.error('Error initializing popup:', error);
    updateStatus('Error loading extension', 'error');
  }
}

/**
 * Handle job data response from content script
 */
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
 * Animate progress bar with steps
 */
function animateProgress() {
  const steps = [
    { percentage: 10, text: 'Extracting job data...' },
    { percentage: 25, text: 'Analyzing requirements...' },
    { percentage: 40, text: 'Optimizing content...' },
    { percentage: 60, text: 'Generating sections...' },
    { percentage: 80, text: 'Finalizing resume...' },
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
        updateProgress(100, 'Resume created successfully!');
        setTimeout(() => {
          updateStatus('✅ Resume created! Click below to view', 'success');
          hideProgress();
          
          // Store the created resume data and show view button
          lastCreatedResume = response.data;
          chrome.storage.local.set({
            lastCreatedResume: {
              profile: response.data.profile,
              optimizations: response.data.optimizations,
              timestamp: Date.now(),
              jobData: currentJobData
            }
          });
          
          showViewResumeButton();
        }, 1000);
      } else {
        const errorMessage = response?.error || 'Unknown error';
        updateStatus('❌ Failed: ' + errorMessage, 'error');
      }
    });
  } catch (error) {
    isCreating = false;
    hideLoading();
    updateStatus('❌ Error: ' + error.message, 'error');
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
