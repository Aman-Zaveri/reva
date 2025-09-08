import { z } from 'zod';

// Hyperlink validation schema
const HyperlinkInfoSchema = z.object({
  url: z.string().optional(),
  displayText: z.string().optional(),
});

// Validation schemas
export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  location: z.string().min(1, 'Location is required'),
  linkedin: z.string().optional(),
  linkedinHyperlink: HyperlinkInfoSchema.optional(),
  github: z.string().optional(),
  githubHyperlink: HyperlinkInfoSchema.optional(),
  website: z.string().optional(),
  websiteHyperlink: HyperlinkInfoSchema.optional(),
  summary: z.string().optional(),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  date: z.string().min(1, 'Date is required'),
  bullets: z.array(z.string()).min(1, 'At least one bullet point is required'),
  tags: z.array(z.string()).optional().default([]),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Project title is required'),
  link: z.string().optional(),
  bullets: z.array(z.string()).min(1, 'At least one bullet point is required'),
  tags: z.array(z.string()).optional().default([]),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Skill category name is required'),
  details: z.string().min(1, 'Skill details are required'),
});

export const EducationSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Education title is required'),
  details: z.string().min(1, 'Education details are required'),
});

export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Profile name is required'),
  personalInfo: PersonalInfoSchema.optional(),
  experienceIds: z.array(z.string()),
  projectIds: z.array(z.string()),
  skillIds: z.array(z.string()),
  educationIds: z.array(z.string()),
  experienceOverrides: z.record(z.string(), ExperienceSchema.partial()).optional(),
  projectOverrides: z.record(z.string(), ProjectSchema.partial()).optional(),
  skillOverrides: z.record(z.string(), SkillSchema.partial()).optional(),
  educationOverrides: z.record(z.string(), EducationSchema.partial()).optional(),
  template: z.enum(['classic', 'compact']).optional().default('classic'),
  aiOptimization: z.object({
    timestamp: z.string(),
    keyInsights: z.array(z.string()),
    jobDescriptionHash: z.string(),
  }).optional(),
});

export const DataBundleSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experiences: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema),
  skills: z.array(SkillSchema),
  education: z.array(EducationSchema),
});

// API request schemas
export const OptimizeResumeRequestSchema = z.object({
  jobUrl: z.string().url('Invalid job URL').optional(),
  jobDescription: z.string().optional(),
  profile: ProfileSchema,
  data: DataBundleSchema,
  glazeLevel: z.number().int().min(1).max(5).optional().default(2),
  customInstructions: z.string().optional(),
}).refine(
  (data) => data.jobUrl || data.jobDescription,
  {
    message: "Either jobUrl or jobDescription must be provided",
    path: ["jobUrl"],
  }
).refine(
  (data) => !data.jobDescription || data.jobDescription.length >= 50,
  {
    message: "Job description must be at least 50 characters when provided",
    path: ["jobDescription"],
  }
);

// Form validation helpers
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
};

export function validatePersonalInfo(data: unknown): ValidationResult<z.infer<typeof PersonalInfoSchema>> {
  try {
    const result = PersonalInfoSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

export function validateExperience(data: unknown): ValidationResult<z.infer<typeof ExperienceSchema>> {
  try {
    const result = ExperienceSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

export function validateProject(data: unknown): ValidationResult<z.infer<typeof ProjectSchema>> {
  try {
    const result = ProjectSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

export function validateOptimizeRequest(data: unknown): ValidationResult<z.infer<typeof OptimizeResumeRequestSchema>> {
  try {
    const result = OptimizeResumeRequestSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

// Quick validation checks
export const isValidEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const isValidUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

export const isValidLinkedInUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.linkedin.com' && 
           (urlObj.pathname.includes('/in/') || urlObj.pathname.includes('/jobs/view/'));
  } catch {
    return false;
  }
};

export const isValidGitHubUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'github.com';
  } catch {
    return false;
  }
};
