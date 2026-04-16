import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export enum ExamRequestType {
  REVALUATION = 'REVALUATION',
  SUPPLEMENTARY = 'SUPPLEMENTARY',
}

export enum ExamRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface IExamRequest extends Document {
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  resultId?: Types.ObjectId;
  courseId: Types.ObjectId;
  examId?: Types.ObjectId;
  type: ExamRequestType;
  status: ExamRequestStatus;
  feePaid: boolean;
  amount: number;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamRequestSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  resultId: { type: Schema.Types.ObjectId, ref: 'Result' },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
  type: { type: String, enum: Object.values(ExamRequestType), required: true },
  status: { type: String, enum: Object.values(ExamRequestStatus), default: ExamRequestStatus.PENDING },
  feePaid: { type: Boolean, default: false },
  amount: { type: Number, required: true, default: 0 },
  reason: { type: String }
}, {
  timestamps: true
});

ExamRequestSchema.plugin(mongooseTenantIsolation);

export const ExamRequest = mongoose.model<IExamRequest>('ExamRequest', ExamRequestSchema);
