import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['Theory', 'Lab']),
  capacity: z.number().int().positive(),
  location: z.string().min(1),
});

export const createTimetableEntrySchema = z.object({
  dayOfWeek: z.number().int().min(1).max(6),
  slotIndex: z.number().int().min(1).max(8),
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  facultyId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  sectionId: z.string().min(1),
  batchId: z.string().optional(),
});

export const createSubstitutionSchema = z.object({
  entryId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  date: z.string().pipe(z.coerce.date()),
  substituteId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const getFreeFacultySchema = z.object({
  dayOfWeek: z.string().pipe(z.coerce.number().int().min(1).max(6)),
  slotIndex: z.string().pipe(z.coerce.number().int().min(1).max(8)),
  department: z.string().optional(),
});
