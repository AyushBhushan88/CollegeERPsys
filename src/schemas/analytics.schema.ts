import { z } from 'zod';

export const AnalyticsQuerySchema = z.object({
  query: z.object({
    branch: z.string().optional(),
    yearOfAdmission: z.string().optional(),
    gender: z.string().optional(),
    batch: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    departmentId: z.string().optional()
  })
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>['query'];
