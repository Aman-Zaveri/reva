// Popup script for the Chrome extension
document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const jobInfoDiv = document.getElementById('jobInfo');
  const jobTitleSpan = document.getElementById('jobTitle');
  const companyNameSpan = document.getElementById('companyName');
  const jobDescriptionSpan = document.getElementById('jobDescription');
  const createResumeBtn = document.getElementById('createResumeBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const notificationDot = document.getElementById('notificationDot');
  

  let isCreatingResume = false;
  let currentJobData = null;
  let progressInterval = null;
  let lastStatus = null;
  let lastProgress = null;

  // Save popup state to chrome.storage.local
  function savePopupState() {
    chrome.storage.local.set({
      popupState: {
        currentJobData,
        status: lastStatus,
        progress: lastProgress
      }
    });
  }

  // Initialize popup state first, then restore from storage if needed
  initializePopup();

  async function initializePopup() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we're on WaterlooWorks
      if (!tab.url.includes('waterlooworks.uwaterloo.ca')) {
        updateStatus('This extension only works on WaterlooWorks', 'unavailable');
        return;
      }

      // Get job data from content script
      chrome.tabs.sendMessage(tab.id, { action: 'getJobData' }, (response) => {
        if (chrome.runtime.lastError) {
          updateStatus('Please refresh the page', 'unavailable');
          return;
        }
        
        console.log('Response from content script:', response);
        
        if (response && response.available && response.jobData) {
          // Live job detected - use current data
          updateJobInfo(response.jobData);
          updateStatus('<span class="notification-dot"></span>Job found! Ready to create resume', 'available');
          enableCreateButton();
        } else if (response && response.jobData) {
          // Job data exists but not marked as available - still use it
          updateJobInfo(response.jobData);
          updateStatus('<span class="notification-dot"></span>Job found! Ready to create resume', 'available');
          enableCreateButton();
        } else {
          // No current job detected - try to extract job data directly
          chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' }, (extractResponse) => {
            if (extractResponse && extractResponse.success && extractResponse.jobData) {
              // Found job data - use it
              updateJobInfo(extractResponse.jobData);
              updateStatus('<span class="notification-dot"></span>Job found! Ready to create resume', 'available');
              enableCreateButton();
            } else {
              // No job data found - check for saved state
              restoreStateFromStorage();
            }
          });
        }
      });
    } catch (error) {
      console.error('Error initializing popup:', error);
      updateStatus('Error loading extension', 'error');
    }
  }

  // Restore state from storage when no current job is detected
  function restoreStateFromStorage() {
    chrome.storage.local.get(['popupState'], (result) => {
      if (result.popupState) {
        const state = result.popupState;
        if (state.currentJobData) {
          updateJobInfo(state.currentJobData);
          currentJobData = state.currentJobData;
        }
        if (state.status) {
          updateStatus(state.status.message, state.status.type);
          lastStatus = state.status;
        }
        if (state.progress) {
          showProgress(true);
          updateProgress(state.progress.percentage, state.progress.text);
          lastProgress = state.progress;
        }
      } else {
        // No saved state either
        updateStatus('Monitoring for job selection...', 'unavailable');
        disableCreateButton();
      }
    });
  }

  function updateStatus(message, type) {
    statusDiv.innerHTML = message;
    statusDiv.className = `status ${type}`;
    // Show notification dot for certain status types
    if (type === 'available') {
      notificationDot.classList.remove('hidden');
    } else {
      notificationDot.classList.add('hidden');
    }
    lastStatus = { message, type };
    savePopupState();
  }

  function showProgress(show = true) {
    if (show) {
      progressContainer.classList.remove('hidden');
    } else {
      progressContainer.classList.add('hidden');
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    }
  }

  function updateProgress(percentage, text) {
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = text;
  lastProgress = { percentage, text };
  savePopupState();
  }

  function animateProgress(steps) {
    let currentStep = 0;
    const totalSteps = steps.length;
    
    progressInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        const step = steps[currentStep];
        updateProgress(step.percentage, step.text);
        currentStep++;
      } else {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    }, 1000); // Update every second
  }

  function updateJobInfo(jobData) {
    currentJobData = jobData;
    if (jobData) {
      jobTitleSpan.textContent = jobData.title || 'Unknown Position';
      companyNameSpan.textContent = jobData.company || 'Unknown Company';
      jobDescriptionSpan.textContent = jobData.description 
        ? (jobData.description.length > 150 
           ? jobData.description.substring(0, 150) + '...' 
           : jobData.description)
        : 'No description available';
      jobInfoDiv.classList.remove('hidden');
    } else {
      jobInfoDiv.classList.add('hidden');
    }
    savePopupState();
  }

  function enableCreateButton() {
    createResumeBtn.disabled = false;
    createResumeBtn.textContent = 'Create Resume';
  }

  function disableCreateButton() {
    createResumeBtn.disabled = true;
    createResumeBtn.textContent = 'Create Resume';
  }

  function showLoading() {
    createResumeBtn.disabled = true;
    createResumeBtn.innerHTML = '<div class="loading-spinner"></div>Creating Resume...';
    updateStatus('Creating your optimized resume...', 'loading');
    
    // Show progress bar with animated steps
    showProgress(true);
    const progressSteps = [
      { percentage: 10, text: 'Extracting job data...' },
      { percentage: 25, text: 'Analyzing requirements...' },
      { percentage: 40, text: 'Optimizing resume content...' },
      { percentage: 60, text: 'Generating sections...' },
      { percentage: 80, text: 'Finalizing resume...' },
      { percentage: 95, text: 'Almost done...' }
    ];
    animateProgress(progressSteps);
  }

  function hideLoading() {
    createResumeBtn.disabled = false;
    createResumeBtn.innerHTML = 'Create Resume';
    showProgress(false);
  }

  // Create resume button click handler
  createResumeBtn.addEventListener('click', async function() {
    if (isCreatingResume || !currentJobData) {
      return;
    }

    isCreatingResume = true;
    showLoading();

    try {
      // Send message to background script to create resume
      chrome.runtime.sendMessage({
        action: 'createResume',
        jobData: currentJobData
      }, (response) => {
        isCreatingResume = false;
        hideLoading();

        if (chrome.runtime.lastError) {
          updateStatus('Error: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (response && response.success) {
          updateProgress(100, 'Resume created successfully!');
          setTimeout(() => {
            updateStatus('✅ Resume created successfully! Go to Resume Manager to view and analyze.', 'success');
            showProgress(false);
          }, 1000);
          
          // Store success state
          chrome.storage.local.set({
            lastResumeCreation: {
              success: true,
              timestamp: Date.now(),
              jobData: currentJobData,
              optimizationResult: response.data
            }
          });
          
        } else {
          const errorMessage = response?.error || 'Unknown error occurred';
          updateStatus('❌ Failed to create resume: ' + errorMessage, 'error');
          showProgress(false);
        }
      });

    } catch (error) {
      isCreatingResume = false;
      hideLoading();
      updateStatus('❌ Error: ' + error.message, 'error');
    }
  });

  // Listen for job availability changes
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'jobAvailabilityChanged') {
      if (request.available && request.jobData) {
        updateJobInfo(request.jobData);
        updateStatus('<span class="notification-dot"></span>Job detected! Ready to create resume', 'available');
        enableCreateButton();
      } else {
        updateStatus('Monitoring for job selection...', 'unavailable');
        disableCreateButton();
        hideJobInfo();
      }
    }
  });

  function hideJobInfo() {
    jobInfoDiv.classList.add('hidden');
    currentJobData = null;
    savePopupState();
  }

  // Refresh button functionality (hidden, but can be triggered)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
      e.preventDefault();
      initializePopup();
    }
  });
});
