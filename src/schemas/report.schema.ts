import { z } from 'zod';

export const reportDefinitionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  baseModel: z.enum(['Student', 'Faculty', 'Course', 'FeeDemand', 'AttendanceRecord']),
  columns: z.array(z.object({
    field: z.string(),
    label: z.string(),
    transform: z.string().optional()
  })),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['$eq', '$gt', '$lt', '$in', '$regex']),
    value: z.any()
  })),
  sort: z.array(z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc'])
  })),
});

export const reportWhitelist: Record<string, string[]> = {
  Student: ['name', 'gender', 'category', 'branch', 'section', 'batch', 'yearOfAdmission', 'status', 'admissionNumber', 'enrollmentNumber'],
  Faculty: ['name', 'department', 'designation'],
  Course: ['name', 'code', 'credits', 'department', 'type'],
  FeeDemand: ['studentId', 'amount', 'dueDate', 'status', 'type'],
  AttendanceRecord: ['studentId', 'courseId', 'date', 'status']
};

export type ReportDefinitionInput = z.infer<typeof reportDefinitionSchema>;
