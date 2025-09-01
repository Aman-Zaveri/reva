import type { Profile, DataBundle, Experience, Project, Skill, Education } from '@/lib/types';
import { GeminiService } from './gemini.service';

export interface OptimizationRequest {
  jobDescription: string;
  profile: Profile;
  data: DataBundle;
}

export interface OptimizationResult {
  personalInfo?: {
    summary?: string;
  };
  experienceOptimizations?: Array<{
    id: string;
    bullets: string[];
    tags: string[];
  }>;
  projectOptimizations?: Array<{
    id: string;
    bullets: string[];
    tags: string[];
  }>;
  recommendedExperienceOrder?: string[];
  recommendedProjectOrder?: string[];
  recommendedSkillOrder?: string[];
  keyInsights: string[];
}

export interface ProfileUpdates extends Partial<Profile> {
  aiOptimization?: {
    timestamp: string;
    keyInsights: string[];
    jobDescriptionHash: string;
  };
}

/**
 * Service for AI-powered resume optimization
 */
export class ResumeOptimizationService {
  
  /**
   * Optimize a resume profile based on job description
   */
  static async optimizeResume(request: OptimizationRequest): Promise<ProfileUpdates> {
    const { jobDescription, profile, data } = request;
    
    // Validate input
    this.validateOptimizationRequest(request);
    
    // Get current profile data
    const profileData = this.extractProfileData(profile, data);
    
    // Generate optimization prompt
    const { systemPrompt, userPrompt } = this.buildOptimizationPrompt(
      jobDescription,
      profileData
    );
    
    // Get AI optimization suggestions
    const optimizations = await GeminiService.generateStructuredResponse<OptimizationResult>(
      systemPrompt,
      userPrompt
    );
    
    // Convert AI suggestions to profile updates
    const profileUpdates = this.convertToProfileUpdates(optimizations, profile, jobDescription);
    
    return profileUpdates;
  }

  /**
   * Validate optimization request
   */
  private static validateOptimizationRequest(request: OptimizationRequest): void {
    const { jobDescription, profile, data } = request;
    
    if (!jobDescription?.trim()) {
      throw new Error('Job description is required');
    }
    
    if (!profile?.id) {
      throw new Error('Valid profile is required');
    }
    
    if (!data) {
      throw new Error('Profile data is required');
    }
    
    if (jobDescription.length < 50) {
      throw new Error('Job description is too short. Please provide a more detailed description.');
    }
  }

  /**
   * Extract relevant data from profile
   */
  private static extractProfileData(profile: Profile, data: DataBundle) {
    const currentExperiences = profile.experienceIds
      .map(id => data.experiences.find(exp => exp.id === id))
      .filter(Boolean) as Experience[];

    const currentProjects = profile.projectIds
      .map(id => data.projects.find(proj => proj.id === id))
      .filter(Boolean) as Project[];

    const currentSkills = profile.skillIds
      .map(id => data.skills.find(skill => skill.id === id))
      .filter(Boolean) as Skill[];

    const currentEducation = profile.educationIds
      .map(id => data.education.find(edu => edu.id === id))
      .filter(Boolean) as Education[];

    return {
      personalInfo: profile.personalInfo,
      experiences: currentExperiences,
      projects: currentProjects,
      skills: currentSkills,
      education: currentEducation
    };
  }

