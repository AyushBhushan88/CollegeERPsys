import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation';

export interface IFaculty extends Document {
  userId: Types.ObjectId;
  tenantId: Types.ObjectId;
  name: string;
  department: string;
  designation: string;
  qualifications: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience: {
    institution: string;
    role: string;
    duration: string;
  }[];
  publications: {
    title: string;
    journal: string;
    year: number;
  }[];
  photo?: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  qualifications: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true }
  }],
  experience: [{
    institution: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String, required: true }
  }],
  publications: [{
    title: { type: String, required: true },
    journal: { type: String, required: true },
    year: { type: Number, required: true }
  }],
  photo: { type: String },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true }
  }
}, {
  timestamps: true
});

FacultySchema.index({ tenantId: 1, department: 1 });

FacultySchema.plugin(mongooseIsolation);

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);
