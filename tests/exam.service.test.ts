import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamService } from '../src/services/exam.service.js';
import { Exam } from '../src/models/Exam.js';
import { ExamTimetable } from '../src/models/ExamTimetable.js';
import AttendanceRecord from '../src/models/AttendanceRecord.js';
import { CourseRegistration } from '../src/models/CourseRegistration.js';
import mongoose from 'mongoose';

vi.mock('../src/models/Exam.js');
vi.mock('../src/models/ExamTimetable.js');
vi.mock('../src/models/AttendanceRecord.js');
vi.mock('../src/models/CourseRegistration.js');
vi.mock('../src/middleware/tenant.js', () => ({
  getTenantId: vi.fn().mockReturnValue('tenant123')
}));

describe('ExamService', () => {
  let examService: ExamService;

  beforeEach(() => {
    examService = new ExamService();
    vi.clearAllMocks();
  });

  describe('scheduleExam', () => {
    it('should prevent room clashes', async () => {
      const timetableData = {
        examId: new mongoose.Types.ObjectId(),
        courseId: new mongoose.Types.ObjectId(),
        roomId: new mongoose.Types.ObjectId(),
        date: new Date('2024-05-15'),
        slot: 'Morning'
      };

      // Mock finding an existing entry with same room/date/slot
      (ExamTimetable.findOne as any).mockResolvedValue({ _id: 'clash' });

      await expect(examService.scheduleExam(timetableData as any)).rejects.toThrow('Room clash detected');
    });

    it('should detect student clashes', async () => {
      const timetableData = {
        examId: new mongoose.Types.ObjectId(),
        courseId: new mongoose.Types.ObjectId(),
        roomId: new mongoose.Types.ObjectId(),
        date: new Date('2024-05-15'),
        slot: 'Morning'
      };

      // Mock no room clash
      (ExamTimetable.findOne as any).mockResolvedValue(null);

      // Mock another course's exam in same slot
      const otherCourseId = new mongoose.Types.ObjectId();
      (ExamTimetable.find as any).mockResolvedValue([{ courseId: otherCourseId }]);

      // Mock a student registered for BOTH courses
      (CourseRegistration.find as any).mockImplementation((query) => {
        if (query.courseId === timetableData.courseId) {
          return Promise.resolve([{ studentId: 'student1' }]);
        }
        if (query.courseId === otherCourseId) {
          return Promise.resolve([{ studentId: 'student1' }]);
        }
        return Promise.resolve([]);
      });

      await expect(examService.scheduleExam(timetableData as any)).rejects.toThrow('Student clash detected');
    });

    it('should create exam entry if no clashes', async () => {
        const timetableData = {
          examId: new mongoose.Types.ObjectId(),
          courseId: new mongoose.Types.ObjectId(),
          roomId: new mongoose.Types.ObjectId(),
          date: new Date('2024-05-15'),
          slot: 'Morning'
        };
  
        (ExamTimetable.findOne as any).mockResolvedValue(null);
        (ExamTimetable.find as any).mockResolvedValue([]);
        const mockTimetable = { ...timetableData, _id: new mongoose.Types.ObjectId(), save: vi.fn() };
        (ExamTimetable as any).mockImplementation(() => mockTimetable);
  
        const result = await examService.scheduleExam(timetableData as any);
  
        expect(ExamTimetable).toHaveBeenCalledWith(timetableData);
        expect(mockTimetable.save).toHaveBeenCalled();
        expect(result).toBe(mockTimetable);
      });
  });

  describe('requestHallTicket', () => {
    it('should throw error if student has < 75% attendance', async () => {
      const studentId = new mongoose.Types.ObjectId();
      const examId = new mongoose.Types.ObjectId();

      // Mock attendance: 2 present, 1 absent = 66%
      (AttendanceRecord.find as any).mockResolvedValue([
        { status: 'Present' },
        { status: 'Present' },
        { status: 'Absent' }
      ]);

      await expect(examService.requestHallTicket(studentId.toString(), examId.toString())).rejects.toThrow('Ineligible due to low attendance');
    });
  });
});
