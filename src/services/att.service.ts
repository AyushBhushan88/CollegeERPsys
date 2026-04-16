import { Types } from 'mongoose';
import AttendanceRecord, { AttendanceStatus, IAttendanceRecord } from '../models/AttendanceRecord.js';
import { CourseRegistration, RegistrationStatus } from '../models/CourseRegistration.js';
import Condonation, { CondonationStatus } from '../models/Condonation.js';
import ExcelJS from 'exceljs';
import { shortageQueue } from '../config/bullmq.js';

export interface MarkAttendanceInput {
  studentId: string;
  courseId: string;
  date: Date;
  slotId: string;
  status: AttendanceStatus;
}

export class AttendanceService {
  /**
   * Bulk mark attendance for multiple students
   */
  async markAttendance(data: MarkAttendanceInput[], markedBy: string, tenantId: string) {
    const operations = data.map((record) => ({
      updateOne: {
        filter: {
          tenantId,
          studentId: record.studentId,
          courseId: record.courseId,
          date: record.date,
          slotId: record.slotId,
        },
        update: {
          $set: {
            status: record.status,
            markedBy,
          },
        },
        upsert: true,
      },
    }));

    const result = await AttendanceRecord.bulkWrite(operations);

    // After marking, add a job to the shortage-check queue for each unique course marked
    const uniqueCourses = [...new Set(data.map(d => d.courseId))];
    for (const courseId of uniqueCourses) {
      await shortageQueue.add(`shortage-check-${courseId}`, { courseId, tenantId });
    }

    return result;
  }

  /**
   * Get list of students registered for a course
   */
  async getRegisterList(courseId: string, tenantId: string) {
    const registrations = await CourseRegistration.find({
      courseId,
      tenantId,
      status: RegistrationStatus.APPROVED,
    }).populate('studentId');

    return registrations.map((r) => r.studentId);
  }

  /**
   * Calculate student attendance stats per course
   */
  async getStudentStats(studentId: string, tenantId: string) {
    // Get all approved course registrations for the student
    const registrations = await CourseRegistration.find({
      studentId,
      tenantId,
      status: RegistrationStatus.APPROVED,
    }).populate('courseId');

    const stats = await Promise.all(
      registrations.map(async (reg: any) => {
        const courseId = reg.courseId._id;

        // Get all attendance records for this student and course
        const records = await AttendanceRecord.find({
          studentId,
          courseId,
          tenantId,
        });

        // Get approved condonations for this student and course
        const condonations = await Condonation.find({
          studentId,
          courseId,
          tenantId,
          status: CondonationStatus.APPROVED,
        });

        const totalSessions = records.length;
        const presentCount = records.filter(
          (r) =>
            r.status === AttendanceStatus.PRESENT ||
            r.status === AttendanceStatus.EXCUSED ||
            r.status === AttendanceStatus.LATE
        ).length;

        // Condoned sessions are counted as present for percentage calculation
        // Need to calculate how many sessions were missed but condoned
        // For simplicity, let's say condonation covers a date range and we count sessions in that range as "Present"
        // In a more complex system, we'd check each absent record against condonation ranges.

        let condonedCount = 0;
        records.forEach((record) => {
          if (record.status === AttendanceStatus.ABSENT) {
            const isCondoned = condonations.some(
              (c) => record.date >= c.startDate && record.date <= c.endDate
            );
            if (isCondoned) condonedCount++;
          }
        });

        const adjustedPresent = presentCount + condonedCount;
        const percentage = totalSessions > 0 ? (adjustedPresent / totalSessions) * 100 : 100;

        return {
          courseId,
          courseName: reg.courseId.name,
          courseCode: reg.courseId.code,
          totalSessions,
          presentCount,
          condonedCount,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      })
    );

    return stats;
  }

  /**
   * Submit condonation request
   */
  async submitCondonation(studentId: string, data: any, tenantId: string) {
    const condonation = new Condonation({
      ...data,
      studentId,
      tenantId,
      status: CondonationStatus.PENDING,
    });
    return await condonation.save();
  }

  /**
   * Approve/Reject condonation request
   */
  async approveCondonation(condonationId: string, status: CondonationStatus, approvedBy: string, tenantId: string) {
    return await Condonation.findOneAndUpdate(
      { _id: condonationId, tenantId },
      { status, approvedBy },
      { new: true }
    );
  }

  /**
   * Generate course-wise attendance report in Excel
   */
  async generateCourseReport(courseId: string, tenantId: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    const students = await this.getRegisterList(courseId, tenantId);
    
    // Header
    worksheet.columns = [
      { header: 'Roll Number', key: 'rollNumber', width: 20 },
      { header: 'Student Name', key: 'name', width: 30 },
      { header: 'Total Sessions', key: 'total', width: 15 },
      { header: 'Present', key: 'present', width: 15 },
      { header: 'Absent', key: 'absent', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 },
    ];

    for (const student of students as any[]) {
      const records = await AttendanceRecord.find({
        studentId: student._id,
        courseId,
        tenantId,
      });

      const total = records.length;
      const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const absent = total - present;
      const percentage = total > 0 ? (present / total) * 100 : 100;

      worksheet.addRow({
        rollNumber: student.rollNumber,
        name: student.name || 'N/A', // Student model might have name via populate or joined user
        total,
        present,
        absent,
        percentage: `${percentage.toFixed(2)}%`,
      });
    }

    return workbook;
  }
}

export default new AttendanceService();
