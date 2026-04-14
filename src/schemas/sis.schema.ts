import { z } from 'zod';

export const studentSchema = z.object({
  userId: z.string(),
  name: z.string(),
  dob: z.string().transform((val) => new Date(val)),
  gender: z.string(),
  category: z.string(),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string()
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }),
  guardianDetails: z.object({
    name: z.string(),
    relationship: z.string(),
    contact: z.string()
  }),
  admissionNumber: z.string(),
  enrollmentNumber: z.string(),
  branch: z.string(),
  section: z.string(),
  batch: z.string(),
  yearOfAdmission: z.number()
});

export const facultySchema = z.object({
  userId: z.string(),
  name: z.string(),
  department: z.string(),
  designation: z.string(),
  qualifications: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number()
  })),
  experience: z.array(z.object({
    institution: z.string(),
    role: z.string(),
    duration: z.string()
  })),
  publications: z.array(z.object({
    title: z.string(),
    journal: z.string(),
    year: z.number()
  })),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string()
  })
});
