import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Plus, ExternalLink, Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/hub/useProjects";
import { SectionHeader, EmptyState, FormCard, FloatingAddButton } from "./base";

interface ProjectEntry {
  id: string;
  title: string;
  link: string;
  date: Date | undefined;
  bullets: string[];
}

export function ProjectsSection() {
  const { 
    projects, 
    isLoading, 
    error, 
    isSaving,
    hasUnsavedChanges,
    createProject, 
    updateProject, 
    deleteProject,
    saveProjects,
    discardChanges
  } = useProjects();

  console.log('ProjectsSection render:', { 
    projectsLength: projects.length, 
    hasUnsavedChanges, 
    showEmptyState: projects.length === 0 && !hasUnsavedChanges 
  });

  const addProject = () => {
    createProject();
  };

  const handleUpdate = (id: string | undefined, field: string, value: any) => {
    if (!id) return;
    updateProject(id, { [field]: value });
  };

  const removeProject = (id: string | undefined) => {
    if (!id) return;
    deleteProject(id);
  };

  const addBullet = (projectId: string | undefined) => {
    if (!projectId) return;
    
    const project = projects.find(proj => proj.id === projectId);
    if (project) {
      const newBullets = [...(project.bullets || []), ""];
      updateProject(projectId, { bullets: newBullets });
    }
  };

  const updateBullet = (projectId: string | undefined, bulletIndex: number, value: string) => {
    if (!projectId) return;
    
    const project = projects.find(proj => proj.id === projectId);
    if (project) {
      const newBullets = project.bullets?.map((bullet, index) =>
        index === bulletIndex ? value : bullet
      ) || [];
      updateProject(projectId, { bullets: newBullets });
    }
  };

  const removeBullet = (projectId: string | undefined, bulletIndex: number) => {
    if (!projectId) return;
    
    const project = projects.find(proj => proj.id === projectId);
    if (project && (project.bullets?.length || 0) > 1) {
      const newBullets = project.bullets?.filter((_, index) => index !== bulletIndex) || [];
      updateProject(projectId, { bullets: newBullets });
    }
  };

  return (
    <div className="w-full relative">
      <SectionHeader
        title="Projects"
        description="Showcase your personal and professional projects."
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={saveProjects}
        onDiscard={discardChanges}
        showActions={hasUnsavedChanges}
      />

      {projects.length === 0 && !hasUnsavedChanges ? (
        <EmptyState
          emoji="🚀"
          title="No projects yet!"
          description="Time to show off your amazing work! Add your first project to highlight your skills and creativity."
          buttonText="Add Your First Project"
          onAdd={addProject}
        />
      ) : (
        <div className="space-y-6">
          {projects.map((project, projectIndex) => (
            <FormCard 
              key={project.id}
              title={project.title || `Project ${projectIndex + 1}`}
              titlePlaceholder="Project Title"
              onTitleChange={(value) => handleUpdate(project.id, 'title', value)}
              onDelete={() => removeProject(project.id)}
              deleteTitle="Delete Project"
              deleteDescription="Are you sure you want to delete this project? This action cannot be undone."
              isSaving={isSaving}
            >
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
                        onChange={(e) => handleUpdate(project.id, 'link', e.target.value)}
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
                      onSelect={(date) => handleUpdate(project.id, 'date', date)}
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
                    {(project.bullets || []).map((bullet, bulletIndex) => (
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
            </FormCard>
          ))}
        </div>
      )}

      {/* Fixed circular add button - only show when there are projects */}
      {projects.length > 0 && (
        <FloatingAddButton
          onClick={addProject}
          tooltip="Add new project"
          disabled={isSaving}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}