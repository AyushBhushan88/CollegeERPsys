import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { sisService } from '../services/sis.service.js';
import { studentSchema, facultySchema } from '../schemas/sis.schema.js';
import { checkRole } from '../middleware/rbac.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  // Student Routes
  fastify.get('/students', {
    preHandler: [checkRole(['admin', 'faculty'])]
  }, async (request, reply) => {
    return sisService.searchStudents(request.query);
  });

  fastify.post('/students', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = studentSchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    return sisService.createStudent({ ...data, tenantId });
  });

  fastify.get('/students/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const student = await sisService.getStudentById(id);
    if (!student) return reply.code(404).send({ message: 'Student not found' });
    return student;
  });

  fastify.patch('/students/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    // Students can update their own profile, Admins can update any
    const user = request.user as any;
    const student = await sisService.getStudentById(id);
    
    if (!student) return reply.code(404).send({ message: 'Student not found' });
    
    if (user.roles.includes('admin') || student.userId.toString() === user.id) {
      return sisService.updateStudent(id, request.body as any);
    }
    
    return reply.code(403).send({ message: 'Forbidden' });
  });

  fastify.delete('/students/:id', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return sisService.deleteStudent(id);
  });

  // Faculty Routes
  fastify.get('/faculty', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    return sisService.searchFaculty(request.query);
  });

  fastify.post('/faculty', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = facultySchema.parse(request.body);
    const tenantId = (request.user as any).tenantId;
    return sisService.createFaculty({ ...data, tenantId });
  });

  fastify.get('/faculty/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const faculty = await sisService.getFacultyById(id);
    if (!faculty) return reply.code(404).send({ message: 'Faculty not found' });
    return faculty;
  });

  fastify.patch('/faculty/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;
    const faculty = await sisService.getFacultyById(id);
    
    if (!faculty) return reply.code(404).send({ message: 'Faculty not found' });
    
    if (user.roles.includes('admin') || faculty.userId.toString() === user.id) {
      return sisService.updateFaculty(id, request.body as any);
    }
    
    return reply.code(403).send({ message: 'Forbidden' });
  });

  fastify.delete('/faculty/:id', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return sisService.deleteFaculty(id);
  });
}
