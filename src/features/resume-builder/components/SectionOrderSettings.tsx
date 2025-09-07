'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { SectionType, Profile } from '@/shared/lib/types';

interface SectionOrderSettingsProps {
  profile: Profile;
  onUpdateProfile: (patch: Partial<Profile>) => void;
}

const DEFAULT_SECTION_ORDER: SectionType[] = ['skills', 'experiences', 'projects', 'education'];

const SECTION_LABELS: Record<SectionType, string> = {
  skills: 'Skills',
  experiences: 'Work Experiences',
  projects: 'Projects',
  education: 'Education',
};

const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  skills: 'Technical skills and competencies',
  experiences: 'Professional work experience',
  projects: 'Personal and professional projects',
  education: 'Educational background and achievements',
};

interface SortableItemProps {
  sectionType: SectionType;
  index: number;
  isVisible: boolean;
  itemCount: number;
}

function SortableItem({ sectionType, index, isVisible, itemCount }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionType });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 bg-card border rounded-lg transition-all
        ${isDragging ? 'shadow-lg z-10 ring-2 ring-primary' : 'hover:shadow-sm'}
        ${!isVisible ? 'opacity-60' : ''}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {index + 1}. {SECTION_LABELS[sectionType]}
          </span>
          <div className="flex items-center gap-1">
            {isVisible ? (
              <Eye className="h-3 w-3 text-green-600" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {SECTION_DESCRIPTIONS[sectionType]}
        </p>
      </div>

      <div className="text-xs text-muted-foreground">
        {isVisible ? 'Visible' : 'Hidden'}
      </div>
    </div>
  );
}

export function SectionOrderSettings({ profile, onUpdateProfile }: SectionOrderSettingsProps) {
  const sectionOrder = profile.sectionOrder || DEFAULT_SECTION_ORDER;
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as SectionType);
      const newIndex = sectionOrder.indexOf(over.id as SectionType);
      
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      onUpdateProfile({ sectionOrder: newOrder });
    }
  };

  const resetToDefault = () => {
    onUpdateProfile({ sectionOrder: DEFAULT_SECTION_ORDER });
  };

  const getSectionItemCount = (sectionType: SectionType): number => {
    switch (sectionType) {
      case 'skills':
        return profile.skillIds.length;
      case 'experiences':
        return profile.experienceIds.length;
      case 'projects':
        return profile.projectIds.length;
      case 'education':
        return profile.educationIds.length;
      default:
        return 0;
    }
  };

  const getSectionVisibility = (sectionType: SectionType): boolean => {
    return getSectionItemCount(sectionType) > 0;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Section Order</CardTitle>
            <CardDescription>
              Drag and drop to reorder how sections appear on your resume
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetToDefault}
            disabled={JSON.stringify(sectionOrder) === JSON.stringify(DEFAULT_SECTION_ORDER)}
          >
            Reset Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sectionOrder} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sectionOrder.map((sectionType, index) => {
                const isVisible = getSectionVisibility(sectionType);
                const itemCount = getSectionItemCount(sectionType);

                return (
                  <SortableItem
                    key={sectionType}
                    sectionType={sectionType}
                    index={index}
                    isVisible={isVisible}
                    itemCount={itemCount}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• Sections with items will be visible on your resume</p>
          <p>• Empty sections will be automatically hidden</p>
          <p>• The order you set here determines how sections appear from top to bottom</p>
        </div>
      </CardContent>
    </Card>
  );
}
