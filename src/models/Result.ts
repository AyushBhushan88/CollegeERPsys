import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export interface IResult extends Document {
  studentId: Types.ObjectId;
  semester: number;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  publishedDate: Date;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true },
  academicYear: { type: String, required: true },
  sgpa: { type: Number, required: true, default: 0 },
  cgpa: { type: Number, required: true, default: 0 },
  publishedDate: { type: Date, default: Date.now },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

ResultSchema.plugin(mongooseTenantIsolation);

// Unique index for (tenantId, studentId, semester, academicYear)
ResultSchema.index({ tenantId: 1, studentId: 1, semester: 1, academicYear: 1 }, { unique: true });

export const Result = mongoose.model<IResult>('Result', ResultSchema);
