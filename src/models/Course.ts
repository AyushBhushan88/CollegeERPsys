import mongoose, { Schema, Document, Types } from 'mongoose';

export enum CourseType {
  CORE = 'CORE',
  ELECTIVE = 'ELECTIVE',
  OPEN = 'OPEN',
}

export interface ICourse extends Document {
  code: string;
  name: string;
  credits: number;
  type: CourseType;
  department: string;
  prerequisites: Types.ObjectId[];
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  type: { type: String, enum: Object.values(CourseType), required: true },
  department: { type: String, required: true },
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

// Unique index on code AND tenantId
CourseSchema.index({ code: 1, tenantId: 1 }, { unique: true });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
