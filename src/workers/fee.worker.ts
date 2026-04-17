import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.js';
import { feeService } from '../services/fee.service.js';

export const feeWorker = new Worker(
  'fee-overdue-check',
  async (job: Job) => {
    console.log(`Processing fee overdue check: ${job.id}`);
    const result = await feeService.checkOverdueDemands();
    console.log(`Fee overdue check completed. Modified ${result.modifiedCount} demands.`);
  },
  { connection }
);

feeWorker.on('completed', job => {
  console.log(`Fee Overdue Job ${job.id} completed successfully.`);
});

feeWorker.on('failed', (job, err) => {
  console.error(`Fee Overdue Job ${job?.id} failed with error: ${err.message}`);
});

console.log('Fee worker started.');

export default feeWorker;
