'use client';

import { create } from 'zustand';
import { nanoid } from './utils';
import { LocalStorageProfileRepository } from '@/repositories/profile.repository';
import { STORAGE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants';
import type { Profile, DataBundle, Experience, Project, Skill, Education, PersonalInfo } from './types';

// Repository instance
const profileRepository = new LocalStorageProfileRepository();

export type ProfilesState = {
  profiles: Profile[];
  data: DataBundle;
  loading: boolean;
  error: string | null;
  lastSaved: string | null;
  
  // Core profile operations
  createProfile: () => Promise<void>;
  updateProfile: (id: string, patch: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  cloneProfile: (id: string) => Promise<void>;
  
  // Profile item management
  reorderProfileItems: (profileId: string, itemType: 'experienceIds' | 'projectIds' | 'skillIds' | 'educationIds', fromIndex: number, toIndex: number) => Promise<void>;
  
  // Personal info management
  updatePersonalInfo: (id: string, patch: Partial<PersonalInfo>) => Promise<void>;
  updateMasterPersonalInfo: (patch: Partial<PersonalInfo>) => Promise<void>;
  
  // Profile-specific overrides
  updateProfileExperience: (profileId: string, experienceId: string, patch: Partial<Experience>) => Promise<void>;
  updateProfileProject: (profileId: string, projectId: string, patch: Partial<Project>) => Promise<void>;
  updateProfileSkill: (profileId: string, skillId: string, patch: Partial<Skill>) => Promise<void>;
  updateProfileEducation: (profileId: string, educationId: string, patch: Partial<Education>) => Promise<void>;
  resetProfileOverride: (profileId: string, itemType: 'experience' | 'project' | 'skill' | 'education', itemId: string) => Promise<void>;
  
  // Master data management
  updateData: (patch: Partial<DataBundle>) => Promise<void>;
  
  // Experience management
  updateExperience: (id: string, patch: Partial<Experience>) => Promise<void>;
  addExperience: () => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  
  // Project management
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  addProject: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Skill management
  updateSkill: (id: string, patch: Partial<Skill>) => Promise<void>;
  addSkill: () => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  
  // Education management
  updateEducation: (id: string, patch: Partial<Education>) => Promise<void>;
  addEducation: () => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  
  // Data operations
  resetAll: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  backupData: () => Promise<string>;
  restoreData: (backup: string) => Promise<void>;
  
  // Error handling
  clearError: () => void;
};

// Default seed data
import { data as seedData } from './data';

// Helper function to create default profiles
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

// Initialize store
export const useProfilesStore = create<ProfilesState>((set, get) => ({
  profiles: [],
  data: seedData,
  loading: false,
  error: null,
  lastSaved: null,

  // Load initial data
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
    } catch (error) {
      console.error('Failed to load from storage:', error);
      set({ 
        error: ERROR_MESSAGES.LOAD_ERROR,
        loading: false
      });
    }
  },

  // Save to storage
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
    } catch (error) {
      console.error('Failed to save to storage:', error);
      set({ error: ERROR_MESSAGES.SAVE_ERROR });
    }
  },

  // Create profile
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

  // Profile experience overrides
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
        const overrides = { ...(p[overrideKey] as Record<string, any> || {}) };
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
    } catch (error) {
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
