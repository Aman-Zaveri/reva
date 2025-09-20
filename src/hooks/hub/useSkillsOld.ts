"use client";

import { useState, useEffect } from 'react';

interface Skill {
  id?: string;
  name: string;
  category: string;
  level?: string;
  order?: number;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all skills
  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/hub/skills');
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      
      const data = await response.json();
      // Sort by order and category
      const sortedData = data.sort((a: Skill, b: Skill) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return (a.order || 0) - (b.order || 0);
      });
      setSkills(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new skill
  const createSkill = async (data: Omit<Skill, 'id'>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch('/api/hub/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create skill');
      }
      
      const savedData = await response.json();
      setSkills(prev => {
        const newSkills = [...prev, savedData];
        return newSkills.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });
      });
      return savedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Update skill
  const updateSkill = async (id: string, data: Omit<Skill, 'id'>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch('/api/hub/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update skill');
      }
      
      const savedData = await response.json();
      setSkills(prev => {
        const updated = prev.map(skill => skill.id === id ? savedData : skill);
        return updated.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });
      });
      return savedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete skill
  const deleteSkill = async (id: string) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch(`/api/hub/skills?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete skill');
      }
      
      setSkills(prev => prev.filter(skill => skill.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder skills within a category
  const reorderSkills = async (category: string, newOrder: string[]) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch('/api/hub/skills/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, order: newOrder }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder skills');
      }
      
      // Optimistically update the order
      setSkills(prev => {
        const updated = prev.map(skill => {
          if (skill.category === category && skill.id) {
            const orderIndex = newOrder.indexOf(skill.id);
            return { ...skill, order: orderIndex >= 0 ? orderIndex : skill.order };
          }
          return skill;
        });
        return updated.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Revert the optimistic update by refetching
      await fetchSkills();
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Get skills grouped by category
  const getSkillsByCategory = () => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  };

  // Get all categories
  const getCategories = () => {
    return Array.from(new Set(skills.map(skill => skill.category))).sort();
  };

  // Load data on mount
  useEffect(() => {
    fetchSkills();
  }, []);

  return {
    skills,
    isLoading,
    error,
    isSaving,
    createSkill,
    updateSkill,
    deleteSkill,
    reorderSkills,
    getSkillsByCategory,
    getCategories,
    refetch: fetchSkills,
  };
}