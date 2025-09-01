/**
 * Application constants
 */

// Storage keys
export const STORAGE_KEYS = {
  PROFILES: 'resume_profiles_v2',
  BACKUP: 'resume_profiles_backup',
  PREFERENCES: 'resume_preferences',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  OPTIMIZE_RESUME: '/api/optimize-resume',
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  PERSONAL_INFO: {
    FULL_NAME: { min: 1, max: 100 },
    EMAIL: { max: 254 },
    PHONE: { min: 1, max: 50 },
    LOCATION: { min: 1, max: 100 },
    SUMMARY: { max: 500 },
  },
  EXPERIENCE: {
    TITLE: { min: 1, max: 100 },
    COMPANY: { min: 1, max: 100 },
    DATE: { min: 1, max: 50 },
    BULLETS: { min: 1, max: 10 },
    BULLET_LENGTH: { min: 1, max: 500 },
    TAGS: { max: 20 },
  },
  PROJECT: {
    TITLE: { min: 1, max: 100 },
    BULLETS: { min: 1, max: 10 },
    BULLET_LENGTH: { min: 1, max: 500 },
    TAGS: { max: 20 },
  },
  SKILL: {
    NAME: { min: 1, max: 50 },
    DETAILS: { min: 1, max: 300 },
  },
  EDUCATION: {
    TITLE: { min: 1, max: 100 },
    DETAILS: { min: 1, max: 200 },
  },
  PROFILE: {
    NAME: { min: 1, max: 50 },
  },
  JOB_DESCRIPTION: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 10000,
  },
} as const;

// UI constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 500, // ms
  AUTO_SAVE_DELAY: 1000, // ms
  TOAST_DURATION: 5000, // ms
  ANIMATION_DURATION: 200, // ms
  MAX_RECENT_PROFILES: 5,
} as const;

// Resume templates
export const RESUME_TEMPLATES = {
  CLASSIC: 'classic',
  COMPACT: 'compact',
} as const;

export const TEMPLATE_NAMES = {
  [RESUME_TEMPLATES.CLASSIC]: 'Classic',
  [RESUME_TEMPLATES.COMPACT]: 'Compact',
} as const;

// AI optimization settings
export const AI_SETTINGS = {
  MAX_RETRIES: 3,
  TIMEOUT: 30000, // 30 seconds
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MIN_JOB_DESCRIPTION_LENGTH: 50,
  MAX_JOB_DESCRIPTION_LENGTH: 10000,
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 15,
    REQUESTS_PER_DAY: 1500,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  TEXT_TOO_LONG: (max: number) => `Text cannot exceed ${max} characters`,
  TEXT_TOO_SHORT: (min: number) => `Text must be at least ${min} characters`,
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  RATE_LIMIT_ERROR: 'Rate limit exceeded. Please try again later.',
  API_KEY_ERROR: 'API key not configured. Please check your settings.',
  GENERAL_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please fix the errors below and try again.',
  SAVE_ERROR: 'Failed to save changes. Please try again.',
  LOAD_ERROR: 'Failed to load data. Please refresh the page.',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this item? This action cannot be undone.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_CREATED: 'Profile created successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_DELETED: 'Profile deleted successfully',
  DATA_SAVED: 'Changes saved successfully',
  DATA_IMPORTED: 'Data imported successfully',
  DATA_EXPORTED: 'Data exported successfully',
  OPTIMIZATION_COMPLETE: 'Resume optimization completed successfully',
  BACKUP_CREATED: 'Backup created successfully',
  BACKUP_RESTORED: 'Backup restored successfully',
} as const;

// Feature flags
export const FEATURES = {
  AI_OPTIMIZATION: true,
  MULTIPLE_TEMPLATES: true,
  DATA_EXPORT: true,
  BACKUP_RESTORE: true,
  KEYBOARD_SHORTCUTS: true,
  ANALYTICS: false,
  COLLABORATION: false,
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  NEW_PROFILE: 'Ctrl+N',
  DELETE_PROFILE: 'Ctrl+D',
  EXPORT_PDF: 'Ctrl+P',
  SEARCH: 'Ctrl+F',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
} as const;

// Theme colors (matching Tailwind CSS)
export const THEME_COLORS = {
  PRIMARY: '#7c3aed', // purple-600
  PRIMARY_HOVER: '#6d28d9', // purple-700
  SECONDARY: '#64748b', // slate-500
  SUCCESS: '#10b981', // emerald-500
  WARNING: '#f59e0b', // amber-500
  ERROR: '#ef4444', // red-500
  INFO: '#3b82f6', // blue-500
} as const;

// Local storage size limits
export const STORAGE_LIMITS = {
  WARNING_THRESHOLD: 0.8, // 80% of available space
  MAX_PROFILES: 50,
  MAX_EXPERIENCES: 100,
  MAX_PROJECTS: 100,
  MAX_SKILLS: 50,
  MAX_EDUCATION: 20,
} as const;

// Regular expressions for validation
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[\d\s\-\(\)\.]{7,}$/,
  URL: /^https?:\/\/.+\..+/,
  LINKEDIN_PROFILE: /^https:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/,
  LINKEDIN_JOB: /^https:\/\/(www\.)?linkedin\.com\/jobs\/view\/\d+\/?$/,
  GITHUB_PROFILE: /^https:\/\/(www\.)?github\.com\/[\w\-]+\/?$/,
} as const;

// File size and type limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['application/json', 'text/plain'],
} as const;
