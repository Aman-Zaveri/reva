import { z } from 'zod';

// Experience schemas
export const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  title: z.string().min(1, 'Job title is required').max(100, 'Job title too long'),
  location: z.string().max(100, 'Location too long').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  bullets: z.array(z.string().max(500, 'Bullet point too long')).optional(),
});

export const updateExperienceSchema = experienceSchema.extend({
  id: z.string().cuid('Invalid experience ID'),
});

// Education schemas
export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required').max(100, 'Institution name too long'),
  program: z.string().min(1, 'Program/Degree is required').max(100, 'Program name too long'),
  minor: z.string().max(100, 'Minor too long').optional(),
  graduationDate: z.string().datetime().optional(),
  gpa: z.string().max(10, 'GPA too long').optional(),
  relevantCoursework: z.string().max(500, 'Coursework description too long').optional(),
});

export const updateEducationSchema = educationSchema.extend({
  id: z.string().cuid('Invalid education ID'),
});

// Personal Info schemas
export const personalInfoSchema = z.object({
  firstName: z.string().max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional(),
  github: z.string().url('Invalid GitHub URL').optional(),
  summary: z.string().max(1000, 'Summary too long').optional(),
});

// Skills schemas
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50, 'Skill name too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category name too long'),
});

export const updateSkillSchema = skillSchema.extend({
  id: z.string().cuid('Invalid skill ID'),
});

// Projects schemas
export const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Project title too long'),
  link: z.string().url('Invalid project URL').optional(),
  date: z.string().datetime().optional(),
  bullets: z.array(z.string().max(500, 'Bullet point too long')).optional(),
});

export const updateProjectSchema = projectSchema.extend({
  id: z.string().cuid('Invalid project ID'),
});

// Generic validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid input data' };
  }
}