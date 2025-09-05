'use client';

import { create } from 'zustand';
import { nanoid } from './utils';
import { LocalStorageProfileRepository } from '@/shared/repositories/profile.repository';
import { ERROR_MESSAGES } from '@/shared/utils/constants';
import type { Profile, DataBundle, Experience, Project, Skill, Education, PersonalInfo } from './types';

// Repository instance for data persistence
const profileRepository = new LocalStorageProfileRepository();

/**
 * State interface for the profiles store
 * 
 * This store manages the entire application state including profiles, master data,
 * loading states, and all operations for creating, updating, and managing resume data.
 * Uses Zustand for state management with localStorage persistence.
 */
export type ProfilesState = {
  /** Array of all user-created resume profiles */
  profiles: Profile[];
  /** Master data bundle containing all experiences, projects, skills, education */
  data: DataBundle;
  /** Loading state for async operations */
  loading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Timestamp of last successful save operation */
  lastSaved: string | null;
  
  // Core profile operations
  /** Creates a new empty profile and adds it to the store */
  createProfile: () => Promise<void>;
  /** Updates an existing profile with partial data */
  updateProfile: (id: string, patch: Partial<Profile>) => Promise<void>;
  /** Permanently deletes a profile */
  deleteProfile: (id: string) => Promise<void>;
  /** Creates a copy of an existing profile */
  cloneProfile: (id: string) => Promise<void>;
  
  // Profile item management
  /** Reorders items within a profile (drag & drop support) */
  reorderProfileItems: (profileId: string, itemType: 'experienceIds' | 'projectIds' | 'skillIds' | 'educationIds', fromIndex: number, toIndex: number) => Promise<void>;
  
  // Personal info management
  /** Updates personal info for a specific profile */
  updatePersonalInfo: (id: string, patch: Partial<PersonalInfo>) => Promise<void>;
  /** Updates master personal info (affects all profiles by default) */
  updateMasterPersonalInfo: (patch: Partial<PersonalInfo>) => Promise<void>;
  
  // Profile-specific overrides (allows customizing content per profile without affecting master data)
  /** Creates profile-specific override for an experience item */
  updateProfileExperience: (profileId: string, experienceId: string, patch: Partial<Experience>) => Promise<void>;
  /** Creates profile-specific override for a project item */
  updateProfileProject: (profileId: string, projectId: string, patch: Partial<Project>) => Promise<void>;
  /** Creates profile-specific override for a skill item */
  updateProfileSkill: (profileId: string, skillId: string, patch: Partial<Skill>) => Promise<void>;
  /** Creates profile-specific override for an education item */
  updateProfileEducation: (profileId: string, educationId: string, patch: Partial<Education>) => Promise<void>;
  /** Removes a profile-specific override, reverting to master data */
  resetProfileOverride: (profileId: string, itemType: 'experience' | 'project' | 'skill' | 'education', itemId: string) => Promise<void>;
  
  // Master data management
  /** Updates the master data bundle */
  updateData: (patch: Partial<DataBundle>) => Promise<void>;
  
  // Experience management (affects master data used by all profiles)
  /** Updates an existing experience in master data */
  updateExperience: (id: string, patch: Partial<Experience>) => Promise<void>;
  /** Adds a new experience to master data */
  addExperience: () => Promise<void>;
  /** Removes an experience from master data and all profiles */
  deleteExperience: (id: string) => Promise<void>;
  
  // Project management (affects master data used by all profiles)
  /** Updates an existing project in master data */
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  /** Adds a new project to master data */
  addProject: () => Promise<void>;
  /** Removes a project from master data and all profiles */
  deleteProject: (id: string) => Promise<void>;
  
  // Skill management (affects master data used by all profiles)
  /** Updates an existing skill category in master data */
  updateSkill: (id: string, patch: Partial<Skill>) => Promise<void>;
  /** Adds a new skill category to master data */
  addSkill: () => Promise<void>;
  /** Removes a skill category from master data and all profiles */
  deleteSkill: (id: string) => Promise<void>;
  
  // Education management (affects master data used by all profiles)
  /** Updates an existing education item in master data */
  updateEducation: (id: string, patch: Partial<Education>) => Promise<void>;
  /** Adds a new education item to master data */
  addEducation: () => Promise<void>;
  /** Removes an education item from master data and all profiles */
  deleteEducation: (id: string) => Promise<void>;
  
  // Data operations
  /** Resets all data to default seed values */
  resetAll: () => Promise<void>;
  /** Loads data from localStorage */
  loadFromStorage: () => Promise<void>;
  /** Saves current state to localStorage */
  saveToStorage: () => Promise<void>;
  /** Creates a backup string of current data */
  backupData: () => Promise<string>;
  /** Restores data from a backup string */
  restoreData: (backup: string) => Promise<void>;
  
  // Error handling
  /** Clears the current error state */
  clearError: () => void;
};

