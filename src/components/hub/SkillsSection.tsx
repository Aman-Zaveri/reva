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
import { Plus, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
}

export function SkillsSection() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<{
    [categoryId: string]: string;
  }>({});
  const [hoveredSkill, setHoveredSkill] = useState<{
    categoryId: string;
    skillIndex: number;
  } | null>(null);
  const [animatingSkill, setAnimatingSkill] = useState<{
    categoryId: string;
    skillIndex: number;
  } | null>(null);

  const addSkillCategory = () => {
    const newCategory: SkillCategory = {
      id: Date.now().toString(),
      title: "",
      skills: [],
    };
    setSkillCategories([...skillCategories, newCategory]);
  };

  const removeSkillCategory = (id: string) => {
    setSkillCategories(
      skillCategories.filter((category) => category.id !== id)
    );
    // Clean up the input state for this category
    const newInputState = { ...newSkillInput };
    delete newInputState[id];
    setNewSkillInput(newInputState);
  };

  const updateSkillCategoryTitle = (id: string, title: string) => {
    setSkillCategories(
      skillCategories.map((category) =>
        category.id === id ? { ...category, title } : category
      )
    );
  };

  const addSkill = (categoryId: string) => {
    const skillText = newSkillInput[categoryId]?.trim();
    if (!skillText) return;

    setSkillCategories(
      skillCategories.map((category) =>
        category.id === categoryId
          ? { ...category, skills: [...category.skills, skillText] }
          : category
      )
    );

    // Clear the input for this category
    setNewSkillInput({ ...newSkillInput, [categoryId]: "" });
  };

  const removeSkill = (categoryId: string, skillIndex: number) => {
    setSkillCategories(
      skillCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              skills: category.skills.filter(
                (_, index) => index !== skillIndex
              ),
            }
          : category
      )
    );
  };

  const moveSkillLeft = (categoryId: string, skillIndex: number) => {
    if (skillIndex === 0) return; // Already at the beginning

    // Set animation state
    setAnimatingSkill({ categoryId, skillIndex });

    // Apply the swap immediately for smooth animation
    setSkillCategories(
      skillCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              skills: category.skills.map((skill, index) => {
                if (index === skillIndex)
                  return category.skills[skillIndex - 1];
                if (index === skillIndex - 1)
                  return category.skills[skillIndex];
                return skill;
              }),
            }
          : category
      )
    );

    // Clear animation state
    setTimeout(() => setAnimatingSkill(null), 300);
  };

  const moveSkillRight = (categoryId: string, skillIndex: number) => {
    // Set animation state
    setAnimatingSkill({ categoryId, skillIndex });

    // Apply the swap immediately for smooth animation
    setSkillCategories((prevCategories) =>
      prevCategories.map((category) => {
        if (category.id !== categoryId) return category;
        if (skillIndex >= category.skills.length - 1) return category; // Already at the end

        return {
          ...category,
          skills: category.skills.map((skill, index) => {
            if (index === skillIndex) return category.skills[skillIndex + 1];
            if (index === skillIndex + 1) return category.skills[skillIndex];
            return skill;
          }),
        };
      })
    );

    // Clear animation state
    setTimeout(() => setAnimatingSkill(null), 300);
  };

  const handleSkillInputChange = (categoryId: string, value: string) => {
    setNewSkillInput({ ...newSkillInput, [categoryId]: value });
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

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium mb-2">Skills</h2>
          <p className="text-sm">
            Organize your technical and professional skills by category.
          </p>
        </div>
      </div>

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
                      updateSkillCategoryTitle(category.id, e.target.value)
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
                          onClick={() => removeSkillCategory(category.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
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
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addSkill(category.id)}
                            className="gap-2 rounded-full"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add skill</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Skills Display */}
                  {category.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, skillIndex) => {
                        const isHovered =
                          hoveredSkill?.categoryId === category.id &&
                          hoveredSkill?.skillIndex === skillIndex;
                        const isAnimating =
                          animatingSkill?.categoryId === category.id &&
                          animatingSkill?.skillIndex === skillIndex;

                        return (
                          <div
                            key={`${category.id}-${skillIndex}`}
                            className={`relative flex flex-col items-center transition-all duration-300 ease-in-out ${
                              isAnimating ? "scale-[1.01] z-10" : "scale-100"
                            }`}
                            onMouseEnter={() =>
                              setHoveredSkill({
                                categoryId: category.id,
                                skillIndex,
                              })
                            }
                            onMouseLeave={() => setHoveredSkill(null)}
                            style={{
                              transform: isAnimating
                                ? "translateX(10px)"
                                : "translateX(0px)",
                            }}
                          >
                            {/* Control Icons Above Badge */}
                            <div
                              className={`absolute -top-5 left-1/2 transform -translate-x-1/2 flex items-center gap-1 transition-all duration-200 z-10 ${
                                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                              }`}
                            >
                              {/* Move Left Button */}
                              {skillIndex > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        moveSkillLeft(category.id, skillIndex)
                                      }
                                      className="h-5 w-5 p-0 hover:bg-blue-100 rounded-full"
                                    >
                                      <ChevronLeft className="h-3 w-3 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Move left</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Delete Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeSkill(category.id, skillIndex)
                                    }
                                    className="h-5 w-5 p-0 hover:bg-red-100 rounded-full"
                                  >
                                    <X className="h-3 w-3 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove skill</TooltipContent>
                              </Tooltip>

                              {/* Move Right Button */}
                              {skillIndex < category.skills.length - 1 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        moveSkillRight(category.id, skillIndex)
                                      }
                                      className="h-5 w-5 p-0 hover:bg-blue-100 rounded-full"
                                    >
                                      <ChevronRight className="h-3 w-3 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Move right</TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            {/* Skill Badge */}
                            <Badge
                              variant="secondary"
                              className={`text-sm px-3 py-1.5 transition-all duration-200 ease-in-out ${
                                isHovered
                                  ? "shadow-md scale-[1.01]"
                                  : "shadow-sm"
                              }`}
                            >
                              {skill}
                            </Badge>
                          </div>
                        );
                      })}
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
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Add Skill Category</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new skill category</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
