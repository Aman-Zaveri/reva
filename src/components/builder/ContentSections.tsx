'use client';

import type { Profile, DataBundle } from '@/lib/types';
import { UnifiedItemPicker } from '@/components/pickers';

interface ContentSectionsProps {
  profile: Profile;
  data: DataBundle;
  onUpdateProfile: (patch: Partial<Profile>) => void;
  onReorderItems: (
    itemType: 'experienceIds' | 'projectIds' | 'skillIds' | 'educationIds',
    fromIndex: number,
    toIndex: number
  ) => void;
  onUpdateProfileExperience: (itemId: string, patch: any) => void;
  onUpdateProfileProject: (itemId: string, patch: any) => void;
  onUpdateProfileSkill: (itemId: string, patch: any) => void;
  onUpdateProfileEducation: (itemId: string, patch: any) => void;
  onResetProfileOverride: (itemType: string, itemId: string) => void;
}

export function ContentSections({
  profile,
  data,
  onUpdateProfile,
  onReorderItems,
  onUpdateProfileExperience,
  onUpdateProfileProject,
  onUpdateProfileSkill,
  onUpdateProfileEducation,
  onResetProfileOverride,
}: ContentSectionsProps) {
  // Create visibility states from profile selections
  const createVisibilityState = (ids: string[], allItems: any[]) => {
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
          onItemsReorder={(newOrder) => handleReorder('experienceIds', newOrder)}
          onToggleVisibility={(id) => handleSelectionChange('experienceIds', id)}
          onCustomizeItem={onUpdateProfileExperience}
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
          onItemsReorder={(newOrder) => handleReorder('projectIds', newOrder)}
          onToggleVisibility={(id) => handleSelectionChange('projectIds', id)}
          onCustomizeItem={onUpdateProfileProject}
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
        />
      </div>
    </div>
  );
}
