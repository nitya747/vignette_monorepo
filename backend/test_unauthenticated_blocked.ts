/**
 * Fail-Safe Credit Enforcement — Unauthenticated Request Block Test
 * 
 * Verifies that the middleware blocks unauthenticated or failed auth requests:
 * 1. An unauthenticated request (no user session) is immediately blocked with 401.
 * 2. A guest session with active credits is allowed.
 * 3. A registered user session with active credits is allowed.
 */

import { creditMiddleware } from './src/middleware/creditMiddleware.js';
import { getUserCredits } from './src/services/historyService.js';
import { Request, Response } from 'express';

const TEST_GUEST_ID = `guest-test-block-${Math.floor(Math.random() * 100000)}`;
const TEST_USER_ID = `86b88d74-1157-487d-bfac-${Math.floor(Math.random() * 900000) + 100000}`; // Mock UUID

async function runBlockTest() {
  console.log('\n🧪 Vignette.ai Unauthenticated Request Blocking Verification\n');
  console.log('━'.repeat(60));

  try {
    // ─── 1. Test Unauthenticated Request Block ──────────────────────────────────
    console.log('\n📌 Step 1: Simulating request with NO authentication session...');
    
    const mockRequest1 = {
      user: null
    } as unknown as Request;

    let responseStatus1 = 0;
    let responseBody1 = {};
    const mockResponse1 = {
      status(code: number) {
        responseStatus1 = code;
        return this;
      },
      json(body: any) {
        responseBody1 = body;
        return this;
      }
    } as unknown as Response;

    let nextCalled1 = false;
    const mockNext1 = () => {
      nextCalled1 = true;
    };

    await creditMiddleware(mockRequest1, mockResponse1, mockNext1);

    console.log(`   HTTP Status: ${responseStatus1}`);
    console.log(`   Response JSON:`, JSON.stringify(responseBody1));
    console.log(`   Next() Triggered: ${nextCalled1}`);

    if (responseStatus1 === 401 && !nextCalled1) {
      console.log('   ✅ PASS: Unauthenticated request was successfully blocked with 401 Unauthorized!');
    } else {
      console.error('   ❌ FAIL: Unauthenticated request was allowed to bypass!');
      process.exit(1);
    }

    // ─── 2. Test Guest Session with Active Credits ──────────────────────────────
    console.log('\n📌 Step 2: Simulating valid Guest session...');

    const mockRequest2 = {
      user: {
        id: TEST_GUEST_ID,
        email: 'guest@vignette.ai',
        isAnonymous: true
      }
    } as unknown as Request;

    let responseStatus2 = 0;
    const mockResponse2 = {
      status(code: number) {
        responseStatus2 = code;
        return this;
      },
      json(body: any) {
        return this;
      }
    } as unknown as Response;

    let nextCalled2 = false;
    const mockNext2 = () => {
      nextCalled2 = true;
    };

    // Ensure guest has their starting 1 credit
    const creditsBefore = await getUserCredits(TEST_GUEST_ID);
    console.log(`   Guest Starting Credits: ${creditsBefore}`);

    await creditMiddleware(mockRequest2, mockResponse2, mockNext2);

    console.log(`   HTTP Status: ${responseStatus2}`);
    console.log(`   Next() Triggered: ${nextCalled2}`);

    if (nextCalled2 && responseStatus2 === 0) {
      console.log('   ✅ PASS: Valid guest session with active credits was correctly allowed!');
    } else {
      console.error('   ❌ FAIL: Valid guest session with active credits was blocked!');
      process.exit(1);
    }

    // ─── 3. Test Registered User with Active Credits ────────────────────────────
    console.log('\n📌 Step 3: Simulating valid Registered User session...');

    const mockRequest3 = {
      user: {
        id: TEST_USER_ID,
        email: 'registered@vignette.ai',
        isAnonymous: false
      }
    } as unknown as Request;

    let responseStatus3 = 0;
    const mockResponse3 = {
      status(code: number) {
        responseStatus3 = code;
        return this;
      },
      json(body: any) {
        return this;
      }
    } as unknown as Response;

    let nextCalled3 = false;
    const mockNext3 = () => {
      nextCalled3 = true;
    };

    // Ensure registered user starts with 5 credits
    const userCreditsBefore = await getUserCredits(TEST_USER_ID);
    console.log(`   User Starting Credits: ${userCreditsBefore}`);

    await creditMiddleware(mockRequest3, mockResponse3, mockNext3);

    console.log(`   HTTP Status: ${responseStatus3}`);
    console.log(`   Next() Triggered: ${nextCalled3}`);

    if (nextCalled3 && responseStatus3 === 0) {
      console.log('   ✅ PASS: Valid registered user session with active credits was correctly allowed!');
    } else {
      console.error('   ❌ FAIL: Valid registered user session with active credits was blocked!');
      process.exit(1);
    }

  } catch (err: any) {
    console.error('\n❌ Exception encountered during block test:', err.message);
    process.exit(1);
  }

  console.log('\n' + '━'.repeat(60));
  console.log('🎉 All unauthenticated blocking validation tests passed successfully!\n');
}

runBlockTest().catch(err => {
  console.error('Fatal unauthenticated blocking validation test failure:', err);
  process.exit(1);
});
