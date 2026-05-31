import { cacheMiddleware } from './src/middleware/cache.js';
import { getUserCredits, decrementUserCredits } from './src/services/historyService.js';
import { Request, Response } from 'express';
import { Redis } from '@upstash/redis';
import { config } from './src/config/index.js';

const TEST_USER_ID = `cache-credit-user-${Math.floor(Math.random() * 100000)}`;

// The hash for our request body will map to this redisKey
const REDIS_KEY = 'vignette:cache:generate:9cf93775d0d86ac41168948f1ea0ff946b2f83adfbb3bc9316f9a5be3facc55f';

async function runCacheCreditsTest() {
  console.log('\n🧪 Vignette.ai Cache Credit Spending Verification\n');
  console.log('━'.repeat(60));

  let redis: Redis | null = null;
  const isRedisConfigured = 
    config.upstashRedisUrl && 
    config.upstashRedisToken && 
    config.upstashRedisUrl !== 'your_upstash_redis_url_here';

  if (isRedisConfigured) {
    try {
      redis = new Redis({
        url: config.upstashRedisUrl!,
        token: config.upstashRedisToken!,
      });
      console.log('🧹 Persistent Upstash Redis detected. Clearing test cache key to prevent pre-cached hits...');
      await redis.del(REDIS_KEY);
      console.log('   ✅ Test key cleared successfully.');
    } catch (err) {
      console.warn('   ⚠️ Failed to pre-clear Upstash Redis key (continuing):', err);
    }
  }

  try {
    // Initialize starting balance to 5 credits
    const startVal = await getUserCredits(TEST_USER_ID);
    console.log(`1. Initial credits for ${TEST_USER_ID}: ${startVal} (Expected: 5)`);

    const middleware = cacheMiddleware('generate');
    
    // Simulate first request (MISS)
    const mockReqMiss = {
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

    let missResponseBody: any = null;
    let nextCalled = false;

    const mockResMiss = {
      statusCode: 200,
      setHeader() {},
      json(body: any) {
        missResponseBody = body;
        return this;
      }
    } as unknown as Response;

    const mockNext = () => {
      nextCalled = true;
    };

    console.log('\n2. Injecting Cache Miss...');
    await middleware(mockReqMiss, mockResMiss, mockNext);

    if (nextCalled) {
      console.log('   ✅ Next was called correctly for Cache Miss.');
    } else {
      console.error('   ❌ Fail: Next was not called on Cache Miss.');
      process.exit(1);
    }

    // Simulate route handler generating image & decrementing credits (5 -> 4)
    console.log('   Simulating route handler execution...');
    const creditsAfterRoute = await decrementUserCredits(TEST_USER_ID, 1);
    const mockRouteResponse = {
      imageUrl: 'https://vignette.ai/preset-image.jpg',
      provider: 'Mock Engine',
      remainingCredits: creditsAfterRoute
    };

    // Route handler calls res.json
    mockResMiss.json(mockRouteResponse);
    console.log('   Route returned to client:', JSON.stringify(missResponseBody));

    // Verify cache has stored the payload WITHOUT remainingCredits
    console.log('\n3. Verifying stored cache payload is clean...');
    // We can simulate a cache hit by creating a request without auth (guest) which won't trigger decrement
    const mockReqGuest = {
      method: 'POST',
      body: {
        prompt: 'Futuristic neon coding setup',
        niche: 'Tech',
        archetype: 'Visual-Heavy',
        aspectRatio: '16:9'
      },
      user: null
    } as unknown as Request;

    let guestResponseBody: any = null;
    const mockResGuest = {
      statusCode: 200,
      setHeader() {},
      json(body: any) {
        guestResponseBody = body;
        return this;
      }
    } as unknown as Response;

    await middleware(mockReqGuest, mockResGuest, () => {});

    console.log('   Guest Cache Hit Response:', JSON.stringify(guestResponseBody));
    if (guestResponseBody && guestResponseBody.imageUrl === 'https://vignette.ai/preset-image.jpg' && guestResponseBody.remainingCredits === undefined) {
      console.log('   ✅ PASS: Cache stored clean response without remainingCredits!');
    } else {
      console.error('   ❌ FAIL: Cache payload either missing or contains remainingCredits!', guestResponseBody);
      process.exit(1);
    }

    // Simulate second request (HIT) with auth user
    console.log('\n4. Simulating Authenticated User Cache Hit (Expected: credit decrement 4 -> 3)...');
    const mockReqHit = {
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

    let hitResponseBody: any = null;
    const mockResHit = {
      statusCode: 200,
      setHeader() {},
      json(body: any) {
        hitResponseBody = body;
        return this;
      }
    } as unknown as Response;

    await middleware(mockReqHit, mockResHit, () => {});

    console.log('   Authenticated Cache Hit Response:', JSON.stringify(hitResponseBody));
    
    const dbCredits = await getUserCredits(TEST_USER_ID);
    console.log(`   Final DB/Sandbox Credit Balance: ${dbCredits} (Expected: 3)`);

    if (hitResponseBody && hitResponseBody.remainingCredits === 3 && dbCredits === 3) {
      console.log('   ✅ PASS: Credits successfully billed on cache hit, and correct remainingCredits returned!');
    } else {
      console.error('   ❌ FAIL: Billed credits on cache hit or response credits mismatch!', hitResponseBody);
      process.exit(1);
    }

    // Post-test cleanup
    if (redis) {
      console.log('\n🧹 Cleaning up test key in Redis...');
      await redis.del(REDIS_KEY);
      console.log('   ✅ Cleaned up.');
    }

  } catch (err: any) {
    console.error('Test encountered exception:', err);
    process.exit(1);
  }

  console.log('━'.repeat(60));
  console.log('🎉 All cache-credits integration tests passed successfully!\n');
}

runCacheCreditsTest();
