import { CheckSquare, Square, GripVertical, Edit3, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BaseItem } from '@/shared/lib/types';

export interface ItemDisplayProps {
  item: BaseItem;
  isSelected: boolean;
  hasOverride?: boolean;
  showControls?: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onResetOverride?: () => void;
}

export function ItemDisplay({ 
  item, 
  isSelected, 
  hasOverride = false, 
  showControls = false,
  onToggle, 
  onEdit, 
  onResetOverride 
}: ItemDisplayProps) {
  return (
    <div className="flex items-center gap-3 p-2 bg-card border border-border rounded-lg hover:bg-accent/30 transition-colors group">
      <div
        className="flex-1 flex justify-between items-center h-auto text-left min-h-[3rem] cursor-pointer px-2 truncate"
        onClick={onToggle}
      >
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-base truncate mr-8">
                {item.title || item.name}
              </span>
              {hasOverride && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  Customized
                </Badge>
              )}
            </div>
            {item.subtitle && (
              <div className="text-sm text-muted-foreground mt-1 truncate">
                {item.subtitle}
              </div>
            )}
          </div>
          {isSelected ? (
            <CheckSquare size={20} className="text-primary flex-shrink-0" />
          ) : (
            <Square size={20} className="text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </div>

      {isSelected && showControls && (
        <div className="flex gap-1 ml-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
              title="Customize for this resume"
            >
              <Edit3 size={16} />
            </Button>
          )}
          {hasOverride && onResetOverride && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onResetOverride();
              }}
              className="h-9 w-9 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
              title="Reset to master data"
            >
              <RotateCcw size={16} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export interface SortableItemDisplayProps extends ItemDisplayProps {
  id: string;
  dragDisabled?: boolean;
}

export function SortableItemDisplay({ 
  id, 
  dragDisabled = false,
  ...itemProps 
}: SortableItemDisplayProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: dragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-3 p-2 bg-card border border-border rounded-lg hover:bg-accent/30 transition-colors group">
        {!dragDisabled && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical size={16} />
          </div>
        )}
        
        <div className="flex-1">
          <ItemDisplay {...itemProps} />
        </div>
      </div>
    </div>
  );
}
