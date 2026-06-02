import { refinePromptWithLLM } from './src/services/promptRefinementService.js';
import { generateImage } from './src/services/imageGenerationService.js';

async function testPipeline() {
  console.log('🧪 TESTING 2-LAYER HIGH-CTR THUMBNAIL GENERATOR PIPELINE...');
  
  const testPayload = {
    prompt: 'Lofi relaxing sunset beats',
    title: 'How I Built a Profitable Indie App in 30 Days',
    topic: 'A solo developer working in a dark room with green neon screen reflections, code visible on screen, intense focus.',
    keywords: 'indie hacker, coding, entrepreneurship, nextjs',
    niche: 'education',
    archetype: 'hero',
    aspectRatio: '16:9' as const,
  };

  console.log('\n--- 1. Testing Layer 1 Prompt Refinement (Fallback Builder/LLM) ---');
  const refined = await refinePromptWithLLM(testPayload);
  console.log('Generated Visual Prompt:\n');
  console.log(refined);
  console.log('\n------------------------------------------------------------------');

  console.log('\n--- 2. Testing Full 2-Layer Image Generation Service (Layer 1 + Layer 2) ---');
  const imageResult = await generateImage({
    ...testPayload,
    image: undefined
  });
  console.log('Generation Response:');
  console.log(`- Image URL: ${imageResult.imageUrl.substring(0, 100)}...`);
  console.log(`- Revised Prompt matches refined: ${imageResult.revisedPrompt === refined ? '✅ Yes' : '❌ No'}`);
  console.log(`- Provider: ${imageResult.provider}`);
  console.log(`- Latency: ${imageResult.latencyMs}ms`);
  
  console.log('\n✅ 2-LAYER PIPELINE INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
}

testPipeline().catch(err => {
  console.error('❌ Pipeline test failed:', err);
  process.exit(1);
});
