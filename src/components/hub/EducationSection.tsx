"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Loader2 } from "lucide-react";
import { useEducations } from "@/hooks";
import { SectionHeader, EmptyState, FormCard, FloatingAddButton } from "./base";

interface Education {
  id: string;
  program: string;
  institution: string;
  graduationDate: Date | undefined;
  minor: string;
  gpa: string;
  relevantCoursework: string;
}

export function EducationSection() {
  const { 
    educations, 
    isLoading, 
    error, 
    isSaving, 
    hasUnsavedChanges,
    createEducation, 
    updateEducation, 
    deleteEducation,
    saveEducations,
    discardChanges
  } = useEducations();

  const addEducation = () => {
    createEducation();
  };

  const handleUpdate = (id: string | undefined, field: string, value: any) => {
    if (!id) return;
    updateEducation(id, { [field]: value });
  };

  const removeEducation = (id: string | undefined) => {
    if (!id) return;
    deleteEducation(id);
  };

  return (
    <div className="w-full relative">
      <SectionHeader
        title="Education"
        description="Add your educational background, degrees, and academic achievements."
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={saveEducations}
        onDiscard={discardChanges}
        showActions={hasUnsavedChanges}
      />

      {educations.length === 0 ? (
        <EmptyState
          emoji="🎓"
          title="No education entries yet!"
          description="Ready to showcase your academic journey? Add your first education entry to highlight your degrees and achievements!"
          buttonText="Add Your First Education"
          onAdd={addEducation}
        />
      ) : (
        <div className="space-y-6">
          {educations.map((education) => (
            <FormCard 
              key={education.id}
              title={education.program}
              titlePlaceholder="Bachelor of Science in Computer Science"
              onTitleChange={(value) => handleUpdate(education.id, "program", value)}
              onDelete={() => removeEducation(education.id)}
              deleteTitle="Delete Education Entry"
              deleteDescription="Are you sure you want to delete this education entry? This action cannot be undone."
              isSaving={isSaving}
            >
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Institution */}
                <div className="space-y-2">
                  <Label htmlFor={`institution-${education.id}`}>
                    University/College
                  </Label>
                  <Input
                    id={`institution-${education.id}`}
                    placeholder="University of California, Berkeley"
                    value={education.institution}
                    onChange={(e) =>
                      handleUpdate(
                        education.id,
                        "institution",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* Graduation Date */}
                <div className="space-y-2">
                  <Label htmlFor={`graduation-${education.id}`}>
                    Graduation Date
                  </Label>
                  <DatePicker
                    id={`graduation-${education.id}`}
                    date={education.graduationDate}
                    onSelect={(date: Date | undefined) =>
                      handleUpdate(education.id, "graduationDate", date)
                    }
                    placeholder="Select graduation date"
                  />
                </div>

                {/* Minor */}
                <div className="space-y-2">
                  <Label htmlFor={`minor-${education.id}`}>
                    Minor (Optional)
                  </Label>
                  <Input
                    id={`minor-${education.id}`}
                    placeholder="Business Administration"
                    value={education.minor}
                    onChange={(e) =>
                      handleUpdate(education.id, "minor", e.target.value)
                    }
                  />
                </div>

                {/* GPA */}
                <div className="space-y-2">
                  <Label htmlFor={`gpa-${education.id}`}>
                    GPA (Optional)
                  </Label>
                  <Input
                    id={`gpa-${education.id}`}
                    placeholder="3.8/4.0"
                    value={education.gpa}
                    onChange={(e) =>
                      handleUpdate(education.id, "gpa", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Relevant Coursework */}
              <div className="space-y-2">
                <Label htmlFor={`coursework-${education.id}`}>
                  Relevant Coursework (Optional)
                </Label>
                <Input
                  id={`coursework-${education.id}`}
                  placeholder="Data Structures, Algorithms, Database Systems, Machine Learning"
                  value={education.relevantCoursework}
                  onChange={(e) =>
                    handleUpdate(
                      education.id,
                      "relevantCoursework",
                      e.target.value
                    )
                  }
                />
              </div>
            </FormCard>
          ))}
        </div>
      )}

      {/* Fixed circular add button - only show when there are education entries */}
      {educations.length > 0 && (
        <FloatingAddButton
          onClick={addEducation}
          tooltip="Add new education entry"
          disabled={isSaving}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}