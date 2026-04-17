import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HRService } from '../src/services/hr.service.js';
import { LeaveRequest } from '../src/models/LeaveRequest.js';
import { Faculty } from '../src/models/Faculty.js';
import { TimetableEntry } from '../src/models/TimetableEntry.js';
import mongoose from 'mongoose';

vi.mock('../src/models/LeaveRequest.js');
vi.mock('../src/models/Faculty.js');
vi.mock('../src/models/TimetableEntry.js');
vi.mock('../src/middleware/tenant.js', () => ({
  getTenantId: vi.fn().mockReturnValue('tenant123')
}));

describe('HRService', () => {
  let hrService: HRService;

  beforeEach(() => {
    hrService = new HRService();
    vi.clearAllMocks();
  });

  describe('requestLeave', () => {
    it('should create a new leave request', async () => {
      const leaveData = {
        facultyId: new mongoose.Types.ObjectId(),
        type: 'CL',
        startDate: new Date(),
        endDate: new Date(),
        reason: 'Personal'
      };

      const mockLeave: any = { ...leaveData, _id: new mongoose.Types.ObjectId() };
      mockLeave.save = vi.fn().mockResolvedValue(mockLeave);
      (LeaveRequest as any).mockImplementation(function() { return mockLeave; });

      const result = await hrService.requestLeave(leaveData as any);

      expect(LeaveRequest).toHaveBeenCalledWith(expect.objectContaining(leaveData));
      expect(mockLeave.save).toHaveBeenCalled();
      expect(result).toBe(mockLeave);
    });
  });

  describe('updateLeaveStatus', () => {
    it('should update leave status and append to approval chain', async () => {
      const leaveId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        approverId: new mongoose.Types.ObjectId(),
        status: 'Approved',
        comment: 'Fine'
      };
      const existingLeave = {
        _id: leaveId,
        status: 'Pending',
        approvalChain: [],
        save: vi.fn()
      };

      (LeaveRequest.findById as any).mockResolvedValue(existingLeave);

      const result = await hrService.updateLeaveStatus(leaveId, updateData as any);

      expect(LeaveRequest.findById).toHaveBeenCalledWith(leaveId);
      expect(existingLeave.status).toBe('Approved');
      expect(existingLeave.approvalChain).toHaveLength(1);
      expect(existingLeave.approvalChain[0]).toMatchObject(updateData);
      expect(existingLeave.save).toHaveBeenCalled();
    });
  });

  describe('getFacultyWorkload', () => {
    it('should return workload based on timetable entries', async () => {
      const facultyId = new mongoose.Types.ObjectId();
      const mockAggregationResult = [{ _id: null, totalSlots: 15 }];
      
      (TimetableEntry.aggregate as any).mockResolvedValue(mockAggregationResult);

      const result = await hrService.getFacultyWorkload(facultyId.toString());

      expect(TimetableEntry.aggregate).toHaveBeenCalledWith([
        { 
          $match: { 
            tenantId: 'tenant123',
            facultyId: new mongoose.Types.ObjectId(facultyId.toString()) 
          } 
        },
        { $group: { _id: null, totalSlots: { $sum: 1 } } }
      ]);
      expect(result).toBe(15);
    });

    it('should return 0 if no timetable entries found', async () => {
      const facultyId = new mongoose.Types.ObjectId();
      (TimetableEntry.aggregate as any).mockResolvedValue([]);

      const result = await hrService.getFacultyWorkload(facultyId.toString());

      expect(result).toBe(0);
    });
  });
});
