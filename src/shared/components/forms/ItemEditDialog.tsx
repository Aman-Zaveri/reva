import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { AIEnhancedBulletEditor } from './AIEnhancedBulletEditor';
import type { Experience, Project, Skill, Education, Profile, DataBundle } from '@/shared/lib/types';

export interface ItemEditDialogProps {
  item: Experience | Project | Skill | Education;
  type: 'experience' | 'project' | 'skill' | 'education';
  isOpen: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Experience | Project | Skill | Education>) => void;
  profile?: Profile;
  data?: DataBundle;
  jobContext?: string;
}

export function ItemEditDialog({ 
  item, 
  type, 
  isOpen, 
  onClose, 
  onSave, 
  profile, 
  data,
  jobContext 
}: ItemEditDialogProps) {
  const [editedItem, setEditedItem] = useState(item);

  const handleSave = () => {
    onSave(editedItem);
    onClose();
  };

  const renderExperienceFields = (exp: Experience) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={exp.title}
            onChange={(e) => setEditedItem({...exp, title: e.target.value})}
            className="border-border focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={exp.company}
            onChange={(e) => setEditedItem({...exp, company: e.target.value})}
            className="border-border focus:border-primary"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          value={exp.date}
          onChange={(e) => setEditedItem({...exp, date: e.target.value})}
          className="border-border focus:border-primary"
        />
      </div>
      
      {/* AI-Enhanced Bullet Editor */}
      {profile && data ? (
        <AIEnhancedBulletEditor
          bullets={exp.bullets}
          itemTitle={exp.title}
          itemType="experience"
          profile={profile}
          data={data}
          jobContext={jobContext}
          onBulletsChange={(bullets) => setEditedItem({...exp, bullets})}
        />
      ) : (
        <div className="space-y-2">
          <Label>Bullet Points</Label>
          {exp.bullets.map((bullet, index) => (
            <RichTextEditor
              key={index}
              value={bullet}
              onChange={(value) => {
                const newBullets = [...exp.bullets];
                newBullets[index] = value;
                setEditedItem({...exp, bullets: newBullets});
              }}
              className="border-border focus:border-primary"
            />
          ))}
        </div>
      )}
    </>
  );

  const renderProjectFields = (proj: Project) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={proj.title}
            onChange={(e) => setEditedItem({...proj, title: e.target.value})}
            className="border-border focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            value={proj.link || ''}
            onChange={(e) => setEditedItem({...proj, link: e.target.value})}
            className="border-border focus:border-primary"
          />
        </div>
      </div>
      
      {/* AI-Enhanced Bullet Editor for Projects */}
      {profile && data ? (
        <AIEnhancedBulletEditor
          bullets={proj.bullets}
          itemTitle={proj.title}
          itemType="project"
          profile={profile}
          data={data}
          jobContext={jobContext}
          onBulletsChange={(bullets) => setEditedItem({...proj, bullets})}
        />
      ) : (
        <div className="space-y-2">
          <Label>Bullet Points</Label>
          {proj.bullets.map((bullet, index) => (
            <RichTextEditor
              key={index}
              value={bullet}
              onChange={(value) => {
                const newBullets = [...proj.bullets];
                newBullets[index] = value;
                setEditedItem({...proj, bullets: newBullets});
              }}
              className="border-border focus:border-primary"
            />
          ))}
        </div>
      )}
    </>
  );

  const renderSkillFields = (skill: Skill) => (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Category</Label>
        <Input
          id="name"
          value={skill.name}
          onChange={(e) => setEditedItem({...skill, name: e.target.value})}
          className="border-border focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <RichTextEditor
          value={skill.details}
          onChange={(value) => setEditedItem({...skill, details: value})}
          className="border-border focus:border-primary"
          placeholder="Describe your skill level and relevant experience..."
        />
      </div>
    </>
  );

  const renderEducationFields = (edu: Education) => (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Program/Degree</Label>
        <Input
          id="title"
          value={edu.title}
          onChange={(e) => setEditedItem({...edu, title: e.target.value})}
          className="border-border focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Input
          id="details"
          value={edu.details}
          onChange={(e) => setEditedItem({...edu, details: e.target.value})}
          className="border-border focus:border-primary"
        />
      </div>
    </>
  );

  const renderFields = () => {
    switch (type) {
      case 'experience':
        return renderExperienceFields(editedItem as Experience);
      case 'project':
        return renderProjectFields(editedItem as Project);
      case 'skill':
        return renderSkillFields(editedItem as Skill);
      case 'education':
        return renderEducationFields(editedItem as Education);
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize {type} for this resume</DialogTitle>
          <DialogDescription>
            Changes made here will only affect this resume profile, not the master data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {renderFields()}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
