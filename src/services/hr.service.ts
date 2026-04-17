import { LeaveRequest, ILeaveRequest } from '../models/LeaveRequest.js';
import { Faculty, IFaculty } from '../models/Faculty.js';
import { TimetableEntry } from '../models/TimetableEntry.js';
import mongoose from 'mongoose';
import { getTenantId } from '../middleware/tenant.js';

export class HRService {
  /**
   * Submit a new leave request
   */
  async requestLeave(data: Partial<ILeaveRequest>): Promise<ILeaveRequest> {
    const tenantId = getTenantId();
    const leaveRequest = new LeaveRequest({
      ...data,
      tenantId,
      status: 'Pending',
      approvalChain: []
    });
    return await leaveRequest.save();
  }

  /**
   * Update leave status and add to approval history
   */
  async updateLeaveStatus(
    leaveId: string,
    update: { approverId: string; status: 'Approved' | 'Rejected'; comment?: string }
  ): Promise<ILeaveRequest | null> {
    const leaveRequest = await LeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }

    leaveRequest.status = update.status;
    leaveRequest.approvalChain.push({
      approverId: new mongoose.Types.ObjectId(update.approverId),
      status: update.status,
      comment: update.comment,
      timestamp: new Date()
    });

    return await leaveRequest.save();
  }

  /**
   * Calculate faculty workload based on timetable entries
   */
  async getFacultyWorkload(facultyId: string): Promise<number> {
    const tenantId = getTenantId();
    const result = await TimetableEntry.aggregate([
      {
        $match: {
          tenantId: tenantId,
          facultyId: new mongoose.Types.ObjectId(facultyId)
        }
      },
      {
        $group: {
          _id: null,
          totalSlots: { $sum: 1 }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalSlots : 0;
  }

  /**
   * Get faculty profile
   */
  async getFacultyProfile(facultyId: string): Promise<IFaculty | null> {
    return await Faculty.findById(facultyId);
  }

  /**
   * Update faculty profile
   */
  async updateFacultyProfile(facultyId: string, data: Partial<IFaculty>): Promise<IFaculty | null> {
    return await Faculty.findByIdAndUpdate(facultyId, data, { new: true });
  }

  /**
   * List pending leave requests
   */
  async getPendingLeaves(): Promise<ILeaveRequest[]> {
    return await LeaveRequest.find({ status: 'Pending' }).populate('facultyId', 'name department');
  }
}
