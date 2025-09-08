"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProfilesStore } from "@/shared/lib/store";
import type {
  PersonalInfo,
  Experience,
  Project,
  Skill,
  Education,
} from "@/shared/lib/types";
import { useBuilderState } from "@/shared/hooks/useBuilderState";
import { BuilderHeader, ProfileSettings, ContentSections, ResumePreview, SectionOrderSettings } from "@/features/resume-builder";

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const {
    profiles,
    updateProfile,
    updatePersonalInfo,
    deleteProfile,
    data,
    updateProfileExperience,
    updateProfileProject,
    updateProfileSkill,
    updateProfileEducation,
    resetProfileOverride,
    loadFromStorage,
  } = useProfilesStore();

  const { saveStatus, createUpdateHandler } = useBuilderState();

  const profile = useMemo(
    () => profiles.find((p) => p.id === params.id),
    [profiles, params.id]
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Ensure data is loaded from database
        await loadFromStorage();
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !profile) {
      const t = setTimeout(() => router.replace("/"), 800);
      return () => clearTimeout(t);
    }
  }, [profile, router, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return notFound();

  const syncFromMasterData = () => {
    updatePersonalInfo(profile.id, {
      ...data.personalInfo,
      summary: profile.personalInfo?.summary || "",
    });
  };

  // Create wrapped handlers with save status
  const handleUpdateProfile = createUpdateHandler(
    (patch: Partial<typeof profile>) => updateProfile(profile.id, patch)
  );

  const handleUpdatePersonalInfo = createUpdateHandler(
    (patch: Partial<PersonalInfo>) => updatePersonalInfo(profile.id, patch)
  );

  const handleUpdateProfileExperience = createUpdateHandler(
    (itemId: string, patch: Partial<Experience>) =>
      updateProfileExperience(profile.id, itemId, patch)
  );

  const handleUpdateProfileProject = createUpdateHandler(
    (itemId: string, patch: Partial<Project>) =>
      updateProfileProject(profile.id, itemId, patch)
  );

  const handleUpdateProfileSkill = createUpdateHandler(
    (itemId: string, patch: Partial<Skill>) =>
      updateProfileSkill(profile.id, itemId, patch)
  );

  const handleUpdateProfileEducation = createUpdateHandler(
    (itemId: string, patch: Partial<Education>) =>
      updateProfileEducation(profile.id, itemId, patch)
  );

  const handleResetProfileOverride = createUpdateHandler(
    (itemType: string, itemId: string) =>
      resetProfileOverride(
        profile.id,
        itemType as "experience" | "project" | "skill" | "education",
        itemId
      )
  );

  const handleSyncFromMasterData = createUpdateHandler(syncFromMasterData);

  const handleApplyOptimizations = createUpdateHandler(
    (optimizations: Partial<typeof profile>) => {
      updateProfile(profile.id, optimizations);
    }
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <BuilderHeader
        profile={profile}
        data={data}
        saveStatus={saveStatus}
        onDeleteProfile={() => deleteProfile(profile.id)}
        onApplyOptimizations={handleApplyOptimizations}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Left Side - Editor (takes up remaining space) */}
        <div className="overflow-y-auto hide-scrollbar p-6" style={{ width: '50vw', height: 'calc(100vh - 73px)' }}>
          <div className="flex flex-col gap-6">
            <ProfileSettings
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePersonalInfo={handleUpdatePersonalInfo}
              onSyncFromMasterData={handleSyncFromMasterData}
            />

            <SectionOrderSettings
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />

            <ContentSections
              profile={profile}
              data={data}
              onUpdateProfile={handleUpdateProfile}
              onUpdateProfileExperience={handleUpdateProfileExperience}
              onUpdateProfileProject={handleUpdateProfileProject}
              onUpdateProfileSkill={handleUpdateProfileSkill}
              onUpdateProfileEducation={handleUpdateProfileEducation}
              onResetProfileOverride={handleResetProfileOverride}
            />
          </div>
        </div>

        {/* Right Side - Resume Preview (now fixed positioned, not in flex flow) */}
        <ResumePreview profile={profile} data={data} />
      </div>
    </div>
  );
}
