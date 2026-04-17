import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';
import { IFeeItem } from './FeeStructure.js';

export enum FeeStatus {
  PENDING = 'Pending',
  PARTIAL = 'Partial',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export interface IConcession {
  type: string;
  amount: number;
  reason: string;
}

export interface IFeeDemand extends Document {
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  structureId: Types.ObjectId;
  items: IFeeItem[];
  concessions: IConcession[];
  totalAmount: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeeDemandSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  structureId: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  items: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  concessions: [{
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(FeeStatus), default: FeeStatus.PENDING },
  dueDate: { type: Date, required: true }
}, {
  timestamps: true
});

FeeDemandSchema.index({ tenantId: 1, studentId: 1, structureId: 1 }, { unique: true });

FeeDemandSchema.plugin(mongooseIsolation);

export const FeeDemand = mongoose.model<IFeeDemand>('FeeDemand', FeeDemandSchema);
