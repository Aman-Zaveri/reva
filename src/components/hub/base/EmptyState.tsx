import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  buttonText: string;
  onAdd: () => void;
}

export function EmptyState({
  emoji,
  title,
  description,
  buttonText,
  onAdd,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center min-h-full">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      <Button onClick={onAdd} className="gap-2">
        {buttonText}
      </Button>
    </div>
  );
}