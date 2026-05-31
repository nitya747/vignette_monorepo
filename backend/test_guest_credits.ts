import { creditMiddleware } from './src/middleware/creditMiddleware.js';
import { getUserCredits, decrementUserCredits } from './src/services/historyService.js';
import { Request, Response } from 'express';

const GUEST_ID_SPENT = `guest-spent-${Math.floor(Math.random() * 100000)}`;
const GUEST_ID_UNSPENT = `guest-unspent-${Math.floor(Math.random() * 100000)}`;
const AUTH_USER_SPENT = `auth-user-spent-${Math.floor(Math.random() * 100000)}`;
const AUTH_USER_UNSPENT = `auth-user-unspent-${Math.floor(Math.random() * 100000)}`;

// Simulate the GET /api/history/credits controller logic directly for testing
async function handleGetCredits(userId: string, guestIdParam?: string): Promise<number> {
  let credits = await getUserCredits(userId);

  if (guestIdParam && guestIdParam.startsWith('guest-')) {
    const guestCredits = await getUserCredits(guestIdParam);
    if (guestCredits === 0) {
      if (credits === 5) {
        credits = await decrementUserCredits(userId, 1);
      }
    }
  }
  return credits;
}

async function runGuestCreditsTest() {
  console.log('\n🧪 Vignette.ai Guest-to-User Credit Seeding & Migration Verification\n');
  console.log('━'.repeat(60));

  try {
    // ─── 1. Guest Starting Credits ─────────────────────────────────────────────
    console.log('\n📌 Step 1: Checking starting credits for fresh Guest...');
    const guestSpentCredits = await getUserCredits(GUEST_ID_SPENT);
    console.log(`   Guest (${GUEST_ID_SPENT}) Credits: ${guestSpentCredits}`);
    if (guestSpentCredits === 1) {
      console.log('   ✅ PASS: Guest starts with exactly 1 credit!');
    } else {
      console.error(`   ❌ FAIL: Expected guest to start with 1 credit, got ${guestSpentCredits}`);
      process.exit(1);
    }

    // ─── 2. Guest Credit Decrement ─────────────────────────────────────────────
    console.log('\n📌 Step 2: Simulating guest spending their 1 free credit...');
    const guestCreditsAfterGen = await decrementUserCredits(GUEST_ID_SPENT, 1);
    console.log(`   Guest (${GUEST_ID_SPENT}) Credits remaining: ${guestCreditsAfterGen}`);
    if (guestCreditsAfterGen === 0) {
      console.log('   ✅ PASS: Guest spent credit correctly decremented to 0!');
    } else {
      console.error(`   ❌ FAIL: Expected guest credits to be 0, got ${guestCreditsAfterGen}`);
      process.exit(1);
    }

    // ─── 3. Guest Credit Blocking ──────────────────────────────────────────────
    console.log('\n📌 Step 3: Simulating guest blocked on 2nd generation attempt...');
    const mockRequest = {
      user: {
        id: GUEST_ID_SPENT,
        email: 'guest@vignette.ai',
        isAnonymous: true
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

    await creditMiddleware(mockRequest, mockResponse, mockNext);
    console.log(`   HTTP Status: ${responseStatus}`);
    console.log(`   Response JSON:`, JSON.stringify(responseBody));
    
    if (responseStatus === 403 && !nextCalled) {
      console.log('   ✅ PASS: Guest successfully blocked with 403 Forbidden!');
    } else {
      console.error('   ❌ FAIL: Guest with 0 credits was not blocked.');
      process.exit(1);
    }

    // ─── 4. User Credit Migration (Guest Spent -> Auth User has 4) ─────────────
    console.log('\n📌 Step 4: Simulating Sign In / Up of guest who SPENT their credit...');
    const userSpentInitial = await getUserCredits(AUTH_USER_SPENT);
    console.log(`   Authenticated User (${AUTH_USER_SPENT}) initial credits: ${userSpentInitial}`);

    console.log('   Triggering credit retrieval with spent guestId...');
    const returnedCreditsSpent = await handleGetCredits(AUTH_USER_SPENT, GUEST_ID_SPENT);
    console.log(`   Returned Credits: ${returnedCreditsSpent}`);
    
    const dbCreditsSpent = await getUserCredits(AUTH_USER_SPENT);
    console.log(`   Final DB/Sandbox credits for user: ${dbCreditsSpent}`);

    if (returnedCreditsSpent === 4 && dbCreditsSpent === 4) {
      console.log('   ✅ PASS: Authenticated user credits successfully seeded to 4 (5 - 1 guest spent)!');
    } else {
      console.error(`   ❌ FAIL: Expected 4 credits for user, got ${returnedCreditsSpent}`);
      process.exit(1);
    }

    // ─── 5. User Credit Seeding (Guest Unspent -> Auth User remains 5) ──────────
    console.log('\n📌 Step 5: Simulating Sign In / Up of guest who DID NOT spend their credit...');
    const guestUnspentCredits = await getUserCredits(GUEST_ID_UNSPENT);
    console.log(`   Guest (${GUEST_ID_UNSPENT}) Credits: ${guestUnspentCredits}`);

    const userUnspentInitial = await getUserCredits(AUTH_USER_UNSPENT);
    console.log(`   Authenticated User (${AUTH_USER_UNSPENT}) initial credits: ${userUnspentInitial}`);

    console.log('   Triggering credit retrieval with unspent guestId...');
    const returnedCreditsUnspent = await handleGetCredits(AUTH_USER_UNSPENT, GUEST_ID_UNSPENT);
    console.log(`   Returned Credits: ${returnedCreditsUnspent}`);
    
    const dbCreditsUnspent = await getUserCredits(AUTH_USER_UNSPENT);
    console.log(`   Final DB/Sandbox credits for user: ${dbCreditsUnspent}`);

    if (returnedCreditsUnspent === 5 && dbCreditsUnspent === 5) {
      console.log('   ✅ PASS: Authenticated user credits remains at 5 because guest credit was unspent!');
    } else {
      console.error(`   ❌ FAIL: Expected 5 credits for user, got ${returnedCreditsUnspent}`);
      process.exit(1);
    }

  } catch (err: any) {
    console.error('Test encountered exception:', err);
    process.exit(1);
  }

  console.log('━'.repeat(60));
  console.log('🎉 All guest credit seeding and migration integration tests passed successfully!\n');
}

runGuestCreditsTest();
