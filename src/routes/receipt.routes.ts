import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { receiptService } from '../services/receipt.service.js';
import { paymentService } from '../services/payment.service.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  fastify.get('/:paymentId/receipt', async (request, reply) => {
    const { paymentId } = request.params as { paymentId: string };
    const user = request.user as any;

    const payment = await paymentService.getPaymentById(paymentId);
    if (!payment) {
      return reply.code(404).send({ message: 'Payment not found' });
    }

    // Auth check: Admin or the student who made the payment
    const student = payment.studentId as any;
    if (!user.roles.includes('admin') && student.userId.toString() !== user.id) {
      return reply.code(403).send({ message: 'Forbidden' });
    }

    try {
      const pdfDoc = await receiptService.generateReceipt(paymentId);
      
      reply.type('application/pdf');
      reply.header('Content-Disposition', `attachment; filename=receipt_${paymentId}.pdf`);
      
      // pdfmake returns a stream-like object that can be piped
      return reply.send(pdfDoc);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ message: error.message });
    }
  });
}
