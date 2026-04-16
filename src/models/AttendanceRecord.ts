import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  EXCUSED = 'Excused',
}

export interface IAttendanceRecord extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  date: Date;
  slotId: string; // e.g., 'slot1', '9:00-10:00'
  status: AttendanceStatus;
  markedBy: Types.ObjectId; // User ID (Faculty/Admin)
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true },
    slotId: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index for performance and uniqueness
AttendanceRecordSchema.index(
  { tenantId: 1, studentId: 1, courseId: 1, date: 1, slotId: 1 },
  { unique: true }
);

// Apply tenant isolation
AttendanceRecordSchema.plugin(mongooseTenantIsolation);

export default mongoose.models.AttendanceRecord ||
  mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
