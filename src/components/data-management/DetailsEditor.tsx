"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface DetailsEditorProps {
  details: string;
  onSave: (details: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function DetailsEditor({ 
  details, 
  onSave, 
  placeholder = "Add details...",
  minHeight = "min-h-[120px]"
}: DetailsEditorProps) {
  const [editDetails, setEditDetails] = useState(details);

  const handleSave = () => {
    onSave(editDetails);
  };

  return (
    <div className="space-y-4 py-4">
      <RichTextEditor
        value={editDetails}
        onChange={setEditDetails}
        placeholder={placeholder}
        className={minHeight}
      />
      <Button onClick={handleSave} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}