"use client";

import { useProfilesStore } from "@/lib/store";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Briefcase,
  FolderOpen,
  Award,
  GraduationCap,
  Building,
  Calendar,
  ExternalLink,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PersonalInfoForm,
  BulletEditor,
  DetailsEditor,
  DataSection,
  DataCard,
  DataPageNavigation,
} from "@/components/data-management";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import type { Job } from "@/lib/types";

export default function DataManagerPage() {
  const {
    data,
    updateMasterPersonalInfo,
    updateExperience,
    addExperience,
    deleteExperience,
    updateProject,
    addProject,
    deleteProject,
    updateSkill,
    addSkill,
    deleteSkill,
    updateEducation,
    addEducation,
    deleteEducation,
  } = useProfilesStore();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetch("/api/jobs");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setJobs(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      {/* <div className="flex-shrink-0 border-b px-4 py-3 fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Master Data</h1>
              <p className="text-muted-foreground text-sm">
                Manage your resume content library
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Link href="/import-resume">Import Resume</Link>
          </Button>
        </div>
      </div> */}

      <div className="flex-1 flex flex-row pt-16">
        {/* Navigation - Now in a sidebar */}
        <div className="w-72 flex-shrink-0 border-r relative">
          <div className="sticky top-1/2 -translate-y-1/2 p-4">
            <DataPageNavigation />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 pt-10">
          <ScrollArea className="h-full">
            <div className="container mx-auto max-w-7xl py-4 px-4 space-y-6">
            {/* Personal Information Section */}
            <DataSection
              id="personal-info"
              title="Personal Information"
              description="Your personal details used as defaults for new resumes"
              headerIcon={<User className="h-4 w-4" />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    Personal Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your personal details, contact information, and
                    professional summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PersonalInfoForm
                    personalInfo={data.personalInfo}
                    onUpdate={updateMasterPersonalInfo}
                  />
                </CardContent>
              </Card>
            </DataSection>

            <Separator className="my-8" />

            {/* Experience Section */}
            <DataSection
              id="experience"
              title="Experience"
              description="Your work experience history"
              headerIcon={<Briefcase className="h-4 w-4" />}
              onAdd={addExperience}
              addButtonText="Add Experience"
            >
              {data.experiences.map((experience) => (
                <DataCard
                  key={experience.id}
                  id={experience.id}
                  title={experience.title}
                  subtitle={experience.company}
                  borderColor=""
                  onDelete={() => deleteExperience(experience.id)}
                  onTitleChange={(title) =>
                    updateExperience(experience.id, { title })
                  }
                  onSubtitleChange={(company) =>
                    updateExperience(experience.id, { company })
                  }
                  titlePlaceholder="Job Title"
                  subtitlePlaceholder="Company"
                  editDialog={{
                    title: `Edit ${experience.title || "Experience"} Details`,
                    description:
                      "Add and edit bullet points for this experience.",
                    content: (
                      <BulletEditor
                        bullets={experience.bullets}
                        onSave={(bullets) =>
                          updateExperience(experience.id, { bullets })
                        }
                        placeholder="Describe your achievement or responsibility..."
                      />
                    ),
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <Input
                      placeholder="Date Range"
                      value={experience.date}
                      onChange={(e) =>
                        updateExperience(experience.id, {
                          date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Achievements & Responsibilities (
                      {experience.bullets.length})
                    </h4>

                    {experience.bullets.length > 0 ? (
                      <div className="space-y-2">
                        {experience.bullets.map((bullet, index) => (
                          <div
                            key={index}
                            className="p-2 bg-muted/50 rounded text-sm"
                          >
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: bullet || "Empty bullet point",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground border border-dashed rounded">
                        <p className="text-sm">
                          No details added yet. Click "Edit Details" to add
                          achievements.
                        </p>
                      </div>
                    )}
                  </div>
                </DataCard>
              ))}
            </DataSection>

            <Separator className="my-8" />

            {/* Projects Section */}
            <DataSection
              id="projects"
              title="Projects"
              description="Your notable projects and work"
              headerIcon={<FolderOpen className="h-4 w-4" />}
              onAdd={addProject}
              addButtonText="Add Project"
            >
              {data.projects.map((project) => (
                <DataCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  subtitle={project.link}
                  borderColor=""
                  onDelete={() => deleteProject(project.id)}
                  onTitleChange={(title) =>
                    updateProject(project.id, { title })
                  }
                  onSubtitleChange={(link) =>
                    updateProject(project.id, { link })
                  }
                  titlePlaceholder="Project Title"
                  subtitlePlaceholder="Project Link (optional)"
                  editDialog={{
                    title: `Edit ${project.title || "Project"} Details`,
                    description: "Add and edit details about this project.",
                    content: (
                      <BulletEditor
                        bullets={project.bullets}
                        onSave={(bullets) =>
                          updateProject(project.id, { bullets })
                        }
                        placeholder="Describe project impact, technologies used, or features..."
                      />
                    ),
                  }}
                >
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Project Details ({project.bullets.length})
                    </h4>

                    {project.bullets.length > 0 ? (
                      <div className="space-y-2">
                        {project.bullets.map((bullet, index) => (
                          <div
                            key={index}
                            className="p-2 bg-muted/50 rounded text-sm"
                          >
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: bullet || "Empty bullet point",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground border border-dashed rounded">
                        <p className="text-sm">
                          No details added yet. Click "Edit Details" to add
                          project features.
                        </p>
                      </div>
                    )}
                  </div>
                </DataCard>
              ))}
            </DataSection>

            <Separator className="my-8" />

            {/* Skills Section */}
            <DataSection
              id="skills"
              title="Skills"
              description="Your technical and professional skills"
              headerIcon={<Award className="h-4 w-4" />}
              onAdd={addSkill}
              addButtonText="Add Skill Category"
            >
              {data.skills.map((skill) => (
                <DataCard
                  key={skill.id}
                  id={skill.id}
                  title={skill.name}
                  borderColor=""
                  onDelete={() => deleteSkill(skill.id)}
                  onTitleChange={(name) => updateSkill(skill.id, { name })}
                  titlePlaceholder="Skill Category"
                  editDialog={{
                    title: `Edit Skills: ${skill.name}`,
                    description: "Add or modify the skills in this category.",
                    content: (
                      <DetailsEditor
                        details={skill.details}
                        onSave={(details) => updateSkill(skill.id, { details })}
                        placeholder="List your skills in this category..."
                      />
                    ),
                  }}
                >
                  {skill.details ? (
                    <div className="bg-muted/50 rounded p-2 prose prose-sm max-w-none text-sm">
                      <div
                        dangerouslySetInnerHTML={{ __html: skill.details }}
                      />
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded p-2 text-muted-foreground text-sm border border-dashed">
                      No skills added yet. Click "Edit Details" to add skills in
                      this category.
                    </div>
                  )}
                </DataCard>
              ))}
            </DataSection>

            <Separator className="my-8" />

            {/* Education Section */}
            <DataSection
              id="education"
              title="Education"
              description="Your educational background"
              headerIcon={<GraduationCap className="h-4 w-4" />}
              onAdd={addEducation}
              addButtonText="Add Education"
            >
              {data.education.map((edu) => (
                <DataCard
                  key={edu.id}
                  id={edu.id}
                  title={edu.title}
                  borderColor=""
                  onDelete={() => deleteEducation(edu.id)}
                  onTitleChange={(title) => updateEducation(edu.id, { title })}
                  titlePlaceholder="Degree/Program"
                  editDialog={{
                    title: `Edit Education: ${edu.title}`,
                    description: "Add details about this education entry.",
                    content: (
                      <DetailsEditor
                        details={edu.details}
                        onSave={(details) =>
                          updateEducation(edu.id, { details })
                        }
                        placeholder="Institution, graduation year, GPA, honors..."
                      />
                    ),
                  }}
                >
                  {edu.details ? (
                    <div className="bg-muted/50 rounded p-2 prose prose-sm max-w-none text-sm">
                      <div dangerouslySetInnerHTML={{ __html: edu.details }} />
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded p-2 text-muted-foreground text-sm border border-dashed">
                      No details added yet. Click "Edit Details" to add
                      institution, graduation year, GPA, honors, etc.
                    </div>
                  )}
                </DataCard>
              ))}
            </DataSection>

            <Separator className="my-8" />

            {/* Jobs Section */}
            <DataSection
              id="jobs"
              title="Job Applications"
              description="Jobs you've applied to and their corresponding resumes"
              headerIcon={<Building className="h-4 w-4" />}
            >
              {loadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-muted-foreground text-sm">Loading jobs...</p>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        No jobs tracked yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Jobs will appear here when you create resumes using the
                        Chrome extension
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="border-l-2 border-l-blue-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">
                              {job.title}
                            </h3>
                            <Badge
                              variant={
                                job.source === "extension"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {job.source === "extension" ? (
                                <>
                                  <Chrome className="h-3 w-3 mr-1" /> Extension
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3 mr-1" /> Manual
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {job.url && (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>View Job</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {job.description && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Description
                            </h4>
                            <div className="bg-muted/50 rounded p-2 text-sm">
                              {job.description.length > 200
                                ? `${job.description.substring(0, 200)}...`
                                : job.description}
                            </div>
                          </div>
                        )}

                        {job.skills && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Skills Required
                            </h4>
                            <div className="bg-muted/50 rounded p-2 text-sm">
                              {job.skills}
                            </div>
                          </div>
                        )}

                        {(job as any).profiles &&
                        (job as any).profiles.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Resumes Created ({(job as any).profiles.length})
                            </h4>
                            <div className="space-y-1">
                              {(job as any).profiles.map((profile: any) => (
                                <div
                                  key={profile.id}
                                  className="bg-muted/50 rounded p-2 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-medium text-sm">
                                      {profile.profileName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Created{" "}
                                      {new Date(
                                        profile.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/builder/${profile.id}`}>
                                      View Resume
                                    </Link>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/50 rounded p-3 text-center text-muted-foreground border border-dashed">
                            <p className="text-sm">
                              No resumes created for this job yet
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </DataSection>
          </div>
        </ScrollArea>
      </div>
    </div>
    </div>
  );
}
