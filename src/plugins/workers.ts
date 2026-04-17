import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // We just need to import them to trigger their execution/initialization
  // BullMQ workers start immediately upon instantiation
  
  try {
    const { feeWorker } = await import('../workers/fee.worker.js');
    const { libWorker } = await import('../workers/lib.worker.js');
    const { shortageWorker } = await import('../workers/att.worker.js');
    const { examWorker } = await import('../workers/exam.worker.js');
    const { complianceWorker } = await import('../workers/compliance.worker.js');

    fastify.log.info('BullMQ workers initialized');

    // Add a hook to close workers when the app closes
    fastify.addHook('onClose', async () => {
      await Promise.all([
        feeWorker.close(),
        libWorker.close(),
        shortageWorker.close(),
        examWorker.close(),
        complianceWorker.close()
      ]);
      fastify.log.info('BullMQ workers closed');
    });
  } catch (error) {
    fastify.log.error('Failed to initialize workers:', error);
  }
});
