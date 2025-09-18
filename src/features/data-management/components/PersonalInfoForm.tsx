'use client';

import { useState } from 'react';
import { PersonalInfo } from '@/shared/lib/types';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { HyperlinkInput } from '@/shared/components/ui/hyperlink-input';
import { Wand2 } from 'lucide-react';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onUpdate: (patch: Partial<PersonalInfo>) => void;
}

export function PersonalInfoForm({ personalInfo, onUpdate }: PersonalInfoFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleAIEnhanceSummary = async () => {
    if (!personalInfo.summary?.trim()) {
      alert('Please write a brief summary first, then use AI to enhance it.');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/ai-agents/grammar-enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: personalInfo.summary,
          context: `Professional summary for ${personalInfo.fullName || 'candidate'}`,
          improvementType: 'professional-summary'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.enhancedText) {
          onUpdate({ summary: result.enhancedText });
        }
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
      alert('AI enhancement temporarily unavailable. Please try again later.');
    } finally {
      setIsEnhancing(false);
    }
  };
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
        <div className="flex items-center justify-between">
          <Label htmlFor="summary">Professional Summary</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIEnhanceSummary}
            disabled={isEnhancing || !personalInfo.summary?.trim()}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            {isEnhancing ? (
              <>
                <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-2" />
                Enhancing...
              </>
            ) : (
              <>
                <Wand2 size={14} className="mr-1" />
                AI Enhance
              </>
            )}
          </Button>
        </div>
        <div className="relative">
          <RichTextEditor
            value={personalInfo.summary || ''}
            onChange={(value) => onUpdate({ summary: value })}
            placeholder="A brief professional summary that highlights your key skills and experience..."
            className="border-border focus:border-primary"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-blue-50 border-blue-200 hover:bg-blue-100"
            onClick={handleAIEnhanceSummary}
            disabled={isEnhancing || !personalInfo.summary?.trim()}
            title="AI enhance professional summary"
          >
            <Wand2 size={14} className="text-blue-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
