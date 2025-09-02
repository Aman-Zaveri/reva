import { Button } from "@/shared/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, Sparkles } from "lucide-react";

interface OptimizationControlsProps {
  isLoading: boolean;
  isExtractingJob: boolean;
  error: string;
  hasJobInput: boolean;
  onOptimize: () => void;
  onCancel: () => void;
  // For results view
  showResults?: boolean;
  onApply?: () => void;
  onTryAgain?: () => void;
}

export function OptimizationControls({
  isLoading,
  isExtractingJob,
  error,
  hasJobInput,
  onOptimize,
  onCancel,
  showResults = false,
  onApply,
  onTryAgain,
}: OptimizationControlsProps) {
  if (showResults) {
    return (
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onTryAgain}>
          Try Again
        </Button>
        <Button onClick={onApply} className="gap-2">
          <CheckCircle size={16} />
          Apply Optimizations
        </Button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onOptimize}
          disabled={isLoading || isExtractingJob || !hasJobInput}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Optimize Resume
            </>
          )}
        </Button>
      </div>
    </>
  );
}
