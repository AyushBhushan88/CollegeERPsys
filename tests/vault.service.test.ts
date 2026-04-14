import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vaultService } from '../src/services/vault.service.js';
import Evidence from '../src/models/Evidence.js';
import mongoose, { Types } from 'mongoose';
import { Readable } from 'stream';

vi.mock('../src/models/Evidence.js');

describe('VaultService', () => {
  let mockMinioClient: any;

  beforeEach(() => {
    mockMinioClient = {
      bucketExists: vi.fn(),
      makeBucket: vi.fn(),
      putObject: vi.fn(),
      presignedGetObject: vi.fn(),
      removeObject: vi.fn(),
    };
    vi.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('should upload document to MinIO and save metadata to MongoDB', async () => {
      const mockFileStream = new Readable();
      mockFileStream.push('test content');
      mockFileStream.push(null);

      const metadata = {
        tenantId: new Types.ObjectId().toHexString(),
        studentId: new Types.ObjectId().toHexString(),
        uploadedBy: new Types.ObjectId().toHexString(),
        category: 'marksheet',
      };

      mockMinioClient.bucketExists.mockResolvedValue(true);
      
      // Mock Evidence instance and save method
      const mockEvidenceInstance = {
        save: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          ...metadata,
          name: 'test.pdf',
          key: 'key',
          bucket: 'evidence-vault',
          mimeType: 'application/pdf',
          size: 100,
        }),
      };

      (Evidence as any).mockImplementation(function() {
        return mockEvidenceInstance;
      });

      const result = await vaultService.uploadDocument(        mockMinioClient,
        mockFileStream,
        'test.pdf',
        'application/pdf',
        100,
        metadata
      );

      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith('evidence-vault');
      expect(mockMinioClient.putObject).toHaveBeenCalled();
      expect(mockEvidenceInstance.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getPresignedUrl', () => {
    it('should return a pre-signed URL for valid evidence', async () => {
      const tenantId = new Types.ObjectId().toHexString();
      const evidenceId = new Types.ObjectId().toHexString();
      const mockEvidence = {
        _id: evidenceId,
        bucket: 'evidence-vault',
        key: 'some-key',
        tenantId: new Types.ObjectId(tenantId),
      };

      (Evidence.findOne as any).mockResolvedValue(mockEvidence);
      mockMinioClient.presignedGetObject.mockResolvedValue('https://mock-url.com');

      const url = await vaultService.getPresignedUrl(mockMinioClient, evidenceId, tenantId);

      expect(Evidence.findOne).toHaveBeenCalled();
      expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith('evidence-vault', 'some-key', 3600);
      expect(url).toBe('https://mock-url.com');
    });

    it('should throw error if evidence not found', async () => {
      (Evidence.findOne as any).mockResolvedValue(null);
      await expect(vaultService.getPresignedUrl(mockMinioClient, new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString())).rejects.toThrow('Evidence not found');
    });
  });

  describe('deleteDocument', () => {
    it('should remove object from MinIO and delete from MongoDB', async () => {
      const tenantId = new Types.ObjectId().toHexString();
      const evidenceId = new Types.ObjectId().toHexString();
      const mockEvidence = {
        _id: evidenceId,
        bucket: 'evidence-vault',
        key: 'some-key',
      };

      (Evidence.findOne as any).mockResolvedValue(mockEvidence);
      (Evidence.deleteOne as any).mockResolvedValue({ deletedCount: 1 });

      await vaultService.deleteDocument(mockMinioClient, evidenceId, tenantId);

      expect(mockMinioClient.removeObject).toHaveBeenCalledWith('evidence-vault', 'some-key');
      expect(Evidence.deleteOne).toHaveBeenCalledWith({ _id: evidenceId });
    });
  });
});
