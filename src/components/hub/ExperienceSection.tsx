import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Plus, Loader2 } from "lucide-react";
import { useExperiences } from "@/hooks";
import { SectionHeader, EmptyState, FormCard, FloatingAddButton } from "./base";

export function ExperienceSection() {
  const { 
    experiences, 
    isLoading, 
    error, 
    isSaving,
    hasUnsavedChanges,
    createExperience, 
    updateExperience, 
    deleteExperience,
    saveExperiences,
    discardChanges
  } = useExperiences();

  const addExperience = () => {
    createExperience();
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const experience = experiences.find(exp => exp.id === id);
    if (experience) {
      updateExperience(id, {
        ...experience,
        [field]: value
      });
    }
  };

  const handleUpdateBullets = (id: string, bullets: string[]) => {
    const experience = experiences.find(exp => exp.id === id);
    if (experience) {
      updateExperience(id, {
        ...experience,
        bullets: bullets.filter(bullet => bullet.trim() !== '')
      });
    }
  };

  const addBullet = (experienceId: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (experience) {
      const newBullets = [...(experience.bullets || []), ""];
      handleUpdateBullets(experienceId, newBullets);
    }
  };

  const updateBullet = (experienceId: string, bulletIndex: number, value: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (experience && experience.bullets) {
      const newBullets = experience.bullets.map((bullet, index) => 
        index === bulletIndex ? value : bullet
      );
      handleUpdateBullets(experienceId, newBullets);
    }
  };

  const removeBullet = (experienceId: string, bulletIndex: number) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (experience && experience.bullets && experience.bullets.length > 1) {
      const newBullets = experience.bullets.filter((_, index) => index !== bulletIndex);
      handleUpdateBullets(experienceId, newBullets);
    }
  };

  const removeExperience = (id: string) => {
    deleteExperience(id);
  };

  return (
    <div className="w-full relative">
      <SectionHeader
        title="Work Experience"
        description="Add your professional experience and achievements."
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={saveExperiences}
        onDiscard={discardChanges}
        showActions={experiences.length > 0}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="w-full flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : experiences.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title="No work experience yet!"
          description="Ready to showcase your professional journey? Add your first work experience to get started!"
          buttonText="Add Your First Experience"
          onAdd={addExperience}
        />
      ) : (
        <div className="space-y-6">
          {experiences.map((experience, experienceIndex) => (
            <FormCard 
              key={experience.id}
              title={experience.title || `Experience ${experienceIndex + 1}`}
              titlePlaceholder="Job Title"
              onTitleChange={(value) => handleUpdate(experience.id!, 'title', value)}
              onDelete={() => removeExperience(experience.id!)}
              deleteTitle="Delete Experience"
              deleteDescription="Are you sure you want to delete this work experience? This action cannot be undone."
              isSaving={isSaving}
            >
              {/* Company and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`company-${experience.id}`} className="text-sm font-medium">
                    Company
                  </Label>
                  <Input
                    id={`company-${experience.id}`}
                    value={experience.company}
                    onChange={(e) => handleUpdate(experience.id!, 'company', e.target.value)}
                    placeholder="Company Name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`location-${experience.id}`} className="text-sm font-medium">
                    Location
                  </Label>
                  <Input
                    id={`location-${experience.id}`}
                    value={experience.location}
                    onChange={(e) => handleUpdate(experience.id!, 'location', e.target.value)}
                    placeholder="New York, NY"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`start-date-${experience.id}`}>
                    Start Date
                  </Label>
                  <DatePicker
                    id={`start-date-${experience.id}`}
                    date={experience.startDate}
                    onSelect={(date) => handleUpdate(experience.id!, 'startDate', date)}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`end-date-${experience.id}`}>
                    End Date
                  </Label>
                  <DatePicker
                    id={`end-date-${experience.id}`}
                    date={experience.endDate}
                    onSelect={(date) => handleUpdate(experience.id!, 'endDate', date)}
                    placeholder="Select end date"
                  />
                </div>
              </div>

              {/* Bullets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Work Description Bullet Points
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => addBullet(experience.id!)}
                        className="rounded-full p-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Add bullet point
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  {(experience.bullets || []).map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <Textarea
                        value={bullet}
                        onChange={(e) => updateBullet(experience.id!, bulletIndex, e.target.value)}
                        placeholder="Implemented a new feature that improved user engagement by 20%."
                        className="flex-1 min-h-[60px] resize-y"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </FormCard>
          ))}
        </div>
      )}

      {/* Fixed circular add button - only show when there are experiences */}
      {experiences.length > 0 && (
        <FloatingAddButton
          onClick={addExperience}
          tooltip="Add new experience"
          disabled={isSaving}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}