import { refinePromptWithLLM } from './src/services/promptRefinementService.js';

async function runTest() {
  const payload = {
    prompt: 'how to learn eb dev in 2026',
    title: 'how to learn eb dev in 2026',
    topic: 'how to learn eb dev in 2026',
    keywords: 'web development, coding, programming, roadmap',
    niche: 'education',
    archetype: 'hero',
    aspectRatio: '16:9' as const
  };
  const result = await refinePromptWithLLM(payload);
  console.log('--- REFINED PROMPT START ---');
  console.log(result);
  console.log('--- REFINED PROMPT END ---');
}

runTest().catch(console.error);
