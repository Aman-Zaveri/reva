'use client';

import type { DataBundle, Profile, FormattingOptions } from '@/shared/lib/types';
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
  
  if (formatting && type) {
    switch (type) {
      case 'name':
        if (formatting.nameColor) styles.color = formatting.nameColor;
        break;
      case 'header':
        if (formatting.headerColor) styles.color = formatting.headerColor;
        break;
      case 'body':
        if (formatting.bodyTextColor) styles.color = formatting.bodyTextColor;
        break;
      case 'metadata':
        if (formatting.metadataTextColor) styles.color = formatting.metadataTextColor;
        break;
    }
  }

  // Replace font size classes with custom ones if specified
  let classes = defaultClasses;
  if (formatting && type) {
    switch (type) {
      case 'name':
        if (formatting.nameFontSize) {
          classes = classes.replace(/text-\w+/, formatting.nameFontSize);
        }
        break;
      case 'header':
        if (formatting.headerFontSize) {
          classes = classes.replace(/text-\w+/, formatting.headerFontSize);
        }
        break;
      case 'body':
        if (formatting.bodyTextFontSize) {
          classes = classes.replace(/text-\[\d+px\]|text-\w+/, formatting.bodyTextFontSize);
        }
        break;
      case 'metadata':
        if (formatting.metadataTextFontSize) {
          classes = classes.replace(/text-\[\d+px\]|text-\w+/, formatting.metadataTextFontSize);
        }
        break;
    }
  }

  return { className: classes, style: styles };
};

