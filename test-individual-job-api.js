// Test the individual job API endpoint
const jobId = 'test-job-1757863290489'; // From the test data creation

async function testJobAPI() {
  try {
    console.log('Testing GET /api/jobs/' + jobId);
    
    const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('Response body:', result);

    if (response.ok) {
      const jobData = JSON.parse(result);
      if (jobData.success) {
        console.log('✅ Job API is working');
        console.log('✅ Job data:', jobData.data);
      } else {
        console.log('❌ Job API returned error:', jobData.error);
      }
    } else {
      console.log('❌ Job API failed with status:', response.status);
    }

  } catch (error) {
    console.error('❌ Error testing job API:', error);
  }
}

testJobAPI();