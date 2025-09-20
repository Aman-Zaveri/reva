"use client";

import { useState, useEffect } from 'react';

interface Skill {
  id?: string;
  name: string;
  category: string;
}

interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
}

export function useSkills() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<SkillCategory[]>([]);

  // Fetch all skills grouped by category
  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/hub/skills');
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      
      const groupedData = await response.json();
      
      // Convert grouped data to our category format
      const categories: SkillCategory[] = Object.entries(groupedData).map(([categoryName, skills]: [string, any]) => ({
        id: categoryName.toLowerCase().replace(/\s+/g, '-'),
        title: categoryName,
        skills: skills as Skill[]
      }));
      
      setSkillCategories(categories);
      setOriginalData(categories);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new skill category
  const createSkillCategory = (title: string) => {
    const newCategory: SkillCategory = {
      id: 'temp-' + Date.now(),
      title,
      skills: [],
    };
    setSkillCategories(prev => [...prev, newCategory]);
    setHasUnsavedChanges(true);
    return newCategory;
  };

  // Delete skill category and all its skills
  const deleteSkillCategory = (categoryId: string) => {
    setSkillCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setHasUnsavedChanges(true);
  };

  // Update category title
  const updateCategoryTitle = (categoryId: string, newTitle: string) => {
    setSkillCategories(prev =>
      prev.map(cat => cat.id === categoryId ? { ...cat, title: newTitle } : cat)
    );
    setHasUnsavedChanges(true);
  };

  // Add skill to category
  const addSkillToCategory = (categoryId: string, skillName: string) => {
    const newSkill: Skill = {
      id: 'temp-' + Date.now(),
      name: skillName,
      category: '',
    };
    
    setSkillCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, skills: [...cat.skills, { ...newSkill, category: cat.title }] }
          : cat
      )
    );
    setHasUnsavedChanges(true);
  };

  // Remove skill from category
  const removeSkillFromCategory = (categoryId: string, skillId: string) => {
    setSkillCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, skills: cat.skills.filter(skill => skill.id !== skillId) }
          : cat
      )
    );
    setHasUnsavedChanges(true);
  };

  // Save all changes
  const saveSkills = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Convert to grouped format for API
      const grouped: { [key: string]: any[] } = {};
      skillCategories.forEach(category => {
        grouped[category.title] = category.skills.map(skill => ({
          name: skill.name,
          category: category.title
        }));
      });

      const response = await fetch('/api/hub/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(grouped),
      });

      if (!response.ok) {
        throw new Error('Failed to save skills');
      }

      const savedGroupedData = await response.json();
      
      // Convert back to our category format
      const categories: SkillCategory[] = Object.entries(savedGroupedData).map(([categoryName, skills]: [string, any]) => ({
        id: categoryName.toLowerCase().replace(/\s+/g, '-'),
        title: categoryName,
        skills: skills as Skill[]
      }));
      
      setSkillCategories(categories);
      setOriginalData(categories);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const discardChanges = () => {
    setSkillCategories(originalData);
    setHasUnsavedChanges(false);
  };

  // Load data on mount
  useEffect(() => {
    fetchSkills();
  }, []);

  return {
    skillCategories,
    isLoading,
    error,
    isSaving,
    hasUnsavedChanges,
    createSkillCategory,
    deleteSkillCategory,
    updateCategoryTitle,
    addSkillToCategory,
    removeSkillFromCategory,
    saveSkills,
    discardChanges,
    refetch: fetchSkills,
  };
}