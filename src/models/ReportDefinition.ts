import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReportDefinition extends Document {
  name: string;
  description: string;
  baseModel: string;
  columns: { field: string; label: string; transform?: string }[];
  filters: { field: string; operator: string; value: any }[];
  sort: { field: string; order: 'asc' | 'desc' }[];
  tenantId: Types.ObjectId;
}

const ReportDefinitionSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  baseModel: { type: String, required: true },
  columns: [{
    field: { type: String, required: true },
    label: { type: String, required: true },
    transform: { type: String }
  }],
  filters: [{
    field: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  }],
  sort: [{
    field: { type: String, required: true },
    order: { type: String, enum: ['asc', 'desc'], default: 'asc' }
  }],
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, {
  timestamps: true
});

ReportDefinitionSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const ReportDefinition = mongoose.model<IReportDefinition>('ReportDefinition', ReportDefinitionSchema);
