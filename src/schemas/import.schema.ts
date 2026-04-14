import { z } from 'zod';

export const StudentImportSchema = z.object({
  name: z.string().min(2),
  dob: z.string().or(z.date()).transform((val) => new Date(val)),
  gender: z.string().min(1),
  category: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  guardianName: z.string().min(1),
  guardianRelationship: z.string().min(1),
  guardianContact: z.string().min(1),
  admissionNumber: z.string().min(1),
  enrollmentNumber: z.string().min(1),
  branch: z.string().min(1),
  section: z.string().min(1),
  batch: z.string().min(1),
  yearOfAdmission: z.number().or(z.string().transform((val) => parseInt(val, 10))),
});

export type StudentImportRow = z.infer<typeof StudentImportSchema>;

export const ImportSummarySchema = z.object({
  successCount: z.number(),
  failCount: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    error: z.string(),
    data: z.any().optional(),
  })),
});

export type ImportSummary = z.infer<typeof ImportSummarySchema>;
