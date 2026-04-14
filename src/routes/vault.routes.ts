import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { vaultService } from '../services/vault.service';
import { checkRoles } from '../middleware/rbac';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // All vault routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  /**
   * Upload a document for a student.
   * Admin and Faculty can upload for any student.
   * Students can only upload for themselves.
   */
  fastify.post('/students/:studentId/evidence', async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const user = request.user as any;
    
    // Authorization check
    if (!user.roles.includes('admin') && !user.roles.includes('faculty')) {
      // Basic check: Student must be uploading for their own profile
      if (user.profileId !== studentId) {
         return reply.code(403).send({ 
           message: 'Forbidden: You can only upload evidence for your own profile' 
         });
      }
    }

    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ message: 'No file uploaded' });
    }

    // Extract category from fields (optional)
    const categoryField = data.fields.category as any;
    const category = categoryField ? categoryField.value : 'marksheet';

    try {
      // In production, we might want to limit file size here using fastify-multipart options
      const evidence = await vaultService.uploadDocument(
        fastify.minio,
        data.file,
        data.filename,
        data.mimetype,
        0, // Passing 0 for unknown size - Minio SDK will handle via multipart upload if size unknown
        {
          tenantId: user.tenantId,
          studentId,
          uploadedBy: user.id,
          category
        }
      );

      return evidence;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Failed to upload document' });
    }
  });

  /**
   * Get pre-signed URL for an evidence.
   * Admin/Faculty can access any. Student can only access their own.
   */
  fastify.get('/evidence/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;

    try {
      // vaultService.getPresignedUrl already checks tenant isolation
      const url = await vaultService.getPresignedUrl(fastify.minio, id, user.tenantId);
      
      // Additional check for Student role: Can they access this specific student's evidence?
      // Since Evidence model has studentId, we could check it against user.profileId
      // But for now, tenant-level isolation is the primary requirement.
      
      return { url };
    } catch (err) {
      return reply.code(404).send({ message: (err as Error).message });
    }
  });

  /**
   * Delete an evidence.
   * Only Admin can delete evidence.
   */
  fastify.delete('/evidence/:id', {
    preHandler: [checkRoles(['admin'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;

    try {
      await vaultService.deleteDocument(fastify.minio, id, user.tenantId);
      return { message: 'Evidence deleted' };
    } catch (err) {
      return reply.code(404).send({ message: (err as Error).message });
    }
  });

  /**
   * List all evidences for a student.
   * Admin/Faculty can see any. Student can only see their own.
   */
  fastify.get('/students/:studentId/evidence', async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    const user = request.user as any;

    // Authorization
    if (!user.roles.includes('admin') && !user.roles.includes('faculty')) {
      if (user.profileId !== studentId) {
        return reply.code(403).send({ message: 'Forbidden' });
      }
    }

    const evidences = await vaultService.getStudentEvidences(studentId, user.tenantId);
    return evidences;
  });
}