export function Resume({ profile, data, compact }: { profile: Profile; data: DataBundle; compact?: boolean }) {
  const effectiveData = getEffectiveProfileData(profile, data);
  const experiences = effectiveData.experiences.filter((experience) => profile.experienceIds.includes(experience.id));
  const projects = effectiveData.projects.filter((project) => profile.projectIds.includes(project.id));
  const skills = effectiveData.skills.filter((skill) => profile.skillIds.includes(skill.id));
  const education = effectiveData.education.filter((educationItem) => profile.educationIds.includes(educationItem.id));

  const template = profile.template || 'classic';

  if (template === 'compact') {
    const nameStyles = getStyleWithFormatting('text-xl font-semibold text-foreground', profile.formatting, 'name');
    const headerStyles = getStyleWithFormatting('text-xs font-bold uppercase tracking-wide text-foreground', profile.formatting, 'header');
    const bodyStyles = getStyleWithFormatting('text-[11px] font-medium', profile.formatting, 'body');
    const metadataStyles = getStyleWithFormatting('text-muted-foreground', profile.formatting, 'metadata');

    return (
      <div className={clsx('text-[12px] leading-snug space-y-4')}>        
        <header className="border-b border-border pb-3 text-center section-header">
          <h1 className={nameStyles.className} style={nameStyles.style}>
            {profile.personalInfo?.fullName || 'Your Name'}
          </h1>
          {profile.personalInfo?.summary && (
            <RichTextDisplay 
              content={profile.personalInfo.summary} 
              className={clsx('mt-1', bodyStyles.className)} 
              style={bodyStyles.style}
            />
          )}
        </header>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            {experiences.length>0 && (
              <section className={clsx('section-header', projects.length > 0 && 'border-b border-border pb-3')}>
                <h2 className={headerStyles.className} style={headerStyles.style}>Experience</h2>
                <div className="mt-2 space-y-3">
                  {experiences.map(experience => (
                    <div key={experience.id} className="experience-item">
                      <div className="flex justify-between">
                        <span className={clsx(bodyStyles.className)} style={bodyStyles.style}>
                          {experience.title} @ {experience.company}
                        </span>
                        <span className={clsx(metadataStyles.className)} style={metadataStyles.style}>
                          {experience.date}
                        </span>
                      </div>
                      <ul className="ml-4 list-disc space-y-1 mt-1">
                        {experience.bullets.slice(0,3).map((bullet,index)=>(
                          <li key={index}>
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
            )}
            {projects.length>0 && (
              <section className="section-header">
                <h2 className={headerStyles.className} style={headerStyles.style}>Projects</h2>
                <div className="mt-2 space-y-3">
                  {projects.map(project => (
                    <div key={project.id} className="project-item">
                      <div className="flex justify-between">
                        <span className={clsx(bodyStyles.className)} style={bodyStyles.style}>
                          {project.title}
                        </span>
                        <span className={clsx(metadataStyles.className)} style={metadataStyles.style}>
                          {project.link||''}
                        </span>
                      </div>
                      <ul className="ml-4 list-disc space-y-1 mt-1">
                        {project.bullets.slice(0,2).map((bullet,index)=>(
                          <li key={index}>
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
            )}
          </div>
          <div className="col-span-1 space-y-4">
            {skills.length>0 && (
              <section className={clsx('section-header', education.length > 0 && 'border-b border-border pb-3')}>
                <h2 className={headerStyles.className} style={headerStyles.style}>Skills</h2>
                <ul className="mt-2 space-y-1">
                  {skills.map(skill => (
                    <li key={skill.id}>
                      <span className={clsx(bodyStyles.className, 'font-medium')} style={bodyStyles.style}>
                        {skill.name}:
                      </span>{' '}
                      <RichTextDisplay 
                        content={skill.details} 
                        className={clsx('inline', bodyStyles.className)} 
                        style={bodyStyles.style}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {education.length>0 && (
              <section className="section-header">
                <h2 className={headerStyles.className} style={headerStyles.style}>Education</h2>
                <div className="mt-2 space-y-2">
                  {education.map(educationItem => (
                    <div key={educationItem.id} className="education-item">
                      <span className={clsx(bodyStyles.className, 'font-medium')} style={bodyStyles.style}>
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
            )}
          </div>
        </div>
      </div>
    );
  }

  const nameStyles = getStyleWithFormatting(
    clsx('font-semibold text-foreground', compact ? 'text-xl' : 'text-2xl'), 
    profile.formatting, 
    'name'
  );
  const headerStyles = getStyleWithFormatting(
    clsx('font-bold uppercase tracking-wide text-foreground', compact ? 'text-sm' : 'text-sm'), 
    profile.formatting, 
    'header'
  );
  const bodyStyles = getStyleWithFormatting(
    clsx('break-words', compact ? 'text-[12px]' : 'text-[13px]'), 
    profile.formatting, 
    'body'
  );
  const metadataStyles = getStyleWithFormatting(
    clsx('text-muted-foreground', compact ? 'text-[11px]' : 'text-xs'), 
    profile.formatting, 
    'metadata'
  );

  return (
    <div className={clsx('text-[14px] leading-relaxed', compact ? 'space-y-5' : 'space-y-5')}>
      {/* Header */}
      <header className="border-b border-border pb-3 section-header text-center">
        <h1 className={nameStyles.className} style={nameStyles.style}>
          {profile.personalInfo?.fullName || 'Your Name'}
        </h1>
        <div className={clsx('mt-1 text-muted-foreground break-words', compact ? 'text-[12px]' : 'text-[12px]')}>
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
            className={clsx('mt-1', bodyStyles.className)}
            style={bodyStyles.style}
          />
        )}
      </header>

      {/* Skills */}
      {skills.length > 0 && (
        <section className={clsx('section-header', (experiences.length > 0 || projects.length > 0 || education.length > 0) && 'border-b border-border pb-3')}>
          <h2 className={headerStyles.className} style={headerStyles.style}>
            Skills
          </h2>
          <div className={clsx('mt-2 space-y-1', compact ? 'grid grid-cols-1' : 'flex flex-col')}>
            {skills.map((skill) => (
              <div key={skill.id} className={bodyStyles.className} style={bodyStyles.style}>
                <span className="font-medium">
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
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section className={clsx('section-header', (projects.length > 0 || education.length > 0) && 'border-b border-border pb-3')}>
          <h2 className={headerStyles.className} style={headerStyles.style}>
            Work Experiences
          </h2>
          <div className="mt-2 space-y-4">
            {experiences.map((experience) => (
              <div key={experience.id} className="experience-item">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className={clsx('font-semibold', bodyStyles.className)} style={bodyStyles.style}>
                    {experience.title} | {experience.company}
                  </div>
                  <div className={metadataStyles.className} style={metadataStyles.style}>
                    {experience.date}
                  </div>
                </div>
                <ul className="ml-5 list-disc space-y-1 mt-1">
                  {experience.bullets.slice(0, compact ? 3 : undefined).map((bullet, index) => (
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
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className={clsx('section-header', education.length > 0 && 'border-b border-border pb-3')}>
          <h2 className={headerStyles.className} style={headerStyles.style}>
            Projects
          </h2>
          <div className="mt-2 space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className={clsx('font-semibold', bodyStyles.className)} style={bodyStyles.style}>
                    {project.title}
                  </div>
                  <div className={metadataStyles.className} style={metadataStyles.style}>
                    {project.link || ''}
                  </div>
                </div>
                <ul className="ml-5 list-disc space-y-1 mt-1">
                  {project.bullets.slice(0, compact ? 2 : undefined).map((bullet, index) => (
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
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="section-header">
          <h2 className={headerStyles.className} style={headerStyles.style}>
            Education
          </h2>
          <div className="mt-2 space-y-2">
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
      )}
    </div>
  );
}