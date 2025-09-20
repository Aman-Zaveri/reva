import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  bullets: string[];
}

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);

  const addExperience = () => {
    const newExperience: ExperienceEntry = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      bullets: [""]
    };
    setExperiences([...experiences, newExperience]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Omit<ExperienceEntry, 'id'>, value: string | string[] | Date | undefined) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addBullet = (experienceId: string) => {
    setExperiences(experiences.map(exp => 
      exp.id === experienceId 
        ? { ...exp, bullets: [...exp.bullets, ""] }
        : exp
    ));
  };

  const updateBullet = (experienceId: string, bulletIndex: number, value: string) => {
    setExperiences(experiences.map(exp => 
      exp.id === experienceId 
        ? { 
            ...exp, 
            bullets: exp.bullets.map((bullet, index) => 
              index === bulletIndex ? value : bullet
            ) 
          }
        : exp
    ));
  };

  const removeBullet = (experienceId: string, bulletIndex: number) => {
    setExperiences(experiences.map(exp => 
      exp.id === experienceId && exp.bullets.length > 1
        ? { 
            ...exp, 
            bullets: exp.bullets.filter((_, index) => index !== bulletIndex)
          }
        : exp
    ));
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium mb-2">Work Experience</h2>
          <p className="text-sm">Add your professional experience and achievements.</p>
        </div>
      </div>

      {experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center min-h-[400px]">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium mb-2">No work experience yet!</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            Ready to showcase your professional journey? Add your first work experience to get started!
          </p>
          <Button 
            onClick={addExperience}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((experience, experienceIndex) => (
            <Card key={experience.id} className="p-6 border border-accent">
              <div className="flex items-center justify-between">
                <Input
                  value={experience.title || `Experience ${experienceIndex + 1}`}
                  onChange={(e) => updateExperience(experience.id, 'title', e.target.value)}
                  placeholder="Job Title"
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
                    <TooltipContent>
                      Delete experience
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this work experience? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeExperience(experience.id)} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

            <div className="space-y-4">
              {/* Company and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`company-${experience.id}`} className="text-sm font-medium">
                    Company
                  </Label>
                  <Input
                    id={`company-${experience.id}`}
                    value={experience.company}
                    onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
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
                    onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
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
                    onSelect={(date) => updateExperience(experience.id, 'startDate', date)}
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
                    onSelect={(date) => updateExperience(experience.id, 'endDate', date)}
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
                        onClick={() => addBullet(experience.id)}
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
                  {experience.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <Textarea
                        value={bullet}
                        onChange={(e) => updateBullet(experience.id, bulletIndex, e.target.value)}
                        placeholder="Implemented a new feature that improved user engagement by 20%."
                        className="flex-1 min-h-[60px] resize-y"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Fixed circular add button - only show when there are experiences */}
      {experiences.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={addExperience}
              className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
              size="icon"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Add Experience</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Add new experience
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}