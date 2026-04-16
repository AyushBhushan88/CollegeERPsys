import mongoose, { Schema, Document } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export interface IRoom extends Document {
  tenantId: string;
  name: string;
  type: 'Theory' | 'Lab';
  capacity: number;
  location: string;
}

const RoomSchema = new Schema<IRoom>({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Theory', 'Lab'], required: true },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
});

RoomSchema.plugin(mongooseIsolation);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
