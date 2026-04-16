import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import attendanceService from '../services/att.service.js';
import {
  markAttendanceSchema,
  condonationSchema,
  approveCondonationSchema,
} from '../schemas/att.schema.ts';
import { checkRoles } from '../middleware/rbac.js';
import { CondonationStatus } from '../models/Condonation.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // Attendance Marking
  fastify.post('/mark', {
    preHandler: [checkRoles(['tenant-admin', 'faculty'])]
  }, async (request, reply) => {
    const { records } = markAttendanceSchema.parse(request.body);
    const user = request.user as any;
    const tenantId = user.tenantId;
    
    return await attendanceService.markAttendance(records, user.id, tenantId);
  });

  // Get Register List for Course
  fastify.get('/register/:courseId', {
    preHandler: [checkRoles(['tenant-admin', 'faculty'])]
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const tenantId = (request.user as any).tenantId;
    
    return await attendanceService.getRegisterList(courseId, tenantId);
  });

  // Student Stats
  fastify.get('/stats', {
    preHandler: [checkRoles(['student'])]
  }, async (request, reply) => {
    const user = request.user as any;
    
    if (user.profileModel !== 'Student' || !user.profileId) {
      return reply.code(400).send({ message: 'Student profile not found' });
    }
    
    return await attendanceService.getStudentStats(user.profileId, user.tenantId);
  });

  // Condonation
  fastify.post('/condonation', {
    preHandler: [checkRoles(['student'])]
  }, async (request, reply) => {
    const data = condonationSchema.parse(request.body);
    const user = request.user as any;
    
    if (user.profileModel !== 'Student' || !user.profileId) {
      return reply.code(400).send({ message: 'Student profile not found' });
    }
    
    return await attendanceService.submitCondonation(user.profileId, data, user.tenantId);
  });

  fastify.patch('/condonation/:id/approve', {
    preHandler: [checkRoles(['tenant-admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = approveCondonationSchema.parse(request.body);
    const user = request.user as any;
    
    return await attendanceService.approveCondonation(id, status as CondonationStatus, user.id, user.tenantId);
  });

  // Reports
  fastify.get('/report/:courseId', {
    preHandler: [checkRoles(['tenant-admin', 'faculty'])]
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const user = request.user as any;
    
    const workbook = await attendanceService.generateCourseReport(courseId, user.tenantId);
    
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', `attachment; filename="attendance_${courseId}.xlsx"`);
    
    const buffer = await workbook.xlsx.writeBuffer();
    return reply.send(buffer);
  });
}
