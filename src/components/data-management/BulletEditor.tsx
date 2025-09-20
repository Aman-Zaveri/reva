"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Plus, Trash2 } from 'lucide-react';

interface BulletEditorProps {
  bullets: string[];
  onSave: (bullets: string[]) => void;
  placeholder?: string;
}

export function BulletEditor({ bullets, onSave, placeholder = "Describe your achievement or responsibility..." }: BulletEditorProps) {
  const [editBullets, setEditBullets] = useState(bullets);

  const addBullet = () => {
    setEditBullets([...editBullets, ""]);
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...editBullets];
    newBullets[index] = value;
    setEditBullets(newBullets);
  };

  const removeBullet = (index: number) => {
    const newBullets = editBullets.filter((_: any, i: number) => i !== index);
    setEditBullets(newBullets);
  };

  const handleSave = () => {
    onSave(editBullets);
  };

  return (
    <div className="space-y-4 py-4">
      {editBullets.map((bullet: string, index: number) => (
        <div key={index} className="flex gap-2">
          <RichTextEditor
            value={bullet}
            onChange={(value) => updateBullet(index, value)}
            placeholder={placeholder}
            className="min-h-[80px] flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeBullet(index)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={addBullet}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add bullet point
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}