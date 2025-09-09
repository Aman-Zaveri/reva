# Chrome Extension for Resume Builder

This Chrome extension automatically creates resumes from WaterlooWorks job postings using your local Resume Manager API.

## Features

- **Automatic Job Detection**: Detects when you're viewing a job on WaterlooWorks
- **Smart Resume Creation**: Extracts job details and creates optimized resumes
- **Real-time Status**: Shows loading states and completion notifications
- **Seamless Integration**: Works with your existing Resume Manager application

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this `chrome-extension` folder
4. The extension will appear in your toolbar

## Usage

1. Navigate to WaterlooWorks: `https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm`
2. Click on a job to open the job details popup
3. Click the Resume Builder extension icon in your toolbar
4. When a job is detected, click "Create Resume"
5. Wait for the resume to be created (loading indicator will show)
6. Once complete, you can access your new resume in the Resume Manager

## Configuration

### Job Selectors
Before using the extension, you need to update the CSS selectors in `content.js` to match WaterlooWorks' actual structure:

```javascript
const SELECTORS = {
  jobTitle: '.job-title-selector',        // Update with actual selector
  company: '.company-name-selector',      // Update with actual selector  
  description: '.job-description-selector', // Update with actual selector
  skills: '.required-skills-selector',    // Update with actual selector
  jobPopup: '.job-popup-container'        // Update with actual selector
};
```

### API Endpoint
The extension connects to your local Resume Manager API at `http://localhost:3000/api/optimize-resume`. Make sure your Resume Manager is running when using the extension.

## How It Works

1. **Content Script**: Monitors WaterlooWorks for job popups and extracts job data
2. **Background Script**: Handles API communication with your Resume Manager
3. **Popup**: Provides user interface for creating resumes
4. **Storage**: Tracks resume creation status and history

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Page monitoring and data extraction
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── icons/                # Extension icons (add your own)
└── README.md             # This file
```

## Requirements

- Chrome browser (Manifest V3 compatible)
- Resume Manager running on `http://localhost:3000`
- Access to WaterlooWorks

## Troubleshooting

- **Extension not working**: Refresh the WaterlooWorks page and try again
- **Job not detected**: Verify the CSS selectors match the current page structure
- **API errors**: Ensure your Resume Manager is running and accessible
- **Permissions**: Make sure the extension has permission to access WaterlooWorks

## Next Steps

1. Update the CSS selectors for WaterlooWorks
2. Add custom icons to the `icons/` folder
3. Test the extension thoroughly
4. Consider adding more job sites in the future
