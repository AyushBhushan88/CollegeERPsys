import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ImportService } from '../services/import.service.js';
import { checkRole } from '../middleware/rbac.js';
import mongoose from 'mongoose';

const importService = new ImportService();

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', fastify.auth([fastify.verifyJWT]));

  fastify.post('/sis/import/students', {
    preHandler: [checkRole(['admin'])]
  }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ message: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    const filename = data.filename.toLowerCase();
    
    let parsedData: any[] = [];
    if (filename.endsWith('.csv')) {
      parsedData = await importService.parseCSV(buffer);
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      parsedData = await importService.parseExcel(buffer);
    } else {
      return reply.code(400).send({ message: 'Unsupported file format. Please upload CSV or Excel.' });
    }

    const tenantId = (request.user as any).tenantId;
    const summary = await importService.importStudents(parsedData, new mongoose.Types.ObjectId(tenantId));

    return summary;
  });
}
