"use client";

import { useState, useEffect } from 'react';

interface PersonalInfo {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

export function usePersonalInfo() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<PersonalInfo>({});

  // Fetch personal info
  const fetchPersonalInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/hub/personal-info');
      if (!response.ok) {
        throw new Error('Failed to fetch personal info');
      }
      
      const responseData = await response.json();
      console.log('Personal info from API:', responseData);
      setPersonalInfo(responseData);
      setOriginalData(responseData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePersonalInfo = (data: Partial<PersonalInfo>) => {
    setPersonalInfo(prev => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  };

  const savePersonalInfo = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/hub/personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalInfo),
      });

      if (!response.ok) {
        throw new Error('Failed to save personal info');
      }

      const savedData = await response.json();
      setPersonalInfo(savedData);
      setOriginalData(savedData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setPersonalInfo(originalData);
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  return {
    personalInfo,
    isLoading,
    error,
    isSaving,
    hasUnsavedChanges,
    updatePersonalInfo,
    savePersonalInfo,
    discardChanges,
    refetch: fetchPersonalInfo,
  };
}