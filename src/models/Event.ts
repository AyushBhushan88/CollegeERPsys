import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export interface IEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  type: 'Holiday' | 'Exam' | 'Event' | 'Academic';
  tenantId: Types.ObjectId;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String },
  type: { 
    type: String, 
    enum: ['Holiday', 'Exam', 'Event', 'Academic'],
    required: true
  },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

EventSchema.plugin(mongooseIsolation);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
