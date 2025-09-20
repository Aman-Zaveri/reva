"use client";

import { useState, useEffect } from 'react';

interface Experience {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  bullets?: string[];
}

export function useExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Experience[]>([]);

  // Fetch experiences
  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/hub/experiences');
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      
      const data = await response.json();
      const transformedData = data.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate) : undefined,
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        bullets: exp.bullets?.map((bullet: any) => bullet.content) || [],
      }));
      
      setExperiences(transformedData);
      setOriginalData(transformedData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const createExperience = () => {
    const newExp: Experience = {
      id: 'temp-' + Date.now(),
      company: "",
      title: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      bullets: [""]
    };
    setExperiences(prev => [newExp, ...prev]);
    setHasUnsavedChanges(true);
  };

  const updateExperience = (id: string, data: Partial<Experience>) => {
    setExperiences(prev => 
      prev.map(exp => exp.id === id ? { ...exp, ...data } : exp)
    );
    setHasUnsavedChanges(true);
  };

  const deleteExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    setHasUnsavedChanges(true);
  };

  const saveExperiences = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/hub/experiences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experiences),
      });

      if (!response.ok) {
        throw new Error('Failed to save experiences');
      }

      const savedData = await response.json();
      const transformedData = savedData.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate) : undefined,
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        bullets: exp.bullets?.map((bullet: any) => bullet.content) || [],
      }));
      
      setExperiences(transformedData);
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
    setExperiences(originalData);
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  return {
    experiences,
    isLoading,
    error,
    isSaving,
    hasUnsavedChanges,
    createExperience,
    updateExperience,
    deleteExperience,
    saveExperiences,
    discardChanges,
    refetch: fetchExperiences,
  };
}