import type { Profile, DataBundle, PersonalInfo, Experience, Project, Skill, Education } from '@/lib/types';
import type { StorageResult, ProfileRepository } from './profile.repository';
import { prisma } from '@/lib/prisma';

// Helper function to parse date ranges like "2020 - 2023", "2021 - Present", "2022"
function parseDateRange(dateStr: string): { startDate: Date; endDate: Date | null } {
  const currentYear = new Date().getFullYear();
  
  if (dateStr.includes(' - ')) {
    const [start, end] = dateStr.split(' - ').map(s => s.trim());
    const startDate = parseYear(start, currentYear);
    const endDate = end.toLowerCase() === 'present' ? null : parseYear(end, currentYear);
    return { startDate, endDate };
  } else {
    // Single year or just a year
    const startDate = parseYear(dateStr.trim(), currentYear);
    return { startDate, endDate: null };
  }
}

function parseYear(yearStr: string, fallbackYear: number): Date {
  const year = parseInt(yearStr);
  return isNaN(year) ? new Date(fallbackYear, 0, 1) : new Date(year, 0, 1);
}

// Helper function to format dates back to string format
function formatDateRange(startDate: Date, endDate: Date | null): string {
  const startYear = startDate.getFullYear();
  
  if (!endDate) {
    return `${startYear} - Present`;
  }
  
  const endYear = endDate.getFullYear();
  
  if (startYear === endYear) {
    return startYear.toString();
  }
  
  return `${startYear} - ${endYear}`;
}

export class PostgreSQLProfileRepository implements ProfileRepository {
  
