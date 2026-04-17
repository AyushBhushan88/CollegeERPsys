import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeeService } from '../src/services/fee.service.js';
import { FeeStructure } from '../src/models/FeeStructure.js';
import { FeeDemand, FeeStatus } from '../src/models/FeeDemand.js';
import mongoose from 'mongoose';

vi.mock('../src/models/FeeStructure.js');
vi.mock('../src/models/FeeDemand.js');
vi.mock('../src/middleware/tenant.js', () => ({
  getTenantId: vi.fn().mockReturnValue('tenant123')
}));

describe('FeeService', () => {
  let feeService: FeeService;

  beforeEach(() => {
    feeService = new FeeService();
    vi.clearAllMocks();
  });

  describe('createStructure', () => {
    it('should create a new fee structure', async () => {
      const structureData = {
        name: 'Annual Fees 2023',
        academicYear: '2023-24',
        branch: 'CSE',
        batch: '2023',
        items: [{ name: 'Tuition', amount: 50000 }]
      };

      const mockStructure = { ...structureData, _id: new mongoose.Types.ObjectId() };
      const saveMock = vi.fn().mockResolvedValue(mockStructure);
      (mockStructure as any).save = saveMock;
      
      // Use a regular function to act as a constructor
      (FeeStructure as any).mockImplementation(function() {
        return mockStructure;
      });

      const result = await feeService.createStructure(structureData as any);

      expect(FeeStructure).toHaveBeenCalledWith(structureData);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toBe(mockStructure);
    });
  });

  describe('generateDemands', () => {
    it('should generate fee demands for students based on structure', async () => {
      const structureId = new mongoose.Types.ObjectId().toString();
      const studentIds = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];
      const dueDate = new Date();
      const mockStructure = {
        _id: structureId,
        items: [{ name: 'Tuition', amount: 50000 }, { name: 'Lab', amount: 5000 }],
        tenantId: 'tenant123'
      };

      (FeeStructure.findById as any).mockResolvedValue(mockStructure);
      (FeeDemand.insertMany as any).mockResolvedValue([{ studentId: studentIds[0] }, { studentId: studentIds[1] }]);

      const result = await feeService.generateDemands(structureId, studentIds, dueDate);

      expect(FeeStructure.findById).toHaveBeenCalledWith(structureId);
      expect(FeeDemand.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            studentId: expect.any(mongoose.Types.ObjectId),
            structureId: mockStructure._id,
            totalAmount: 55000,
            dueDate: dueDate
          })
        ]),
        { ordered: false }
      );
      expect(result).toHaveLength(2);
    });

    it('should throw error if structure not found', async () => {
      (FeeStructure.findById as any).mockResolvedValue(null);
      await expect(feeService.generateDemands('invalid', [], new Date())).rejects.toThrow('Fee structure not found');
    });
  });

  describe('applyConcession', () => {
    it('should apply concession and update totalAmount', async () => {
      const demandId = new mongoose.Types.ObjectId().toString();
      const concession = { type: 'Scholarship', amount: 10000, reason: 'Merit' };
      const mockDemand = {
        _id: demandId,
        items: [{ name: 'Tuition', amount: 50000 }],
        concessions: [],
        totalAmount: 50000,
        paidAmount: 0,
        status: FeeStatus.PENDING,
        save: vi.fn().mockImplementation(function(this: any) { return Promise.resolve(this); })
      };

      (FeeDemand.findById as any).mockResolvedValue(mockDemand);

      const result = await feeService.applyConcession(demandId, concession);

      expect(FeeDemand.findById).toHaveBeenCalledWith(demandId);
      expect(mockDemand.concessions).toContain(concession);
      expect(mockDemand.totalAmount).toBe(40000);
      expect(mockDemand.save).toHaveBeenCalled();
      expect(result.totalAmount).toBe(40000);
    });
  });

  describe('getStudentBalance', () => {
    it('should calculate total balance for a student', async () => {
      const studentId = new mongoose.Types.ObjectId().toString();
      const mockDemands = [
        { totalAmount: 50000, paidAmount: 20000 },
        { totalAmount: 5000, paidAmount: 0 }
      ];

      (FeeDemand.find as any).mockResolvedValue(mockDemands);

      const result = await feeService.getStudentBalance(studentId);

      expect(FeeDemand.find).toHaveBeenCalledWith({
        studentId: expect.any(mongoose.Types.ObjectId),
        status: { $in: [FeeStatus.PENDING, FeeStatus.PARTIAL, FeeStatus.OVERDUE] }
      });
      expect(result).toBe(35000);
    });
  });

  describe('checkOverdueDemands', () => {
    it('should update status of overdue demands', async () => {
      (FeeDemand.updateMany as any).mockResolvedValue({ modifiedCount: 5 });

      const result = await feeService.checkOverdueDemands();

      expect(FeeDemand.updateMany).toHaveBeenCalledWith(
        {
          status: { $in: [FeeStatus.PENDING, FeeStatus.PARTIAL] },
          dueDate: { $lt: expect.any(Date) }
        },
        {
          $set: { status: FeeStatus.OVERDUE }
        }
      );
      expect((result as any).modifiedCount).toBe(5);
    });
  });
});