// Default seed data import
import { data as seedData } from './data';

/**
 * Creates default profiles with sample data for new users
 * 
 * These profiles demonstrate the application's capabilities and provide
 * a starting point for users to understand the profile system.
 * 
 * @returns Array of sample profiles (AI Resume and General Software)
 */
const createDefaultProfiles = (): Profile[] => [
  {
    id: nanoid(),
    name: 'AI Resume',
    personalInfo: {
      fullName: 'Aman Zaveri',
      email: 'a2zaveri@uwaterloo.ca',
      phone: '647-676-8981',
      location: 'Toronto, ON',
      linkedin: 'linkedin.com/in/aman-zaveri',
      github: 'github.com/azaveri7',
      website: '',
      summary: 'AI + Embedded + Systems'
    },
    experienceIds: ['ford-se-2025', 'ford-wlan-2024'],
    projectIds: ['letterly', 'autonomous-parking'],
    skillIds: ['langs', 'tools', 'devops'],
    educationIds: ['uw-ai'],
    template: 'classic'
  },
  {
    id: nanoid(),
    name: 'General Software',
    personalInfo: {
      fullName: 'Aman Zaveri',
      email: 'a2zaveri@uwaterloo.ca',
      phone: '647-676-8981',
      location: 'Toronto, ON',
      linkedin: 'linkedin.com/in/aman-zaveri',
      github: 'github.com/azaveri7',
      website: '',
      summary: 'Full‑stack + DevOps'
    },
    experienceIds: ['ford-se-2025', 'transpire-2024'],
    projectIds: ['course-clutch', 'letterly'],
    skillIds: ['langs', 'tools', 'devops'],
    educationIds: ['uw-ai'],
    template: 'classic'
  }
];

/**
 * Main Zustand store for resume management
 * 
 * This store implements the complete state management for the resume application,
 * including profiles, master data, and all operations. It automatically persists
 * to localStorage and provides optimistic updates for better UX.
 * 
 * Key concepts:
 * - Master Data: Single source of truth for experiences, projects, skills, education
 * - Profiles: Collections of master data items with optional per-profile overrides
 * - Profile Overrides: Allow customizing content for specific profiles without affecting master data
 * - Automatic Persistence: All operations automatically save to localStorage
 */
