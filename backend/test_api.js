import fetch from 'node-fetch';

async function runTests() {
  const token = `Bearer guest-sandbox-token-${Math.floor(Math.random() * 100000)}`;
  let savedId = '';
  
  try {
    // 1. Health check
    console.log('\n1. Testing GET /api/health...');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    console.log('Status:', healthRes.status);
    console.log('Body:', JSON.stringify(healthData, null, 2));

    // 2. Metadata Extract
    console.log('\n2. Testing POST /api/extract (First Fetch)...');
    const extractRes1 = await fetch('http://localhost:5000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      })
    });
    const extractData1 = await extractRes1.json();
    console.log('Status:', extractRes1.status);
    console.log('X-Cache:', extractRes1.headers.get('X-Cache'));

    // 3. Image Generation
    console.log('\n3. Testing POST /api/generate...');
    const generateRes = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        prompt: 'A premium sleek tech workspace in high-end studio lighting',
        niche: 'tech',
        archetype: 'hero',
        aspectRatio: '16:9'
      })
    });
    const generateData = await generateRes.json();
    console.log('Status:', generateRes.status);
    console.log('Body:', JSON.stringify(generateData, null, 2));

    // 4. CTR Analysis
    console.log('\n4. Testing POST /api/analyze...');
    const analyzeRes = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        title: 'How to scale standard web apps to $10M ARR in 2026',
        topic: 'A walkthrough on tech startups and high ARR scaling secrets',
        keywords: 'startup, ARR, scale, software',
        niche: 'finance',
        archetype: 'hero'
      })
    });
    const analyzeData = await analyzeRes.json();
    console.log('Status:', analyzeRes.status);

    // 5. Save generation (POST /api/history)
    console.log('\n5. Testing POST /api/history (Saving Generation)...');
    const saveRes = await fetch('http://localhost:5000/api/history', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        videoId: 'dQw4w9WgXcQ',
        title: 'How to scale standard web apps to $10M ARR in 2026',
        prompt: 'YouTube thumbnail, 16:9 aspect ratio...',
        imageUrl: generateData.imageUrl,
        niche: 'finance',
        archetype: 'hero',
        aspectRatio: '16:9',
        provider: generateData.provider,
        analysis: analyzeData
      })
    });
    const saveData = await saveRes.json();
    console.log('Status:', saveRes.status);
    console.log('Saved Item Body:', JSON.stringify(saveData, null, 2));
    savedId = saveData.id;

    // 6. List history (GET /api/history)
    console.log('\n6. Testing GET /api/history (Listing Library)...');
    const listRes = await fetch('http://localhost:5000/api/history?page=1&limit=5', {
      method: 'GET',
      headers: { 'Authorization': token }
    });
    const listData = await listRes.json();
    console.log('Status:', listRes.status);
    console.log('Library Count:', listData.total);
    console.log('First Item ID:', listData.items[0]?.id);

    // 7. Get single generation (GET /api/history/:id)
    console.log(`\n7. Testing GET /api/history/${savedId} (Fetch Details)...`);
    const singleRes = await fetch(`http://localhost:5000/api/history/${savedId}`, {
      method: 'GET',
      headers: { 'Authorization': token }
    });
    const singleData = await singleRes.json();
    console.log('Status:', singleRes.status);
    console.log('Fetched Score:', singleData.analysis?.score);

    // 8. Delete generation (DELETE /api/history/:id)
    console.log(`\n8. Testing DELETE /api/history/${savedId} (Removal)...`);
    const deleteRes = await fetch(`http://localhost:5000/api/history/${savedId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });
    console.log('Status:', deleteRes.status);

    // 9. Confirm deletion
    console.log(`\n9. Confirming deletion GET /api/history/${savedId}...`);
    const confirmRes = await fetch(`http://localhost:5000/api/history/${savedId}`, {
      method: 'GET',
      headers: { 'Authorization': token }
    });
    console.log('Status (Expected 404):', confirmRes.status);

    console.log('\n--- All API Integration Tests Completed! ---');
  } catch (error) {
    console.error('API Verification Test Failed:', error);
    process.exit(1);
  }
}

runTests();
