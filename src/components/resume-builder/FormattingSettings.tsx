"use client";

import React from "react";
import { Palette } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FormattingOptions } from "@/lib/types";

interface FormattingSettingsProps {
  formatting: FormattingOptions;
  onUpdate: (formatting: FormattingOptions) => void;
}

const FONT_FAMILY_OPTIONS = [
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Cambria, serif", label: "Cambria" },
];

// Helper function to convert font size string to number
const getFontSizeNumber = (fontSizeClass?: string): number => {
  if (!fontSizeClass) return 16;
  
  // Handle both old Tailwind classes and new custom pixel values
  const sizeMap: Record<string, number> = {
    'text-xs': 12,
    'text-sm': 14,
    'text-base': 16,
    'text-lg': 18,
    'text-xl': 20,
    'text-2xl': 24,
    'text-3xl': 30,
  };
  
  // Check if it's a Tailwind class
  if (sizeMap[fontSizeClass]) {
    return sizeMap[fontSizeClass];
  }
  
  // Check if it's a custom pixel value like 'text-[16px]'
  const pixelMatch = fontSizeClass.match(/text-\[(\d+)px\]/);
  if (pixelMatch) {
    return parseInt(pixelMatch[1]);
  }
  
  return 16; // Default fallback
};

// Helper function to convert number to font size class
const getFontSizeClass = (size: number): string => {
  return `text-[${size}px]`;
};

// Default font sizes for each type
const getDefaultFontSize = (type: 'name' | 'header' | 'body' | 'metadata'): number => {
  switch (type) {
    case 'name': return 24;
    case 'header': return 14;
    case 'body': return 14;
    case 'metadata': return 12;
    default: return 16;
  }
};

export function FormattingSettings({
  formatting,
  onUpdate,
}: FormattingSettingsProps) {
  const handleUpdate = (key: keyof FormattingOptions, value: string) => {
    onUpdate({
      ...formatting,
      [key]: value,
    });
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500 text-white">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-md">Formatting & Style</CardTitle>
            <p className="text-xs text-muted-foreground">
              Customize the global font, primary color, and precise font sizes for your resume
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Global Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Font Family */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Font Family
                </Label>
                <Select
                  value={formatting.fontFamily || "Times New Roman, serif"}
                  onValueChange={(value) => handleUpdate("fontFamily", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILY_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Applied to all text on the resume
                </p>
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Primary Color
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formatting.primaryColor || "#000000"}
                    onChange={(e) => handleUpdate("primaryColor", e.target.value)}
                    className="w-16 h-10 p-1 border-border"
                  />
                  <span className="text-xs text-muted-foreground flex-1">
                    {formatting.primaryColor || "#000000"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied to name, section headers, and section lines
                </p>
              </div>
            </div>
          </div>

          {/* Font Sizes */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Font Sizes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Font Size */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Name Size (px)
                </Label>
                <Input
                  type="number"
                  min="8"
                  max="72"
                  step="1"
                  value={getFontSizeNumber(formatting.nameFontSize) || getDefaultFontSize('name')}
                  onChange={(e) => handleUpdate("nameFontSize", getFontSizeClass(parseInt(e.target.value) || getDefaultFontSize('name')))}
                  className="w-full"
                />
              </div>

              {/* Header Font Size */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Section Headers Size (px)
                </Label>
                <Input
                  type="number"
                  min="8"
                  max="48"
                  step="1"
                  value={getFontSizeNumber(formatting.headerFontSize) || getDefaultFontSize('header')}
                  onChange={(e) => handleUpdate("headerFontSize", getFontSizeClass(parseInt(e.target.value) || getDefaultFontSize('header')))}
                  className="w-full"
                />
              </div>

              {/* Body Font Size */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Body Text Size (px)
                </Label>
                <Input
                  type="number"
                  min="8"
                  max="24"
                  step="1"
                  value={getFontSizeNumber(formatting.bodyTextFontSize) || getDefaultFontSize('body')}
                  onChange={(e) => handleUpdate("bodyTextFontSize", getFontSizeClass(parseInt(e.target.value) || getDefaultFontSize('body')))}
                  className="w-full"
                />
              </div>

              {/* Metadata Font Size */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Dates & Metadata Size (px)
                </Label>
                <Input
                  type="number"
                  min="8"
                  max="20"
                  step="1"
                  value={getFontSizeNumber(formatting.metadataTextFontSize) || getDefaultFontSize('metadata')}
                  onChange={(e) => handleUpdate("metadataTextFontSize", getFontSizeClass(parseInt(e.target.value) || getDefaultFontSize('metadata')))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
