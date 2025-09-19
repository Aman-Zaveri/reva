'use client';

import type { Profile, DataBundle, Experience, Project, Skill, Education } from '@/lib/types';
import { UnifiedItemPicker } from '@/components/pickers';

interface ContentSectionsProps {
  profile: Profile;
  data: DataBundle;
  onUpdateProfile: (patch: Partial<Profile>) => void;
  onUpdateProfileExperience: (itemId: string, patch: Partial<Experience>) => void;
  onUpdateProfileProject: (itemId: string, patch: Partial<Project>) => void;
  onUpdateProfileSkill: (itemId: string, patch: Partial<Skill>) => void;
  onUpdateProfileEducation: (itemId: string, patch: Partial<Education>) => void;
  onResetProfileOverride: (itemType: string, itemId: string) => void;
}

export function ContentSections({
  profile,
  data,
  onUpdateProfile,
  onUpdateProfileExperience,
  onUpdateProfileProject,
  onUpdateProfileSkill,
  onUpdateProfileEducation,
  onResetProfileOverride,
}: ContentSectionsProps) {
  // Create visibility states from profile selections
  const createVisibilityState = (ids: string[], allItems: Array<{ id: string }>) => {
    const state: Record<string, boolean> = {};
    allItems.forEach(item => {
      state[item.id] = ids.includes(item.id);
    });
    return state;
  };

  // Handle reordering of items
  const handleReorder = (
    itemType: 'experienceIds' | 'projectIds' | 'skillIds' | 'educationIds',
    newOrder: string[]
  ) => {
    onUpdateProfile({ [itemType]: newOrder });
  };

  // Handle selection changes
  const handleSelectionChange = (
    itemType: 'experienceIds' | 'projectIds' | 'skillIds' | 'educationIds',
    id: string
  ) => {
    const currentIds = profile[itemType];
    const newIds = currentIds.includes(id)
      ? currentIds.filter(existingId => existingId !== id)
      : [...currentIds, id];
    onUpdateProfile({ [itemType]: newIds });
  };

  return (
    <div className="space-y-6">
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <UnifiedItemPicker
          title="Work Experiences"
          type="experience"
          items={data.experiences}
          selectedIds={profile.experienceIds}
          visibilityStates={createVisibilityState(profile.experienceIds, data.experiences)}
          customizedItems={profile.experienceOverrides || {}}
          variant="customization"
          profile={profile}
          data={data}
          jobContext={profile.aiOptimization?.jobData?.description}
          onItemsReorder={(newOrder) => handleReorder('experienceIds', newOrder)}
          onToggleVisibility={(id) => handleSelectionChange('experienceIds', id)}
          onCustomizeItem={onUpdateProfileExperience}
          onResetOverride={(id) => onResetProfileOverride('experience', id)}
        />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <UnifiedItemPicker
          title="Projects"
          type="project"
          items={data.projects}
          selectedIds={profile.projectIds}
          visibilityStates={createVisibilityState(profile.projectIds, data.projects)}
          customizedItems={profile.projectOverrides || {}}
          variant="customization"
          profile={profile}
          data={data}
          jobContext={profile.aiOptimization?.jobData?.description}
          onItemsReorder={(newOrder) => handleReorder('projectIds', newOrder)}
          onToggleVisibility={(id) => handleSelectionChange('projectIds', id)}
          onCustomizeItem={onUpdateProfileProject}
          onResetOverride={(id) => onResetProfileOverride('project', id)}
        />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <UnifiedItemPicker
          title="Skills"
          type="skill"
          items={data.skills}
          selectedIds={profile.skillIds}
          visibilityStates={createVisibilityState(profile.skillIds, data.skills)}
          customizedItems={profile.skillOverrides || {}}
          variant="customization"
          onItemsReorder={(newOrder) => handleReorder('skillIds', newOrder)}
          onToggleVisibility={(id) => handleSelectionChange('skillIds', id)}
          onCustomizeItem={onUpdateProfileSkill}
          onResetOverride={(id) => onResetProfileOverride('skill', id)}
        />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <UnifiedItemPicker
          title="Education"
          type="education"
          items={data.education}
          selectedIds={profile.educationIds}
          visibilityStates={createVisibilityState(profile.educationIds, data.education)}
          customizedItems={profile.educationOverrides || {}}
          variant="customization"
          onItemsReorder={(newOrder) => handleReorder('educationIds', newOrder)}
          onToggleVisibility={(id) => handleSelectionChange('educationIds', id)}
          onCustomizeItem={onUpdateProfileEducation}
          onResetOverride={(id) => onResetProfileOverride('education', id)}
        />
      </div>
    </div>
  );
}
