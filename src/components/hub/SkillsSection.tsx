"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Plus, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSkills } from "@/hooks";
import { SectionHeader, EmptyState, FormCard, FloatingAddButton } from "./base";

export function SkillsSection() {
  const {
    skillCategories,
    isLoading,
    error,
    isSaving,
    hasUnsavedChanges,
    createSkillCategory,
    deleteSkillCategory,
    updateCategoryTitle,
    addSkillToCategory,
    removeSkillFromCategory,
    saveSkills,
    discardChanges,
  } = useSkills();

  const [newSkillInput, setNewSkillInput] = useState<{
    [categoryId: string]: string;
  }>({});

  const addSkillCategory = () => {
    createSkillCategory("");
  };

  const handleSkillInputChange = (categoryId: string, value: string) => {
    setNewSkillInput({ ...newSkillInput, [categoryId]: value });
  };

  const addSkill = (categoryId: string) => {
    const skillText = newSkillInput[categoryId]?.trim();
    if (!skillText) return;

    addSkillToCategory(categoryId, skillText);
    // Clear the input for this category
    setNewSkillInput({ ...newSkillInput, [categoryId]: "" });
  };

  const handleSkillInputKeyPress = (
    categoryId: string,
    e: React.KeyboardEvent
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(categoryId);
    }
  };

  const handleCategoryTitleChange = (categoryId: string, newTitle: string) => {
    updateCategoryTitle(categoryId, newTitle);
  };

  const removeSkill = (categoryId: string, skillId: string) => {
    removeSkillFromCategory(categoryId, skillId);
  };

  const removeCategory = (categoryId: string) => {
    deleteSkillCategory(categoryId);
    // Clean up the input state for this category
    const newInputState = { ...newSkillInput };
    delete newInputState[categoryId];
    setNewSkillInput(newInputState);
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <SectionHeader
        title="Skills"
        description="Organize your technical and professional skills by category."
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={saveSkills}
        onDiscard={discardChanges}
        showActions={hasUnsavedChanges}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {skillCategories.length === 0 && !hasUnsavedChanges ? (
        <EmptyState
          emoji="🎯"
          title="No skill categories yet!"
          description="Ready to showcase your expertise? Add your first skill category to organize and highlight your abilities!"
          buttonText="Add Your First Skill Category"
          onAdd={addSkillCategory}
        />
      ) : (
        <div className="space-y-6">
          {skillCategories.map((category) => (
            <FormCard 
              key={category.id}
              title={category.title}
              titlePlaceholder="Programming Languages, Design Tools, etc."
              onTitleChange={(value) => handleCategoryTitleChange(category.id, value)}
              onDelete={() => removeCategory(category.id)}
              deleteTitle="Delete Skill Category"
              deleteDescription="Are you sure you want to delete this skill category? This action cannot be undone."
              isSaving={isSaving}
            >
              {/* Skills Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Skills</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkillInput[category.id] || ""}
                      onChange={(e) =>
                        handleSkillInputChange(category.id, e.target.value)
                      }
                      onKeyPress={(e) =>
                        handleSkillInputKeyPress(category.id, e)
                      }
                      className="w-56"
                      disabled={isSaving}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addSkill(category.id)}
                          className="gap-2 rounded-full"
                          disabled={isSaving || !newSkillInput[category.id]?.trim()}
                        >
                          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add skill</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Skills Display */}
                {category.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group relative flex items-center"
                      >
                        <Badge
                          variant="secondary"
                          className="text-sm px-3 py-1.5 pr-8 hover:shadow-sm transition-shadow"
                        >
                          {skill.name}
                        </Badge>
                        
                        {/* Delete button overlay */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(category.id, skill.id!)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-full transition-opacity"
                              disabled={isSaving}
                            >
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove skill</TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                )}

                {category.skills.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    No skills added yet. Use the input above to add skills.
                  </p>
                )}
              </div>
            </FormCard>
          ))}
        </div>
      )}

      {/* Fixed circular add button - only show when there are skill categories */}
      {skillCategories.length > 0 && (
        <FloatingAddButton
          onClick={addSkillCategory}
          tooltip="Add new skill category"
          disabled={isSaving}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}