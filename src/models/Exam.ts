import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export enum ExamType {
  MAIN = 'MAIN',
  SUPPLEMENTARY = 'SUPPLEMENTARY',
}

export interface IExam extends Document {
  title: string;
  type: ExamType;
  term: number;
  year: number;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: Object.values(ExamType), required: true },
  term: { type: Number, required: true },
  year: { type: Number, required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

ExamSchema.plugin(mongooseTenantIsolation);

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
