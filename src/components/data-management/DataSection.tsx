"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DataSectionProps {
  id?: string;
  title: string;
  description: string;
  children: ReactNode;
  onAdd?: () => void;
  addButtonText?: string;
  headerIcon?: ReactNode;
}

export function DataSection({ 
  id,
  title, 
  description, 
  children, 
  onAdd, 
  addButtonText = "Add Item",
  headerIcon
}: DataSectionProps) {
  return (
    <section id={id} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">{headerIcon}</div>
          <div>
            <h2 className="text-lg font-semibold text-blue-900">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd} className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}