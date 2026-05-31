import { getUserCredits, decrementUserCredits } from './src/services/historyService.js';

async function testRealDecrement() {
  const testUUID = '86b88d74-1157-487d-bfac-2353be04f481';
  console.log(`=== Testing Real Database Decrement for User UUID: ${testUUID} ===`);

  try {
    const initialCredits = await getUserCredits(testUUID);
    console.log(`Initial Credits in DB: ${initialCredits}`);

    console.log('Running decrementUserCredits for 1 credit...');
    const remainingCredits = await decrementUserCredits(testUUID, 1);
    console.log(`Remaining Credits returned: ${remainingCredits}`);

    const finalCredits = await getUserCredits(testUUID);
    console.log(`Final Credits in DB: ${finalCredits}`);

    if (finalCredits === initialCredits - 1) {
      console.log('✅ PASS: Credits successfully decremented in Supabase PostgreSQL!');
    } else {
      console.error(`❌ FAIL: Credits did not decrement correctly. Expected ${initialCredits - 1}, got ${finalCredits}`);
    }
  } catch (err: any) {
    console.error('❌ Exception during decrement test:', err.message);
  }
}

testRealDecrement();
