import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.js';
import AttendanceService from '../services/att.service.js';
import { AttendanceStatus } from '../models/AttendanceRecord.js';

interface ShortageJobData {
  courseId: string;
  tenantId: string;
}

export const shortageWorker = new Worker(
  'shortage-check',
  async (job: Job<ShortageJobData>) => {
    const { courseId, tenantId } = job.data;
    console.log(`Processing shortage check for course: ${courseId}, tenant: ${tenantId}`);

    // Get list of all students registered for the course
    const students = await AttendanceService.getRegisterList(courseId, tenantId);

    for (const student of students as any[]) {
      const stats = await AttendanceService.getStudentStats(student._id, tenantId);
      const courseStats = stats.find(s => s.courseId.toString() === courseId.toString());

      if (courseStats && courseStats.percentage < 75) {
        // Log a notification for shortage (Task 3-2)
        console.warn(`[SHORTAGE ALERT] Student ${student.rollNumber} has ${courseStats.percentage}% attendance in course ${courseId}. (Threshold: 75%)`);
        
        // In Phase 3, we would integrate actual email/SMS/app notification logic here.
      }
    }
  },
  { connection }
);

shortageWorker.on('completed', job => {
  console.log(`Job ${job.id} completed successfully.`);
});

shortageWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

console.log('Shortage worker started.');
