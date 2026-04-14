import * as Minio from 'minio';
import Evidence, { IEvidence } from '../models/Evidence.js';
import { Types } from 'mongoose';
import { Readable } from 'stream';

export class VaultService {
  private bucketName = 'evidence-vault';

  /**
   * Ensure the bucket exists in MinIO.
   */
  async ensureBucketExists(minioClient: Minio.Client) {
    try {
      const exists = await minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (err) {
      console.error('Error ensuring bucket exists:', err);
      throw err;
    }
  }

  /**
   * Upload a document to MinIO and save its metadata to MongoDB.
   * Path is scoped by tenantId and studentId for logical isolation.
   */
  async uploadDocument(
    minioClient: Minio.Client,
    fileStream: Readable,
    filename: string,
    mimetype: string,
    size: number,
    metadata: { 
      tenantId: string; 
      studentId: string; 
      uploadedBy: string; 
      category: string 
    }
  ): Promise<IEvidence> {
    await this.ensureBucketExists(minioClient);

    const key = `${metadata.tenantId}/${metadata.studentId}/${Date.now()}-${filename}`;
    
    // Put object into MinIO
    // If size is unknown, use fPutObject or stream with a chunk size if needed.
    // For fastify-multipart, it can sometimes provide size if content-length is present.
    await minioClient.putObject(
      this.bucketName,
      key,
      fileStream,
      size,
      { 'Content-Type': mimetype }
    );

    const evidence = new Evidence({
      tenantId: new Types.ObjectId(metadata.tenantId),
      studentId: new Types.ObjectId(metadata.studentId),
      name: filename,
      key,
      bucket: this.bucketName,
      mimeType: mimetype,
      size,
      uploadedBy: new Types.ObjectId(metadata.uploadedBy),
      category: metadata.category,
    });

    await evidence.save();
    return evidence;
  }

  /**
   * Generate a pre-signed URL for temporary document access.
   * Access is strictly checked by tenantId.
   */
  async getPresignedUrl(
    minioClient: Minio.Client,
    evidenceId: string,
    tenantId: string
  ): Promise<string> {
    // Note: mongooseTenantIsolation plugin will automatically filter by current tenant
    // but explicit check is safer here for cross-tenant verification in tests.
    const evidence = await Evidence.findOne({ 
      _id: new Types.ObjectId(evidenceId), 
      tenantId: new Types.ObjectId(tenantId) 
    });

    if (!evidence) {
      throw new Error('Evidence not found or access denied');
    }

    return minioClient.presignedGetObject(evidence.bucket, evidence.key, 3600); // 1 hour expiry
  }

  /**
   * Delete a document from MinIO and MongoDB.
   * Scoped by tenantId.
   */
  async deleteDocument(
    minioClient: Minio.Client,
    evidenceId: string,
    tenantId: string
  ): Promise<void> {
    const evidence = await Evidence.findOne({ 
      _id: new Types.ObjectId(evidenceId), 
      tenantId: new Types.ObjectId(tenantId) 
    });

    if (!evidence) {
      throw new Error('Evidence not found or access denied');
    }

    await minioClient.removeObject(evidence.bucket, evidence.key);
    await Evidence.deleteOne({ _id: evidenceId });
  }

  /**
   * List evidences for a specific student.
   * Scoped by tenantId.
   */
  async getStudentEvidences(studentId: string, tenantId: string): Promise<IEvidence[]> {
    return Evidence.find({ 
      studentId: new Types.ObjectId(studentId), 
      tenantId: new Types.ObjectId(tenantId) 
    });
  }
}

export const vaultService = new VaultService();
