import mongoose, { Schema, Document, Types } from 'mongoose';

export enum StudentStatus {
  ADMISSION = 'Admission',
  ACTIVE = 'Active',
  GRADUATED = 'Graduated',
  ALUMNI = 'Alumni',
  WITHDRAWN = 'Withdrawn'
}

export interface IStudent extends Document {
  userId: Types.ObjectId;
  tenantId: Types.ObjectId;
  name: string;
  dob: Date;
  gender: string;
  category: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  guardianDetails: {
    name: string;
    relationship: string;
    contact: string;
  };
  photo?: string;
  admissionNumber: string;
  enrollmentNumber: string;
  branch: string;
  section: string;
  batch: string;
  yearOfAdmission: number;
  status: StudentStatus;
  statusHistory: {
    status: StudentStatus;
    date: Date;
    remarks?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  category: { type: String, required: true },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  guardianDetails: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    contact: { type: String, required: true }
  },
  photo: { type: String },
  admissionNumber: { type: String, required: true, unique: true },
  enrollmentNumber: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  section: { type: String, required: true },
  batch: { type: String, required: true },
  yearOfAdmission: { type: Number, required: true },
  status: { type: String, enum: Object.values(StudentStatus), default: StudentStatus.ADMISSION },
  statusHistory: [{
    status: { type: String, enum: Object.values(StudentStatus) },
    date: { type: Date, default: Date.now },
    remarks: { type: String }
  }]
}, {
  timestamps: true
});

StudentSchema.index({ tenantId: 1, admissionNumber: 1 }, { unique: true });
StudentSchema.index({ tenantId: 1, enrollmentNumber: 1 }, { unique: true });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
