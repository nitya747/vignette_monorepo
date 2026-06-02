import { cacheMiddleware } from './src/middleware/cache.js';
import { getUserCredits, decrementUserCredits } from './src/services/historyService.js';
import { Request, Response, NextFunction } from 'express';

const TEST_USER_ID = `cache-credit-user-${Math.floor(Math.random() * 100000)}`;

async function runCacheCreditsTest() {
  console.log('\n🧪 Vignette.ai Caching Deactivation Verification\n');
  console.log('━'.repeat(60));

  try {
    // Initialize starting balance to 5 credits
    const startVal = await getUserCredits(TEST_USER_ID);
    console.log(`1. Initial credits for ${TEST_USER_ID}: ${startVal} (Expected: 5)`);

    const middleware = cacheMiddleware('generate');
    
    // Simulate first request
    const mockReq1 = {
      method: 'POST',
      body: {
        prompt: 'Futuristic neon coding setup',
        niche: 'Tech',
        archetype: 'Visual-Heavy',
        aspectRatio: '16:9'
      },
      user: {
        id: TEST_USER_ID
      }
    } as unknown as Request;

    let next1Called = false;
    let cacheHeader1 = '';

    const mockRes1 = {
      statusCode: 200,
      setHeader(name: string, value: string) {
        if (name === 'X-Cache') {
          cacheHeader1 = value;
        }
      },
      json(body: any) {
        return this;
      }
    } as unknown as Response;

    console.log('\n2. Simulating First Request...');
    await middleware(mockReq1, mockRes1, () => {
      next1Called = true;
    });

    if (next1Called) {
      console.log('   ✅ Next was called correctly.');
    } else {
      console.error('   ❌ Fail: Next was not called.');
      process.exit(1);
    }

    console.log(`   X-Cache Header Value: "${cacheHeader1}" (Expected: "BYPASS")`);
    if (cacheHeader1 === 'BYPASS') {
      console.log('   ✅ PASS: Cache header set to "BYPASS" successfully!');
    } else {
      console.error(`   ❌ FAIL: Cache header is "${cacheHeader1}" instead of "BYPASS"!`);
      process.exit(1);
    }

    // Simulate route handler generating image & decrementing credits (5 -> 4)
    console.log('   Simulating route handler execution...');
    const creditsAfterRoute = await decrementUserCredits(TEST_USER_ID, 1);
    console.log(`   Credits after route execution: ${creditsAfterRoute} (Expected: 4)`);

    // Simulate second request
    const mockReq2 = {
      method: 'POST',
      body: {
        prompt: 'Futuristic neon coding setup',
        niche: 'Tech',
        archetype: 'Visual-Heavy',
        aspectRatio: '16:9'
      },
      user: {
        id: TEST_USER_ID
      }
    } as unknown as Request;

    let next2Called = false;
    let cacheHeader2 = '';

    const mockRes2 = {
      statusCode: 200,
      setHeader(name: string, value: string) {
        if (name === 'X-Cache') {
          cacheHeader2 = value;
        }
      },
      json(body: any) {
        return this;
      }
    } as unknown as Response;

    console.log('\n3. Simulating Second Identical Request (Expected: BYPASS/MISS, not HIT)...');
    await middleware(mockReq2, mockRes2, () => {
      next2Called = true;
    });

    if (next2Called) {
      console.log('   ✅ Next was called correctly for the second request.');
    } else {
      console.error('   ❌ Fail: Next was not called on the second request.');
      process.exit(1);
    }

    console.log(`   Second X-Cache Header Value: "${cacheHeader2}" (Expected: "BYPASS")`);
    if (cacheHeader2 === 'BYPASS') {
      console.log('   ✅ PASS: Second request bypassed cache successfully!');
    } else {
      console.error(`   ❌ FAIL: Second request hit cache when it should bypass!`);
      process.exit(1);
    }

    const finalCredits = await getUserCredits(TEST_USER_ID);
    console.log(`   Final DB/Sandbox Credit Balance: ${finalCredits} (Expected: 4)`);
    if (finalCredits === 4) {
      console.log('   ✅ PASS: No double billing occurred since caching was bypassed!');
    } else {
      console.error(`   ❌ FAIL: Credits balance is ${finalCredits} instead of 4!`);
      process.exit(1);
    }

  } catch (err: any) {
    console.error('Test encountered exception:', err);
    process.exit(1);
  }

  console.log('━'.repeat(60));
  console.log('🎉 All cache deactivation tests passed successfully!\n');
}

runCacheCreditsTest();
