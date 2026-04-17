import { Types } from 'mongoose';
import { FeeDemand, FeeStatus } from '../models/FeeDemand.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Circulation, CirculationStatus } from '../models/Circulation.js';
import { Faculty } from '../models/Faculty.js';

export interface DashboardSummary {
  fees: {
    totalDemand: number;
    totalCollected: number;
    overdueCount: number;
  };
  hr: {
    pendingLeaveRequests: number;
    activeFacultyCount: number;
  };
  library: {
    activeCirculations: number;
    overdueBooksCount: number;
  };
}

export class AnalyticsService {
  async getDashboardSummary(tenantId: string): Promise<DashboardSummary> {
    const tId = new Types.ObjectId(tenantId);

    // Fee Analytics
    const feeMetrics = await FeeDemand.aggregate([
      { $match: { tenantId: tId } },
      {
        $group: {
          _id: null,
          totalDemand: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
          overdueCount: {
            $sum: { $cond: [{ $eq: ['$status', FeeStatus.OVERDUE] }, 1, 0] }
          }
        }
      }
    ]);

    // HR Analytics
    const pendingLeaves = await LeaveRequest.countDocuments({
      tenantId: tId,
      status: 'Pending'
    });
    const facultyCount = await Faculty.countDocuments({ tenantId: tId });

    // Library Analytics
    const activeCirculations = await Circulation.countDocuments({
      tenantId: tId,
      status: CirculationStatus.ISSUED
    });
    const overdueBooks = await Circulation.countDocuments({
      tenantId: tId,
      status: CirculationStatus.OVERDUE
    });

    const fees = feeMetrics.length > 0 ? feeMetrics[0] : { totalDemand: 0, totalCollected: 0, overdueCount: 0 };

    return {
      fees: {
        totalDemand: fees.totalDemand,
        totalCollected: fees.totalCollected,
        overdueCount: fees.overdueCount
      },
      hr: {
        pendingLeaveRequests: pendingLeaves,
        activeFacultyCount: facultyCount
      },
      library: {
        activeCirculations: activeCirculations,
        overdueBooksCount: overdueBooks
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
