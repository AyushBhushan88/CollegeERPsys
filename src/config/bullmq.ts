import { Queue, ConnectionOptions } from 'bullmq';
import { Redis } from 'ioredis';

// Use environment variable for Redis or default to localhost
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const connection: ConnectionOptions = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const shortageQueue = new Queue('shortage-check', { connection });
export const hallTicketQueue = new Queue('hall-ticket-gen', { connection });
export const feeOverdueQueue = new Queue('fee-overdue-check', { connection });
export const libQueue = new Queue('lib-fine-update', { connection });

export default shortageQueue;