export const useProfilesStore = create<ProfilesState>((set, get) => ({
  profiles: [],
  data: seedData,
  loading: false,
  error: null,
  lastSaved: null,

  /**
   * Loads initial data from localStorage or creates default data
   * 
   * This method is called on app initialization to restore the user's data.
   * If no saved data exists, it creates default sample profiles to get users started.
   */
  loadFromStorage: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await profileRepository.loadProfiles();
      
      if (result.success && result.data) {
        set({ 
          profiles: result.data.profiles, 
          data: result.data.data,
          loading: false,
          lastSaved: 'Loaded from storage'
        });
      } else {
        // Initialize with default data
        const defaultProfiles = createDefaultProfiles();
        set({ 
          profiles: defaultProfiles, 
          data: seedData,
          loading: false
        });
        
        // Save default data
        await profileRepository.saveProfiles(defaultProfiles, seedData);
      }
    } catch {
      set({ 
        error: ERROR_MESSAGES.LOAD_ERROR,
        loading: false
      });
    }
  },

  /**
   * Saves current state to localStorage
   * 
   * Called automatically after most operations to persist changes.
   * Updates the lastSaved timestamp on successful save.
   */
  saveToStorage: async () => {
    const { profiles, data } = get();
    
    try {
      const result = await profileRepository.saveProfiles(profiles, data);
      
      if (result.success) {
        set({ 
          lastSaved: new Date().toLocaleTimeString(),
          error: null
        });
      } else {
        set({ error: result.error || ERROR_MESSAGES.SAVE_ERROR });
      }
    } catch {
      set({ error: ERROR_MESSAGES.SAVE_ERROR });
    }
  },

  /**
   * Creates a new empty profile and adds it to the store
   * 
   * New profiles start with master personal info but empty item lists.
   * The new profile is added to the top of the profiles list.
   */
  createProfile: async () => {
    const masterPersonalInfo = get().data.personalInfo;
    const newProfile: Profile = {
      id: nanoid(),
      name: 'New Profile',
      personalInfo: {
        ...masterPersonalInfo,
        summary: ''
      },
      experienceIds: [],
      projectIds: [],
      skillIds: [],
      educationIds: [],
      template: 'classic'
    };
    
    const updatedProfiles = [newProfile, ...get().profiles];
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Update profile
  updateProfile: async (id, patch) => {
    const updatedProfiles = get().profiles.map((p) => 
      p.id === id ? { ...p, ...patch } : p
    );
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Delete profile
  deleteProfile: async (id) => {
    const updatedProfiles = get().profiles.filter((p) => p.id !== id);
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Clone profile
  cloneProfile: async (id) => {
    const source = get().profiles.find(p => p.id === id);
    if (!source) return;
    
    const cloned: Profile = { 
      ...source, 
      id: nanoid(), 
      name: source.name + ' Copy' 
    };
    
    const updatedProfiles = [cloned, ...get().profiles];
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Reorder profile items
  reorderProfileItems: async (profileId, itemType, fromIndex, toIndex) => {
    const updatedProfiles = get().profiles.map((p) => {
      if (p.id === profileId) {
        const items = [...p[itemType]];
        const [movedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);
        return { ...p, [itemType]: items };
      }
      return p;
    });
    
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Update personal info
  updatePersonalInfo: async (id, patch) => {
    const updatedProfiles = get().profiles.map((p) => {
      if (p.id === id && p.personalInfo) {
        return { 
          ...p, 
          personalInfo: { ...p.personalInfo, ...patch } 
        };
      }
      return p;
    });
    
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Update master personal info
  updateMasterPersonalInfo: async (patch) => {
    const updatedData = {
      ...get().data,
      personalInfo: { ...get().data.personalInfo, ...patch }
    };
    
    set({ data: updatedData });
    await get().saveToStorage();
  },

  /**
   * Updates profile-specific experience overrides
   * 
   * Profile overrides allow customizing specific items for individual profiles
   * without affecting the master data used by other profiles. This enables
   * targeting the same experience differently for different job applications.
   * 
   * @param profileId - ID of the profile to update
   * @param experienceId - ID of the experience item to override
   * @param patch - Partial experience data to override
   */
  updateProfileExperience: async (profileId, experienceId, patch) => {
    const updatedProfiles = get().profiles.map((p) => {
      if (p.id === profileId) {
        const overrides = p.experienceOverrides || {};
        return {
          ...p,
          experienceOverrides: {
            ...overrides,
            [experienceId]: { ...overrides[experienceId], ...patch }
          }
        };
      }
      return p;
    });
    
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Profile project overrides
  updateProfileProject: async (profileId, projectId, patch) => {
    const updatedProfiles = get().profiles.map((p) => {
      if (p.id === profileId) {
        const overrides = p.projectOverrides || {};
        return {
          ...p,
          projectOverrides: {
            ...overrides,
            [projectId]: { ...overrides[projectId], ...patch }
          }
        };
      }
      return p;
    });
    
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Profile skill overrides
  updateProfileSkill: async (profileId, skillId, patch) => {
    const updatedProfiles = get().profiles.map((p) => {
      if (p.id === profileId) {
        const overrides = p.skillOverrides || {};
        return {
          ...p,
          skillOverrides: {
            ...overrides,
            [skillId]: { ...overrides[skillId], ...patch }
          }
        };
      }
      return p;
    });
    
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Profile education overrides
  updateProfileEducation: async (profileId, educationId, patch) => {
    const updatedProfiles = get().profiles.map((p) => {
      if (p.id === profileId) {
        const overrides = p.educationOverrides || {};
        return {
          ...p,
          educationOverrides: {
            ...overrides,
            [educationId]: { ...overrides[educationId], ...patch }
          }
        };
      }
      return p;
    });
    
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Reset profile override
  resetProfileOverride: async (profileId, itemType, itemId) => {
    const updatedProfiles = get().profiles.map((p) => {
      if (p.id === profileId) {
        const overrideKey = `${itemType}Overrides` as keyof Profile;
        const overrides = { ...(p[overrideKey] as Record<string, Partial<Experience | Project | Skill | Education>> || {}) };
        delete overrides[itemId];
        return { ...p, [overrideKey]: overrides };
      }
      return p;
    });
    
    set({ profiles: updatedProfiles });
    await get().saveToStorage();
  },

  // Update master data
  updateData: async (patch) => {
    const updatedData = { ...get().data, ...patch } as DataBundle;
    set({ data: updatedData });
    await get().saveToStorage();
  },

  // Experience management
  updateExperience: async (id, patch) => {
    const experiences = get().data.experiences.map(e => 
      e.id === id ? { ...e, ...patch } : e
    );
    await get().updateData({ experiences });
  },

  addExperience: async () => {
    const experiences = [
      { 
        id: nanoid(), 
        title: 'New Role', 
        company: 'Company', 
        date: '2025', 
        bullets: ['Achievement one'], 
        tags: [] 
      },
      ...get().data.experiences
    ];
    await get().updateData({ experiences });
  },

  deleteExperience: async (id) => {
    const experiences = get().data.experiences.filter(e => e.id !== id);
    await get().updateData({ experiences });
  },

  // Project management
  updateProject: async (id, patch) => {
    const projects = get().data.projects.map(p => 
      p.id === id ? { ...p, ...patch } : p
    );
    await get().updateData({ projects });
  },

  addProject: async () => {
    const projects = [
      { 
        id: nanoid(), 
        title: 'New Project', 
        link: '', 
        bullets: ['Did something cool'], 
        tags: [] 
      },
      ...get().data.projects
    ];
    await get().updateData({ projects });
  },

  deleteProject: async (id) => {
    const projects = get().data.projects.filter(p => p.id !== id);
    await get().updateData({ projects });
  },

  // Skill management
  updateSkill: async (id, patch) => {
    const skills = get().data.skills.map(s => 
      s.id === id ? { ...s, ...patch } : s
    );
    await get().updateData({ skills });
  },

  addSkill: async () => {
    const skills = [
      { 
        id: nanoid(), 
        name: 'New Category', 
        details: 'List, of, skills' 
      },
      ...get().data.skills
    ];
    await get().updateData({ skills });
  },

  deleteSkill: async (id) => {
    const skills = get().data.skills.filter(s => s.id !== id);
    await get().updateData({ skills });
  },

  // Education management
  updateEducation: async (id, patch) => {
    const education = get().data.education.map(e => 
      e.id === id ? { ...e, ...patch } : e
    );
    await get().updateData({ education });
  },

  addEducation: async () => {
    const education = [
      { 
        id: nanoid(), 
        title: 'New Program', 
        details: 'Institution & year' 
      },
      ...get().data.education
    ];
    await get().updateData({ education });
  },

  deleteEducation: async (id) => {
    const education = get().data.education.filter(e => e.id !== id);
    await get().updateData({ education });
  },

  // Reset all data
  resetAll: async () => {
    const defaultProfiles = createDefaultProfiles();
    set({ 
      profiles: defaultProfiles, 
      data: seedData,
      error: null,
      lastSaved: null
    });
    await profileRepository.saveProfiles(defaultProfiles, seedData);
  },

  // Backup data
  backupData: async () => {
    const result = await profileRepository.backupData();
    if (!result.success) {
      set({ error: result.error || 'Failed to create backup' });
      throw new Error(result.error);
    }
    return result.data!;
  },

  // Restore data
  restoreData: async (backup) => {
    set({ loading: true, error: null });
    
    try {
      const result = await profileRepository.restoreData(backup);
      
      if (result.success) {
        await get().loadFromStorage();
        set({ loading: false });
      } else {
        set({ 
          error: result.error || 'Failed to restore backup',
          loading: false
        });
      }
    } catch {
      set({ 
        error: ERROR_MESSAGES.GENERAL_ERROR,
        loading: false
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// Initialize store on first load
if (typeof window !== 'undefined') {
  useProfilesStore.getState().loadFromStorage();
}
