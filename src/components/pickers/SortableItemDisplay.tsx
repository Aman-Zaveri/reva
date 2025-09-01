import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Experience, Project, Skill, Education } from '@/lib/types';

export interface SortableItemDisplayProps {
  id: string;
  item: Experience | Project | Skill | Education;
  type: 'experience' | 'project' | 'skill' | 'education';
  isVisible: boolean;
  isSelected: boolean;
  variant?: 'compact' | 'detailed';
  onToggleVisibility: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleSelection?: (id: string) => void;
  className?: string;
}

export function SortableItemDisplay({
  id,
  item,
  type,
  isVisible,
  isSelected,
  variant = 'detailed',
  onToggleVisibility,
  onEdit,
  onToggleSelection,
  className
}: SortableItemDisplayProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderItemContent = () => {
    if (variant === 'compact') {
      return (
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">
            {item.title}
          </h4>
          {'company' in item && (
            <p className="text-xs text-muted-foreground truncate">
              {item.company}
            </p>
          )}
          {'name' in item && (
            <p className="text-xs text-muted-foreground truncate">
              {item.name}
            </p>
          )}
        </div>
      );
    }

    // Detailed view
    switch (type) {
      case 'experience':
        const exp = item as Experience;
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-medium">{exp.title}</h4>
              <Badge variant={exp.company ? 'secondary' : 'outline'} className="ml-2 text-xs">
                {exp.company || 'No Company'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{exp.date}</p>
            <p className="text-xs text-muted-foreground">
              {exp.bullets?.length || 0} bullet points
            </p>
          </div>
        );

      case 'project':
        const proj = item as Project;
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-medium">{proj.title}</h4>
              {proj.link && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Has Link
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {proj.bullets?.length || 0} bullet points
            </p>
          </div>
        );

      case 'skill':
        const skill = item as Skill;
        return (
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium mb-1">{skill.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {skill.details}
            </p>
          </div>
        );

      case 'education':
        const edu = item as Education;
        return (
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium mb-1">{edu.title}</h4>
            <p className="text-xs text-muted-foreground">{edu.details}</p>
          </div>
        );

      default:
        return (
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">{item.title}</h4>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-3 border rounded-lg transition-colors",
        isVisible 
          ? "bg-background border-border" 
          : "bg-muted/50 border-muted-foreground/20",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isDragging && "shadow-lg",
        className
      )}
    >
      <button
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>

      {onToggleSelection && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(id)}
          className="rounded border-border"
        />
      )}

      {renderItemContent()}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility(id)}
          className={cn(
            "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
            !isVisible && "opacity-100"
          )}
        >
          {isVisible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(id)}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
