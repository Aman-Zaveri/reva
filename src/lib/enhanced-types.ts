/**
 * Enhanced type definitions with better error handling and API types
 */

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T = any> {
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
  (...args: any[]): Promise<T>;
}

// Event types
export interface StoreEvent {
  type: string;
  payload?: any;
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

// Re-export existing types for convenience
export type {
  BaseItem,
  PersonalInfo,
  Experience,
  Project,
  Skill,
  Education,
  DataBundle,
  Profile
} from './types';
