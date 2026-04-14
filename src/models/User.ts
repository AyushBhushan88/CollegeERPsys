import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  roles: string[];
  permissions: string[];
  tenantId: Types.ObjectId;
  profileId?: Types.ObjectId;
  profileModel?: 'Student' | 'Faculty';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true },
  password: { type: String },
  roles: { type: [String], default: ['user'] },
  permissions: { type: [String], default: [] },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  profileId: { type: Schema.Types.ObjectId, refPath: 'profileModel' },
  profileModel: { type: String, enum: ['Student', 'Faculty'] }
}, {
  timestamps: true
});

// We'll add the isolation plugin globally later, 
// so no need to add it here explicitly.

// Important: unique index on email AND tenantId
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
