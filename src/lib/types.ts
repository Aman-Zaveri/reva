// Core domain types
export type BaseItem = {
  id: string;
  title?: string; // for experiences/projects/education
  name?: string;  // for skills groups
};

export type HyperlinkInfo = {
  url?: string;
  displayText?: string;
};

export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  linkedinHyperlink?: HyperlinkInfo;
  github?: string;
  githubHyperlink?: HyperlinkInfo;
  summary?: string;
};

export type Experience = BaseItem & {
  title: string;
  company: string;
  date: string;
  bullets: string[];
  tags?: string[];
};

export type Project = BaseItem & {
  title: string;
  link?: string;
  bullets: string[];
  tags?: string[];
};

export type Skill = BaseItem & {
  name: string;
  details: string;
};

export type Education = BaseItem & {
  title: string;
  details: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string;
  url?: string;
  source: 'manual' | 'extension';
  extractedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type DataBundle = {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  jobs?: Job[];
};

export type FormattingOptions = {
  fontFamily?: string;
  primaryColor?: string;
  nameFontSize?: string;
  headerFontSize?: string;
  bodyTextFontSize?: string;
  metadataTextFontSize?: string;
};

export type SectionType = 'skills' | 'experiences' | 'projects' | 'education';

export type Profile = {
  id: string;
  name: string;
  jobId?: string;
  personalInfo?: PersonalInfo;
  experienceIds: string[];
  projectIds: string[];
  skillIds: string[];
  educationIds: string[];
  // Profile-specific overrides
  experienceOverrides?: Record<string, Partial<Experience>>;
  projectOverrides?: Record<string, Partial<Project>>;
  skillOverrides?: Record<string, Partial<Skill>>;
  educationOverrides?: Record<string, Partial<Education>>;
  template?: 'classic' | 'compact';
  formatting?: FormattingOptions;
  sectionOrder?: SectionType[];
  // AI optimization metadata
  aiOptimization?: {
    timestamp: string;
    keyInsights: string[];
    jobDescriptionHash: string;
    jobData?: {
      title?: string;
      company?: string;
      description?: string;
      requirements?: string;
      responsibilities?: string;
      qualifications?: string;
      skills?: string;
      url?: string;
      extractedAt?: string;
    };
    newSkills?: Array<string | { name: string; details: string; reason?: string }>;
    skillOptimizations?: Array<{
      id: string;
      name: string;
      details: string;
      changes?: string[];
    }>;
    changeAnalysis?: {
      jobAlignmentScore: number;
      scoreExplanation: string;
      technologiesAdded: string[];
      skillsEnhanced: string[];
      contentRewritten: string[];
      keywordsIncorporated: string[];
      totalChanges: number;
    };
  };
};

// Simple API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
