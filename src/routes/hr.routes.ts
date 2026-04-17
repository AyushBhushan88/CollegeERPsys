import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { HRService } from '../services/hr.service.js';
import { checkRoles } from '../middleware/rbac.js';

const hrService = new HRService();

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // View own profile (Faculty)
  fastify.get('/profile', {
    preHandler: [checkRoles(['faculty'])]
  }, async (request, reply) => {
    const user = request.user as any;
    if (user.profileModel !== 'Faculty' || !user.profileId) {
      return reply.code(403).send({ message: 'Not a faculty profile' });
    }
    const profile = await hrService.getFacultyProfile(user.profileId);
    if (!profile) return reply.code(404).send({ message: 'Profile not found' });
    return profile;
  });

  // Update own profile (Faculty)
  fastify.put('/profile', {
    preHandler: [checkRoles(['faculty'])]
  }, async (request, reply) => {
    const user = request.user as any;
    if (user.profileModel !== 'Faculty' || !user.profileId) {
      return reply.code(403).send({ message: 'Not a faculty profile' });
    }
    return hrService.updateFacultyProfile(user.profileId, request.body as any);
  });

  // Submit leave request
  fastify.post('/leaves', {
    preHandler: [checkRoles(['faculty'])]
  }, async (request, reply) => {
    const user = request.user as any;
    if (user.profileModel !== 'Faculty' || !user.profileId) {
      return reply.code(403).send({ message: 'Not a faculty profile' });
    }
    const leaveData = {
      ...(request.body as any),
      facultyId: user.profileId
    };
    return hrService.requestLeave(leaveData);
  });

  // List pending leaves for approval (HOD/Admin)
  fastify.get('/leaves/pending', {
    preHandler: [checkRoles(['admin', 'hod'])]
  }, async (request, reply) => {
    return hrService.getPendingLeaves();
  });

  // Approve/Reject leave
  fastify.patch('/leaves/:id', {
    preHandler: [checkRoles(['admin', 'hod'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;
    const { status, comment } = request.body as { status: 'Approved' | 'Rejected', comment?: string };
    
    return hrService.updateLeaveStatus(id, {
      approverId: user.sub,
      status,
      comment
    });
  });

  // View workload (Admin/HOD)
  fastify.get('/workload/:facultyId', {
    preHandler: [checkRoles(['admin', 'hod'])]
  }, async (request, reply) => {
    const { facultyId } = request.params as { facultyId: string };
    const workload = await hrService.getFacultyWorkload(facultyId);
    return { facultyId, workload };
  });
}
