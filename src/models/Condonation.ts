import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export enum CondonationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface ICondonation extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: string; // e.g., 'Medical', 'Event'
  evidenceUrl: string;
  status: CondonationStatus;
  approvedBy: Types.ObjectId; // User ID (Admin)
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CondonationSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, required: true },
    evidenceUrl: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(CondonationStatus),
      default: CondonationStatus.PENDING,
      required: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index for performance
CondonationSchema.index({ tenantId: 1, studentId: 1, courseId: 1 });

// Apply tenant isolation
CondonationSchema.plugin(mongooseTenantIsolation);

export default mongoose.models.Condonation ||
  mongoose.model<ICondonation>('Condonation', CondonationSchema);
