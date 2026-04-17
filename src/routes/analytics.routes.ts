import { FastifyInstance, FastifyRequest } from 'fastify';
import { analyticsService } from '../services/analytics.service.js';
import { AnalyticsQuerySchema, AnalyticsQuery } from '../schemas/analytics.schema.js';
import { checkRoles } from '../middleware/rbac.js';

export default async function analyticsRoutes(app: FastifyInstance) {
  // Enforce authentication for all routes in this plugin
  app.addHook('preHandler', app.authenticate);

  app.get('/analytics/enrollment', {
    preHandler: [checkRoles(['super-admin', 'tenant-admin'])],
    schema: AnalyticsQuerySchema
  }, async (request: FastifyRequest<{ Querystring: AnalyticsQuery }>, reply) => {
    return await analyticsService.getEnrollmentAnalytics(request.tenantId, request.query);
  });

  app.get('/analytics/fees', {
    preHandler: [checkRoles(['super-admin', 'tenant-admin'])],
    schema: AnalyticsQuerySchema
  }, async (request: FastifyRequest<{ Querystring: AnalyticsQuery }>, reply) => {
    return await analyticsService.getFeeAnalytics(request.tenantId, request.query);
  });

  app.get('/analytics/academics', {
    preHandler: [checkRoles(['super-admin', 'tenant-admin'])],
    schema: AnalyticsQuerySchema
  }, async (request: FastifyRequest<{ Querystring: AnalyticsQuery }>, reply) => {
    return await analyticsService.getAcademicAnalytics(request.tenantId, request.query);
  });

  app.get('/analytics/summary', {
    preHandler: [checkRoles(['super-admin', 'tenant-admin'])]
  }, async (request: FastifyRequest, reply) => {
    return await analyticsService.getDashboardSummary(request.tenantId);
  });
}
