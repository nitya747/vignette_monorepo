import { saveGeneration } from './src/services/historyService.js';

async function testExactInsert() {
  console.log('--- Testing exact insert for user b24d7faf-92ac-4eaf-9a74-f2c0f3434344 ---');
  try {
    const result = await saveGeneration({
      userId: 'b24d7faf-92ac-4eaf-9a74-f2c0f3434344',
      videoId: 'dQw4w9WgXcQ',
      title: 'A cooking series called "$10 Dinners"',
      prompt: 'Luxury kitchen layout...',
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      niche: 'cooking',
      archetype: 'versus',
      aspectRatio: '16:9',
      provider: 'Mock Engine (Auto-Fallback)',
      analysis: {
        score: 80,
        strengths: ['Strength 1'],
        weaknesses: ['Weakness 1'],
        suggestions: ['Suggestion 1'],
        roast: ['Roast 1'],
        attentionHierarchy: ['Primary', 'Secondary'],
        suggestedTitles: ['Title 1']
      }
    });
    console.log('Result of saveGeneration:', result);
  } catch (err) {
    console.error('Exception during saveGeneration:', err);
  }
}

testExactInsert();
