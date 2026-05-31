import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { config } from './src/config/index.js';

const getHash = (payload: any): string => {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

async function runCacheTest() {
  console.log('\n🧪 Vignette.ai Upstash Redis Caching Verification\n');
  console.log('━'.repeat(60));

  const isKeyAvailable = 
    config.upstashRedisUrl && 
    config.upstashRedisToken && 
    config.upstashRedisUrl !== 'your_upstash_redis_url_here';

  if (!isKeyAvailable) {
    console.error('❌ Error: Upstash Redis credentials not detected in .env.local!');
    process.exit(1);
  }

  console.log('🌐 Connecting to Upstash Redis cache instance...');
  console.log(`🔗 URL: ${config.upstashRedisUrl}`);

  try {
    const redis = new Redis({
      url: config.upstashRedisUrl!,
      token: config.upstashRedisToken!,
    });

    // 1. Define a mock request and key
    const mockPayload = {
      prompt: 'Cinematic lofi sunset over mountain peak, extremely warm, highly saturated',
      niche: 'documentary',
      archetype: 'hero',
      aspectRatio: '16:9'
    };
    const key = getHash(mockPayload);
    const redisKey = `vignette:cache:generate:${key}`;
    
    console.log(`\n🔑 Generated Cache Key: ${redisKey}`);

    // 2. Clear any existing key
    console.log('🧹 Clearing potential existing key...');
    await redis.del(redisKey);

    // 3. Simulate first check -> Miss
    console.log('\n🔍 Simulating first query (Expected: MISS)...');
    const cachedData1 = await redis.get(redisKey);
    if (!cachedData1) {
      console.log('   ✅ Result: Cache MISS successfully detected!');
    } else {
      console.error('   ❌ Failure: Cache returned data when it should be empty.');
      process.exit(1);
    }

    // 4. Simulate saving payload back to Redis (TTL 10 seconds)
    const mockResponseBody = {
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
      provider: 'Mock Engine (Test Cache)',
      cachedTimestamp: new Date().toISOString()
    };
    console.log('\n💾 Simulating response injection (Saving to Upstash Redis with 10s TTL)...');
    await redis.set(redisKey, mockResponseBody, { ex: 10 });
    console.log('   ✅ Saved response successfully!');

    // 5. Simulate second check -> Hit
    console.log('\n🔍 Simulating second query (Expected: HIT)...');
    const cachedData2 = await redis.get(redisKey);
    if (cachedData2) {
      console.log('   ✅ Result: Cache HIT successfully detected!');
      console.log('   📦 Retrieved Cached Payload:', JSON.stringify(cachedData2, null, 2));
    } else {
      console.error('   ❌ Failure: Cache returned a MISS after saving data.');
      process.exit(1);
    }

    // 6. Clean up
    console.log('\n🧹 Cleaning up test key...');
    await redis.del(redisKey);
    console.log('   ✅ Cleaned up.');

  } catch (err: any) {
    console.error('\n❌ Exception encountered during Upstash Redis caching test:', err.message);
    process.exit(1);
  }

  console.log('\n' + '━'.repeat(60));
  console.log('✅ Caching test completed successfully!\n');
}

runCacheTest().catch(err => {
  console.error('Fatal caching test execution error:', err);
  process.exit(1);
});
