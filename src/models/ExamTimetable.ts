import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export interface IExamTimetable extends Document {
  examId: Types.ObjectId;
  courseId: Types.ObjectId;
  roomId: Types.ObjectId;
  date: Date;
  slot: string; // e.g. 'Morning', 'Afternoon' or '09:00 - 12:00'
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamTimetableSchema: Schema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: Date, required: true },
  slot: { type: String, required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

ExamTimetableSchema.plugin(mongooseTenantIsolation);

// Unique index on { tenantId, roomId, date, slot } to prevent room clashes
ExamTimetableSchema.index({ tenantId: 1, roomId: 1, date: 1, slot: 1 }, { unique: true });

// Prevent course from having two exams in different rooms/dates for the same exam
ExamTimetableSchema.index({ examId: 1, courseId: 1 }, { unique: true });

export const ExamTimetable = mongoose.model<IExamTimetable>('ExamTimetable', ExamTimetableSchema);
