import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation';

export type LeaveType = 'CL' | 'EL' | 'ML' | 'OD';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IApprovalStep {
  approverId: Types.ObjectId;
  status: LeaveStatus;
  comment?: string;
  timestamp: Date;
}

export interface ILeaveRequest extends Document {
  tenantId: Types.ObjectId;
  facultyId: Types.ObjectId;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvalChain: IApprovalStep[];
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  type: { type: String, enum: ['CL', 'EL', 'ML', 'OD'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvalChain: [{
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], required: true },
    comment: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

LeaveRequestSchema.index({ tenantId: 1, facultyId: 1 });
LeaveRequestSchema.index({ tenantId: 1, status: 1 });

LeaveRequestSchema.plugin(mongooseIsolation);

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