  private handleError(operation: string, error: unknown): { success: false; error: string } {
    console.error(`[PostgreSQLProfileRepository] ${operation} error:`, error);
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes('unique constraint')) {
        return { success: false, error: 'Data conflict: duplicate entry detected' };
      }
      if (error.message.includes('foreign key constraint')) {
        return { success: false, error: 'Data integrity error: invalid reference' };
      }
      if (error.message.includes('not-null constraint')) {
        return { success: false, error: 'Missing required data' };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: false, error: `Unknown error during ${operation.toLowerCase()}` };
  }
  
  async saveProfiles(profiles: Profile[], data: DataBundle, userId: string): Promise<StorageResult<void>> {
    // Validate input data first
    const validationError = this.validateInputData(profiles, data, userId);
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Clear existing data for this user
        const userProfiles = await tx.profile.findMany({ 
          where: { userId }, 
          select: { id: true } 
        });
        const profileIds = userProfiles.map(p => p.id);

        if (profileIds.length > 0) {
          await tx.profileItem.deleteMany({
            where: { profileId: { in: profileIds } }
          });
          await tx.profile.deleteMany({
            where: { userId }
          });
        }
        
        // Delete user's existing master data
        await Promise.all([
          tx.experienceBullet.deleteMany({
            where: { experience: { userId } }
          }),
          tx.experience.deleteMany({ where: { userId } }),
          tx.projectBullet.deleteMany({
            where: { project: { userId } }
          }),
          tx.projectTag.deleteMany({
            where: { project: { userId } }
          }),
          tx.project.deleteMany({ where: { userId } }),
          tx.skill.deleteMany({ where: { userId } }),
          tx.education.deleteMany({ where: { userId } })
        ]);

        // Save personal info
        await tx.personalInfo.upsert({
          where: { userId },
          create: {
            userId,
            firstName: data.personalInfo.fullName.split(' ')[0] || '',
            lastName: data.personalInfo.fullName.split(' ').slice(1).join(' ') || '',
            email: data.personalInfo.email,
            phone: data.personalInfo.phone,
            location: data.personalInfo.location,
            website: data.personalInfo.website,
            summary: data.personalInfo.summary,
          },
          update: {
            firstName: data.personalInfo.fullName.split(' ')[0] || '',
            lastName: data.personalInfo.fullName.split(' ').slice(1).join(' ') || '',
            email: data.personalInfo.email,
            phone: data.personalInfo.phone,
            location: data.personalInfo.location,
            website: data.personalInfo.website,
            summary: data.personalInfo.summary,
          }
        });

        // Handle social links
        const personalInfoRecord = await tx.personalInfo.findUnique({
          where: { userId }
        });

        if (personalInfoRecord) {
          await tx.socialLink.deleteMany({
            where: { personalInfoId: personalInfoRecord.id }
          });

          const socialLinksData = [];
          
          if (data.personalInfo.linkedin) {
            socialLinksData.push({
              personalInfoId: personalInfoRecord.id,
              platform: 'linkedin',
              url: data.personalInfo.linkedinHyperlink?.url || 
                   `https://linkedin.com/in/${data.personalInfo.linkedin}`
            });
          }
          
          if (data.personalInfo.github) {
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

        // Create experiences
        for (const exp of data.experiences) {
          const { startDate, endDate } = parseDateRange(exp.date);
          const experienceRecord = await tx.experience.create({
            data: {
              id: exp.id,
              userId,
              company: exp.company,
              title: exp.title,
              startDate,
              endDate,
            }
          });

          if (exp.bullets && exp.bullets.length > 0) {
            const bulletData = exp.bullets.map((bullet, index) => ({
              experienceId: experienceRecord.id,
              content: bullet,
              order: index
            }));
            await tx.experienceBullet.createMany({ data: bulletData });
          }
        }

        // Create projects
        for (const proj of data.projects) {
          const projectRecord = await tx.project.create({
            data: {
              id: proj.id,
              userId,
              title: proj.title,
              link: proj.link,
            }
          });

          if (proj.bullets && proj.bullets.length > 0) {
            const bulletData = proj.bullets.map((bullet, index) => ({
              projectId: projectRecord.id,
              content: bullet,
              order: index
            }));
            await tx.projectBullet.createMany({ data: bulletData });
          }

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
            }
          });
        }

        // Create educations
        for (const edu of data.education) {
          const { startDate, endDate } = parseDateRange(edu.details || '2020 - 2024');
          await tx.education.create({
            data: {
              id: edu.id,
              userId,
              institution: edu.title.split(',')[1]?.trim() || edu.title,
              degree: edu.title.split(',')[0]?.trim() || edu.title,
              startDate,
              endDate: endDate || new Date(),
            }
          });
        }

        // Create profiles
        for (const profile of profiles) {
          await tx.$executeRaw`
            INSERT INTO profiles (
              id, "userId", "profileName", "templateName", "jobId",
              "resumeConfiguration", "aiOptimizationJobUrl", "aiOptimizationJobDescHash",
              "createdAt", "updatedAt"
            ) VALUES (
              ${profile.id}, ${userId}, ${profile.name}, ${profile.template},
              ${profile.jobId || null}, ${profile.formatting ? JSON.stringify(profile.formatting) : null},
              ${profile.aiOptimization?.jobData?.url || null}, ${profile.aiOptimization?.jobDescriptionHash || null},
              NOW(), NOW()
            )
          `;

          const profileItemData: Array<{
            profileId: string;
            itemType: string;
            itemId: string;
            order: number;
          }> = [];
          
          profile.experienceIds.forEach((expId, index) => {
            profileItemData.push({
              profileId: profile.id,
              itemType: 'experience',
              itemId: expId,
              order: index
            });
          });

          profile.projectIds.forEach((projId, index) => {
            profileItemData.push({
              profileId: profile.id,
              itemType: 'project',
              itemId: projId,
              order: index + 1000
            });
          });

          profile.skillIds.forEach((skillId, index) => {
            profileItemData.push({
              profileId: profile.id,
              itemType: 'skill',
              itemId: skillId,
              order: index + 2000
            });
          });

          profile.educationIds.forEach((eduId, index) => {
            profileItemData.push({
              profileId: profile.id,
              itemType: 'education',
              itemId: eduId,
              order: index + 3000
            });
          });

          if (profileItemData.length > 0) {
            await tx.profileItem.createMany({ data: profileItemData });
          }
        }
      });

      return { success: true };
    } catch (error) {
      return this.handleError('Save', error);
    }
  }

  async loadProfiles(userId: string): Promise<StorageResult<{ profiles: Profile[], data: DataBundle }>> {
    try {
      const [profiles, experiences, projects, skills, educations, personalInfo] = await Promise.all([
        prisma.$queryRaw<Array<{
          id: string;
          profileName: string;
          templateName: string | null;
          jobId: string | null;
          resumeConfiguration: any;
          aiOptimizationJobUrl: string | null;
          aiOptimizationJobDescHash: string | null;
        }>>`
          SELECT id, "profileName", "templateName", "jobId", "resumeConfiguration", 
                 "aiOptimizationJobUrl", "aiOptimizationJobDescHash"
          FROM profiles 
          WHERE "userId" = ${userId}
        `,
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

      // Optimize: Load all profile items in one query instead of N+1
      const allProfileItems = await prisma.profileItem.findMany({
        where: { 
          profileId: { in: profiles.map(p => p.id) }
        },
        orderBy: { order: 'asc' }
      });

      const mappedProfiles: Profile[] = profiles.map(p => {
        const profileItemsData = allProfileItems.filter(item => item.profileId === p.id);
        
        return {
          id: p.id,
          name: p.profileName,
          jobId: p.jobId || undefined,
          template: (p.templateName as 'classic' | 'compact') || 'classic',
          formatting: p.resumeConfiguration ? (p.resumeConfiguration as any) : undefined,
          experienceIds: profileItemsData
            .filter(i => i.itemType === 'experience')
            .map(i => i.itemId),
          projectIds: profileItemsData
            .filter(i => i.itemType === 'project') 
            .map(i => i.itemId),
          skillIds: profileItemsData
            .filter(i => i.itemType === 'skill')
            .map(i => i.itemId),
          educationIds: profileItemsData
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
        };
      });

      const mappedExperiences: Experience[] = experiences.map(e => ({
        id: e.id,
        title: e.title,
        company: e.company,
        date: formatDateRange(e.startDate, e.endDate),
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
        details: e.field || `Graduated ${e.endDate?.getFullYear() || 'Unknown'}`
      }));

      const mappedPersonalInfo = this.mapPersonalInfoFromDb(personalInfo);

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
      const fallbackData = this.createFallbackData();
      const errorResult = this.handleError('Load', error);
      return { 
        ...errorResult,
        data: fallbackData
      };
    }
  }

  private createFallbackData(): { profiles: Profile[], data: DataBundle } {
    const fallbackPersonalInfo: PersonalInfo = {
      fullName: '',
      email: '',
      phone: '',
      location: ''
    };
    return { 
      profiles: [], 
      data: { 
        personalInfo: fallbackPersonalInfo, 
        experiences: [], 
        projects: [], 
        skills: [], 
        education: [] 
      } 
    };
  }

  private mapPersonalInfoFromDb(personalInfo: any): PersonalInfo {
    if (!personalInfo) {
      return { fullName: '', email: '', phone: '', location: '' };
    }

    const linkedinLink = personalInfo.socialLinks?.find((s: any) => s.platform === 'linkedin');
    const githubLink = personalInfo.socialLinks?.find((s: any) => s.platform === 'github');

    return {
      fullName: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim(),
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      location: personalInfo.location || '',
      linkedin: linkedinLink?.url.split('/').pop(),
      linkedinHyperlink: linkedinLink ? {
        url: linkedinLink.url,
        displayText: linkedinLink.url
      } : undefined,
      github: githubLink?.url.split('/').pop(),
      githubHyperlink: githubLink ? {
        url: githubLink.url,
        displayText: githubLink.url
      } : undefined,
      website: personalInfo.website || undefined,
      summary: personalInfo.summary || undefined
    };
  }

  private validateInputData(profiles: Profile[], data: DataBundle, userId: string): string | null {
    if (!userId || typeof userId !== 'string') {
      return 'Invalid user ID';
    }

    if (!Array.isArray(profiles)) {
      return 'Profiles must be an array';
    }

    if (!data || typeof data !== 'object') {
      return 'Data bundle is required';
    }

    // Validate required personal info
    if (!data.personalInfo?.fullName && !data.personalInfo?.email) {
      return 'Personal info must include at least name or email';
    }

    // Validate profile structure
    for (const profile of profiles) {
      if (!profile.id || !profile.name) {
        return 'Each profile must have an ID and name';
      }
    }

    // Validate data arrays
    if (!Array.isArray(data.experiences) || !Array.isArray(data.projects) || 
        !Array.isArray(data.skills) || !Array.isArray(data.education)) {
      return 'Data bundle must contain valid arrays for experiences, projects, skills, and education';
    }

    return null; // No validation errors
  }

  async backupData(userId: string): Promise<StorageResult<string>> {
    try {
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
        version: '2.0',
        data: result.data
      };

      return { 
        success: true, 
        data: JSON.stringify(backup, null, 2)
      };
    } catch (error) {
      return this.handleError('Backup', error);
    }
  }

  async restoreData(backup: string, userId: string): Promise<StorageResult<void>> {
    try {
      const backupData = JSON.parse(backup);
      
      if (!backupData.data || !backupData.data.profiles) {
        return {
          success: false,
          error: 'Invalid backup format'
        };
      }

      return await this.saveProfiles(
        backupData.data.profiles,
        backupData.data.data,
        userId
      );
    } catch (error) {
      return this.handleError('Restore', error);
    }
  }

  async clearData(userId: string): Promise<StorageResult<void>> {
    try {
      await prisma.$transaction(async (tx) => {
        const userProfiles = await tx.profile.findMany({ 
          where: { userId }, 
          select: { id: true } 
        });
        const profileIds = userProfiles.map(p => p.id);

        if (profileIds.length > 0) {
          await tx.profileItem.deleteMany({
            where: { profileId: { in: profileIds } }
          });
          await tx.profile.deleteMany({
            where: { userId }
          });
        }
        
        await Promise.all([
          tx.experienceBullet.deleteMany({
            where: { experience: { userId } }
          }),
          tx.experience.deleteMany({ where: { userId } }),
          tx.projectBullet.deleteMany({
            where: { project: { userId } }
          }),
          tx.projectTag.deleteMany({
            where: { project: { userId } }
          }),
          tx.project.deleteMany({ where: { userId } }),
          tx.skill.deleteMany({ where: { userId } }),
          tx.education.deleteMany({ where: { userId } }),
          tx.socialLink.deleteMany({
            where: { personalInfo: { userId } }
          }),
          tx.personalInfo.deleteMany({ where: { userId } })
        ]);
      });

      return { success: true };
    } catch (error) {
      return this.handleError('Clear', error);
    }
  }
}
