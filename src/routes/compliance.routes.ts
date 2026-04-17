import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { complianceService, ComplianceReportType } from '../services/compliance.service.js';
import { complianceQueue } from '../config/bullmq.js';
import { minioClient } from '../config/minio.js';
import { checkRole } from '../middleware/rbac.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // Trigger a compliance report generation
  fastify.post('/compliance/generate', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { type, filters } = request.body as { type: ComplianceReportType, filters?: any };
    const tenantId = (request.user as any).tenantId;

    if (!Object.values(ComplianceReportType).includes(type)) {
      return reply.code(400).send({ message: 'Invalid report type' });
    }

    const jobId = await complianceService.enqueueReportJob(tenantId, type, filters);
    return { jobId };
  });

  // Check job status
  fastify.get('/compliance/status/:jobId', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = await complianceQueue.getJob(jobId);

    if (!job) {
      return reply.code(404).send({ message: 'Job not found' });
    }

    // Ensure user can only see jobs from their tenant
    const tenantId = (request.user as any).tenantId;
    if (job.data.tenantId !== tenantId) {
      return reply.code(403).send({ message: 'Access denied' });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;

    return { jobId, state, progress, result };
  });

  // Get a download URL for a completed report
  fastify.get('/compliance/download/:jobId', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = await complianceQueue.getJob(jobId);

    if (!job || !(await job.isCompleted())) {
      return reply.code(400).send({ message: 'Report is not ready for download' });
    }

    const tenantId = (request.user as any).tenantId;
    if (job.data.tenantId !== tenantId) {
      return reply.code(403).send({ message: 'Access denied' });
    }

    const { minioKey } = job.returnvalue;
    const url = await minioClient.presignedGetObject('compliance-reports', minioKey, 24 * 60 * 60); // 24 hour expiry

    return { downloadUrl: url };
  });
}
