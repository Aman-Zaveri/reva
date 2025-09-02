import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Plus,
  Eye,
  EyeOff,
  Briefcase,
  FolderOpen,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { SortableItemDisplay } from "./SortableItemDisplay";
import { ItemEditDialog } from "@/shared/components/forms/ItemEditDialog";
import { cn } from "@/shared/lib/utils";
import type { Experience, Project, Skill, Education } from "@/shared/lib/types";

export interface UnifiedItemPickerProps {
  title: string;
  type: "experience" | "project" | "skill" | "education";
  items: (Experience | Project | Skill | Education)[];
  selectedIds: string[];
  visibilityStates: Record<string, boolean>;
  customizedItems?: Record<
    string,
    Partial<Experience | Project | Skill | Education>
  >;
  variant?: "selection" | "customization";
  showAddButton?: boolean;
  className?: string;
  onItemsReorder: (newOrder: string[]) => void;
  onToggleVisibility: (id: string) => void;
  onToggleSelection?: (id: string) => void;
  onCustomizeItem?: (
    id: string,
    updates: Partial<Experience | Project | Skill | Education>
  ) => void;
  onResetOverride?: (id: string) => void;
  onAddItem?: () => void;
}

export function UnifiedItemPicker({
  title,
  type,
  items,
  selectedIds,
  visibilityStates,
  customizedItems = {},
  variant = "selection",
  showAddButton = false,
  className,
  onItemsReorder,
  onToggleVisibility,
  onToggleSelection,
  onCustomizeItem,
  onResetOverride,
  onAddItem,
}: UnifiedItemPickerProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(true);

  // Get the appropriate icon for each section type
  const getSectionIcon = () => {
    switch (type) {
      case "experience":
        return <Briefcase className="w-4 h-4" />;
      case "project":
        return <FolderOpen className="w-4 h-4" />;
      case "skill":
        return <Lightbulb className="w-4 h-4" />;
      case "education":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <FolderOpen className="w-4 h-4" />;
    }
  };

  // Get description text for each section type
  const getSectionDescription = () => {
    switch (type) {
      case "experience":
        return "Work history and achievements";
      case "project":
        return "Personal and professional projects";
      case "skill":
        return "Technical skills and expertise";
      case "education":
        return "Academic background and certifications";
      default:
        return "Manage your items";
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      return;
    }
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(
        items.map((item) => item.id),
        oldIndex,
        newIndex
      );
      onItemsReorder(newOrder);
    }
  };

  const handleEditItem = (id: string) => {
    setEditingItemId(id);
  };

  const handleSaveEdit = (
    updates: Partial<Experience | Project | Skill | Education>
  ) => {
    if (editingItemId && onCustomizeItem) {
      onCustomizeItem(editingItemId, updates);
    }
    setEditingItemId(null);
  };

  const getItemToEdit = () => {
    if (!editingItemId) return null;
    const baseItem = items.find((item) => item.id === editingItemId);
    if (!baseItem) return null;

    // Merge with customizations if available
    const customizations = customizedItems[editingItemId] || {};
    return { ...baseItem, ...customizations };
  };

  const visibleItems = showAllItems
    ? items
    : items.filter((item) => visibilityStates[item.id] !== false);

  const selectedCount = selectedIds.length;
  const visibleCount = items.filter(
    (item) => visibilityStates[item.id] !== false
  ).length;

  return (
    <Card className={cn("h-full border border-border", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-2 rounded-md bg-primary text-primary-foreground">
              {getSectionIcon()}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <CardTitle className="text-md">{title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {getSectionDescription()}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                {variant === "selection" && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCount} selected
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {visibleCount} visible
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllItems(!showAllItems)}
              className="h-8 px-2 text-xs"
            >
              {showAllItems ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  All
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Visible
                </>
              )}
            </Button>
            {showAddButton && onAddItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddItem}
                className="h-8 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {visibleItems.length > 0 ? (
                visibleItems.map((item) => {
                  const mergedItem = { ...item, ...customizedItems[item.id] };
                  const hasOverride =
                    customizedItems[item.id] &&
                    Object.keys(customizedItems[item.id]).length > 0;
                  return (
                    <SortableItemDisplay
                      key={item.id}
                      id={item.id}
                      item={mergedItem}
                      type={type}
                      isVisible={visibilityStates[item.id] !== false}
                      isSelected={selectedIds.includes(item.id)}
                      hasOverride={hasOverride}
                      variant="detailed"
                      onToggleVisibility={onToggleVisibility}
                      onEdit={handleEditItem}
                      onToggleSelection={
                        variant === "selection" ? onToggleSelection : undefined
                      }
                      onResetOverride={onResetOverride}
                    />
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No {type} items available</p>
                  {showAddButton && onAddItem && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddItem}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first {type}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {editingItemId && (
          <ItemEditDialog
            item={getItemToEdit()!}
            type={type}
            isOpen={true}
            onClose={() => setEditingItemId(null)}
            onSave={handleSaveEdit}
          />
        )}
      </CardContent>
    </Card>
  );
}
