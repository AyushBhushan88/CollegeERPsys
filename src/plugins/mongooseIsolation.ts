import type { Schema, Query } from 'mongoose';
import { getTenantId } from '../middleware/tenant.js';

export interface TenantIsolationOptions {
  tenantIdKey?: string;
  skipIsolation?: boolean;
}

export const mongooseTenantIsolation = (schema: Schema, options?: TenantIsolationOptions) => {
  const tenantIdKey = options?.tenantIdKey || 'tenantId';

  // Helper to add tenantId to query
  const applyTenantIsolation = function (this: Query<any, any>) {
    const tenantId = getTenantId();
    if (tenantId) {
      this.where(tenantIdKey).equals(tenantId);
    }
  };

  // List of query methods to intercept
  const queryMethods = [
    'countDocuments',
    'deleteMany',
    'deleteOne',
    'distinct',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndReplace',
    'findOneAndUpdate',
    'replaceOne',
    'updateMany',
    'updateOne',
  ] as const;

  // Apply to all query methods
  queryMethods.forEach((method) => {
    schema.pre(method, applyTenantIsolation);
  });

  // Handle document save - auto-inject tenantId for new documents
  schema.pre('save', async function (this: any) {
    const tenantId = getTenantId();
    if (tenantId && this.isNew && !this.get(tenantIdKey)) {
      this.set(tenantIdKey, tenantId);
    }
  });
};

export const mongooseIsolation = mongooseTenantIsolation;
