import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface FormCardProps {
  title?: string;
  titlePlaceholder?: string;
  onTitleChange?: (value: string) => void;
  onDelete?: () => void;
  deleteTitle?: string;
  deleteDescription?: string;
  children: ReactNode;
  isSaving?: boolean;
}

export function FormCard({
  title,
  titlePlaceholder,
  onTitleChange,
  onDelete,
  deleteTitle = "Delete Item",
  deleteDescription = "Are you sure you want to delete this item? This action cannot be undone.",
  children,
  isSaving = false,
}: FormCardProps) {
  return (
    <Card className="p-6 border border-accent">
      {(title !== undefined || onDelete) && (
        <div className="flex items-center justify-between mb-4">
          {title !== undefined && onTitleChange ? (
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={titlePlaceholder}
              className="text-3xl font-medium border-none shadow-none p-0 h-auto bg-transparent rounded-none focus:border-none focus:shadow-none focus-visible:ring-0"
            />
          ) : (
            <div className="flex-1" />
          )}
          
          {onDelete && (
            <AlertDialog>
              <Tooltip>
                <AlertDialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                </AlertDialogTrigger>
                <TooltipContent>Delete item</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
                  <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete} 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isSaving}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
}