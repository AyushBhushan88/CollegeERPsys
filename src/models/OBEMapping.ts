import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOBEMapping extends Document {
  sourceId: Types.ObjectId; // Typically CO
  targetId: Types.ObjectId; // Typically PO or PSO
  weight: number; // 0, 1, 2, 3
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OBEMappingSchema: Schema = new Schema({
  sourceId: { type: Schema.Types.ObjectId, ref: 'Outcome', required: true },
  targetId: { type: Schema.Types.ObjectId, ref: 'Outcome', required: true },
  weight: { type: Number, min: 0, max: 3, required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

// Unique index on sourceId, targetId, and tenantId
OBEMappingSchema.index({ sourceId: 1, targetId: 1, tenantId: 1 }, { unique: true });

export const OBEMapping = mongoose.model<IOBEMapping>('OBEMapping', OBEMappingSchema);
