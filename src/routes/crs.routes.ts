import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { crsService } from '../services/crs.service.js';
import { 
  courseSchema, 
  syllabusSchema, 
  outcomeSchema, 
  obeMappingSchema, 
  courseRegistrationSchema,
  registrationStatusUpdateSchema 
} from '../schemas/crs.schema.js';
import { checkRole } from '../middleware/rbac.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // Course Management
  fastify.post('/courses', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = courseSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    return crsService.createCourse({ ...data, tenantId });
  });

  fastify.get('/courses', async (request, reply) => {
    return crsService.getCourseCatalog(request.query);
  });

  fastify.get('/courses/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const course = await crsService.getCourseById(id);
    if (!course) return reply.code(404).send({ message: 'Course not found' });
    return course;
  });

  fastify.patch('/courses/:id', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return crsService.updateCourse(id, request.body as any);
  });

  // Syllabus Management
  fastify.post('/courses/:id/syllabus', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = syllabusSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    return crsService.updateSyllabus(id, { ...data, tenantId });
  });

  fastify.get('/courses/:id/syllabus', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { version } = request.query as { version?: string };
    const syllabus = await crsService.getSyllabusByCourse(id, version ? parseInt(version) : undefined);
    if (!syllabus) return reply.code(404).send({ message: 'Syllabus not found' });
    return syllabus;
  });

  fastify.get('/courses/:id/syllabus/history', async (request, reply) => {
    const { id } = request.params as { id: string };
    return crsService.getSyllabusHistory(id);
  });

  fastify.post('/syllabus/:id/activate', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return crsService.activateSyllabus(id);
  });

  // OBE Outcomes
  fastify.post('/outcomes', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = outcomeSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    return crsService.createOutcome({ ...data, tenantId });
  });

  fastify.get('/outcomes', async (request, reply) => {
    return crsService.getOutcomes(request.query);
  });

  // OBE Mappings
  fastify.post('/mappings', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = obeMappingSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    return crsService.createMapping({ ...data, tenantId });
  });

  fastify.get('/courses/:id/mapping-matrix', async (request, reply) => {
    const { id } = request.params as { id: string };
    return crsService.getMappingMatrix(id);
  });

  // Course Registration
  fastify.post('/registrations', {
    preHandler: [checkRole(['student'])]
  }, async (request, reply) => {
    const data = courseRegistrationSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    const studentId = (request.user as any).profileId; // Assuming profileId maps to Student._id
    return crsService.registerStudentForCourse({ ...data, studentId, tenantId });
  });

  fastify.get('/registrations', {
    preHandler: [checkRole(['student'])]
  }, async (request, reply) => {
    const studentId = (request.user as any).profileId;
    return crsService.getStudentRegistrations(studentId, request.query);
  });

  fastify.patch('/registrations/:id/status', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = registrationStatusUpdateSchema.parse(request.body);
    return crsService.updateRegistrationStatus(id, status);
  });
}
