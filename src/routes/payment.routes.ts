import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { paymentService } from '../services/payment.service.js';
import { CreateOrderSchema } from '../schemas/payment.schema.js';
import { checkRoles } from '../middleware/rbac.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Order Initiation - Only Students can initiate their own orders
  fastify.post('/order', {
    preHandler: [fastify.auth([fastify.verifyJWT]), checkRoles(['student'])]
  }, async (request, reply) => {
    const { demandId } = CreateOrderSchema.parse(request.body);
    return paymentService.createOrder(demandId);
  });

  // Webhook - Public route, but requires signature verification
  fastify.post('/webhook', {
    config: {
      rawBody: true
    }
  }, async (request, reply) => {
    const signature = request.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return reply.code(400).send({ message: 'Missing Razorpay signature' });
    }

    const rawBody = (request as any).rawBody;
    try {
      await paymentService.handleWebhook(rawBody, signature);
      return { status: 'ok' };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(400).send({ message: error.message });
    }
  });
}
