/**
 * Transactional Credit System — Integration Test
 * 
 * Verifies the database/sandbox state logic:
 * 1. Default starting credits is exactly 5
 * 2. Atomic credit decrements occur correctly
 * 3. Credit floor constraint is respected (clamped at >= 0)
 * 4. Insufficient credits middleware blocking works
 */

import { getUserCredits, decrementUserCredits } from './src/services/historyService.js';
import { creditMiddleware } from './src/middleware/creditMiddleware.js';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const TEST_USER_ID = randomUUID();

async function runCreditsTest() {
  console.log('\n🧪 Vignette.ai User Credit System Verification\n');
  console.log('━'.repeat(60));

  try {
    // ─── 1. Verify Default Balance ─────────────────────────────────────────────
    console.log('\n📌 Step 1: Checking default credit count for new user...');
    const initialCredits = await getUserCredits(TEST_USER_ID);
    console.log(`   Initial Balance: ${initialCredits} Credits`);
    if (initialCredits === 5) {
      console.log('   ✅ PASS: Default starting credits is exactly 5!');
    } else {
      console.error(`   ❌ FAIL: Expected 5 starting credits, got ${initialCredits}`);
      process.exit(1);
    }

    // ─── 2. Verify Credit Decrement ──────────────────────────────────────────
    console.log('\n📌 Step 2: Simulating thumbnail generation (spending 1 credit)...');
    const balanceAfterGen = await decrementUserCredits(TEST_USER_ID, 1);
    console.log(`   Remaining Balance: ${balanceAfterGen} Credits`);
    if (balanceAfterGen === 4) {
      console.log('   ✅ PASS: Credits successfully decremented by 1!');
    } else {
      console.error(`   ❌ FAIL: Expected 4 remaining credits, got ${balanceAfterGen}`);
      process.exit(1);
    }

    // ─── 3. Verify Clamp at 0 (No Negative Balance) ──────────────────────────
    console.log('\n📌 Step 3: Spending 5 more credits to exhaust balance...');
    const balanceAfterExhaust = await decrementUserCredits(TEST_USER_ID, 5);
    console.log(`   Remaining Balance: ${balanceAfterExhaust} Credits`);
    if (balanceAfterExhaust === 0) {
      console.log('   ✅ PASS: Credits clamped at 0 successfully!');
    } else {
      console.error(`   ❌ FAIL: Credits went negative or did not exhaust, got ${balanceAfterExhaust}`);
      process.exit(1);
    }

    // ─── 4. Verify Credit Middleware Enforcement ────────────────────────────
    console.log('\n📌 Step 4: Simulating middleware block with 0 credits...');
    
    // Setup mock Express Request, Response, Next
    const mockRequest = {
      user: {
        id: TEST_USER_ID,
        email: 'test@vignette.ai',
        isAnonymous: false
      }
    } as unknown as Request;

    let responseStatus = 0;
    let responseBody = {};
    const mockResponse = {
      status(code: number) {
        responseStatus = code;
        return this;
      },
      json(body: any) {
        responseBody = body;
        return this;
      }
    } as unknown as Response;

    let nextCalled = false;
    const mockNext = () => {
      nextCalled = true;
    };

    // Invoke middleware
    await creditMiddleware(mockRequest, mockResponse, mockNext);

    console.log(`   HTTP Status: ${responseStatus}`);
    console.log(`   Response JSON:`, JSON.stringify(responseBody));
    console.log(`   Next() Triggered: ${nextCalled}`);

    if (responseStatus === 403 && !nextCalled) {
      console.log('   ✅ PASS: Middleware successfully BLOCKED request with 403 Forbidden!');
    } else {
      console.error('   ❌ FAIL: Middleware allowed generation request with 0 credits.');
      process.exit(1);
    }

  } catch (err: any) {
    console.error('\n❌ Exception encountered during credit system test:', err.message);
    process.exit(1);
  }

  console.log('\n' + '━'.repeat(60));
  console.log('✅ Credit system integration test completed successfully!\n');
}

runCreditsTest().catch(err => {
  console.error('Fatal credit system integration test failure:', err);
  process.exit(1);
});
