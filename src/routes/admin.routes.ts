import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { checkRoles, checkPermissions } from '../middleware/rbac';

export const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Demo route: Super Admin only
  fastify.get('/system-status', {
    preHandler: [checkRoles(['super-admin'])]
  }, async (request, reply) => {
    return { status: 'healthy', tenantId: request.tenantId };
  });

  // Demo route: Admin or Super Admin with specific permission
  fastify.get('/audit-logs', {
    preHandler: [
      checkRoles(['admin', 'super-admin']),
      checkPermissions(['audit:view'])
    ]
  }, async (request, reply) => {
    return { logs: [], tenantId: request.tenantId };
  });

  // Demo route: Tenant Admin only
  fastify.post('/settings', {
    preHandler: [checkRoles(['admin'])]
  }, async (request, reply) => {
    return { message: 'Settings updated', tenantId: request.tenantId };
  });
};

export default adminRoutes;
