"use client";

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit3 } from 'lucide-react';

interface DataCardProps {
  id: string;
  title: string;
  subtitle?: string;
  borderColor: string;
  children: ReactNode;
  onDelete: () => void;
  onTitleChange?: (value: string) => void;
  onSubtitleChange?: (value: string) => void;
  titlePlaceholder?: string;
  subtitlePlaceholder?: string;
  editDialog?: {
    title: string;
    description: string;
    content: ReactNode;
  };
}

export function DataCard({ 
  id,
  title, 
  subtitle,
  borderColor,
  children,
  onDelete,
  onTitleChange,
  onSubtitleChange,
  titlePlaceholder = "Title",
  subtitlePlaceholder = "Subtitle",
  editDialog
}: DataCardProps) {
  return (
    <Card className="">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="grid gap-2 flex-1 mr-3">
            {onTitleChange ? (
              <Input
                placeholder={titlePlaceholder}
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="font-medium border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
              />
            ) : (
              <h3 className="font-medium">{title}</h3>
            )}
            {(subtitle !== undefined || onSubtitleChange) && (
              onSubtitleChange ? (
                <Input
                  placeholder={subtitlePlaceholder}
                  value={subtitle || ""}
                  onChange={(e) => onSubtitleChange(e.target.value)}
                  className="text-sm"
                />
              ) : (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              )
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {children}
          {editDialog && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editDialog.title}</DialogTitle>
                  <DialogDescription>{editDialog.description}</DialogDescription>
                </DialogHeader>
                {editDialog.content}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}