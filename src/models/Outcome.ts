import mongoose, { Schema, Document, Types } from 'mongoose';

export enum OutcomeType {
  CO = 'CO',
  PO = 'PO',
  PSO = 'PSO',
}

export interface IOutcome extends Document {
  type: OutcomeType;
  code: string;
  description: string;
  courseId?: Types.ObjectId;
  department?: string; // For PO/PSO
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OutcomeSchema: Schema = new Schema({
  type: { type: String, enum: Object.values(OutcomeType), required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  department: { type: String },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

// Unique index on code, type, and tenantId (and courseId if it's a CO)
OutcomeSchema.index({ code: 1, type: 1, tenantId: 1, courseId: 1 }, { unique: true });

export const Outcome = mongoose.model<IOutcome>('Outcome', OutcomeSchema);
