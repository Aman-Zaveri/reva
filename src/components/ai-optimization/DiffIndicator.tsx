import { Badge } from "@/components/ui/badge";

interface DiffIndicatorProps {
  type: "added" | "removed" | "unchanged";
  children: React.ReactNode;
}

export function DiffIndicator({ type, children }: DiffIndicatorProps) {
  const getStyles = () => {
    switch (type) {
      case "added":
        return "bg-green-50 border-green-200 text-green-800";
      case "removed":
        return "bg-red-50 border-red-200 text-red-800";
      case "unchanged":
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "added":
        return "+";
      case "removed":
        return "-";
      case "unchanged":
        return "=";
    }
  };

  return (
    <div className={`border rounded p-3 text-sm ${getStyles()}`}>
      <div className="flex items-start gap-2">
        <Badge 
          variant="secondary" 
          className={`text-xs mt-0.5 ${
            type === "added" ? "bg-green-100" : 
            type === "removed" ? "bg-red-100" : "bg-gray-100"
          }`}
        >
          {getIcon()}
        </Badge>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
