import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnalyticsCache extends Document {
  tenantId: Types.ObjectId;
  key: string;
  data: any;
  expiresAt: Date;
}

const AnalyticsCacheSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  key: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true }
});

AnalyticsCacheSchema.index({ tenantId: 1, key: 1 }, { unique: true });
AnalyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AnalyticsCache = mongoose.model<IAnalyticsCache>('AnalyticsCache', AnalyticsCacheSchema);
