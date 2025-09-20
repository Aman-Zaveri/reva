"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, X, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useSkills } from "@/hooks";

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium mb-2">Skills</h2>
          <p className="text-sm">
            Organize your technical and professional skills by category.
          </p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={discardChanges}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Discard Changes
            </Button>
            <Button
              size="sm"
              onClick={saveSkills}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {skillCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center min-h-[400px]">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium mb-2">No skill categories yet!</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            Ready to showcase your expertise? Add your first skill category to
            organize and highlight your abilities!
          </p>
          <Button onClick={addSkillCategory} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Skill Category
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {skillCategories.map((category) => (
            <Card key={category.id} className="p-6 border border-accent">
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-start justify-between">
                  <Input
                    placeholder="Programming Languages, Design Tools, etc."
                    value={category.title}
                    onChange={(e) =>
                      handleCategoryTitleChange(category.id, e.target.value)
                    }
                    className="text-3xl font-medium border-none shadow-none p-0 h-auto bg-transparent focus:border-none focus:shadow-none focus-visible:ring-0"
                  />
                  <AlertDialog>
                    <Tooltip>
                      <AlertDialogTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 rounded-full hover:text-red-700"
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                      </AlertDialogTrigger>
                      <TooltipContent>Delete skill category</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Skill Category
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this skill category?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeCategory(category.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fixed circular add button - only show when there are skill categories */}
      {skillCategories.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={addSkillCategory}
              className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
              size="icon"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              <span className="sr-only">Add Skill Category</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new skill category</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}