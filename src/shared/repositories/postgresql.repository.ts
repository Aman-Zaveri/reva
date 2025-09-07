import type { Profile, DataBundle, PersonalInfo, Experience, Project, Skill, Education } from '@/shared/lib/types';
import type { StorageResult, ProfileRepository } from './profile.repository';
import { prisma } from '@/shared/lib/prisma';

/**
 * PostgreSQL-based implementation of ProfileRepository using Prisma
 * 
 * This repository provides persistent storage using PostgreSQL with Prisma ORM.
 * It handles data normalization, relationships, and provides full CRUD operations
 * for resume data with proper relational integrity.
 */
export class PostgreSQLProfileRepository implements ProfileRepository {
  
  /**
   * Saves profiles and master data to PostgreSQL
   * 
   * Performs a full data replacement - clears existing data and saves new data.
   * Uses transactions to ensure data consistency.
   * 
   * @param profiles - Array of profile objects to save
   * @param data - Master data bundle to save
   * @returns Promise resolving to operation result
   */
  async saveProfiles(profiles: Profile[], data: DataBundle): Promise<StorageResult<void>> {
    try {
      await prisma.$transaction(async (tx) => {
        // Clear existing data
        await tx.profileExperience.deleteMany();
        await tx.profileProject.deleteMany();
        await tx.profileSkill.deleteMany();
        await tx.profileEducation.deleteMany();
        await tx.profile.deleteMany();
        await tx.experience.deleteMany();
        await tx.project.deleteMany();
        await tx.skill.deleteMany();
        await tx.education.deleteMany();
        await tx.personalInfo.deleteMany();

        // Save personal info
        let personalInfoRecord = null;
        if (data.personalInfo) {
          personalInfoRecord = await tx.personalInfo.create({
            data: {
              fullName: data.personalInfo.fullName,
              email: data.personalInfo.email,
              phone: data.personalInfo.phone,
              location: data.personalInfo.location,
              linkedin: data.personalInfo.linkedin,
              linkedinUrl: data.personalInfo.linkedinHyperlink?.url,
              linkedinDisplay: data.personalInfo.linkedinHyperlink?.displayText,
              github: data.personalInfo.github,
              githubUrl: data.personalInfo.githubHyperlink?.url,
              githubDisplay: data.personalInfo.githubHyperlink?.displayText,
              website: data.personalInfo.website,
              websiteUrl: data.personalInfo.websiteHyperlink?.url,
              websiteDisplay: data.personalInfo.websiteHyperlink?.displayText,
              summary: data.personalInfo.summary,
            },
          });
        }

        // Save master data
        const experienceRecords = await Promise.all(
          data.experiences.map(exp => 
            tx.experience.create({
              data: {
                id: exp.id,
                title: exp.title,
                company: exp.company,
                date: exp.date,
                bullets: exp.bullets,
                tags: exp.tags || [],
              },
            })
          )
        );

        const projectRecords = await Promise.all(
          data.projects.map(project => 
            tx.project.create({
              data: {
                id: project.id,
                title: project.title,
                link: project.link,
                bullets: project.bullets,
                tags: project.tags || [],
              },
            })
          )
        );

        const skillRecords = await Promise.all(
          data.skills.map(skill => 
            tx.skill.create({
              data: {
                id: skill.id,
                name: skill.name,
                details: skill.details,
              },
            })
          )
        );

        const educationRecords = await Promise.all(
          data.education.map(edu => 
            tx.education.create({
              data: {
                id: edu.id,
                title: edu.title,
                details: edu.details,
              },
            })
          )
        );

        // Save profiles
        for (const profile of profiles) {
          const profileRecord = await tx.profile.create({
            data: {
              id: profile.id,
              name: profile.name,
              template: profile.template || 'classic',
              personalInfoId: personalInfoRecord?.id,
              sectionOrder: profile.sectionOrder || ['skills', 'experiences', 'projects', 'education'],
              fontFamily: profile.formatting?.fontFamily,
              primaryColor: profile.formatting?.primaryColor,
              nameFontSize: profile.formatting?.nameFontSize,
              headerFontSize: profile.formatting?.headerFontSize,
              bodyTextFontSize: profile.formatting?.bodyTextFontSize,
              metadataTextFontSize: profile.formatting?.metadataTextFontSize,
              aiOptimizationTimestamp: profile.aiOptimization?.timestamp,
              aiOptimizationKeyInsights: profile.aiOptimization?.keyInsights || [],
              aiOptimizationJobDescHash: profile.aiOptimization?.jobDescriptionHash,
            },
          });

          // Save profile-experience relationships
          for (let i = 0; i < profile.experienceIds.length; i++) {
            const expId = profile.experienceIds[i];
            const overrides = profile.experienceOverrides?.[expId];
            
            await tx.profileExperience.create({
              data: {
                profileId: profileRecord.id,
                experienceId: expId,
                order: i,
                titleOverride: overrides?.title,
                companyOverride: overrides?.company,
                dateOverride: overrides?.date,
                bulletsOverride: overrides?.bullets || [],
                tagsOverride: overrides?.tags || [],
              },
            });
          }

          // Save profile-project relationships
          for (let i = 0; i < profile.projectIds.length; i++) {
            const projectId = profile.projectIds[i];
            const overrides = profile.projectOverrides?.[projectId];
            
            await tx.profileProject.create({
              data: {
                profileId: profileRecord.id,
                projectId: projectId,
                order: i,
                titleOverride: overrides?.title,
                linkOverride: overrides?.link,
                bulletsOverride: overrides?.bullets || [],
                tagsOverride: overrides?.tags || [],
              },
            });
          }

          // Save profile-skill relationships
          for (let i = 0; i < profile.skillIds.length; i++) {
            const skillId = profile.skillIds[i];
            const overrides = profile.skillOverrides?.[skillId];
            
            await tx.profileSkill.create({
              data: {
                profileId: profileRecord.id,
                skillId: skillId,
                order: i,
                nameOverride: overrides?.name,
                detailsOverride: overrides?.details,
              },
            });
          }

          // Save profile-education relationships
          for (let i = 0; i < profile.educationIds.length; i++) {
            const eduId = profile.educationIds[i];
            const overrides = profile.educationOverrides?.[eduId];
            
            await tx.profileEducation.create({
              data: {
                profileId: profileRecord.id,
                educationId: eduId,
                order: i,
                titleOverride: overrides?.title,
                detailsOverride: overrides?.details,
              },
            });
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error saving profiles to PostgreSQL:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while saving'
      };
    }
  }

  /**
   * Loads profiles and master data from PostgreSQL
   * 
   * Retrieves all data with proper relationships and constructs the original
   * Profile and DataBundle structures.
   * 
   * @returns Promise resolving to stored profiles and data, or error result
   */
  async loadProfiles(): Promise<StorageResult<{ profiles: Profile[]; data: DataBundle }>> {
    try {
      // Load all master data
      const [personalInfos, experiences, projects, skills, education, profilesData] = await Promise.all([
        prisma.personalInfo.findMany(),
        prisma.experience.findMany(),
        prisma.project.findMany(),
        prisma.skill.findMany(),
        prisma.education.findMany(),
        prisma.profile.findMany({
          include: {
            personalInfo: true,
            experiences: {
              include: { experience: true },
              orderBy: { order: 'asc' }
            },
            projects: {
              include: { project: true },
              orderBy: { order: 'asc' }
            },
            skills: {
              include: { skill: true },
              orderBy: { order: 'asc' }
            },
            education: {
              include: { education: true },
              orderBy: { order: 'asc' }
            },
          },
        }),
      ]);

        // Construct DataBundle
      const data: DataBundle = {
        personalInfo: personalInfos[0] ? {
          fullName: personalInfos[0].fullName,
          email: personalInfos[0].email,
          phone: personalInfos[0].phone,
          location: personalInfos[0].location,
          linkedin: personalInfos[0].linkedin || undefined,
          linkedinHyperlink: personalInfos[0].linkedinUrl ? {
            url: personalInfos[0].linkedinUrl,
            displayText: personalInfos[0].linkedinDisplay || undefined,
          } : undefined,
          github: personalInfos[0].github || undefined,
          githubHyperlink: personalInfos[0].githubUrl ? {
            url: personalInfos[0].githubUrl,
            displayText: personalInfos[0].githubDisplay || undefined,
          } : undefined,
          website: personalInfos[0].website || undefined,
          websiteHyperlink: personalInfos[0].websiteUrl ? {
            url: personalInfos[0].websiteUrl,
            displayText: personalInfos[0].websiteDisplay || undefined,
          } : undefined,
          summary: personalInfos[0].summary || undefined,
        } : {
          fullName: '',
          email: '',
          phone: '',
          location: '',
        },
        experiences: experiences.map(exp => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          date: exp.date,
          bullets: exp.bullets,
          tags: exp.tags,
        })),
        projects: projects.map(project => ({
          id: project.id,
          title: project.title,
          link: project.link || undefined,
          bullets: project.bullets,
          tags: project.tags,
        })),
        skills: skills.map(skill => ({
          id: skill.id,
          name: skill.name,
          details: skill.details,
        })),
        education: education.map(edu => ({
          id: edu.id,
          title: edu.title,
          details: edu.details,
        })),
      };      // Construct profiles
      const profiles: Profile[] = profilesData.map(profileData => {
        const experienceOverrides: Record<string, Partial<Experience>> = {};
        const projectOverrides: Record<string, Partial<Project>> = {};
        const skillOverrides: Record<string, Partial<Skill>> = {};
        const educationOverrides: Record<string, Partial<Education>> = {};

        // Build overrides
        profileData.experiences.forEach(pe => {
          if (pe.titleOverride || pe.companyOverride || pe.dateOverride || 
              pe.bulletsOverride.length > 0 || pe.tagsOverride.length > 0) {
            experienceOverrides[pe.experienceId] = {
              title: pe.titleOverride || undefined,
              company: pe.companyOverride || undefined,
              date: pe.dateOverride || undefined,
              bullets: pe.bulletsOverride.length > 0 ? pe.bulletsOverride : undefined,
              tags: pe.tagsOverride.length > 0 ? pe.tagsOverride : undefined,
            };
          }
        });

        profileData.projects.forEach(pp => {
          if (pp.titleOverride || pp.linkOverride || 
              pp.bulletsOverride.length > 0 || pp.tagsOverride.length > 0) {
            projectOverrides[pp.projectId] = {
              title: pp.titleOverride || undefined,
              link: pp.linkOverride || undefined,
              bullets: pp.bulletsOverride.length > 0 ? pp.bulletsOverride : undefined,
              tags: pp.tagsOverride.length > 0 ? pp.tagsOverride : undefined,
            };
          }
        });

        profileData.skills.forEach(ps => {
          if (ps.nameOverride || ps.detailsOverride) {
            skillOverrides[ps.skillId] = {
              name: ps.nameOverride || undefined,
              details: ps.detailsOverride || undefined,
            };
          }
        });

        profileData.education.forEach(pe => {
          if (pe.titleOverride || pe.detailsOverride) {
            educationOverrides[pe.educationId] = {
              title: pe.titleOverride || undefined,
              details: pe.detailsOverride || undefined,
            };
          }
        });

        return {
          id: profileData.id,
          name: profileData.name,
          personalInfo: data.personalInfo,
          experienceIds: profileData.experiences.map(pe => pe.experienceId),
          projectIds: profileData.projects.map(pp => pp.projectId),
          skillIds: profileData.skills.map(ps => ps.skillId),
          educationIds: profileData.education.map(pe => pe.educationId),
          experienceOverrides: Object.keys(experienceOverrides).length > 0 ? experienceOverrides : undefined,
          projectOverrides: Object.keys(projectOverrides).length > 0 ? projectOverrides : undefined,
          skillOverrides: Object.keys(skillOverrides).length > 0 ? skillOverrides : undefined,
          educationOverrides: Object.keys(educationOverrides).length > 0 ? educationOverrides : undefined,
          template: profileData.template as 'classic' | 'compact',
          formatting: {
            fontFamily: profileData.fontFamily || undefined,
            primaryColor: profileData.primaryColor || undefined,
            nameFontSize: profileData.nameFontSize || undefined,
            headerFontSize: profileData.headerFontSize || undefined,
            bodyTextFontSize: profileData.bodyTextFontSize || undefined,
            metadataTextFontSize: profileData.metadataTextFontSize || undefined,
          },
          sectionOrder: profileData.sectionOrder as ('skills' | 'experiences' | 'projects' | 'education')[],
          aiOptimization: profileData.aiOptimizationTimestamp ? {
            timestamp: profileData.aiOptimizationTimestamp,
            keyInsights: profileData.aiOptimizationKeyInsights,
            jobDescriptionHash: profileData.aiOptimizationJobDescHash || '',
          } : undefined,
        };
      });

      return { success: true, data: { profiles, data } };
    } catch (error) {
      console.error('Error loading profiles from PostgreSQL:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while loading'
      };
    }
  }

  /**
   * Creates a backup JSON string of all data
   * 
   * @returns Promise resolving to backup string or error result
   */
  async backupData(): Promise<StorageResult<string>> {
    try {
      const result = await this.loadProfiles();
      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'No data to backup' };
      }

      const backup = {
        version: 'v2',
        timestamp: new Date().toISOString(),
        data: result.data
      };

      return { success: true, data: JSON.stringify(backup) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while backing up'
      };
    }
  }

  /**
   * Restores data from a backup string
   * 
   * @param backup - Backup string created by backupData method
   * @returns Promise resolving to operation result
   */
  async restoreData(backup: string): Promise<StorageResult<void>> {
    try {
      const backupData = JSON.parse(backup);
      
      if (!backupData.data || !backupData.version) {
        return { success: false, error: 'Invalid backup format' };
      }

      const { profiles, data } = backupData.data;
      return await this.saveProfiles(profiles, data);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while restoring backup'
      };
    }
  }

  /**
   * Clear all data from PostgreSQL
   */
  async clearData(): Promise<StorageResult<void>> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.profileExperience.deleteMany();
        await tx.profileProject.deleteMany();
        await tx.profileSkill.deleteMany();
        await tx.profileEducation.deleteMany();
        await tx.profile.deleteMany();
        await tx.experience.deleteMany();
        await tx.project.deleteMany();
        await tx.skill.deleteMany();
        await tx.education.deleteMany();
        await tx.personalInfo.deleteMany();
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while clearing data'
      };
    }
  }
}
