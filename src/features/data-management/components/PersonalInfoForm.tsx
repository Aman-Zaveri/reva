'use client';

import { PersonalInfo } from '@/shared/lib/types';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { HyperlinkInput } from '@/shared/components/ui/hyperlink-input';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onUpdate: (patch: Partial<PersonalInfo>) => void;
}

export function PersonalInfoForm({ personalInfo, onUpdate }: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={personalInfo.fullName || ''}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            placeholder="Your full name"
            className="border-border focus:border-primary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personalInfo.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="your.email@example.com"
            className="border-border focus:border-primary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={personalInfo.phone || ''}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="border-border focus:border-primary"
          />
        </div>
      
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={personalInfo.location || ''}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="City, State/Province"
            className="border-border focus:border-primary"
          />
        </div>
        
        <HyperlinkInput
          id="linkedin"
          label="LinkedIn"
          value={personalInfo.linkedin || ''}
          onChange={(value) => onUpdate({ linkedin: value })}
          placeholder="linkedin.com/in/yourprofile"
          className="border-border focus:border-primary"
          hyperlinkInfo={personalInfo.linkedinHyperlink}
          onHyperlinkChange={(hyperlinkInfo) => onUpdate({ linkedinHyperlink: hyperlinkInfo })}
        />
        
        <HyperlinkInput
          id="github"
          label="GitHub"
          value={personalInfo.github || ''}
          onChange={(value) => onUpdate({ github: value })}
          placeholder="github.com/yourusername"
          className="border-border focus:border-primary"
          hyperlinkInfo={personalInfo.githubHyperlink}
          onHyperlinkChange={(hyperlinkInfo) => onUpdate({ githubHyperlink: hyperlinkInfo })}
        />
      </div>

      <HyperlinkInput
        id="website"
        label="Website"
        value={personalInfo.website || ''}
        onChange={(value) => onUpdate({ website: value })}
        placeholder="https://yourwebsite.com"
        className="border-border focus:border-primary"
        hyperlinkInfo={personalInfo.websiteHyperlink}
        onHyperlinkChange={(hyperlinkInfo) => onUpdate({ websiteHyperlink: hyperlinkInfo })}
      />
      
      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <RichTextEditor
          value={personalInfo.summary || ''}
          onChange={(value) => onUpdate({ summary: value })}
          placeholder="A brief professional summary that highlights your key skills and experience..."
          className="border-border focus:border-primary"
        />
      </div>
    </div>
  );
}
