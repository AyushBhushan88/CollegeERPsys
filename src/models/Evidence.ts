import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  name: string;
  key: string; // MinIO object key
  bucket: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  category: string; // e.g., 'marksheet', 'photo', 'certificate'
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    name: { type: String, required: true },
    key: { type: String, required: true },
    bucket: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';
EvidenceSchema.plugin(mongooseTenantIsolation);

export default mongoose.model<IEvidence>('Evidence', EvidenceSchema);
