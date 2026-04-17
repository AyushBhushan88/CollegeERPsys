import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export interface IFeeItem {
  name: string;
  amount: number;
}

export interface IFeeStructure extends Document {
  tenantId: Types.ObjectId;
  name: string;
  academicYear: string;
  branch: string;
  batch: string;
  items: IFeeItem[];
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  academicYear: { type: String, required: true },
  branch: { type: String, required: true },
  batch: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

FeeStructureSchema.plugin(mongooseIsolation);

export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);
