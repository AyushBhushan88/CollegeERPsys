import mongoose, { Schema, Document } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export interface ISubstitution extends Document {
  tenantId: string;
  entryId: mongoose.Types.ObjectId; // The original TimetableEntry
  date: Date;
  substituteId: mongoose.Types.ObjectId; // The faculty substituting
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: mongoose.Types.ObjectId; // The user requesting (usually the original faculty)
}

const SubstitutionSchema = new Schema<ISubstitution>({
  tenantId: { type: String, required: true, index: true },
  entryId: { type: Schema.Types.ObjectId, ref: 'TimetableEntry', required: true },
  date: { type: Date, required: true },
  substituteId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Ensure a substitute faculty isn't assigned twice on the same date and time slot
// This requires knowing the slot from the entryId. 
// We might want to denormalize dayOfWeek and slotIndex if we want DB level unique constraint easily,
// but for now we'll handle it in the service layer or just use this record as is.

SubstitutionSchema.plugin(mongooseIsolation);

export const Substitution = mongoose.model<ISubstitution>('Substitution', SubstitutionSchema);
