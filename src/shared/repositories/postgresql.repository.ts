import type { Profile, DataBundle, PersonalInfo, Experience, Project, Skill, Education } from '@/shared/lib/types';
import type { StorageResult, ProfileRepository } from './profile.repository';
import { prisma } from '@/shared/lib/prisma';

/**
 * Complete PostgreSQL repository for new schema
 * 
 * This implementation handles the conversion between the legacy type system
 * and our improved normalized database schema with proper user scoping,
 * date handling, and searchable data structures.
 */
export class PostgreSQLProfileRepository implements ProfileRepository {
  
  async saveProfiles(profiles: Profile[], data: DataBundle, userId: string): Promise<StorageResult<void>> {
    try {
      await prisma.$transaction(async (tx) => {
        // Clear existing data for this user only (user-scoped operations)
        const userProfiles = await tx.profile.findMany({ 
          where: { userId }, 
          select: { id: true } 
        });
        const profileIds = userProfiles.map(p => p.id);

        if (profileIds.length > 0) {
          // Delete profile items first (referential integrity)
          await tx.profileItem.deleteMany({
            where: { profileId: { in: profileIds } }
          });
          
          // Delete profiles
          await tx.profile.deleteMany({
            where: { userId }
          });
        }
        
        // Delete user's existing master data
        await Promise.all([
          // Delete experience bullets then experiences
          tx.experienceBullet.deleteMany({
            where: { experience: { userId } }
          }),
          tx.experience.deleteMany({ where: { userId } }),
          
          // Delete project bullets/tags then projects
          tx.projectBullet.deleteMany({
            where: { project: { userId } }
          }),
          tx.projectTag.deleteMany({
            where: { project: { userId } }
          }),
          tx.project.deleteMany({ where: { userId } }),
          
          // Delete skills and educations
          tx.skill.deleteMany({ where: { userId } }),
          tx.education.deleteMany({ where: { userId } })
        ]);

        // Save/update personal info
        await tx.personalInfo.upsert({
          where: { userId },
          create: {
            userId,
            firstName: this.extractFirstName(data.personalInfo.fullName),
            lastName: this.extractLastName(data.personalInfo.fullName),
            email: data.personalInfo.email,
            phone: data.personalInfo.phone,
            location: data.personalInfo.location,
            website: data.personalInfo.website,
            headline: undefined, // Not in legacy schema
            summary: data.personalInfo.summary,
          },
          update: {
            firstName: this.extractFirstName(data.personalInfo.fullName),
            lastName: this.extractLastName(data.personalInfo.fullName),
            email: data.personalInfo.email,
            phone: data.personalInfo.phone,
            location: data.personalInfo.location,
            website: data.personalInfo.website,
            summary: data.personalInfo.summary,
          }
        });

        // Handle social links (create new PersonalInfo first)
        const personalInfoRecord = await tx.personalInfo.findUnique({
          where: { userId }
        });

        if (personalInfoRecord) {
          // Clear existing social links
          await tx.socialLink.deleteMany({
            where: { personalInfoId: personalInfoRecord.id }
          });

          // Create social links from legacy data
          const socialLinksData = [];
          
          if (data.personalInfo.linkedin || data.personalInfo.linkedinHyperlink?.url) {
            socialLinksData.push({
              personalInfoId: personalInfoRecord.id,
              platform: 'linkedin',
              url: data.personalInfo.linkedinHyperlink?.url || 
                   `https://linkedin.com/in/${data.personalInfo.linkedin}`
            });
          }
          
          if (data.personalInfo.github || data.personalInfo.githubHyperlink?.url) {
            socialLinksData.push({
              personalInfoId: personalInfoRecord.id,
              platform: 'github',
              url: data.personalInfo.githubHyperlink?.url || 
                   `https://github.com/${data.personalInfo.github}`
            });
          }

          if (socialLinksData.length > 0) {
            await tx.socialLink.createMany({ data: socialLinksData });
          }
        }

        // Create experiences with bullets
        for (const exp of data.experiences) {
          const experienceRecord = await tx.experience.create({
            data: {
              id: exp.id,
              userId,
              company: exp.company,
              title: exp.title,
              location: undefined, // Not in legacy schema
              startDate: this.parseDate(exp.date, true), // Start of period
              endDate: this.parseDate(exp.date, false),  // End of period
            }
          });

          // Create bullets if they exist
          if (exp.bullets && exp.bullets.length > 0) {
            const bulletData = exp.bullets.map((bullet, index) => ({
              experienceId: experienceRecord.id,
              content: bullet,
              order: index
            }));
            await tx.experienceBullet.createMany({ data: bulletData });
          }
        }

        // Create projects with bullets and tags
        for (const proj of data.projects) {
          const projectRecord = await tx.project.create({
            data: {
              id: proj.id,
              userId,
              title: proj.title,
              link: proj.link,
              startDate: undefined, // Legacy schema doesn't have dates
              endDate: undefined,
            }
          });

          // Create bullets
          if (proj.bullets && proj.bullets.length > 0) {
            const bulletData = proj.bullets.map((bullet, index) => ({
              projectId: projectRecord.id,
              content: bullet,
              order: index
            }));
            await tx.projectBullet.createMany({ data: bulletData });
          }

          // Create tags
          if (proj.tags && proj.tags.length > 0) {
            const tagData = proj.tags.map(tag => ({
              projectId: projectRecord.id,
              name: tag
            }));
            await tx.projectTag.createMany({ data: tagData });
          }
        }

        // Create skills
        for (const skill of data.skills) {
          await tx.skill.create({
            data: {
              id: skill.id,
              userId,
              name: skill.name,
              details: skill.details,
              category: undefined, // TODO: Categorize skills
              level: undefined,    // TODO: Add skill levels
            }
          });
        }

        // Create educations
        for (const edu of data.education) {
          await tx.education.create({
            data: {
              id: edu.id,
              userId,
              institution: this.extractInstitution(edu.title, edu.details),
              degree: this.extractDegree(edu.title, edu.details),
              field: this.extractField(edu.details),
              location: undefined, // Not in legacy schema
              startDate: new Date(2020, 0, 1), // Default date - legacy doesn't have dates
              endDate: new Date(2024, 0, 1),
              gpa: undefined,
            }
          });
        }

        // Create profiles with items
        for (const profile of profiles) {
          const profileRecord = await tx.profile.create({
            data: {
              id: profile.id,
              userId,
              profileName: profile.name,
              templateName: profile.template,
              resumeConfiguration: profile.formatting ? profile.formatting as any : null,
              aiOptimizationJobUrl: profile.aiOptimization?.jobData?.url,
              aiOptimizationJobDescHash: profile.aiOptimization?.jobDescriptionHash,
            }
          });

          // Create profile items
          const profileItemData: Array<{
            profileId: string;
            itemType: string;
            itemId: string;
            order: number;
          }> = [];
          
          // Add experiences
          profile.experienceIds.forEach((expId, index) => {
            profileItemData.push({
              profileId: profileRecord.id,
              itemType: 'experience',
              itemId: expId,
              order: index
            });
          });

          // Add projects
          profile.projectIds.forEach((projId, index) => {
            profileItemData.push({
              profileId: profileRecord.id,
              itemType: 'project',
              itemId: projId,
              order: index + 1000 // Offset to avoid conflicts
            });
          });

          // Add skills
          profile.skillIds.forEach((skillId, index) => {
            profileItemData.push({
              profileId: profileRecord.id,
              itemType: 'skill',
              itemId: skillId,
              order: index + 2000 // Offset to avoid conflicts
            });
          });

          // Add educations
          profile.educationIds.forEach((eduId, index) => {
            profileItemData.push({
              profileId: profileRecord.id,
              itemType: 'education',
              itemId: eduId,
              order: index + 3000 // Offset to avoid conflicts
            });
          });

          if (profileItemData.length > 0) {
            await tx.profileItem.createMany({ data: profileItemData });
          }
        }
      });

      return { 
        success: true, 
        data: undefined
      };
    } catch (error) {
      console.error('[PostgreSQLProfileRepository] Save error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during save',
        data: undefined
      };
    }
  }

