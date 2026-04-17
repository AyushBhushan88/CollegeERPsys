import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface IPayment extends Document {
  tenantId: Types.ObjectId;
  demandId: Types.ObjectId;
  studentId: Types.ObjectId;
  amount: number;
  gateway: 'Razorpay';
  gatewayOrderId: string;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  demandId: { type: Schema.Types.ObjectId, ref: 'FeeDemand', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  gateway: { type: String, enum: ['Razorpay'], default: 'Razorpay' },
  gatewayOrderId: { type: String, required: true },
  status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
  transactionId: { type: String }
}, {
  timestamps: true
});

PaymentSchema.plugin(mongooseIsolation);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
