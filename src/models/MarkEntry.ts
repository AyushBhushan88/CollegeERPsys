import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export enum MarkEntryStatus {
  DRAFT = 'DRAFT',
  MODERATED = 'MODERATED',
  PUBLISHED = 'PUBLISHED',
}

export interface IMarkEntry extends Document {
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  courseId: Types.ObjectId;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
  status: MarkEntryStatus;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarkEntrySchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  internalMarks: { type: Number, required: true, default: 0 },
  externalMarks: { type: Number, required: true, default: 0 },
  totalMarks: { type: Number, required: true, default: 0 },
  grade: { type: String, required: true, default: '' },
  gradePoints: { type: Number, required: true, default: 0 },
  status: { type: String, enum: Object.values(MarkEntryStatus), default: MarkEntryStatus.DRAFT },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

MarkEntrySchema.plugin(mongooseTenantIsolation);

// Unique index for (tenantId, studentId, examId, courseId)
MarkEntrySchema.index({ tenantId: 1, studentId: 1, examId: 1, courseId: 1 }, { unique: true });

export const MarkEntry = mongoose.model<IMarkEntry>('MarkEntry', MarkEntrySchema);
