import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export enum CirculationStatus {
  ISSUED = 'Issued',
  RETURNED = 'Returned',
  OVERDUE = 'Overdue'
}

export interface ICirculation extends Document {
  tenantId: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: CirculationStatus;
  fineAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CirculationSchema = new Schema<ICirculation>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { 
    type: String, 
    enum: Object.values(CirculationStatus), 
    default: CirculationStatus.ISSUED 
  },
  fineAmount: { type: Number, default: 0 }
}, {
  timestamps: true
});

CirculationSchema.plugin(mongooseIsolation);

export const Circulation = mongoose.model<ICirculation>('Circulation', CirculationSchema);
