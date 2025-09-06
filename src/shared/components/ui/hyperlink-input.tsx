'use client';

import React, { useState } from 'react';
import { Link, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import type { HyperlinkInfo } from '@/shared/lib/types';

interface HyperlinkInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hyperlinkInfo?: HyperlinkInfo;
  onHyperlinkChange: (hyperlinkInfo: HyperlinkInfo) => void;
}

export function HyperlinkInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
  hyperlinkInfo,
  onHyperlinkChange,
}: HyperlinkInputProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(hyperlinkInfo?.url || '');
  const [tempDisplayText, setTempDisplayText] = useState(hyperlinkInfo?.displayText || '');

  const handleSaveHyperlink = () => {
    onHyperlinkChange({
      url: tempUrl,
      displayText: tempDisplayText,
    });
    
    // Always update the main input field with the URL if it's different
    if (tempUrl && tempUrl !== value) {
      onChange(tempUrl);
    }
    
    setIsDialogOpen(false);
  };

  const formatUrlForField = (inputValue: string, fieldType: string) => {
    if (!inputValue) return '';
    
    // If it's already a full URL, return as is
    if (inputValue.startsWith('http://') || inputValue.startsWith('https://')) {
      return inputValue;
    }
    
    // Handle different field types
    switch (fieldType.toLowerCase()) {
      case 'linkedin':
        if (inputValue.includes('linkedin.com')) {
          return inputValue.startsWith('linkedin.com') ? `https://${inputValue}` : inputValue;
        }
        // If it's just a username or partial path, construct full LinkedIn URL
        if (inputValue.startsWith('in/') || !inputValue.includes('/')) {
          const username = inputValue.replace('in/', '');
          return `https://linkedin.com/in/${username}`;
        }
        return `https://${inputValue}`;
      
      case 'github':
        if (inputValue.includes('github.com')) {
          return inputValue.startsWith('github.com') ? `https://${inputValue}` : inputValue;
        }
        // If it's just a username, construct full GitHub URL
        if (!inputValue.includes('/')) {
          return `https://github.com/${inputValue}`;
        }
        return `https://${inputValue}`;
      
      case 'website':
        // For website, just add https if no protocol
        return `https://${inputValue}`;
      
      default:
        return inputValue;
    }
  };

  const handleOpenDialog = () => {
    // Pre-populate URL field with the main input value if URL is empty
    const currentUrl = hyperlinkInfo?.url || '';
    const formattedUrl = currentUrl || formatUrlForField(value, label);
    setTempUrl(formattedUrl);
    setTempDisplayText(hyperlinkInfo?.displayText || '');
    setIsDialogOpen(true);
  };

  const handleRemoveHyperlink = () => {
    onHyperlinkChange({
      url: '',
      displayText: '',
    });
    setTempUrl('');
    setTempDisplayText('');
    setIsDialogOpen(false);
  };

  const hasHyperlink = Boolean(hyperlinkInfo?.url);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${className} ${hasHyperlink ? 'pr-10' : ''}`}
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                hasHyperlink ? 'text-blue-600 hover:text-blue-700' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={handleOpenDialog}
            >
              {hasHyperlink ? <ExternalLink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configure Hyperlink for {label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hyperlink-url">URL</Label>
                <Input
                  id="hyperlink-url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder={`https://example.com (auto-filled from ${label.toLowerCase()} field)`}
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  This will be the clickable link in your resume
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hyperlink-display">Display Text</Label>
                <Input
                  id="hyperlink-display"
                  value={tempDisplayText}
                  onChange={(e) => setTempDisplayText(e.target.value)}
                  placeholder="Text to display on resume"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the main field value as display text. Note: The main field will be updated with the URL above when you save.
                </p>
              </div>
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveHyperlink}
                  disabled={!hasHyperlink}
                >
                  Remove Link
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveHyperlink}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {hasHyperlink && (
        <div className="text-xs text-muted-foreground">
          🔗 Will link to: {hyperlinkInfo?.url}
          {hyperlinkInfo?.displayText && ` (displays as: "${hyperlinkInfo.displayText}")`}
        </div>
      )}
    </div>
  );
}
