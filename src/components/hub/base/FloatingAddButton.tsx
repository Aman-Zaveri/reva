import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Plus, Loader2 } from "lucide-react";

interface FloatingAddButtonProps {
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function FloatingAddButton({
  onClick,
  tooltip = "Add new item",
  disabled = false,
  isLoading = false,
}: FloatingAddButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          size="icon"
          disabled={disabled}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          <span className="sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}