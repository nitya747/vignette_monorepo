import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { config } from './src/config/index.js';

async function runRateLimiterTest() {
  console.log('\n🧪 Vignette.ai Upstash Redis Rate Limiting Verification\n');
  console.log('━'.repeat(60));

  const isKeyAvailable = 
    config.upstashRedisUrl && 
    config.upstashRedisToken && 
    config.upstashRedisUrl !== 'your_upstash_redis_url_here';

  if (!isKeyAvailable) {
    console.error('❌ Error: Upstash Redis credentials not detected in .env.local!');
    process.exit(1);
  }

  console.log('🌐 Connecting to Upstash Redis endpoint...');
  console.log(`🔗 URL: ${config.upstashRedisUrl}`);

  try {
    const redis = new Redis({
      url: config.upstashRedisUrl!,
      token: config.upstashRedisToken!,
    });

    // Create a temporary sliding window limiter for test validation
    // Limit: 5 requests per 10 seconds for our test IP
    console.log('⚡ Initializing a sliding window limiter: 5 requests per 10 seconds...');
    const testLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'),
      prefix: 'vignette:test-rate-limit',
    });

    const testIp = `test-ip-client-${Math.floor(Math.random() * 100000)}`;
    console.log(`\n👥 Simulating client IP: ${testIp}`);

    // Make 6 rapid requests. The first 5 should succeed, and the 6th should be blocked.
    for (let i = 1; i <= 6; i++) {
      console.log(`\n🚀 Request #${i}...`);
      const { success, limit, remaining, reset } = await testLimiter.limit(testIp);
      
      console.log(`   Status:    ${success ? '✅ ALLOWED' : '❌ BLOCKED'}`);
      console.log(`   Limit:     ${limit}`);
      console.log(`   Remaining: ${remaining}`);
      console.log(`   Reset In:  ${Math.max(0, Math.ceil((reset - Date.now()) / 1000))} seconds`);

      if (i === 6) {
        if (!success) {
          console.log('\n🎉 SUCCESS: The 6th request was correctly BLOCKED by the sliding window!');
        } else {
          console.error('\n❌ FAILURE: The 6th request was allowed — rate limiting failed.');
          process.exit(1);
        }
      }
    }

  } catch (err: any) {
    console.error('\n❌ Exception encountered during Upstash Redis operations:', err.message);
    process.exit(1);
  }

  console.log('\n' + '━'.repeat(60));
  console.log('✅ Rate Limiting test completed successfully!\n');
}

runRateLimiterTest().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
