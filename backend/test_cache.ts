import { cacheMiddleware } from './src/middleware/cache.js';
import { Request, Response } from 'express';

async function runCacheTest() {
  console.log('\n🧪 Vignette.ai Caching Deactivation Verification\n');
  console.log('━'.repeat(60));

  const middleware = cacheMiddleware('extract');
  
  const mockReq = {
    method: 'POST',
    body: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  } as unknown as Request;

  let nextCalled = false;
  let cacheHeader = '';

  const mockRes = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      if (name === 'X-Cache') {
        cacheHeader = value;
      }
    },
    json(body: any) {
      return this;
    }
  } as unknown as Response;

  console.log('🔍 Executing cache middleware test...');
  await middleware(mockReq, mockRes, () => {
    nextCalled = true;
  });

  if (nextCalled) {
    console.log('   ✅ Next was called successfully.');
  } else {
    console.error('   ❌ Failure: Next was not called by cache middleware.');
    process.exit(1);
  }

  console.log(`   X-Cache Header: "${cacheHeader}" (Expected: "BYPASS")`);
  if (cacheHeader === 'BYPASS') {
    console.log('   ✅ PASS: Caching deactivation successfully verified!');
  } else {
    console.error(`   ❌ FAIL: Caching is still active (Header: "${cacheHeader}")!`);
    process.exit(1);
  }

  console.log('\n' + '━'.repeat(60));
  console.log('✅ Caching deactivation test completed successfully!\n');
}

runCacheTest().catch(err => {
  console.error('Fatal caching test execution error:', err);
  process.exit(1);
});
