import { Button } from "@/components/ui/button";
import { Save, Loader2, X } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description: string;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  showActions?: boolean;
}

export function SectionHeader({
  title,
  description,
  hasUnsavedChanges = false,
  isSaving = false,
  onSave,
  onDiscard,
  showActions = true,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-medium mb-2">{title}</h2>
        <p className="text-sm">{description}</p>
      </div>
      {showActions && hasUnsavedChanges && (
        <div className="flex gap-2">
          {onDiscard && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscard}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Discard Changes
            </Button>
          )}
          {onSave && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}