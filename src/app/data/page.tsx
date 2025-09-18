"use client";

import { useProfilesStore } from '@/shared/lib/store';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit3, ExternalLink, Calendar, Building, Chrome, User, Wand2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { AIEnhancedBulletEditor } from '@/shared/components/forms/AIEnhancedBulletEditor';
import { PersonalInfoForm, StorageSettings } from '@/features/data-management/components';
import { AIFloatingActions } from '@/shared/components/shared/AIFloatingActions';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { useState, useEffect } from 'react';
import type { Job } from '@/shared/lib/types';

export default function DataManagerPage() {
  const {
    data,
    updateMasterPersonalInfo,
    updateExperience, addExperience, deleteExperience,
    updateProject, addProject, deleteProject,
    updateSkill, addSkill, deleteSkill,
    updateEducation, addEducation, deleteEducation
  } = useProfilesStore();

  const [editingItem, setEditingItem] = useState<{
    type: 'experience' | 'project' | 'skill' | 'education';
    id: string;
    bullets?: string[];
  } | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetch('/api/jobs');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setJobs(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const SkillDetailsEditor = ({ 
    skill, 
    onSave 
  }: {
    skill: any;
    onSave: (details: string) => void;
  }) => {
    const [editDetails, setEditDetails] = useState(skill.details);

    const handleSave = () => {
      onSave(editDetails);
    };

    const handleAIEnhance = async () => {
      try {
        // Use the grammar enhancement API to improve skill descriptions
        const response = await fetch('/api/ai-agents/grammar-enhance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: editDetails,
            context: `Skills category: ${skill.name}`,
            improvementType: 'skills-description'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.enhancedText) {
            setEditDetails(result.enhancedText);
          }
        }
      } catch (error) {
        console.error('AI enhancement failed:', error);
        alert('AI enhancement temporarily unavailable. Please try again later.');
      }
    };

    return (
      <div className="space-y-4 py-4">
        <div className="relative">
          <RichTextEditor
            value={editDetails}
            onChange={setEditDetails}
            placeholder="List your skills in this category..."
            className="min-h-[120px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-purple-50 border-purple-200 hover:bg-purple-100"
            onClick={handleAIEnhance}
            title="AI enhance skill descriptions"
          >
            <Wand2 size={14} className="text-purple-600" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleAIEnhance}
            className="flex-1 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <Wand2 size={16} className="mr-2" />
            AI Enhance
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const EducationDetailsEditor = ({ 
    education, 
    onSave 
  }: {
    education: any;
    onSave: (details: string) => void;
  }) => {
    const [editDetails, setEditDetails] = useState(education.details);

    const handleSave = () => {
      onSave(editDetails);
    };

    const handleAIEnhance = async () => {
      try {
        // Use the grammar enhancement API to improve education descriptions
        const response = await fetch('/api/ai-agents/grammar-enhance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: editDetails,
            context: `Education: ${education.title}`,
            improvementType: 'education-description'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.enhancedText) {
            setEditDetails(result.enhancedText);
          }
        }
      } catch (error) {
        console.error('AI enhancement failed:', error);
        alert('AI enhancement temporarily unavailable. Please try again later.');
      }
    };

    return (
      <div className="space-y-4 py-4">
        <div className="relative">
          <RichTextEditor
            value={editDetails}
            onChange={setEditDetails}
            placeholder="Institution, graduation year, GPA, honors..."
            className="min-h-[120px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-green-50 border-green-200 hover:bg-green-100"
            onClick={handleAIEnhance}
            title="AI enhance education description"
          >
            <Wand2 size={14} className="text-green-600" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleAIEnhance}
            className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <Wand2 size={16} className="mr-2" />
            AI Enhance
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const ProjectBulletEditor = ({ 
    project, 
    onSave 
  }: {
    project: any;
    onSave: (bullets: string[]) => void;
  }) => {
    const [editBullets, setEditBullets] = useState(project.bullets);

    const addBullet = () => {
      setEditBullets([...editBullets, ""]);
    };

    const updateBullet = (index: number, value: string) => {
      const newBullets = [...editBullets];
      newBullets[index] = value;
      setEditBullets(newBullets);
    };

    const removeBullet = (index: number) => {
      const newBullets = editBullets.filter((_: any, i: number) => i !== index);
      setEditBullets(newBullets);
    };

    const handleSave = () => {
      onSave(editBullets);
    };

    return (
      <div className="space-y-4 py-4">
        {editBullets.map((bullet: string, index: number) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <RichTextEditor
                value={bullet}
                onChange={(value) => updateBullet(index, value)}
                placeholder="Describe project impact, technologies used, or features..."
                className="min-h-[80px]"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBullet(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addBullet}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add bullet point
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const ExperienceBulletEditor = ({ 
    experience, 
    onSave 
  }: {
    experience: any;
    onSave: (bullets: string[]) => void;
  }) => {
    const [editBullets, setEditBullets] = useState(experience.bullets);

    const addBullet = () => {
      setEditBullets([...editBullets, ""]);
    };

    const updateBullet = (index: number, value: string) => {
      const newBullets = [...editBullets];
      newBullets[index] = value;
      setEditBullets(newBullets);
    };

    const removeBullet = (index: number) => {
      const newBullets = editBullets.filter((_: any, i: number) => i !== index);
      setEditBullets(newBullets);
    };

    const handleSave = () => {
      onSave(editBullets);
    };

    return (
      <div className="space-y-4 py-4">
        {editBullets.map((bullet: string, index: number) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <RichTextEditor
                value={bullet}
                onChange={(value) => updateBullet(index, value)}
                placeholder="Describe your achievement or responsibility..."
                className="min-h-[80px]"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBullet(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addBullet}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add bullet point
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const BulletEditDialog = ({ 
    isOpen, 
    onOpenChange, 
    bullets, 
    onSave, 
    title 
  }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    bullets: string[];
    onSave: (bullets: string[]) => void;
    title: string;
  }) => {
    const [editBullets, setEditBullets] = useState(bullets);

    const handleSave = () => {
      onSave(editBullets);
      onOpenChange(false);
    };

    const addBullet = () => {
      setEditBullets([...editBullets, ""]);
    };

    const updateBullet = (index: number, value: string) => {
      const newBullets = [...editBullets];
      newBullets[index] = value;
      setEditBullets(newBullets);
    };

    const removeBullet = (index: number) => {
      const newBullets = editBullets.filter((_, i) => i !== index);
      setEditBullets(newBullets);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {title}</DialogTitle>
            <DialogDescription>
              Add and edit bullet points for this item. Click the AI enhancement button for intelligent suggestions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editBullets.map((bullet, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <RichTextEditor
                      value={bullet}
                      onChange={(value: string) => updateBullet(index, value)}
                      placeholder="Describe your achievement or responsibility..."
                      className="min-h-[80px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-blue-50 border-blue-200 hover:bg-blue-100"
                      onClick={() => {
                        // TODO: Implement AI enhancement for individual bullet
                        alert('AI enhancement coming soon! This will provide intelligent suggestions for improving this bullet point.');
                      }}
                      title="AI enhance this bullet point"
                    >
                      <Wand2 size={14} className="text-blue-600" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBullet(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={addBullet}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add bullet point
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="hover:bg-gray-50 transition-colors">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Master Data
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your resume content library
            </p>
          </div>
        </div>
        <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
          <Link href="/import-resume">
            Import Resume
          </Link>
        </Button>
      </div>

      <Separator />

      <Tabs defaultValue="personal" className="space-y-8">
        <TabsList className="grid w-full grid-cols-7 bg-gray-50 border border-gray-200 rounded-lg p-1">
          <TabsTrigger value="personal" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Personal
          </TabsTrigger>
          <TabsTrigger value="experiences" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Experience
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Projects
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Skills
          </TabsTrigger>
          <TabsTrigger value="education" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Education
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Jobs
          </TabsTrigger>
          <TabsTrigger value="storage" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Personal Information</h2>
              <p className="text-muted-foreground mt-1">Your personal details used as defaults for new resumes</p>
            </div>
          </div>

          <Card className="bg-blue-50/80 border-l-blue-400 border-l-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Personal Profile</CardTitle>
              <CardDescription className="text-gray-600">
                Manage your personal details, contact information, and professional summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm
                personalInfo={data.personalInfo}
                onUpdate={updateMasterPersonalInfo}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiences" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Experience</h2>
              <p className="text-muted-foreground mt-1">Your work experience history</p>
            </div>
            <Button onClick={addExperience} className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>

          <div className="space-y-6">
            {data.experiences.map((experience, index) => {
              const colors = [
                { border: 'border-l-blue-400', bg: 'bg-blue-50/80', accent: 'text-blue-700' },
                { border: 'border-l-emerald-400', bg: 'bg-emerald-50/80', accent: 'text-emerald-700' },
                { border: 'border-l-violet-400', bg: 'bg-violet-50/80', accent: 'text-violet-700' },
                { border: 'border-l-amber-400', bg: 'bg-amber-50/80', accent: 'text-amber-700' },
                { border: 'border-l-rose-400', bg: 'bg-rose-50/80', accent: 'text-rose-700' },
                { border: 'border-l-slate-400', bg: 'bg-slate-50/80', accent: 'text-slate-700' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <Card key={experience.id} className={`${colorScheme.bg} ${colorScheme.border} border-l-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="grid gap-3 flex-1 mr-4">
                        <Input
                          placeholder="Job Title"
                          value={experience.title}
                          onChange={(e) => updateExperience(experience.id, { title: e.target.value })}
                          className={`text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent ${colorScheme.accent}`}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Company"
                            value={experience.company}
                            onChange={(e) => updateExperience(experience.id, { company: e.target.value })}
                            className="bg-white/70 border-gray-200 focus:border-gray-400 transition-colors"
                          />
                          <Input
                            placeholder="Date Range"
                            value={experience.date}
                            onChange={(e) => updateExperience(experience.id, { date: e.target.value })}
                            className="bg-white/70 border-gray-200 focus:border-gray-400 transition-colors"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExperience(experience.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="ml-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Achievements & Responsibilities
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border">
                            {experience.bullets.length} {experience.bullets.length === 1 ? 'bullet' : 'bullets'}
                          </span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                <span>Edit {experience.title || 'Experience'} Details</span>
                              </DialogTitle>
                              <DialogDescription>
                                Add and edit bullet points for this experience. Focus on achievements, impact, and specific responsibilities.
                              </DialogDescription>
                            </DialogHeader>
                            <ExperienceBulletEditor
                              experience={experience}
                              onSave={(bullets) => updateExperience(experience.id, { bullets })}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="space-y-3">
                        {experience.bullets.map((bullet, index) => (
                          <div key={index} className="p-4 bg-white/50 rounded-lg border border-gray-100 hover:bg-white/80 transition-colors duration-200">
                            <div 
                              className="text-sm prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: bullet || "Empty bullet point" }}
                            />
                          </div>
                        ))}
                        {experience.bullets.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg bg-white/30">
                            <div className="space-y-2">
                              <div className="text-lg">📝</div>
                              <p className="font-medium">No details added yet</p>
                              <p className="text-sm">Click "Edit Details" to add achievements and responsibilities.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h2>
              <p className="text-muted-foreground mt-1">Your notable projects and work</p>
            </div>
            <Button onClick={addProject} className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>

          <div className="space-y-6">
            {data.projects.map((project, index) => {
              const colors = [
                { border: 'border-l-blue-400', bg: 'bg-blue-50/80', accent: 'text-blue-700' },
                { border: 'border-l-emerald-400', bg: 'bg-emerald-50/80', accent: 'text-emerald-700' },
                { border: 'border-l-violet-400', bg: 'bg-violet-50/80', accent: 'text-violet-700' },
                { border: 'border-l-amber-400', bg: 'bg-amber-50/80', accent: 'text-amber-700' },
                { border: 'border-l-rose-400', bg: 'bg-rose-50/80', accent: 'text-rose-700' },
                { border: 'border-l-slate-400', bg: 'bg-slate-50/80', accent: 'text-slate-700' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <Card key={project.id} className={`${colorScheme.bg} ${colorScheme.border} border-l-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="grid gap-3 flex-1 mr-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Project Title"
                            value={project.title}
                            onChange={(e) => updateProject(project.id, { title: e.target.value })}
                            className={`text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent ${colorScheme.accent}`}
                          />
                        </div>
                        <Input
                          placeholder="Project Link (optional)"
                          value={project.link || ""}
                          onChange={(e) => updateProject(project.id, { link: e.target.value })}
                          className="bg-white/70 border-gray-200 focus:border-gray-400 transition-colors"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Project Details
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border">
                            {project.bullets.length} {project.bullets.length === 1 ? 'bullet' : 'bullets'}
                          </span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                <span>Edit {project.title || 'Project'} Details</span>
                              </DialogTitle>
                              <DialogDescription>
                                Add and edit details about this project. Include technologies used, features, and impact.
                              </DialogDescription>
                            </DialogHeader>
                            <ProjectBulletEditor
                              project={project}
                              onSave={(bullets) => updateProject(project.id, { bullets })}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="space-y-3">
                        {project.bullets.map((bullet, index) => (
                          <div key={index} className="p-4 bg-white/50 rounded-lg border border-gray-100 hover:bg-white/80 transition-colors duration-200">
                            <div 
                              className="text-sm prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: bullet || "Empty bullet point" }}
                            />
                          </div>
                        ))}
                        {project.bullets.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg bg-white/30">
                            <div className="space-y-2">
                              <div className="text-lg">🚀</div>
                              <p className="font-medium">No details added yet</p>
                              <p className="text-sm">Click "Edit Details" to add project features and technologies.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Skills</h2>
              <p className="text-muted-foreground mt-1">Your technical and professional skills</p>
            </div>
            <Button onClick={addSkill} className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill Category
            </Button>
          </div>

          <div className="space-y-6">
            {data.skills.map((skill, index) => {
              const colors = [
                { border: 'border-l-blue-400', bg: 'bg-blue-50/80', accent: 'text-blue-700' },
                { border: 'border-l-emerald-400', bg: 'bg-emerald-50/80', accent: 'text-emerald-700' },
                { border: 'border-l-violet-400', bg: 'bg-violet-50/80', accent: 'text-violet-700' },
                { border: 'border-l-amber-400', bg: 'bg-amber-50/80', accent: 'text-amber-700' },
                { border: 'border-l-rose-400', bg: 'bg-rose-50/80', accent: 'text-rose-700' },
                { border: 'border-l-slate-400', bg: 'bg-slate-50/80', accent: 'text-slate-700' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <Card key={skill.id} className={`${colorScheme.bg} ${colorScheme.border} border-l-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          placeholder="Skill Category"
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                          className={`text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent ${colorScheme.accent}`}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSkill(skill.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {skill.details ? (
                        <div className="bg-white/70 rounded-lg p-3 prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: skill.details }} />
                        </div>
                      ) : (
                        <div className="bg-white/50 rounded-lg p-3 text-muted-foreground text-sm italic border-2 border-dashed border-gray-200">
                          No skills added yet. Click to add skills in this category.
                        </div>
                      )}
                      <Dialog
                        open={editingItem?.type === 'skill' && editingItem?.id === skill.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setEditingItem({ type: 'skill', id: skill.id });
                          } else {
                            setEditingItem(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            {skill.details ? 'Edit Skills' : 'Add Skills'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <span>Edit Skills: {skill.name}</span>
                            </DialogTitle>
                            <DialogDescription>
                              Add or modify the skills in this category. Use commas to separate skills or describe your proficiency level.
                            </DialogDescription>
                          </DialogHeader>
                          <SkillDetailsEditor
                            skill={skill}
                            onSave={(details) => {
                              updateSkill(skill.id, { details });
                              setEditingItem(null);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-800">Education</h2>
              <p className="text-muted-foreground mt-1">Your educational background</p>
            </div>
            <Button onClick={addEducation} className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>

          <div className="space-y-6">
            {data.education.map((edu, index) => {
              const colors = [
                { border: 'border-l-blue-400', bg: 'bg-blue-50/80', accent: 'text-blue-700' },
                { border: 'border-l-emerald-400', bg: 'bg-emerald-50/80', accent: 'text-emerald-700' },
                { border: 'border-l-violet-400', bg: 'bg-violet-50/80', accent: 'text-violet-700' },
                { border: 'border-l-amber-400', bg: 'bg-amber-50/80', accent: 'text-amber-700' },
                { border: 'border-l-rose-400', bg: 'bg-rose-50/80', accent: 'text-rose-700' },
                { border: 'border-l-slate-400', bg: 'bg-slate-50/80', accent: 'text-slate-700' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <Card key={edu.id} className={`${colorScheme.bg} ${colorScheme.border} border-l-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="grid gap-2 flex-1 mr-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <Input
                            placeholder="Degree/Program"
                            value={edu.title}
                            onChange={(e) => updateEducation(edu.id, { title: e.target.value })}
                            className={`text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent ${colorScheme.accent}`}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEducation(edu.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {edu.details ? (
                        <div className="bg-white/50 rounded-lg p-3 prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: edu.details }} />
                        </div>
                      ) : (
                        <div className="bg-white/30 rounded-lg p-3 text-muted-foreground text-sm italic border-2 border-dashed border-gray-200">
                          No details added yet. Click to add institution, graduation year, GPA, honors, etc.
                        </div>
                      )}
                      <Dialog
                        open={editingItem?.type === 'education' && editingItem?.id === edu.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setEditingItem({ type: 'education', id: edu.id });
                          } else {
                            setEditingItem(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`w-full border-2 hover:${colorScheme.bg} hover:${colorScheme.border.replace('border-l-', 'border-')} transition-colors duration-200`}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            {edu.details ? 'Edit Details' : 'Add Details'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                              <span>Edit Education: {edu.title}</span>
                            </DialogTitle>
                            <DialogDescription>
                              Add details about this education entry. Include institution, graduation year, GPA, honors, relevant coursework, etc.
                            </DialogDescription>
                          </DialogHeader>
                          <EducationDetailsEditor
                            education={edu}
                            onSave={(details) => {
                              updateEducation(edu.id, { details });
                              setEditingItem(null);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Job Applications</h2>
              <p className="text-muted-foreground mt-1">Jobs you've applied to and their corresponding resumes</p>
            </div>
          </div>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No jobs tracked yet</h3>
                  <p className="text-muted-foreground">
                    Jobs will appear here when you create resumes using the Chrome extension
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job, index) => {
                const colors = [
                  { border: 'border-l-blue-400', bg: 'bg-blue-50/80', accent: 'text-blue-700' },
                  { border: 'border-l-emerald-400', bg: 'bg-emerald-50/80', accent: 'text-emerald-700' },
                  { border: 'border-l-violet-400', bg: 'bg-violet-50/80', accent: 'text-violet-700' },
                  { border: 'border-l-amber-400', bg: 'bg-amber-50/80', accent: 'text-amber-700' },
                  { border: 'border-l-rose-400', bg: 'bg-rose-50/80', accent: 'text-rose-700' },
                  { border: 'border-l-slate-400', bg: 'bg-slate-50/80', accent: 'text-slate-700' }
                ];
                const colorScheme = colors[index % colors.length];
                
                return (
                  <Card key={job.id} className={`${colorScheme.bg} ${colorScheme.border} border-l-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-xl font-semibold ${colorScheme.accent}`}>
                              {job.title}
                            </h3>
                            <Badge variant={job.source === 'extension' ? 'default' : 'secondary'}>
                              {job.source === 'extension' ? (
                                <><Chrome className="h-3 w-3 mr-1" /> Extension</>
                              ) : (
                                <><User className="h-3 w-3 mr-1" /> Manual</>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                            {job.url && (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View Job</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {job.description && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                            <div className="bg-white/70 rounded-lg p-3 text-sm">
                              {job.description.length > 200 
                                ? `${job.description.substring(0, 200)}...` 
                                : job.description
                              }
                            </div>
                          </div>
                        )}
                        
                        {job.skills && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Skills Required</h4>
                            <div className="bg-white/70 rounded-lg p-3 text-sm">
                              {job.skills}
                            </div>
                          </div>
                        )}

                        {(job as any).profiles && (job as any).profiles.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                              Resumes Created ({(job as any).profiles.length})
                            </h4>
                            <div className="space-y-2">
                              {(job as any).profiles.map((profile: any) => (
                                <div key={profile.id} className="bg-white/70 rounded-lg p-3 flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{profile.profileName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Created {new Date(profile.createdAt).toLocaleDateString()}
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
                        )}

                        {(!(job as any).profiles || (job as any).profiles.length === 0) && (
                          <div className="bg-white/50 rounded-lg p-4 text-center text-muted-foreground border-2 border-dashed border-gray-200">
                            <p className="text-sm">No resumes created for this job yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>
                Choose where your resume data is stored
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StorageSettings />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* AI Floating Actions */}
      <AIFloatingActions
        context="data-management"
        data={data}
        onAIAction={async (actionId: string, params?: any) => {
          try {
            // Handle AI actions in the data management context
            switch (actionId) {
              case 'generate-experiences':
                console.log('Triggering AI experience generation...');
                const jobRole = prompt('What job role would you like to generate experience for?');
                if (jobRole) {
                  const response = await fetch('/api/ai-agents/single-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      agent: 'resume-builder',
                      prompt: `Generate professional experience bullet points for a ${jobRole} role. Current experiences: ${JSON.stringify(data.experiences)}`,
                    }),
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    alert('AI-generated experiences created! Check console for details.');
                    console.log('Generated Experiences:', result);
                  }
                }
                break;
                
              case 'enhance-skills':
                console.log('Triggering AI skills enhancement...');
                if (data.skills?.length > 0) {
                  const response = await fetch('/api/ai-agents/single-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      agent: 'content-optimizer',
                      prompt: `Enhance and categorize these skills with better descriptions: ${JSON.stringify(data.skills)}`,
                    }),
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    alert('Skills enhanced! Check console for details.');
                    console.log('Enhanced Skills:', result);
                  }
                } else {
                  alert('No skills found to enhance. Please add some skills first.');
                }
                break;
                
              case 'improve-summary':
                console.log('Triggering AI summary improvement...');
                if (data.personalInfo?.summary) {
                  const response = await fetch('/api/ai-agents/single-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      agent: 'content-optimizer',
                      prompt: `Improve this professional summary: ${data.personalInfo.summary}. Make it more compelling and professional.`,
                    }),
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    alert('Summary improved! Check console for details.');
                    console.log('Improved Summary:', result);
                  }
                } else {
                  alert('No summary found to improve. Please add a professional summary first.');
                }
                break;
                
              case 'content-suggestions':
                console.log('Triggering AI content suggestions...');
                const response = await fetch('/api/ai-agents/single-agent', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    agent: 'resume-reviewer',
                    prompt: `Analyze this resume data and suggest missing content areas: ${JSON.stringify(data)}`,
                  }),
                });
                
                if (response.ok) {
                  const result = await response.json();
                  alert('Content suggestions generated! Check console for details.');
                  console.log('Content Suggestions:', result);
                }
                break;
                
              default:
                console.log(`AI Action: ${actionId} not implemented yet`);
            }
          } catch (error) {
            console.error('AI Action failed:', error);
            alert('AI action failed. Please try again.');
          }
        }}
      />
    </div>
  );
}
