'use client';

import { create } from 'zustand';
import { nanoid } from './utils';
import { ApiStorageService } from '@/services/storage.service';
import { ERROR_MESSAGES } from '@/utils/constants';
import type { Profile, DataBundle, Experience, Project, Skill, Education, PersonalInfo } from './types';
import { data as seedData } from './data';

const storageService = new ApiStorageService();

export type ProfilesState = {
  profiles: Profile[];
  data: DataBundle;
  loading: boolean;
  error: string | null;
  
  // Core operations
  createProfile: () => Promise<void>;
  updateProfile: (id: string, patch: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  cloneProfile: (id: string) => Promise<void>;
  
  // Personal info
  updatePersonalInfo: (id: string, patch: Partial<PersonalInfo>) => Promise<void>;
  updateMasterPersonalInfo: (patch: Partial<PersonalInfo>) => Promise<void>;
  
  // Profile overrides
  updateProfileExperience: (profileId: string, experienceId: string, patch: Partial<Experience>) => Promise<void>;
  updateProfileProject: (profileId: string, projectId: string, patch: Partial<Project>) => Promise<void>;
  updateProfileSkill: (profileId: string, skillId: string, patch: Partial<Skill>) => Promise<void>;
  updateProfileEducation: (profileId: string, educationId: string, patch: Partial<Education>) => Promise<void>;
  resetProfileOverride: (profileId: string, itemType: 'experience' | 'project' | 'skill' | 'education', itemId: string) => Promise<void>;
  
  // Master data
  updateData: (patch: Partial<DataBundle>) => Promise<void>;
  updateExperience: (id: string, patch: Partial<Experience>) => Promise<void>;
  addExperience: () => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  addProject: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateSkill: (id: string, patch: Partial<Skill>) => Promise<void>;
  addSkill: () => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  updateEducation: (id: string, patch: Partial<Education>) => Promise<void>;
  addEducation: () => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  
  // Storage
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  resetAll: () => Promise<void>;
  clearError: () => void;
};

const createDefaultProfiles = (): Profile[] => [
  {
    id: nanoid(),
    name: 'Main Resume',
    personalInfo: seedData.personalInfo,
    experienceIds: seedData.experiences.map(e => e.id),
    projectIds: seedData.projects.map(p => p.id),
    skillIds: seedData.skills.map(s => s.id),
    educationIds: seedData.education.map(e => e.id),
    template: 'classic'
  }
];

export const useProfilesStore = create<ProfilesState>((set, get) => ({
  profiles: [],
  data: seedData,
  loading: false,
  error: null,

  loadFromStorage: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await storageService.loadProfiles();
      
      if (result.success && result.data) {
        set({ 
          profiles: result.data.profiles, 
          data: result.data.data,
          loading: false
        });
      } else {
        const defaultProfiles = createDefaultProfiles();
        set({ 
          profiles: defaultProfiles, 
          data: seedData,
          loading: false
        });
        await storageService.saveProfiles(defaultProfiles, seedData);
      }
    } catch {
      set({ 
        error: ERROR_MESSAGES.LOAD_ERROR,
        loading: false
      });
    }
  },

  saveToStorage: async () => {
    const { profiles, data } = get();
    
    try {
      const result = await storageService.saveProfiles(profiles, data);
      
      if (!result.success) {
        set({ error: result.error || ERROR_MESSAGES.SAVE_ERROR });
      }
    } catch {
      set({ error: ERROR_MESSAGES.SAVE_ERROR });
    }
  },

  createProfile: async () => {
    const newProfile: Profile = {
      id: nanoid(),
      name: 'New Profile',
      personalInfo: { ...get().data.personalInfo, summary: '' },
      experienceIds: [],
      projectIds: [],
      skillIds: [],
      educationIds: [],
      template: 'classic'
    };
    
    set({ profiles: [newProfile, ...get().profiles] });
    await get().saveToStorage();
  },

  updateProfile: async (id, patch) => {
    set({
      profiles: get().profiles.map((p) => 
        p.id === id ? { ...p, ...patch } : p
      )
    });
    await get().saveToStorage();
  },

  deleteProfile: async (id) => {
    set({ profiles: get().profiles.filter((p) => p.id !== id) });
    await get().saveToStorage();
  },

  cloneProfile: async (id) => {
    const source = get().profiles.find(p => p.id === id);
    if (!source) return;
    
    const cloned: Profile = { 
      ...source, 
      id: nanoid(), 
      name: source.name + ' Copy' 
    };
    
    set({ profiles: [cloned, ...get().profiles] });
    await get().saveToStorage();
  },

  updatePersonalInfo: async (id, patch) => {
    set({
      profiles: get().profiles.map((p) => {
        if (p.id === id && p.personalInfo) {
          return { 
            ...p, 
            personalInfo: { ...p.personalInfo, ...patch } 
          };
        }
        return p;
      })
    });
    await get().saveToStorage();
  },

  updateMasterPersonalInfo: async (patch) => {
    set({
      data: {
        ...get().data,
        personalInfo: { ...get().data.personalInfo, ...patch }
      }
    });
    await get().saveToStorage();
  },

  updateProfileExperience: async (profileId, experienceId, patch) => {
    set({
      profiles: get().profiles.map((p) => {
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
      })
    });
    await get().saveToStorage();
  },

  updateProfileProject: async (profileId, projectId, patch) => {
    set({
      profiles: get().profiles.map((p) => {
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
      })
    });
    await get().saveToStorage();
  },

  updateProfileSkill: async (profileId, skillId, patch) => {
    set({
      profiles: get().profiles.map((p) => {
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
      })
    });
    await get().saveToStorage();
  },

  updateProfileEducation: async (profileId, educationId, patch) => {
    set({
      profiles: get().profiles.map((p) => {
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
      })
    });
    await get().saveToStorage();
  },

  resetProfileOverride: async (profileId, itemType, itemId) => {
    set({
      profiles: get().profiles.map((p) => {
        if (p.id === profileId) {
          const overrideKey = `${itemType}Overrides` as keyof Profile;
          const overrides = { ...(p[overrideKey] as Record<string, Partial<Experience | Project | Skill | Education>> || {}) };
          delete overrides[itemId];
          return { ...p, [overrideKey]: overrides };
        }
        return p;
      })
    });
    await get().saveToStorage();
  },

  updateData: async (patch) => {
    set({ data: { ...get().data, ...patch } as DataBundle });
    await get().saveToStorage();
  },

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

  resetAll: async () => {
    const defaultProfiles = createDefaultProfiles();
    set({ 
      profiles: defaultProfiles, 
      data: seedData,
      error: null
    });
    await storageService.saveProfiles(defaultProfiles, seedData);
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Initialize store on first load
if (typeof window !== 'undefined') {
  useProfilesStore.getState().loadFromStorage();
}
