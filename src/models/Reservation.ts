import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export enum ReservationStatus {
  PENDING = 'Pending',
  FULFILLED = 'Fulfilled',
  EXPIRED = 'Expired',
  CANCELLED = 'Cancelled'
}

export interface IReservation extends Document {
  tenantId: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  reservationDate: Date;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reservationDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: Object.values(ReservationStatus), 
    default: ReservationStatus.PENDING 
  }
}, {
  timestamps: true
});

ReservationSchema.plugin(mongooseIsolation);

export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema);
