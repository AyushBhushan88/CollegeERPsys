import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ttService } from '../services/tt.service.js';
import { createRoomSchema, createTimetableEntrySchema, createSubstitutionSchema, getFreeFacultySchema } from '../schemas/tt.schema.js';
import { checkRole } from '../middleware/rbac.js';
import { Faculty } from '../models/Faculty.js';
import { Student } from '../models/Student.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // Room Routes
  fastify.get('/tt/rooms', {
    preHandler: [checkRole(['admin', 'faculty'])]
  }, async (request, reply) => {
    const tenantId = (request.user as any).tenantId;
    return ttService.getRooms(tenantId);
  });

  fastify.post('/tt/rooms', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = createRoomSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    return ttService.createRoom(tenantId, data);
  });

  // Timetable Entry Routes
  fastify.post('/tt/entries', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = createTimetableEntrySchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    try {
      return await ttService.createTimetableEntry(tenantId, data);
    } catch (error: any) {
      if (error.message.includes('occupied') || error.message.includes('already has a class')) {
        return reply.code(409).send({ message: error.message });
      }
      throw error;
    }
  });

  fastify.delete('/tt/entries/:id', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenantId = (request.user as any).tenantId;
    return ttService.deleteTimetableEntry(tenantId, id);
  });

  // Substitution Routes
  fastify.get('/tt/free-faculty', {
    preHandler: [checkRole(['admin', 'faculty'])]
  }, async (request, reply) => {
    const { dayOfWeek, slotIndex, department } = getFreeFacultySchema.parse(request.query);
    const tenantId = (request.user as any).tenantId;
    return ttService.getFreeFaculty(tenantId, dayOfWeek, slotIndex, department);
  });

  fastify.post('/tt/substitutions', {
    preHandler: [checkRole(['admin', 'faculty'])]
  }, async (request, reply) => {
    const data = createSubstitutionSchema.parse(request.body);
    const user = request.user as any;
    const tenantId = user.tenantId;
    
    try {
      return await ttService.createSubstitutionRequest(tenantId, {
        ...data,
        requestedBy: user.id
      });
    } catch (error: any) {
      return reply.code(400).send({ message: error.message });
    }
  });

  fastify.get('/tt/substitutions', {
    preHandler: [checkRole(['admin', 'faculty'])]
  }, async (request, reply) => {
    const tenantId = (request.user as any).tenantId;
    return ttService.getSubstitutions(tenantId, request.query || {});
  });

  // Query Routes
  fastify.get('/tt/room/:roomId', {
    preHandler: [checkRole(['admin', 'faculty'])]
  }, async (request, reply) => {
    const { roomId } = request.params as { roomId: string };
    const tenantId = (request.user as any).tenantId;
    return ttService.getTimetableForRoom(tenantId, roomId);
  });

  fastify.get('/tt/faculty/:facultyId', {
    preHandler: [checkRole(['admin', 'faculty'])]
  }, async (request, reply) => {
    const { facultyId } = request.params as { facultyId: string };
    const tenantId = (request.user as any).tenantId;
    return ttService.getTimetableForFaculty(tenantId, facultyId);
  });

  fastify.get('/tt/section/:sectionId', async (request, reply) => {
    const { sectionId } = request.params as { sectionId: string };
    const tenantId = (request.user as any).tenantId;
    return ttService.getTimetableForSection(tenantId, sectionId);
  });

  fastify.get('/tt/my-timetable', async (request, reply) => {
    const user = request.user as any;
    const tenantId = user.tenantId;

    if (user.roles.includes('faculty')) {
        const faculty = await Faculty.findOne({ userId: user.id });
        if (!faculty) return reply.code(404).send({ message: 'Faculty profile not found' });
        
        const timetable = await ttService.getTimetableForFaculty(tenantId, faculty._id.toString());
        const substitutions = await ttService.getSubstitutions(tenantId, { substituteId: faculty._id });
        
        return { timetable, substitutions };
    } else if (user.roles.includes('student')) {
        const student = await Student.findOne({ userId: user.id });
        if (!student) return reply.code(404).send({ message: 'Student profile not found' });
        
        const timetable = await ttService.getTimetableForSection(tenantId, student.sectionId);
        // Also fetch substitutions for this section's classes
        const entryIds = (timetable as any).map((e: any) => e._id);
        const substitutions = await ttService.getSubstitutions(tenantId, { entryId: { $in: entryIds } });
        
        return { timetable, substitutions };
    }
    
    return reply.code(403).send({ message: 'Only students and faculty can view personalized timetable' });
  });
}
