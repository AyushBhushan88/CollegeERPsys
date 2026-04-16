import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.js';
import { Exam } from '../models/Exam.js';
import { ExamTimetable } from '../models/ExamTimetable.js';
import { Student } from '../models/Student.js';

interface HallTicketJobData {
  studentId: string;
  examId: string;
  tenantId: string;
}

export const examWorker = new Worker(
  'hall-ticket-gen',
  async (job: Job<HallTicketJobData>) => {
    const { studentId, examId, tenantId } = job.data;
    
    console.log(`[ExamWorker] Generating hall ticket for Student: ${studentId}, Exam: ${examId}, Tenant: ${tenantId}`);

    // Fetch data for the PDF
    const student = await Student.findById(studentId);
    const exam = await Exam.findById(examId);
    const timetable = await ExamTimetable.find({ examId, tenantId }).populate('courseId roomId');

    if (!student || !exam) {
      throw new Error('Student or Exam not found during hall ticket generation');
    }

    // PDF generation logic (mocked for prototype)
    // In a real implementation, you would use pdfmake here
    const hallTicketContent = {
      studentName: student.name,
      rollNumber: student.rollNumber,
      examName: exam.name,
      schedule: timetable.map(t => ({
        course: (t.courseId as any).name,
        date: t.date,
        slot: t.slot,
        room: (t.roomId as any).name
      }))
    };

    console.log(`[ExamWorker] Hall ticket content prepared:`, JSON.stringify(hallTicketContent));
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`[ExamWorker] Hall ticket generated successfully for job ${job.id}`);
    
    return { success: true, studentName: student.name };
  },
  { connection }
);

examWorker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

examWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with ${err.message}`);
});
