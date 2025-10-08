import IORedis from 'ioredis';
import { Queue, Worker } from 'bullmq';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const remindersQueue = new Queue('nightly-reminders', { connection });

export function startWorkers() {
  // Example worker
  new Worker(
    'nightly-reminders',
    async (job) => {
      // send reminders here
      return { sent: true, jobId: job.id };
    },
    { connection }
  );
}
