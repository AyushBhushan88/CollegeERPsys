import { z } from 'zod';
import { CourseType } from '../models/Course.js';
import { SyllabusStatus } from '../models/Syllabus.js';
import { OutcomeType } from '../models/Outcome.js';
import { RegistrationStatus } from '../models/CourseRegistration.js';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const courseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  credits: z.number().min(0),
  type: z.nativeEnum(CourseType),
  department: z.string().min(1),
  prerequisites: z.array(objectIdSchema).optional()
});

export const syllabusSchema = z.object({
  units: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1)
  })),
  status: z.nativeEnum(SyllabusStatus).optional()
});

export const outcomeSchema = z.object({
  type: z.nativeEnum(OutcomeType),
  code: z.string().min(1),
  description: z.string().min(1),
  courseId: objectIdSchema.optional(),
  department: z.string().optional()
});

export const obeMappingSchema = z.object({
  sourceId: objectIdSchema,
  targetId: objectIdSchema,
  weight: z.number().min(0).max(3)
});

export const courseRegistrationSchema = z.object({
  courseId: objectIdSchema,
  semester: z.string().min(1)
});

export const registrationStatusUpdateSchema = z.object({
  status: z.nativeEnum(RegistrationStatus)
});
