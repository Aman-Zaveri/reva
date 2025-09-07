'use client';

import React from 'react';
import type { DataBundle, Profile, FormattingOptions, SectionType } from '@/shared/lib/types';
import { getEffectiveProfileData } from '@/shared/lib/utils';
import { RichTextDisplay } from '@/shared/components/ui/rich-text-editor';
import { PersonalInfoLink } from '@/shared/components/ui/personal-info-link';
import { clsx } from 'clsx';

// Helper function to apply custom formatting styles
const getStyleWithFormatting = (
  defaultClasses: string,
  formatting?: FormattingOptions,
  type?: 'name' | 'header' | 'body' | 'metadata'
) => {
  const styles: React.CSSProperties = {};
  
  if (formatting) {
    // Apply global font family to all text
    if (formatting.fontFamily) {
      styles.fontFamily = formatting.fontFamily;
    }
    
    // Apply primary color to name and headers
    if (formatting.primaryColor && (type === 'name' || type === 'header')) {
      styles.color = formatting.primaryColor;
    }
    
    // Apply font sizes directly as inline styles
    if (type && formatting) {
      const getFontSizeFromClass = (fontSizeClass: string): string | null => {
        // Handle custom pixel values like 'text-[16px]'
        const pixelMatch = fontSizeClass.match(/text-\[(\d+)px\]/);
        if (pixelMatch) {
          return `${pixelMatch[1]}px`;
        }
        
        // Handle legacy Tailwind classes
        const sizeMap: Record<string, string> = {
          'text-xs': '12px',
          'text-sm': '14px',
          'text-base': '16px',
          'text-lg': '18px',
          'text-xl': '20px',
          'text-2xl': '24px',
          'text-3xl': '30px',
        };
        
        return sizeMap[fontSizeClass] || null;
      };
      
      switch (type) {
        case 'name':
          if (formatting.nameFontSize) {
            const fontSize = getFontSizeFromClass(formatting.nameFontSize);
            if (fontSize) styles.fontSize = fontSize;
          }
          break;
        case 'header':
          if (formatting.headerFontSize) {
            const fontSize = getFontSizeFromClass(formatting.headerFontSize);
            if (fontSize) styles.fontSize = fontSize;
          }
          break;
        case 'body':
          if (formatting.bodyTextFontSize) {
            const fontSize = getFontSizeFromClass(formatting.bodyTextFontSize);
            if (fontSize) styles.fontSize = fontSize;
          }
          break;
        case 'metadata':
          if (formatting.metadataTextFontSize) {
            const fontSize = getFontSizeFromClass(formatting.metadataTextFontSize);
            if (fontSize) styles.fontSize = fontSize;
          }
          break;
      }
    }
  }

  // Remove existing font-size classes from defaultClasses when we have custom sizes
  let classes = defaultClasses;
  if (formatting && type) {
    const hasCustomSize = (
      (type === 'name' && formatting.nameFontSize) ||
      (type === 'header' && formatting.headerFontSize) ||
      (type === 'body' && formatting.bodyTextFontSize) ||
      (type === 'metadata' && formatting.metadataTextFontSize)
    );
    
    if (hasCustomSize) {
      // Remove any font size classes since we're using inline styles
      classes = classes.replace(/text-\w+|text-\[\d+px\]/g, '').replace(/\s+/g, ' ').trim();
    }
  }

  return { className: classes, style: styles };
};

// Helper function to get border style for section separators
const getBorderStyle = (formatting?: FormattingOptions) => {
  if (formatting?.primaryColor) {
    return { borderBottomColor: formatting.primaryColor };
  }
  return {};
};

interface SectionRenderProps {
  skills: any[];
  experiences: any[];
  projects: any[];
  education: any[];
  profile: Profile;
  template: string;
  compact?: boolean;
  isLast: boolean;
}

