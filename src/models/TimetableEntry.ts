import mongoose, { Schema, Document } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export interface ITimetableEntry extends Document {
  tenantId: string;
  dayOfWeek: number; // 1-6 (Monday-Saturday)
  slotIndex: number; // 1-8 (Time slot index)
  roomId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sectionId: string; // From Section model if it existed, otherwise string
  batchId?: string; // Optional for labs
}

const TimetableEntrySchema = new Schema<ITimetableEntry>({
  tenantId: { type: String, required: true, index: true },
  dayOfWeek: { type: Number, required: true, min: 1, max: 6 },
  slotIndex: { type: Number, required: true, min: 1, max: 8 },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  sectionId: { type: String, required: true },
  batchId: { type: String },
});

// Room Conflict
TimetableEntrySchema.index({ tenantId: 1, roomId: 1, dayOfWeek: 1, slotIndex: 1 }, { unique: true });

// Faculty Conflict
TimetableEntrySchema.index({ tenantId: 1, facultyId: 1, dayOfWeek: 1, slotIndex: 1 }, { unique: true });

// Section Conflict
TimetableEntrySchema.index({ tenantId: 1, sectionId: 1, dayOfWeek: 1, slotIndex: 1 }, { unique: true });

TimetableEntrySchema.plugin(mongooseIsolation);

export const TimetableEntry = mongoose.model<ITimetableEntry>('TimetableEntry', TimetableEntrySchema);
