"use client";

import React from "react";
import { Palette } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { FormattingOptions } from "@/shared/lib/types";

interface FormattingSettingsProps {
  formatting: FormattingOptions;
  onUpdate: (formatting: FormattingOptions) => void;
}

const FONT_SIZE_OPTIONS = [
  { value: "text-xs", label: "Extra Small (12px)" },
  { value: "text-sm", label: "Small (14px)" },
  { value: "text-base", label: "Base (16px)" },
  { value: "text-lg", label: "Large (18px)" },
  { value: "text-xl", label: "Extra Large (20px)" },
  { value: "text-2xl", label: "2X Large (24px)" },
  { value: "text-3xl", label: "3X Large (30px)" },
];

interface FormattingSection {
  id: string;
  title: string;
  description: string;
  colorKey: keyof FormattingOptions;
  fontSizeKey: keyof FormattingOptions;
  defaultColor: string;
  defaultFontSize: string;
}

const FORMATTING_SECTIONS: FormattingSection[] = [
  {
    id: "name",
    title: "Name & Title",
    description: "Top of the resume",
    colorKey: "nameColor",
    fontSizeKey: "nameFontSize",
    defaultColor: "#000000",
    defaultFontSize: "text-2xl",
  },
  {
    id: "header",
    title: "Section Headers",
    description: "Skills, Experience, Projects, Education",
    colorKey: "headerColor",
    fontSizeKey: "headerFontSize",
    defaultColor: "#000000",
    defaultFontSize: "text-sm",
  },
  {
    id: "body",
    title: "Body Text",
    description: "Job descriptions, project details, skills",
    colorKey: "bodyTextColor",
    fontSizeKey: "bodyTextFontSize",
    defaultColor: "#000000",
    defaultFontSize: "text-sm",
  },
  {
    id: "metadata",
    title: "Dates & Metadata",
    description: "Dates, locations, secondary information",
    colorKey: "metadataTextColor",
    fontSizeKey: "metadataTextFontSize",
    defaultColor: "#6b7280",
    defaultFontSize: "text-xs",
  },
];

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

  const renderFormattingSection = (section: FormattingSection) => (
    <div key={section.id} className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">
        {section.title}
      </h3>
      <p className="text-xs text-muted-foreground">
        {section.description}
      </p>
      <div className="flex gap-4">
        <div className="space-y-2">
          <Input
            id={`${section.id}-color`}
            type="color"
            value={formatting[section.colorKey] || section.defaultColor}
            onChange={(e) => handleUpdate(section.colorKey, e.target.value)}
            className="w-16 h-10 p-1 border-border"
          />
        </div>
        <div className="space-y-2">
          <Select
            value={formatting[section.fontSizeKey] || section.defaultFontSize}
            onValueChange={(value) => handleUpdate(section.fontSizeKey, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

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
              Customize colors and font sizes for different text elements
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FORMATTING_SECTIONS.map(renderFormattingSection)}
        </div>
      </CardContent>
    </Card>
  );
}
