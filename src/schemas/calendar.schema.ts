import { z } from 'zod';

export const eventTypeEnum = z.enum(['Holiday', 'Exam', 'Event', 'Academic']);

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().optional(),
  type: eventTypeEnum
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
