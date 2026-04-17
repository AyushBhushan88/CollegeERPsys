import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongooseIsolation } from '../plugins/mongooseIsolation.js';

export interface IBook extends Document {
  tenantId: Types.ObjectId;
  title: string;
  authors: string[];
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  authors: [{ type: String, required: true }],
  isbn: { type: String, required: true },
  category: { type: String, required: true },
  publisher: { type: String, required: true },
  year: { type: Number, required: true },
  totalCopies: { type: Number, required: true, min: 0 },
  availableCopies: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },
}, {
  timestamps: true
});

// Unique ISBN per tenant
BookSchema.index({ tenantId: 1, isbn: 1 }, { unique: true });
// Text search index
BookSchema.index({ title: 'text', authors: 'text', category: 'text' });

BookSchema.plugin(mongooseIsolation);

export const Book = mongoose.model<IBook>('Book', BookSchema);