  /**
   * Build optimization prompts
   */
  private static buildOptimizationPrompt(jobDescription: string, profileData: any) {
    const systemPrompt = `You are an expert resume optimization AI. Your task is to analyze a job description and optimize a resume to better match the requirements while keeping the content truthful and authentic.

Guidelines:
1. Only suggest modifications that are truthful and based on existing experience
2. Optimize bullet points to highlight relevant skills and achievements
3. Suggest skill emphasis that matches the job requirements
4. Recommend summary changes that align with the role
5. Prioritize experiences and projects that are most relevant
6. Use industry keywords from the job description when appropriate
7. Maintain professional tone and formatting

IMPORTANT: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. The response must be parseable JSON.

Return your response as a JSON object with the following structure:
{
  "personalInfo": {
    "summary": "optimized summary that aligns with the job"
  },
  "experienceOptimizations": [
    {
      "id": "experience_id",
      "bullets": ["optimized bullet points"],
      "tags": ["relevant tags"]
    }
  ],
  "projectOptimizations": [
    {
      "id": "project_id", 
      "bullets": ["optimized bullet points"],
      "tags": ["relevant tags"]
    }
  ],
  "recommendedExperienceOrder": ["exp_id_1", "exp_id_2"],
  "recommendedProjectOrder": ["proj_id_1", "proj_id_2"],
  "recommendedSkillOrder": ["skill_id_1", "skill_id_2"],
  "keyInsights": [
    "Insight about what was optimized and why"
  ]
}`;

    const userPrompt = `
Job Description:
${jobDescription}

Current Resume Data:

Personal Info:
${JSON.stringify(profileData.personalInfo, null, 2)}

Experiences:
${JSON.stringify(profileData.experiences, null, 2)}

Projects:
${JSON.stringify(profileData.projects, null, 2)}

Skills:
${JSON.stringify(profileData.skills, null, 2)}

Education:
${JSON.stringify(profileData.education, null, 2)}

Please optimize this resume to better match the job description while keeping all information truthful and authentic.`;

    return { systemPrompt, userPrompt };
  }

  /**
   * Convert AI optimization results to profile updates
   */
  private static convertToProfileUpdates(
    optimizations: OptimizationResult,
    profile: Profile,
    jobDescription: string
  ): ProfileUpdates {
    const profileUpdates: ProfileUpdates = {};

    // Update personal info if suggested
    if (optimizations.personalInfo && profile.personalInfo) {
      profileUpdates.personalInfo = {
        ...profile.personalInfo,
        ...optimizations.personalInfo
      };
    }

    // Create experience overrides
    if (optimizations.experienceOptimizations) {
      profileUpdates.experienceOverrides = { ...profile.experienceOverrides };
      optimizations.experienceOptimizations.forEach((opt) => {
        if (profileUpdates.experienceOverrides) {
          profileUpdates.experienceOverrides[opt.id] = {
            bullets: opt.bullets,
            tags: opt.tags
          };
        }
      });
    }

    // Create project overrides
    if (optimizations.projectOptimizations) {
      profileUpdates.projectOverrides = { ...profile.projectOverrides };
      optimizations.projectOptimizations.forEach((opt) => {
        if (profileUpdates.projectOverrides) {
          profileUpdates.projectOverrides[opt.id] = {
            bullets: opt.bullets,
            tags: opt.tags
          };
        }
      });
    }

    // Reorder items based on recommendations
    if (optimizations.recommendedExperienceOrder) {
      profileUpdates.experienceIds = optimizations.recommendedExperienceOrder;
    }
    if (optimizations.recommendedProjectOrder) {
      profileUpdates.projectIds = optimizations.recommendedProjectOrder;
    }
    if (optimizations.recommendedSkillOrder) {
      profileUpdates.skillIds = optimizations.recommendedSkillOrder;
    }

    // Add metadata about the optimization
    profileUpdates.aiOptimization = {
      timestamp: new Date().toISOString(),
      keyInsights: optimizations.keyInsights || [],
      jobDescriptionHash: Buffer.from(jobDescription).toString('base64').slice(0, 20)
    };

    return profileUpdates;
  }

  /**
   * Generate a job description hash for caching
   */
  static generateJobDescriptionHash(jobDescription: string): string {
    return Buffer.from(jobDescription).toString('base64').slice(0, 20);
  }

  /**
   * Check if optimization is still valid based on job description
   */
  static isOptimizationStale(
    profile: Profile,
    currentJobDescription: string,
    maxAgeHours: number = 24
  ): boolean {
    if (!profile.aiOptimization) return true;
    
    const optimizationDate = new Date(profile.aiOptimization.timestamp);
    const hoursSinceOptimization = (Date.now() - optimizationDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceOptimization > maxAgeHours) return true;
    
    const currentHash = this.generateJobDescriptionHash(currentJobDescription);
    return currentHash !== profile.aiOptimization.jobDescriptionHash;
  }
}
