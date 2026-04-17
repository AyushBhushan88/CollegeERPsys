import { Types } from 'mongoose';
import { FeeDemand, FeeStatus } from '../models/FeeDemand.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Circulation, CirculationStatus } from '../models/Circulation.js';
import { Faculty } from '../models/Faculty.js';
import { Student } from '../models/Student.js';
import { Result } from '../models/Result.js';
import { MarkEntry } from '../models/MarkEntry.js';
import AttendanceRecord, { AttendanceStatus } from '../models/AttendanceRecord.js';
import { AnalyticsCache } from '../models/AnalyticsCache.js';

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
  enrollment: {
    totalStudents: number;
    newEnrollments: number;
  };
  academics: {
    avgPassPercentage: number;
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

    // Enrollment Snapshot
    const totalStudents = await Student.countDocuments({ tenantId: tId });
    const currentYear = new Date().getFullYear();
    const newEnrollments = await Student.countDocuments({
      tenantId: tId,
      yearOfAdmission: currentYear
    });

    // Academic Snapshot
    const passMetrics = await MarkEntry.aggregate([
      { $match: { tenantId: tId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $ne: ['$grade', 'F'] }, 1, 0] } }
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
    const academics = passMetrics.length > 0 ? (passMetrics[0].passed / passMetrics[0].total) * 100 : 0;

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
      },
      enrollment: {
        totalStudents,
        newEnrollments
      },
      academics: {
        avgPassPercentage: academics
      }
    };
  }

  async getEnrollmentAnalytics(tenantId: string, filters: any = {}) {
    const tId = new Types.ObjectId(tenantId);
    const match: any = { tenantId: tId };

    if (filters.branch) match.branch = filters.branch;
    if (filters.yearOfAdmission) match.yearOfAdmission = Number(filters.yearOfAdmission);
    if (filters.gender) match.gender = filters.gender;

    return await Student.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            branch: '$branch',
            yearOfAdmission: '$yearOfAdmission',
            gender: '$gender'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          branch: '$_id.branch',
          yearOfAdmission: '$_id.yearOfAdmission',
          gender: '$_id.gender',
          count: 1
        }
      },
      { $sort: { yearOfAdmission: -1, branch: 1 } }
    ]);
  }

  async getFeeAnalytics(tenantId: string, filters: any = {}) {
    const tId = new Types.ObjectId(tenantId);
    const match: any = { tenantId: tId };

    return await FeeDemand.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'feestructures',
          localField: 'structureId',
          foreignField: '_id',
          as: 'structure'
        }
      },
      { $unwind: '$structure' },
      {
        $group: {
          _id: {
            batch: '$student.batch',
            category: '$structure.name'
          },
          totalDemand: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' }
        }
      },
      {
        $project: {
          _id: 0,
          batch: '$_id.batch',
          category: '$_id.category',
          totalDemand: 1,
          totalPaid: 1,
          collectionRatio: {
            $cond: [
              { $eq: ['$totalDemand', 0] },
              0,
              { $divide: ['$totalPaid', '$totalDemand'] }
            ]
          }
        }
      },
      { $sort: { batch: 1, category: 1 } }
    ]);
  }

  async getAcademicAnalytics(tenantId: string, filters: any = {}) {
    const tId = new Types.ObjectId(tenantId);
    const match: any = { tenantId: tId };

    const gpaMetrics = await Result.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.batch',
          avgSGPA: { $avg: '$sgpa' },
          avgCGPA: { $avg: '$cgpa' }
        }
      },
      {
        $project: {
          _id: 0,
          batch: '$_id',
          avgSGPA: 1,
          avgCGPA: 1
        }
      }
    ]);

    const passMetrics = await MarkEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$courseId',
          total: { $sum: 1 },
          passed: {
            $sum: { $cond: [{ $ne: ['$grade', 'F'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          courseId: '$_id',
          passPercentage: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$passed', '$total'] }, 100] }
            ]
          }
        }
      }
    ]);

    // Attendance-Performance Correlation
    const correlation = await AttendanceRecord.aggregate([
      { $match: { tenantId: tenantId } }, // tenantId is string in AttendanceRecord
      {
        $group: {
          _id: '$studentId',
          totalSessions: { $sum: 1 },
          presentSessions: {
            $sum: {
              $cond: [
                { $in: ['$status', [AttendanceStatus.PRESENT, AttendanceStatus.LATE]] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          studentId: '$_id',
          attendancePercentage: {
            $cond: [
              { $eq: ['$totalSessions', 0] },
              0,
              { $multiply: [{ $divide: ['$presentSessions', '$totalSessions'] }, 100] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'results',
          localField: 'studentId',
          foreignField: 'studentId',
          as: 'results'
        }
      },
      { $unwind: '$results' },
      {
        $project: {
          attendancePercentage: 1,
          cgpa: '$results.cgpa',
          bracket: {
            $switch: {
              branches: [
                { case: { $lt: ['$attendancePercentage', 50] }, then: '0-50%' },
                { case: { $lt: ['$attendancePercentage', 75] }, then: '50-75%' },
                { case: { $lt: ['$attendancePercentage', 85] }, then: '75-85%' }
              ],
              default: '85-100%'
            }
          }
        }
      },
      {
        $group: {
          _id: '$bracket',
          avgCGPA: { $avg: '$cgpa' },
          studentCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          bracket: '$_id',
          avgCGPA: 1,
          studentCount: 1
        }
      },
      { $sort: { bracket: 1 } }
    ]);

    return {
      gpaMetrics,
      passMetrics,
      correlation
    };
  }

  async getCachedAnalytics(tenantId: string, key: string, generator: () => Promise<any>, ttl: number = 3600) {
    const tId = new Types.ObjectId(tenantId);
    const cached = await AnalyticsCache.findOne({ tenantId: tId, key });

    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }

    const data = await generator();
    await AnalyticsCache.findOneAndUpdate(
      { tenantId: tId, key },
      {
        data,
        expiresAt: new Date(Date.now() + ttl * 1000)
      },
      { upsert: true, new: true }
    );

    return data;
  }
}

export const analyticsService = new AnalyticsService();
