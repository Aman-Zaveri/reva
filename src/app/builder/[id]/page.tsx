"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProfilesStore } from "@/lib/store";
import type {
  PersonalInfo,
  Experience,
  Project,
  Skill,
  Education,
} from "@/lib/types";
import { useBuilderState } from "@/hooks/useBuilderState";
import { BuilderHeader, ProfileSettings, ContentSections, SectionOrderSettings } from "@/components/resume-builder";
import { A4Resume } from "@/components/A4Resume";
import { AIFloatingActions } from "@/components/shared/AIFloatingActions";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalysisOnLoad, setShowAnalysisOnLoad] = useState(false);
  
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

  // Check for showAnalysis URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setShowAnalysisOnLoad(urlParams.get('showAnalysis') === 'true');
    }
  }, []);

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

  const handleAIAction = async (actionId: string, params?: any) => {
    try {
      // Handle AI actions in the resume builder context
      switch (actionId) {
        case 'optimize-resume':
          // Trigger AI optimization flow
          if (profile && data) {
            console.log('Triggering AI optimization...');
            // Create a simple dialog to get job description
            const jobDescription = prompt('Please paste the job description for optimization:');
            if (jobDescription) {
              const response = await fetch('/api/ai-agents/single-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agent: 'content-optimizer',
                  prompt: `Optimize this resume content for the job description. Current profile: ${JSON.stringify(profile)}, Data: ${JSON.stringify(data)}, Job: ${jobDescription}`,
                }),
              });
              
              if (response.ok) {
                const result = await response.json();
                alert('Optimization suggestions generated! Check console for details.');
                console.log('AI Optimization Result:', result);
              }
            }
          }
          break;
          
        case 'analyze-skills':
          // Trigger skills analysis
          const jobDescription2 = prompt('Please paste the job description for skills analysis:');
          if (jobDescription2) {
            console.log('Triggering skills analysis...');
            const response = await fetch('/api/ai-agents/single-agent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                agent: 'skills-extractor',
                prompt: `Extract and analyze skills from this job description and compare with current skills: ${JSON.stringify(data?.skills || [])}. Job: ${jobDescription2}`,
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              alert('Skills analysis complete! Check console for details.');
              console.log('Skills Analysis Result:', result);
            }
          }
          break;
          
        case 'review-resume':
          // Trigger resume review
          if (profile && data) {
            console.log('Triggering resume review...');
            const response = await fetch('/api/ai-agents/single-agent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                agent: 'resume-reviewer',
                prompt: `Review this resume for quality and improvements. Profile: ${JSON.stringify(profile)}, Data: ${JSON.stringify(data)}`,
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              alert('Resume review complete! Check console for details.');
              console.log('Resume Review Result:', result);
            }
          }
          break;
          
        case 'ats-optimize':
          // Trigger ATS optimization
          if (profile && data) {
            console.log('Triggering ATS optimization...');
            const response = await fetch('/api/ai-agents/single-agent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                agent: 'ats-optimizer',
                prompt: `Optimize this resume for ATS systems. Profile: ${JSON.stringify(profile)}, Data: ${JSON.stringify(data)}`,
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              alert('ATS optimization complete! Check console for details.');
              console.log('ATS Optimization Result:', result);
            }
          }
          break;
          
        default:
          console.log(`AI Action: ${actionId} not implemented yet`);
      }
    } catch (error) {
      console.error('AI Action failed:', error);
      alert('AI action failed. Please try again.');
    }
  };

  const handleApplyOptimizations = createUpdateHandler(
    (optimizations: Partial<typeof profile>) => {
      updateProfile(profile.id, optimizations);
    }
  );

  return (
    <div className="flex flex-col h-screen">
      <BuilderHeader
        profile={profile}
        data={data}
        saveStatus={saveStatus}
        onDeleteProfile={() => deleteProfile(profile.id)}
        onApplyOptimizations={handleApplyOptimizations}
        showAnalysisOnLoad={showAnalysisOnLoad}
      />
      
      <div className="flex p-6 gap-8 min-h-0">
        {/* Left Side - Editor */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="h-full" hideScrollbar>
            <div className="space-y-6">
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
          </ScrollArea>
        </div>

        {/* Right Side - Resume Preview */}
        <div className="flex-shrink-0">
          <ScrollArea className="h-full" hideScrollbar>
            <div className="bg-white">
              <A4Resume profile={profile} data={data} />
            </div>
          </ScrollArea>
        </div>
      </div>

      <AIFloatingActions
        context="resume-builder"
        profile={profile}
        data={data}
        jobContext={profile.aiOptimization?.jobData?.description || undefined}
        onAIAction={handleAIAction}
      />
    </div>
  );
}
