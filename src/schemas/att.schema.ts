import { z } from 'zod';
import { AttendanceStatus } from '../models/AttendanceRecord.js';

export const markAttendanceSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),
      courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID'),
      date: z.string().datetime(),
      slotId: z.string(),
      status: z.nativeEnum(AttendanceStatus),
    })
  ),
});

export const condonationSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.string(),
  evidenceUrl: z.string().url(),
});

export const approveCondonationSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
});
