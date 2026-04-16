import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceService } from '../src/services/att.service.js';
import { AttendanceStatus } from '../src/models/AttendanceRecord.js';
import { RegistrationStatus } from '../src/models/CourseRegistration.js';
import { CondonationStatus } from '../src/models/Condonation.js';
import mongoose from 'mongoose';

// Mock Models
vi.mock('../src/models/AttendanceRecord.js', () => ({
  default: {
    bulkWrite: vi.fn(),
    find: vi.fn(),
  },
  AttendanceStatus: {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
    EXCUSED: 'EXCUSED',
  }
}));

vi.mock('../src/models/CourseRegistration.js', () => ({
  CourseRegistration: {
    find: vi.fn(),
  },
  RegistrationStatus: {
    APPROVED: 'APPROVED',
    PENDING: 'PENDING',
  }
}));

vi.mock('../src/models/Condonation.js', () => ({
  default: {
    find: vi.fn(),
  },
  CondonationStatus: {
    APPROVED: 'APPROVED',
    PENDING: 'PENDING',
  }
}));

vi.mock('../src/config/bullmq.js', () => ({
  shortageQueue: {
    add: vi.fn(),
  }
}));

// We need to import the mocked modules to setup their mock return values
import AttendanceRecord from '../src/models/AttendanceRecord.js';
import { CourseRegistration } from '../src/models/CourseRegistration.js';
import Condonation from '../src/models/Condonation.js';

describe('AttendanceService', () => {
  let service: AttendanceService;
  const tenantId = 'tenant-1';
  const studentId = 'student-1';
  const courseId = 'course-1';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AttendanceService();
  });

  it('should mark attendance correctly', async () => {
    const data = [
      {
        studentId,
        courseId,
        date: new Date(),
        slotId: 'L1',
        status: AttendanceStatus.PRESENT
      }
    ];

    (AttendanceRecord.bulkWrite as any).mockResolvedValue({ ok: 1 });

    await service.markAttendance(data, 'faculty-1', tenantId);
    
    expect(AttendanceRecord.bulkWrite).toHaveBeenCalled();
  });

  it('should calculate attendance percentage correctly', async () => {
    // Mock Course Registration
    (CourseRegistration.find as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          courseId: { _id: courseId, name: 'Test Course', code: 'TC101' },
          studentId,
          status: RegistrationStatus.APPROVED
        }
      ])
    });

    // Mock Attendance Records: 4 sessions, 2 present, 2 absent
    const records = [
      { tenantId, studentId, courseId, date: new Date('2026-04-01'), status: AttendanceStatus.PRESENT },
      { tenantId, studentId, courseId, date: new Date('2026-04-02'), status: AttendanceStatus.PRESENT },
      { tenantId, studentId, courseId, date: new Date('2026-04-03'), status: AttendanceStatus.ABSENT },
      { tenantId, studentId, courseId, date: new Date('2026-04-04'), status: AttendanceStatus.ABSENT },
    ];
    (AttendanceRecord.find as any).mockResolvedValue(records);

    // Mock Condonations: One approved covering the 2nd absent session
    (Condonation.find as any).mockResolvedValue([
      {
        tenantId,
        studentId,
        courseId,
        startDate: new Date('2026-04-04'),
        endDate: new Date('2026-04-04'),
        status: CondonationStatus.APPROVED
      }
    ]);

    const stats = await service.getStudentStats(studentId, tenantId);
    
    // 2 present + 1 condoned = 3/4 = 75%
    expect(stats[0].percentage).toBe(75);
    expect(stats[0].totalSessions).toBe(4);
    expect(stats[0].presentCount).toBe(2);
    expect(stats[0].condonedCount).toBe(1);
  });
});
