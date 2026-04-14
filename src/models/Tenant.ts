import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  settings: { type: Object, default: {} }
}, {
  timestamps: true
});

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
