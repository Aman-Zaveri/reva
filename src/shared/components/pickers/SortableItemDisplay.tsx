import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { Experience, Project, Skill, Education } from "@/shared/lib/types";

export interface SortableItemDisplayProps {
  id: string;
  item: Experience | Project | Skill | Education;
  type: "experience" | "project" | "skill" | "education";
  isVisible: boolean;
  isSelected: boolean;
  hasOverride?: boolean;
  variant?: "compact" | "detailed";
  onToggleVisibility: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleSelection?: (id: string) => void;
  onResetOverride?: (id: string) => void;
  className?: string;
}

export function SortableItemDisplay({
  id,
  item,
  type,
  isVisible,
  isSelected,
  hasOverride = false,
  variant = "detailed",
  onToggleVisibility,
  onEdit,
  onToggleSelection,
  onResetOverride,
  className,
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
    if (variant === "compact") {
      return (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate">{item.title}</h4>
            {hasOverride && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Updated
              </Badge>
            )}
          </div>
          {"company" in item && (
            <p className="text-xs text-muted-foreground truncate">
              {item.company}
            </p>
          )}
          {"name" in item && (
            <p className="text-xs text-muted-foreground truncate">
              {item.name}
            </p>
          )}
        </div>
      );
    }

    // Detailed view
    switch (type) {
      case "experience":
        const exp = item as Experience;
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">
                  {exp.title} - {exp.company || "No Company"}
                </h4>
                {hasOverride && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Updated
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{exp.date}</p>
            <p className="text-xs text-muted-foreground">
              {exp.bullets?.length || 0} bullet points
            </p>
          </div>
        );

      case "project":
        const proj = item as Project;
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-end justify-between mb-1">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{proj.title}</h4>
                {hasOverride && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Updated
                  </Badge>
                )}
                {proj.link && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs flex-shrink-0"
                  >
                    Link
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {proj.bullets?.length || 0} bullet points
            </p>
          </div>
        );

      case "skill":
        const skill = item as Skill;
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">{skill.name}</h4>
              {hasOverride && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  Updated
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {skill.details}
            </p>
          </div>
        );

      case "education":
        const edu = item as Education;
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">{edu.title}</h4>
              {hasOverride && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  Updated
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{edu.details}</p>
          </div>
        );

      default:
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium truncate">{item.title}</h4>
              {hasOverride && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  Updated
                </Badge>
              )}
            </div>
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
        isDragging && "shadow-lg",
        className
      )}
    >
      <button
        className="opacity-30 group-hover:opacity-100 p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing transition-opacity"
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
          onClick={() => onEdit(id)}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        {hasOverride && onResetOverride && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResetOverride(id)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-100"
            title="Reset to master data"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
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
      </div>
    </div>
  );
}
