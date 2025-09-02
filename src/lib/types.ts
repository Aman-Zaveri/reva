export type BaseItem = {
  id: string;
  title?: string; // for experiences/projects/education
  name?: string;  // for skills groups
  subtitle?: string; // optional secondary line
};

export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
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

export type DataBundle = {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
};

export type Profile = {
  id: string;
  name: string;
  personalInfo?: PersonalInfo;
  experienceIds: string[];
  projectIds: string[];
  skillIds: string[];
  educationIds: string[];
  // Profile-specific overrides that don't affect master data
  experienceOverrides?: Record<string, Partial<Experience>>;
  projectOverrides?: Record<string, Partial<Project>>;
  skillOverrides?: Record<string, Partial<Skill>>;
  educationOverrides?: Record<string, Partial<Education>>;
  template?: 'classic' | 'compact';
  // AI optimization metadata
  aiOptimization?: {
    timestamp: string;
    keyInsights: string[];
    jobDescriptionHash: string;
  };
};

// Enhanced type definitions with better error handling and API types

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Store types
export interface StoreState {
  loading: boolean;
  error: string | null;
  lastSaved: string | null;
}

export interface AsyncAction<T = void> {
  (...args: unknown[]): Promise<T>;
}

// Event types
export interface StoreEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: Date;
}

// Component prop types
export interface WithErrorBoundary {
  onError?: (error: Error) => void;
  fallback?: React.ComponentType<{ error: Error }>;
}

export interface WithLoading {
  loading?: boolean;
  loadingText?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;