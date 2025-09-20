"use client";

import { useState, useEffect } from 'react';

interface Project {
  id?: string;
  title: string;
  link?: string;
  date?: Date;
  bullets?: string[];
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Project[]>([]);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/hub/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      const transformedData = data.map((project: any) => ({
        ...project,
        date: project.date ? new Date(project.date) : undefined,
        bullets: project.bullets?.map((bullet: any) => bullet.content) || [],
      }));
      
      setProjects(transformedData);
      setOriginalData(transformedData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = () => {
    const newProject: Project = {
      id: 'temp-' + Date.now(),
      title: "",
      link: "",
      date: undefined,
      bullets: [""]
    };
    setProjects(prev => [newProject, ...prev]);
    setHasUnsavedChanges(true);
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => project.id === id ? { ...project, ...data } : project)
    );
    setHasUnsavedChanges(true);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    setHasUnsavedChanges(true);
  };

  const saveProjects = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/hub/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projects),
      });

      if (!response.ok) {
        throw new Error('Failed to save projects');
      }

      const savedData = await response.json();
      const transformedData = savedData.map((project: any) => ({
        ...project,
        date: project.date ? new Date(project.date) : undefined,
        bullets: project.bullets?.map((bullet: any) => bullet.content) || [],
      }));
      
      setProjects(transformedData);
      setOriginalData(transformedData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setProjects(originalData);
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    isLoading,
    error,
    isSaving,
    hasUnsavedChanges,
    createProject,
    updateProject,
    deleteProject,
    saveProjects,
    discardChanges,
    refetch: fetchProjects,
  };
}