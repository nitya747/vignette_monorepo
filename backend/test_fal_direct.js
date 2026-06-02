import fetch from 'node-fetch';

async function testFalDirect() {
  const falKey = '19ee7ab8-daa1-47e6-b6d3-8e439901a6df:fd3ad899102741f0215e12ac7e005632';
  const endpoint = 'https://fal.run/fal-ai/gemini-3.1-flash-image-preview';
  
  console.log('Sending request to fal.ai...');
  const startTime = Date.now();
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A cozy ambient lofi room at sunset',
        sync_mode: true,
        aspect_ratio: '16:9'
      })
    });
    
    console.log('Status:', response.status);
    const latency = Date.now() - startTime;
    console.log('Latency:', latency, 'ms');
    
    const text = await response.text();
    console.log('Response body:', text);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testFalDirect();
