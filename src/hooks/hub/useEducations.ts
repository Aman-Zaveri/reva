"use client";

import { useState, useEffect } from 'react';

interface Education {
  id?: string;
  institution: string;
  degree: string;
  minor?: string;
  graduationDate?: Date;
  gpa?: string;
  relevantCoursework?: string;
}

export function useEducations() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Education[]>([]);

  // Fetch educations
  const fetchEducations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/hub/educations');
      if (!response.ok) {
        throw new Error('Failed to fetch educations');
      }
      
      const data = await response.json();
      const transformedData = data.map((edu: any) => ({
        ...edu,
        graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : undefined,
      }));
      
      setEducations(transformedData);
      setOriginalData(transformedData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const createEducation = () => {
    const newEdu: Education = {
      id: 'temp-' + Date.now(),
      institution: "",
      degree: "",
      minor: "",
      graduationDate: undefined,
      gpa: "",
      relevantCoursework: ""
    };
    setEducations(prev => [newEdu, ...prev]);
    setHasUnsavedChanges(true);
  };

  const updateEducation = (id: string, data: Partial<Education>) => {
    setEducations(prev => 
      prev.map(edu => edu.id === id ? { ...edu, ...data } : edu)
    );
    setHasUnsavedChanges(true);
  };

  const deleteEducation = (id: string) => {
    setEducations(prev => prev.filter(edu => edu.id !== id));
    setHasUnsavedChanges(true);
  };

  const saveEducations = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/hub/educations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educations),
      });

      if (!response.ok) {
        throw new Error('Failed to save educations');
      }

      const savedData = await response.json();
      const transformedData = savedData.map((edu: any) => ({
        ...edu,
        graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : undefined,
      }));
      
      setEducations(transformedData);
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
    setEducations(originalData);
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    fetchEducations();
  }, []);

  return {
    educations,
    isLoading,
    error,
    isSaving,
    hasUnsavedChanges,
    createEducation,
    updateEducation,
    deleteEducation,
    saveEducations,
    discardChanges,
    refetch: fetchEducations,
  };
}