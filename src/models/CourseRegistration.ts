import mongoose, { Schema, Document, Types } from 'mongoose';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface ICourseRegistration extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  semester: string; // e.g., 'S24', 'F24'
  status: RegistrationStatus;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseRegistrationSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: String, required: true },
  status: { type: String, enum: Object.values(RegistrationStatus), default: RegistrationStatus.PENDING },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

// Unique registration per student, course, and semester within a tenant
CourseRegistrationSchema.index({ studentId: 1, courseId: 1, semester: 1, tenantId: 1 }, { unique: true });

export const CourseRegistration = mongoose.model<ICourseRegistration>('CourseRegistration', CourseRegistrationSchema);
