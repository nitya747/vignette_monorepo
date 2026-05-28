import { getUserHistory } from './src/services/historyService.js';

async function testGetHistory() {
  console.log('--- Testing getUserHistory for user b24d7faf-92ac-4eaf-9a74-f2c0f3434344 ---');
  try {
    const result = await getUserHistory('b24d7faf-92ac-4eaf-9a74-f2c0f3434344', 1, 20);
    console.log('Result of getUserHistory:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Exception during getUserHistory:', err);
  }
}

testGetHistory();
