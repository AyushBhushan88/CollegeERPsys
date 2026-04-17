import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { reportBuilderService } from '../services/reportBuilder.service.js';
import { ReportDefinition } from '../models/ReportDefinition.js';
import { reportDefinitionSchema } from '../schemas/report.schema.js';
import { checkRole } from '../middleware/rbac.js';
import { Types } from 'mongoose';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // List saved report definitions
  fastify.get('/reports', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const tenantId = (request.user as any).tenantId;
    return ReportDefinition.find({ tenantId });
  });

  // Create and save a new report definition
  fastify.post('/reports', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = reportDefinitionSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    
    const report = new ReportDefinition({
      ...data,
      tenantId
    });
    
    await report.save();
    return report;
  });

  // Fetch a definition and execute it
  fastify.get('/reports/:id/execute', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenantId = (request.user as any).tenantId;
    
    const reportDef = await ReportDefinition.findOne({ _id: id, tenantId });
    if (!reportDef) {
      return reply.code(404).send({ message: 'Report definition not found' });
    }
    
    return reportBuilderService.executeReport(reportDef as any, new Types.ObjectId(tenantId));
  });

  // Execute a report definition without saving it
  fastify.post('/reports/preview', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = reportDefinitionSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    
    return reportBuilderService.executeReport(data, new Types.ObjectId(tenantId));
  });
}
