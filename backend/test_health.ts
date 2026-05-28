import fetch from 'node-fetch';

async function testHealth() {
  try {
    const res = await fetch('http://localhost:5000/api/health');
    const json = await res.json();
    console.log('Health JSON:', json);
  } catch (err: any) {
    console.error('Error fetching health:', err.message);
  }
}

testHealth();
