import { Types } from 'mongoose';
import { Exam, IExam } from '../models/Exam.js';
import { ExamTimetable, IExamTimetable } from '../models/ExamTimetable.js';
import { CourseRegistration } from '../models/CourseRegistration.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import { MarkEntry, MarkEntryStatus } from '../models/MarkEntry.js';
import { Result } from '../models/Result.js';
import { hallTicketQueue } from '../config/bullmq.js';
import { GradingEngine, AbsoluteGradingStrategy } from './grading.strategy.js';
import { Course } from '../models/Course.js';

export class ExamService {
  async createExam(data: Partial<IExam>): Promise<IExam> {
    const exam = new Exam(data);
    return await exam.save();
  }

  async scheduleExam(data: Partial<IExamTimetable>): Promise<IExamTimetable> {
    const { tenantId, examId, courseId, roomId, date, slot } = data;

    // 1. Room Clash Detection is handled by MongoDB unique index on { tenantId, roomId, date, slot }
    // However, we might want to check it here to provide a better error message.
    const existingRoomExam = await ExamTimetable.findOne({ tenantId, roomId, date, slot });
    if (existingRoomExam) {
      throw new Error(`Room is already booked for another exam at this time.`);
    }

    // 2. Student Clash Detection
    // Find all students registered for this course
    const registeredStudents = await CourseRegistration.find({ courseId, tenantId, status: 'APPROVED' }).distinct('studentId');

    // Find all other exams scheduled at the same time
    const otherExamsAtSameTime = await ExamTimetable.find({ tenantId, date, slot, examId });
    
    for (const otherExam of otherExamsAtSameTime) {
      const otherCourseStudents = await CourseRegistration.find({ 
        courseId: otherExam.courseId, 
        tenantId, 
        status: 'APPROVED' 
      }).distinct('studentId');

      // Check for intersection
      const clashingStudents = registeredStudents.filter(id => 
        otherCourseStudents.some(otherId => otherId.toString() === id.toString())
      );

      if (clashingStudents.length > 0) {
        throw new Error(`Student clash detected for ${clashingStudents.length} students between courses.`);
      }
    }

    const timetableEntry = new ExamTimetable(data);
    return await timetableEntry.save();
  }

  async checkEligibility(studentId: string | Types.ObjectId, courseId: string | Types.ObjectId, tenantId: string | Types.ObjectId): Promise<{ eligible: boolean; percentage: number }> {
    const totalRecords = await AttendanceRecord.countDocuments({ studentId, courseId, tenantId });
    if (totalRecords === 0) return { eligible: true, percentage: 100 }; // Or false, depending on policy. Usually true if no classes held.

    const attendedRecords = await AttendanceRecord.countDocuments({
      studentId,
      courseId,
      tenantId,
      status: { $in: ['Present', 'Late', 'Excused'] }
    });

    const percentage = (attendedRecords / totalRecords) * 100;
    return {
      eligible: percentage >= 75,
      percentage
    };
  }

  async requestHallTicket(studentId: string | Types.ObjectId, examId: string | Types.ObjectId, tenantId: string | Types.ObjectId) {
    // Get all courses for this exam from timetable
    const examEntries = await ExamTimetable.find({ examId, tenantId });
    
    for (const entry of examEntries) {
      const { eligible, percentage } = await this.checkEligibility(studentId, entry.courseId, tenantId.toString());
      if (!eligible) {
        throw new Error(`Ineligible for exam due to low attendance (${percentage.toFixed(2)}%) in course ${entry.courseId}`);
      }
    }

    // Push to queue
    const job = await hallTicketQueue.add('generate-pdf', {
      studentId,
      examId,
      tenantId
    });

    return { jobId: job.id, message: 'Hall ticket generation queued.' };
  }

  async enterMarks(markData: any) {
    const { totalMarks } = markData;
    const engine = new GradingEngine(new AbsoluteGradingStrategy());
    const { grade, gradePoints } = engine.calculate(totalMarks, { tenantId: markData.tenantId });

    return await MarkEntry.findOneAndUpdate(
      { 
        studentId: markData.studentId, 
        courseId: markData.courseId, 
        examId: markData.examId,
        tenantId: markData.tenantId 
      },
      { ...markData, grade, gradePoints },
      { upsert: true, new: true }
    );
  }

  async publishResults(examId: string | Types.ObjectId, tenantId: string | Types.ObjectId) {
    // 1. Update MarkEntry status to PUBLISHED
    await MarkEntry.updateMany({ examId, tenantId }, { status: MarkEntryStatus.PUBLISHED });

    // 2. Identify students in this exam
    const studentIds = await MarkEntry.find({ examId, tenantId }).distinct('studentId');

    for (const studentId of studentIds) {
      await this.calculateAndSaveResult(studentId, tenantId);
    }
  }

  async calculateAndSaveResult(studentId: Types.ObjectId, tenantId: Types.ObjectId) {
     // This would involve SGPA/CGPA calculation logic
     // For brevity, we'll implement a skeleton and expand if needed
     const marks = await MarkEntry.find({ studentId, tenantId, status: MarkEntryStatus.PUBLISHED });
     
     // Group by semester (we might need to join with Exam to get semester/year)
     // For now, let's assume we calculate for the latest exam's semester
     const sgpa = await this.calculateSGPA(studentId, tenantId);
     const cgpa = await this.calculateCGPA(studentId, tenantId);

     // Update or create Result
     // Need to determine semester and academicYear from context
     // ...
  }

  async calculateSGPA(studentId: Types.ObjectId, tenantId: Types.ObjectId): Promise<number> {
    // SGPA = (Sum of (GradePoint * Credits)) / (Sum of Credits)
    const publishedMarks = await MarkEntry.find({ studentId, tenantId, status: MarkEntryStatus.PUBLISHED }).populate('courseId');
    
    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const mark of publishedMarks) {
      const course = mark.courseId as any; // Cast to ICourse
      totalGradePoints += mark.gradePoints * course.credits;
      totalCredits += course.credits;
    }

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  }

  async calculateCGPA(studentId: Types.ObjectId, tenantId: Types.ObjectId): Promise<number> {
    // Simplified CGPA: Average of all published marks
    // Real CGPA would be across all semesters
    return await this.calculateSGPA(studentId, tenantId); 
  }
}

export const examService = new ExamService();
