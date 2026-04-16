import mongoose, { Schema, Document, Types } from 'mongoose';

export enum SyllabusStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface IUnit {
  title: string;
  description: string;
}

export interface ISyllabus extends Document {
  courseId: Types.ObjectId;
  version: number;
  units: IUnit[];
  status: SyllabusStatus;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SyllabusSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  version: { type: Number, required: true },
  units: [{
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  status: { type: String, enum: Object.values(SyllabusStatus), default: SyllabusStatus.DRAFT },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

// Unique index on courseId, version, and tenantId
SyllabusSchema.index({ courseId: 1, version: 1, tenantId: 1 }, { unique: true });

export const Syllabus = mongoose.model<ISyllabus>('Syllabus', SyllabusSchema);
