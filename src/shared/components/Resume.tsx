'use client';

import type { DataBundle, Profile } from '@/shared/lib/types';
import { getEffectiveProfileData } from '@/shared/lib/utils';
import { RichTextDisplay } from '@/shared/components/ui/rich-text-editor';
import { clsx } from 'clsx';

export function Resume({ profile, data, compact }: { profile: Profile; data: DataBundle; compact?: boolean }) {
  const effectiveData = getEffectiveProfileData(profile, data);
  const experiences = effectiveData.experiences.filter((experience) => profile.experienceIds.includes(experience.id));
  const projects = effectiveData.projects.filter((project) => profile.projectIds.includes(project.id));
  const skills = effectiveData.skills.filter((skill) => profile.skillIds.includes(skill.id));
  const education = effectiveData.education.filter((educationItem) => profile.educationIds.includes(educationItem.id));

  const template = profile.template || 'classic';

  if (template === 'compact') {
    return (
      <div className={clsx('text-[12px] leading-snug space-y-3')}>        
        <header className="border-b border-border pb-2">
          <h1 className="text-xl font-semibold text-foreground">{profile.personalInfo?.fullName || 'Your Name'}</h1>
          {profile.personalInfo?.summary && <RichTextDisplay content={profile.personalInfo.summary} className="mt-1 text-[11px] text-muted-foreground" />}
        </header>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-3">
            {experiences.length>0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Experience</h2>
                {experiences.map(experience => (
                  <div key={experience.id} className="mt-1 experience-item">
                    <div className="flex justify-between text-[11px] font-medium"><span className="text-foreground">{experience.title} @ {experience.company}</span><span className="text-muted-foreground">{experience.date}</span></div>
                    <ul className="ml-4 list-disc">
                      {experience.bullets.slice(0,3).map((bullet,index)=>(<li key={index}><RichTextDisplay content={bullet} /></li>))}
                    </ul>
                  </div>
                ))}
              </section>
            )}
            {projects.length>0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Projects</h2>
                {projects.map(project => (
                  <div key={project.id} className="mt-1 project-item">
                    <div className="flex justify-between text-[11px] font-medium"><span className="text-foreground">{project.title}</span><span className="text-muted-foreground">{project.link||''}</span></div>
                    <ul className="ml-4 list-disc">
                      {project.bullets.slice(0,2).map((bullet,index)=>(<li key={index}><RichTextDisplay content={bullet} /></li>))}
                    </ul>
                  </div>
                ))}
              </section>
            )}
          </div>
          <div className="col-span-1 space-y-3">
            {skills.length>0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Skills</h2>
                <ul className="mt-1 space-y-1">
                  {skills.map(skill => <li key={skill.id}><span className="font-medium text-foreground">{skill.name}:</span> <RichTextDisplay content={skill.details} className="inline" /></li>)}
                </ul>
              </section>
            )}
            {education.length>0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Education</h2>
                <ul className="ml-4 list-disc">
                  {education.map(educationItem => <li key={educationItem.id} className="education-item">{educationItem.title} — <RichTextDisplay content={educationItem.details} className="inline" /></li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('text-[14px] leading-relaxed', compact ? 'space-y-4' : 'space-y-6')}>
      {/* Header */}
      <header className="border-b border-border pb-3 section-header">
        <h1 className={clsx('font-semibold text-foreground', compact ? 'text-xl' : 'text-2xl')}>
          {profile.personalInfo?.fullName || 'Your Name'}
        </h1>
        <div className={clsx('mt-1 text-muted-foreground break-words', compact ? 'text-[12px]' : 'text-[12px]')}>
          {[
            profile.personalInfo?.location,
            profile.personalInfo?.phone,
            profile.personalInfo?.email,
            profile.personalInfo?.linkedin,
            profile.personalInfo?.github
          ].filter(Boolean).join(' | ')}
        </div>
        {profile.personalInfo?.summary && (
          <RichTextDisplay 
            content={profile.personalInfo.summary} 
            className={clsx('mt-1 text-muted-foreground break-words', compact ? 'text-[12px]' : 'text-[12px]')}
          />
        )}
      </header>

      {/* Skills */}
      {skills.length > 0 && (
        <section className="section-header">
          <h2 className={clsx('font-bold uppercase tracking-wide text-foreground', compact ? 'text-sm' : 'text-sm')}>
            Skills
          </h2>
          <div className={clsx('mt-1 gap-2', compact ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-2')}>
            {skills.map((skill) => (
              <div key={skill.id} className={clsx('break-words', compact ? 'text-[12px]' : 'text-[13px]')}>
                <span className="font-medium text-foreground">{skill.name}:</span> <RichTextDisplay content={skill.details} className="inline" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="section-header">
          <h2 className={clsx('font-bold uppercase tracking-wide text-foreground', compact ? 'text-sm' : 'text-sm')}>
            Work Experiences
          </h2>
          <div className="mt-1 space-y-3">
            {experiences.map((experience) => (
              <div key={experience.id} className="experience-item">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className={clsx('font-semibold text-foreground', compact ? 'text-[13px]' : 'text-[14px]')}>
                    {experience.title} | {experience.company}
                  </div>
                  <div className={clsx('text-muted-foreground', compact ? 'text-[11px]' : 'text-xs')}>
                    {experience.date}
                  </div>
                </div>
                <ul className={clsx('ml-5 list-disc', compact ? 'text-[12px]' : 'text-[13px]')}>
                  {experience.bullets.slice(0, compact ? 3 : undefined).map((bullet, index) => (
                    <li key={index} className="break-words"><RichTextDisplay content={bullet} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="section-header">
          <h2 className={clsx('font-bold uppercase tracking-wide text-foreground', compact ? 'text-sm' : 'text-sm')}>
            Projects
          </h2>
          <div className="mt-1 space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className={clsx('font-semibold text-foreground', compact ? 'text-[13px]' : 'text-[14px]')}>
                    {project.title}
                  </div>
                  <div className={clsx('text-muted-foreground', compact ? 'text-[11px]' : 'text-xs')}>
                    {project.link || ''}
                  </div>
                </div>
                <ul className={clsx('ml-5 list-disc', compact ? 'text-[12px]' : 'text-[13px]')}>
                  {project.bullets.slice(0, compact ? 2 : undefined).map((bullet, index) => (
                    <li key={index} className="break-words"><RichTextDisplay content={bullet} /></li>
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
          <h2 className={clsx('font-bold uppercase tracking-wide text-foreground', compact ? 'text-sm' : 'text-sm')}>
            Education
          </h2>
          <div className={clsx('ml-5 space-y-1', compact ? 'text-[12px]' : 'text-[13px]')}>
            {education.map((educationItem) => (
              <div key={educationItem.id} className="overflow-hidden education-item">
                <span className="font-medium text-foreground">{educationItem.title}</span> — <RichTextDisplay content={educationItem.details} className="truncate inline-block max-w-xs" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}