  async loadProfiles(userId: string): Promise<StorageResult<{ profiles: Profile[], data: DataBundle }>> {
    try {
      // Load all user data with relationships
      const [profiles, experiences, projects, skills, educations, personalInfo] = await Promise.all([
        prisma.profile.findMany({
          where: { userId },
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        }),
        prisma.experience.findMany({
          where: { userId },
          include: {
            bullets: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { startDate: 'desc' }
        }),
        prisma.project.findMany({
          where: { userId },
          include: {
            bullets: {
              orderBy: { order: 'asc' }
            },
            tags: true
          }
        }),
        prisma.skill.findMany({
          where: { userId },
          orderBy: { name: 'asc' }
        }),
        prisma.education.findMany({
          where: { userId },
          orderBy: { startDate: 'desc' }
        }),
        prisma.personalInfo.findUnique({
          where: { userId },
          include: {
            socialLinks: true
          }
        })
      ]);

      // Convert database models to legacy types
      const mappedProfiles: Profile[] = profiles.map(p => ({
        id: p.id,
        name: p.profileName,
        template: (p.templateName as 'classic' | 'compact') || 'classic',
        formatting: p.resumeConfiguration ? (p.resumeConfiguration as any) : undefined,
        experienceIds: p.items
          .filter(i => i.itemType === 'experience')
          .map(i => i.itemId),
        projectIds: p.items
          .filter(i => i.itemType === 'project') 
          .map(i => i.itemId),
        skillIds: p.items
          .filter(i => i.itemType === 'skill')
          .map(i => i.itemId),
        educationIds: p.items
          .filter(i => i.itemType === 'education')
          .map(i => i.itemId),
        aiOptimization: p.aiOptimizationJobUrl ? {
          timestamp: new Date().toISOString(),
          keyInsights: [],
          jobDescriptionHash: p.aiOptimizationJobDescHash || '',
          jobData: {
            url: p.aiOptimizationJobUrl
          }
        } : undefined
      }));

      const mappedExperiences: Experience[] = experiences.map(e => ({
        id: e.id,
        title: e.title,
        company: e.company,
        date: this.formatDateRange(e.startDate, e.endDate),
        bullets: e.bullets.map(b => b.content)
      }));

      const mappedProjects: Project[] = projects.map(p => ({
        id: p.id,
        title: p.title,
        link: p.link || undefined,
        bullets: p.bullets.map(b => b.content),
        tags: p.tags.map(t => t.name)
      }));

      const mappedSkills: Skill[] = skills.map(s => ({
        id: s.id,
        name: s.name,
        details: s.details || ''
      }));

      const mappedEducations: Education[] = educations.map(e => ({
        id: e.id,
        title: `${e.degree}, ${e.institution}`,
        details: e.field ? `Field: ${e.field}` : `Graduated ${e.endDate?.getFullYear() || 'Unknown'}`
      }));

      // Build personal info from normalized data
      const linkedinLink = personalInfo?.socialLinks.find(s => s.platform === 'linkedin');
      const githubLink = personalInfo?.socialLinks.find(s => s.platform === 'github');

      const mappedPersonalInfo: PersonalInfo = {
        fullName: personalInfo ? 
          `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() : '',
        email: personalInfo?.email || '',
        phone: personalInfo?.phone || '',
        location: personalInfo?.location || '',
        linkedin: linkedinLink ? this.extractUsernameFromUrl(linkedinLink.url, 'linkedin') : undefined,
        linkedinHyperlink: linkedinLink ? {
          url: linkedinLink.url,
          displayText: linkedinLink.url
        } : undefined,
        github: githubLink ? this.extractUsernameFromUrl(githubLink.url, 'github') : undefined,
        githubHyperlink: githubLink ? {
          url: githubLink.url,
          displayText: githubLink.url
        } : undefined,
        website: personalInfo?.website || undefined,
        summary: personalInfo?.summary || undefined
      };

      const dataBundle: DataBundle = {
        personalInfo: mappedPersonalInfo,
        experiences: mappedExperiences,
        projects: mappedProjects,
        skills: mappedSkills,
        education: mappedEducations
      };

      return { 
        success: true, 
        data: { profiles: mappedProfiles, data: dataBundle }
      };
    } catch (error) {
      console.error('[PostgreSQLProfileRepository] Load error:', error);
      const fallbackPersonalInfo: PersonalInfo = {
        fullName: '',
        email: '',
        phone: '',
        location: ''
      };
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during load',
        data: { profiles: [], data: { personalInfo: fallbackPersonalInfo, experiences: [], projects: [], skills: [], education: [] } }
      };
    }
  }

  async backupData(userId: string): Promise<StorageResult<string>> {
    try {
      // Load all user data
      const result = await this.loadProfiles(userId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Failed to load data for backup'
        };
      }

      const backup = {
        timestamp: new Date().toISOString(),
        userId,
        version: '2.0', // New schema version
        data: result.data
      };

      return { 
        success: true, 
        data: JSON.stringify(backup, null, 2)
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during backup'
      };
    }
  }

  async restoreData(backup: string, userId: string): Promise<StorageResult<void>> {
    try {
      const backupData = JSON.parse(backup);
      
      // Validate backup format
      if (!backupData.data || !backupData.data.profiles) {
        return {
          success: false,
          error: 'Invalid backup format',
          data: undefined
        };
      }

      // Restore using save functionality
      const saveResult = await this.saveProfiles(
        backupData.data.profiles,
        backupData.data.data,
        userId
      );

      return saveResult;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during restore',
        data: undefined
      };
    }
  }

  async clearData(userId: string): Promise<StorageResult<void>> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get user profiles
        const userProfiles = await tx.profile.findMany({ 
          where: { userId }, 
          select: { id: true } 
        });
        const profileIds = userProfiles.map(p => p.id);

        if (profileIds.length > 0) {
          // Delete profile items
          await tx.profileItem.deleteMany({
            where: { profileId: { in: profileIds } }
          });
          
          // Delete profiles
          await tx.profile.deleteMany({
            where: { userId }
          });
        }
        
        // Delete all user data
        await Promise.all([
          // Delete experience bullets then experiences
          tx.experienceBullet.deleteMany({
            where: { experience: { userId } }
          }),
          tx.experience.deleteMany({ where: { userId } }),
          
          // Delete project bullets/tags then projects
          tx.projectBullet.deleteMany({
            where: { project: { userId } }
          }),
          tx.projectTag.deleteMany({
            where: { project: { userId } }
          }),
          tx.project.deleteMany({ where: { userId } }),
          
          // Delete skills and educations
          tx.skill.deleteMany({ where: { userId } }),
          tx.education.deleteMany({ where: { userId } }),
          
          // Delete social links and personal info
          tx.socialLink.deleteMany({
            where: { personalInfo: { userId } }
          }),
          tx.personalInfo.deleteMany({ where: { userId } })
        ]);
      });

      return { 
        success: true, 
        data: undefined
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during clear',
        data: undefined
      };
    }
  }

  // Helper methods for data conversion

  /**
   * Extract first name from full name
   */
  private extractFirstName(fullName: string): string | null {
    if (!fullName) return null;
    const parts = fullName.trim().split(' ');
    return parts[0] || null;
  }

  /**
   * Extract last name from full name  
   */
  private extractLastName(fullName: string): string | null {
    if (!fullName) return null;
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : null;
  }

  /**
   * Parse date string into Date object (handles legacy date formats)
   */
  private parseDate(dateString: string, isStart: boolean = true): Date {
    if (!dateString) {
      return new Date();
    }
    
    // Handle "MM/YYYY - MM/YYYY" format
    if (dateString.includes(' - ')) {
      const [start, end] = dateString.split(' - ');
      return this.parseDate(isStart ? start : end, true);
    }
    
    // Handle "MM/YYYY" format
    const parts = dateString.trim().split('/');
    if (parts.length === 2) {
      const month = parseInt(parts[0]) - 1; // 0-indexed
      const year = parseInt(parts[1]);
      return new Date(year, month, isStart ? 1 : new Date(year, month + 1, 0).getDate());
    }
    
    // Handle "YYYY" format
    if (parts.length === 1 && parts[0].length === 4) {
      const year = parseInt(parts[0]);
      return new Date(year, isStart ? 0 : 11, isStart ? 1 : 31);
    }
    
    // Try to parse as regular date
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    // Default fallback
    return new Date();
  }

  /**
   * Extract institution name from education title/details
   */
  private extractInstitution(title: string, details: string): string {
    // Common pattern: "Degree, Institution" or "Institution"
    if (title.includes(',')) {
      const parts = title.split(',');
      return parts[parts.length - 1].trim();
    }
    return title || 'Unknown Institution';
  }

  /**
   * Extract degree from education title/details
   */
  private extractDegree(title: string, details: string): string {
    // Common pattern: "Degree, Institution" 
    if (title.includes(',')) {
      return title.split(',')[0].trim();
    }
    return details || title || 'Unknown Degree';
  }

  /**
   * Extract field of study from education details
   */
  private extractField(details: string): string | null {
    // This is a simplified extraction - could be enhanced
    if (details && details.toLowerCase().includes('in ')) {
      const parts = details.split(/\bin\s+/i);
      if (parts.length > 1) {
        return parts[1].trim();
      }
    }
    return null;
  }

  /**
   * Format date range for display (converts back to legacy format)
   */
  private formatDateRange(startDate: Date, endDate: Date | null): string {
    const formatMonth = (date: Date) => {
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const start = formatMonth(startDate);
    const end = endDate ? formatMonth(endDate) : 'Present';
    
    return `${start} - ${end}`;
  }

  /**
   * Extract username from social media URL
   */
  private extractUsernameFromUrl(url: string, platform: string): string | undefined {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      if (platform === 'linkedin') {
        // Extract from /in/username or /company/companyname
        const match = pathname.match(/\/in\/([^\/]+)/);
        return match ? match[1] : undefined;
      }
      
      if (platform === 'github') {
        // Extract from /username
        const match = pathname.match(/\/([^\/]+)$/);
        return match ? match[1] : undefined;
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }
}