// Section rendering functions
const renderSkillsSection = ({ skills, profile, template, compact, isLast }: SectionRenderProps) => {
  const headerStyles = getStyleWithFormatting(
    clsx('font-bold uppercase tracking-wide text-foreground', compact || template === 'compact' ? 'text-sm' : 'text-sm'), 
    profile.formatting, 
    'header'
  );
  const bodyStyles = getStyleWithFormatting(
    clsx('break-words', compact || template === 'compact' ? 'text-[12px]' : 'text-[13px]'), 
    profile.formatting, 
    'body'
  );

  const spacing = template === 'compact' ? 'space-y-0.5' : 'space-y-1';
  const marginTop = template === 'compact' ? 'mt-1' : 'mt-2';
  const paddingBottom = template === 'compact' ? 'pb-2' : 'pb-3';

  return (
    <section 
      className={clsx('section-header', !isLast && `border-b border-border ${paddingBottom}`)}
      style={!isLast ? getBorderStyle(profile.formatting) : {}}
    >
      <h2 className={headerStyles.className} style={headerStyles.style}>
        Skills
      </h2>
      <div className={clsx(marginTop, spacing)}>
        {skills.map((skill) => (
          <div key={skill.id} className={bodyStyles.className} style={bodyStyles.style}>
            <span className="font-bold">
              {skill.name}:
            </span>{' '}
            <RichTextDisplay 
              content={skill.details} 
              className="inline" 
              style={bodyStyles.style}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

const renderExperiencesSection = ({ experiences, profile, template, compact, isLast }: SectionRenderProps) => {
  const headerStyles = getStyleWithFormatting(
    clsx('font-bold uppercase tracking-wide text-foreground', compact || template === 'compact' ? 'text-sm' : 'text-sm'), 
    profile.formatting, 
    'header'
  );
  const bodyStyles = getStyleWithFormatting(
    clsx('break-words', compact || template === 'compact' ? 'text-[12px]' : 'text-[13px]'), 
    profile.formatting, 
    'body'
  );
  const metadataStyles = getStyleWithFormatting(
    clsx('text-muted-foreground', compact || template === 'compact' ? 'text-[11px]' : 'text-xs'), 
    profile.formatting, 
    'metadata'
  );

  const spacing = template === 'compact' ? 'space-y-2' : 'space-y-4';
  const marginTop = template === 'compact' ? 'mt-1' : 'mt-2';
  const paddingBottom = template === 'compact' ? 'pb-2' : 'pb-3';
  const listSpacing = template === 'compact' ? 'space-y-0.5' : 'space-y-1';
  const listMargin = template === 'compact' ? 'ml-4' : 'ml-5';

  return (
    <section 
      className={clsx('section-header', !isLast && `border-b border-border ${paddingBottom}`)}
      style={!isLast ? getBorderStyle(profile.formatting) : {}}
    >
      <h2 className={headerStyles.className} style={headerStyles.style}>
        Work Experiences
      </h2>
      <div className={clsx(marginTop, spacing)}>
        {experiences.map((experience) => (
          <div key={experience.id} className="experience-item">
            <div className={clsx('flex flex-wrap items-baseline justify-between', template === 'compact' ? 'gap-1' : 'gap-2')}>
              <div className={clsx('font-semibold', bodyStyles.className)} style={bodyStyles.style}>
                {experience.title} | {experience.company}
              </div>
              <div className={metadataStyles.className} style={metadataStyles.style}>
                {experience.date}
              </div>
            </div>
            <ul className={clsx(listMargin, 'list-disc', listSpacing, template === 'compact' ? 'mt-0.5' : 'mt-1')}>
              {experience.bullets.map((bullet: string, index: number) => (
                <li key={index} className="break-words">
                  <RichTextDisplay 
                    content={bullet} 
                    className={bodyStyles.className}
                    style={bodyStyles.style}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const renderProjectsSection = ({ projects, profile, template, compact, isLast }: SectionRenderProps) => {
  const headerStyles = getStyleWithFormatting(
    clsx('font-bold uppercase tracking-wide text-foreground', compact || template === 'compact' ? 'text-sm' : 'text-sm'), 
    profile.formatting, 
    'header'
  );
  const bodyStyles = getStyleWithFormatting(
    clsx('break-words', compact || template === 'compact' ? 'text-[12px]' : 'text-[13px]'), 
    profile.formatting, 
    'body'
  );
  const metadataStyles = getStyleWithFormatting(
    clsx('text-muted-foreground', compact || template === 'compact' ? 'text-[11px]' : 'text-xs'), 
    profile.formatting, 
    'metadata'
  );

  const spacing = template === 'compact' ? 'space-y-2' : 'space-y-4';
  const marginTop = template === 'compact' ? 'mt-1' : 'mt-2';
  const paddingBottom = template === 'compact' ? 'pb-2' : 'pb-3';
  const listSpacing = template === 'compact' ? 'space-y-0.5' : 'space-y-1';
  const listMargin = template === 'compact' ? 'ml-4' : 'ml-5';

  return (
    <section 
      className={clsx('section-header', !isLast && `border-b border-border ${paddingBottom}`)}
      style={!isLast ? getBorderStyle(profile.formatting) : {}}
    >
      <h2 className={headerStyles.className} style={headerStyles.style}>
        Projects
      </h2>
      <div className={clsx(marginTop, spacing)}>
        {projects.map((project) => (
          <div key={project.id} className="project-item">
            <div className={clsx('flex flex-wrap items-baseline justify-between', template === 'compact' ? 'gap-1' : 'gap-2')}>
              <div className={clsx('font-semibold', bodyStyles.className)} style={bodyStyles.style}>
                {project.title}
              </div>
              <div className={metadataStyles.className} style={metadataStyles.style}>
                {project.link || ''}
              </div>
            </div>
            <ul className={clsx(listMargin, 'list-disc', listSpacing, template === 'compact' ? 'mt-0.5' : 'mt-1')}>
              {project.bullets.map((bullet: string, index: number) => (
                <li key={index} className="break-words">
                  <RichTextDisplay 
                    content={bullet} 
                    className={bodyStyles.className}
                    style={bodyStyles.style}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const renderEducationSection = ({ education, profile, template, compact, isLast }: SectionRenderProps) => {
  const headerStyles = getStyleWithFormatting(
    clsx('font-bold uppercase tracking-wide text-foreground', compact || template === 'compact' ? 'text-sm' : 'text-sm'), 
    profile.formatting, 
    'header'
  );
  const bodyStyles = getStyleWithFormatting(
    clsx('break-words', compact || template === 'compact' ? 'text-[12px]' : 'text-[13px]'), 
    profile.formatting, 
    'body'
  );

  const spacing = template === 'compact' ? 'space-y-1' : 'space-y-2';
  const marginTop = template === 'compact' ? 'mt-1' : 'mt-2';
  const paddingBottom = template === 'compact' ? 'pb-2' : 'pb-3';

  return (
    <section 
      className={clsx('section-header', !isLast && `border-b border-border ${paddingBottom}`)}
      style={!isLast ? getBorderStyle(profile.formatting) : {}}
    >
      <h2 className={headerStyles.className} style={headerStyles.style}>
        Education
      </h2>
      <div className={clsx(marginTop, spacing)}>
        {education.map((educationItem) => (
          <div key={educationItem.id} className="education-item">
            <span className={clsx('font-medium', bodyStyles.className)} style={bodyStyles.style}>
              {educationItem.title}
            </span> — <RichTextDisplay 
              content={educationItem.details} 
              className={clsx('inline', bodyStyles.className)} 
              style={bodyStyles.style}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export function Resume({ profile, data, compact }: { profile: Profile; data: DataBundle; compact?: boolean }) {
  const effectiveData = getEffectiveProfileData(profile, data);
  const experiences = effectiveData.experiences.filter((experience) => profile.experienceIds.includes(experience.id));
  const projects = effectiveData.projects.filter((project) => profile.projectIds.includes(project.id));
  const skills = effectiveData.skills.filter((skill) => profile.skillIds.includes(skill.id));
  const education = effectiveData.education.filter((educationItem) => profile.educationIds.includes(educationItem.id));

  const template = profile.template || 'classic';
  
  // Default section order if not specified
  const DEFAULT_SECTION_ORDER: SectionType[] = ['skills', 'experiences', 'projects', 'education'];
  const sectionOrder = profile.sectionOrder || DEFAULT_SECTION_ORDER;

  // Create section rendering functions
  const renderSection = (sectionType: SectionType, isLast: boolean = false) => {
    const sectionProps = {
      skills,
      experiences,
      projects,
      education,
      profile,
      template,
      compact,
      isLast,
    };

    switch (sectionType) {
      case 'skills':
        return skills.length > 0 ? renderSkillsSection(sectionProps) : null;
      case 'experiences':
        return experiences.length > 0 ? renderExperiencesSection(sectionProps) : null;
      case 'projects':
        return projects.length > 0 ? renderProjectsSection(sectionProps) : null;
      case 'education':
        return education.length > 0 ? renderEducationSection(sectionProps) : null;
      default:
        return null;
    }
  };

  // Filter out empty sections and determine which is the last visible section
  const visibleSections = sectionOrder.filter(sectionType => {
    switch (sectionType) {
      case 'skills':
        return skills.length > 0;
      case 'experiences':
        return experiences.length > 0;
      case 'projects':
        return projects.length > 0;
      case 'education':
        return education.length > 0;
      default:
        return false;
    }
  });

  const nameStyles = getStyleWithFormatting(
    clsx('font-semibold text-foreground', compact || template === 'compact' ? 'text-xl' : 'text-2xl'), 
    profile.formatting, 
    'name'
  );

  const mainSpacing = template === 'compact' ? 'space-y-3' : 'space-y-5';
  const headerPadding = template === 'compact' ? 'pb-2' : 'pb-3';
  const textSize = template === 'compact' ? 'text-[13px] leading-tight' : 'text-[14px] leading-relaxed';
  const contactTextSize = template === 'compact' ? 'text-[11px]' : 'text-[12px]';

  return (
    <div className={clsx(textSize, mainSpacing)}>
      {/* Header */}
      <header 
        className={clsx('border-b border-border section-header text-center', headerPadding)}
        style={getBorderStyle(profile.formatting)}
      >
        <h1 className={nameStyles.className} style={nameStyles.style}>
          {profile.personalInfo?.fullName || 'Your Name'}
        </h1>
        <div className={clsx('mt-1 text-muted-foreground break-words', contactTextSize)}>
          {[
            profile.personalInfo?.location,
            profile.personalInfo?.phone,
            profile.personalInfo?.email,
          ].filter(Boolean).join(' | ')}
          {(profile.personalInfo?.linkedin || profile.personalInfo?.github || profile.personalInfo?.website) && ' | '}
          {[
            profile.personalInfo?.linkedin && (
              <PersonalInfoLink
                key="linkedin"
                value={profile.personalInfo.linkedin}
                hyperlinkInfo={profile.personalInfo.linkedinHyperlink}
              />
            ),
            profile.personalInfo?.github && (
              <PersonalInfoLink
                key="github"
                value={profile.personalInfo.github}
                hyperlinkInfo={profile.personalInfo.githubHyperlink}
              />
            ),
            profile.personalInfo?.website && (
              <PersonalInfoLink
                key="website"
                value={profile.personalInfo.website}
                hyperlinkInfo={profile.personalInfo.websiteHyperlink}
              />
            ),
          ].filter(Boolean).reduce((acc, item, index, arr) => {
            if (index === 0) return [item];
            return [...acc, ' | ', item];
          }, [] as React.ReactNode[])}
        </div>
        {profile.personalInfo?.summary && (
          <RichTextDisplay 
            content={profile.personalInfo.summary} 
            className={clsx('mt-1', getStyleWithFormatting(
              clsx('break-words', compact || template === 'compact' ? 'text-[12px]' : 'text-[13px]'), 
              profile.formatting, 
              'body'
            ).className)}
            style={getStyleWithFormatting('', profile.formatting, 'body').style}
          />
        )}
      </header>

      {/* Dynamic Sections */}
      {visibleSections.map((sectionType, index) => {
        const isLast = index === visibleSections.length - 1;
        return (
          <React.Fragment key={sectionType}>
            {renderSection(sectionType, isLast)}
          </React.Fragment>
        );
      })}
    </div>
  );
}