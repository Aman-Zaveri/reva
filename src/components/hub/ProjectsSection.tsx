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
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ProjectEntry {
  id: string;
  title: string;
  link: string;
  date: Date | undefined;
  bullets: string[];
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  const addProject = () => {
    const newProject: ProjectEntry = {
      id: Date.now().toString(),
      title: "",
      link: "",
      date: undefined,
      bullets: [""]
    };
    setProjects([...projects, newProject]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(proj => proj.id !== id));
  };

  const updateProject = (id: string, field: keyof Omit<ProjectEntry, 'id'>, value: string | string[] | Date | undefined) => {
    setProjects(projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };

  const addBullet = (projectId: string) => {
    setProjects(projects.map(proj => 
      proj.id === projectId 
        ? { ...proj, bullets: [...proj.bullets, ""] }
        : proj
    ));
  };

  const updateBullet = (projectId: string, bulletIndex: number, value: string) => {
    setProjects(projects.map(proj => 
      proj.id === projectId 
        ? { 
            ...proj, 
            bullets: proj.bullets.map((bullet, index) => 
              index === bulletIndex ? value : bullet
            ) 
          }
        : proj
    ));
  };

  const removeBullet = (projectId: string, bulletIndex: number) => {
    setProjects(projects.map(proj => 
      proj.id === projectId && proj.bullets.length > 1
        ? { 
            ...proj, 
            bullets: proj.bullets.filter((_, index) => index !== bulletIndex)
          }
        : proj
    ));
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium mb-2">Projects</h2>
          <p className="text-sm">Showcase your personal and professional projects.</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center min-h-[400px]">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-lg font-medium mb-2">No projects yet!</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            Time to show off your amazing work! Add your first project to highlight your skills and creativity.
          </p>
          <Button 
            onClick={addProject}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project, projectIndex) => (
            <Card key={project.id} className="p-6 border border-accent">
              <div className="flex items-center justify-between">
                <Input
                  value={project.title || `Project ${projectIndex + 1}`}
                  onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                  placeholder="Project Title"
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
                      Delete project
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this project? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeProject(project.id)} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="space-y-4">
                {/* Project Link and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`link-${project.id}`}>
                      Project Link
                    </Label>
                    <div className="relative">
                      <Input
                        id={`link-${project.id}`}
                        value={project.link}
                        onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="w-full pr-10"
                      />
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`date-${project.id}`}>
                      Project Date
                    </Label>
                    <DatePicker
                      id={`date-${project.id}`}
                      date={project.date}
                      onSelect={(date) => updateProject(project.id, 'date', date)}
                      placeholder="Select date"
                    />
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Project Description Bullet Points
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addBullet(project.id)}
                          className="gap-2 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Add bullet point
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-3">
                    {project.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <Textarea
                          value={bullet}
                          onChange={(e) => updateBullet(project.id, bulletIndex, e.target.value)}
                          placeholder={`Key feature or achievement ${bulletIndex + 1}`}
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

      {/* Fixed circular add button - only show when there are projects */}
      {projects.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={addProject}
              className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
              size="icon"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Add Project</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Add new project
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}