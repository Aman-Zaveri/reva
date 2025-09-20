"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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
  const [educations, setEducations] = useState<Education[]>([]);

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      program: "",
      institution: "",
      graduationDate: undefined,
      minor: "",
      gpa: "",
      relevantCoursework: "",
    };
    setEducations([...educations, newEducation]);
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter((education) => education.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducations(
      educations.map((education) =>
        education.id === id ? { ...education, [field]: value } : education
      )
    );
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium mb-2">Education</h2>
          <p className="text-sm">
            Add your educational background, degrees, and academic achievements.
          </p>
        </div>
      </div>

      {educations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center min-h-[400px]">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-lg font-medium mb-2">No education entries yet!</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            Ready to showcase your academic journey? Add your first education
            entry to highlight your degrees and achievements!
          </p>
          <Button onClick={addEducation} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Education
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {educations.map((education) => (
            <Card key={education.id} className="p-6 border border-accent">
              <div className="space-y-4">
                {/* Program Title */}
                <div className="flex items-start justify-between">
                  <Input
                    placeholder="Bachelor of Science in Computer Science"
                    value={education.program}
                    onChange={(e) =>
                      updateEducation(education.id, "program", e.target.value)
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
                      <TooltipContent>Delete education entry</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Education Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this education entry?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeEducation(education.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

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
                        updateEducation(
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
                        updateEducation(education.id, "graduationDate", date)
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
                        updateEducation(education.id, "minor", e.target.value)
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
                        updateEducation(education.id, "gpa", e.target.value)
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
                      updateEducation(
                        education.id,
                        "relevantCoursework",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fixed circular add button - only show when there are education entries */}
      {educations.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={addEducation}
              className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
              size="icon"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Add Education</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new education entry</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}