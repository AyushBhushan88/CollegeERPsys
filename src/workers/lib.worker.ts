import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.js';
import { libService } from '../services/lib.service.js';

export const libWorker = new Worker(
  'lib-fine-update',
  async (job: Job) => {
    console.log(`Processing library fine update: ${job.id}`);
    await libService.updateFines();
    console.log('Library fine update completed.');
  },
  { connection }
);

libWorker.on('completed', job => {
  console.log(`Library Fine Job ${job.id} completed successfully.`);
});

libWorker.on('failed', (job, err) => {
  console.error(`Library Fine Job ${job?.id} failed with error: ${err.message}`);
});

console.log('Library worker started.');

export default libWorker;
