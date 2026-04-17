import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportBuilderService } from '../src/services/reportBuilder.service';
import mongoose from 'mongoose';

vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose') as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      model: vi.fn(),
    },
    model: vi.fn(),
  };
});

describe('ReportBuilderService', () => {
  let reportBuilderService: ReportBuilderService;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      aggregate: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([{ name: 'John Doe' }])
      }),
    };
    (mongoose.model as any).mockReturnValue(mockModel);
    reportBuilderService = new ReportBuilderService();
    vi.clearAllMocks();
  });

  describe('buildPipeline', () => {
    it('should always include tenantId as the first match stage', () => {
      const config = {
        baseModel: 'Student',
        columns: [{ field: 'name', label: 'Name' }],
        filters: [],
        sort: []
      };
      const tenantId = new mongoose.Types.ObjectId();
      const pipeline = reportBuilderService.buildPipeline(config as any, tenantId);

      expect(pipeline[0]).toEqual({ $match: { tenantId } });
    });

    it('should allow whitelisted operators', () => {
      const config = {
        baseModel: 'Student',
        columns: [{ field: 'name', label: 'Name' }],
        filters: [{ field: 'status', operator: '$eq', value: 'Active' }],
        sort: []
      };
      const tenantId = new mongoose.Types.ObjectId();
      const pipeline = reportBuilderService.buildPipeline(config as any, tenantId);

      expect(pipeline[1]).toEqual({ $match: { status: { $eq: 'Active' } } });
    });

    it('should throw error for non-whitelisted operators', () => {
      const config = {
        baseModel: 'Student',
        columns: [{ field: 'name', label: 'Name' }],
        filters: [{ field: 'status', operator: '$where', value: 'Active' }],
        sort: []
      };
      const tenantId = new mongoose.Types.ObjectId();
      
      expect(() => reportBuilderService.buildPipeline(config as any, tenantId)).toThrow();
    });

    it('should throw error for non-whitelisted fields', () => {
      const config = {
        baseModel: 'Student',
        columns: [{ field: 'name', label: 'Name' }],
        filters: [{ field: 'invalidField', operator: '$eq', value: 'Active' }],
        sort: []
      };
      const tenantId = new mongoose.Types.ObjectId();
      
      expect(() => reportBuilderService.buildPipeline(config as any, tenantId)).toThrow();
    });

    it('should generate correct $project and $sort stages', () => {
        const config = {
          baseModel: 'Student',
          columns: [{ field: 'name', label: 'Name' }, { field: 'admissionNumber', label: 'ID' }],
          filters: [],
          sort: [{ field: 'name', order: 'asc' }]
        };
        const tenantId = new mongoose.Types.ObjectId();
        const pipeline = reportBuilderService.buildPipeline(config as any, tenantId);
  
        expect(pipeline).toContainEqual({ $project: { name: 1, admissionNumber: 1, _id: 0 } });
        expect(pipeline).toContainEqual({ $sort: { name: 1 } });
    });
  });

  describe('executeReport', () => {
    it('should call aggregate on the correct model', async () => {
      const config = {
        baseModel: 'Student',
        columns: [{ field: 'name', label: 'Name' }],
        filters: [],
        sort: []
      };
      const tenantId = new mongoose.Types.ObjectId();
      await reportBuilderService.executeReport(config as any, tenantId);

      expect(mongoose.model).toHaveBeenCalledWith('Student');
      expect(mockModel.aggregate).toHaveBeenCalled();
    });
  });
});
