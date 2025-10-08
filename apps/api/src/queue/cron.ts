import { remindersQueue } from './index.js';

export async function scheduleNightlyReminders() {
  await remindersQueue.add(
    'nightly',
    {},
    {
      repeat: { pattern: '0 21 * * *' }, // 9pm UTC daily
      removeOnComplete: true,
      removeOnFail: 100
    }
  );
}
