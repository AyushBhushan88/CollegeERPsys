import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { calendarService } from '../services/calendar.service.js';
import { checkRoles } from '../middleware/rbac.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  fastify.get('/events', async (request, reply) => {
    return calendarService.getEvents(request.tenantId);
  });

  fastify.post('/events', {
    preHandler: [checkRoles(['tenant-admin', 'super-admin'])]
  }, async (request, reply) => {
    const event = await calendarService.createEvent(request.body as any, request.tenantId);
    return reply.code(201).send(event);
  });

  fastify.put('/events/:id', {
    preHandler: [checkRoles(['tenant-admin', 'super-admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await calendarService.updateEvent(id, request.body as any, request.tenantId);
    if (!event) return reply.code(404).send({ message: 'Event not found' });
    return event;
  });

  fastify.delete('/events/:id', {
    preHandler: [checkRoles(['tenant-admin', 'super-admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await calendarService.deleteEvent(id, request.tenantId);
    if (!deleted) return reply.code(404).send({ message: 'Event not found' });
    return reply.code(204).send();
  });

  fastify.get('/events/feed.ics', async (request, reply) => {
    const feed = await calendarService.generateICalFeed(request.tenantId);
    reply.type('text/calendar');
    reply.header('Content-Disposition', 'attachment; filename="calendar.ics"');
    return feed;
  });
}
