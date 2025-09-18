// Test script to verify job creation API
// Run this in the browser console while signed in to test the API

async function testJobCreation() {
  try {
    console.log('Testing job creation API...');
    
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        title: 'Test Job',
        company: 'Test Company',
        description: 'This is a test job description',
        source: 'extension',
        extractedAt: new Date().toISOString()
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);

    if (result.success) {
      console.log('✅ Job created successfully:', result.data);
      
      // Test fetching jobs
      const fetchResponse = await fetch('/api/jobs', {
        method: 'GET',
        credentials: 'include'
      });
      
      const fetchResult = await fetchResponse.json();
      console.log('✅ Jobs fetched:', fetchResult);
    } else {
      console.error('❌ Job creation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testJobCreation();