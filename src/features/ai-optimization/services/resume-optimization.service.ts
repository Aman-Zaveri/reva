import type { Profile, DataBundle, Experience, Project, Skill, Education } from '@/shared/lib/types';
import { GeminiService } from '@/shared/services/gemini.service';

/**
 * Request parameters for resume optimization
 */
export interface OptimizationRequest {
  /** Job description text to optimize the resume against */
  jobDescription: string;
  /** Profile to be optimized */
  profile: Profile;
  /** Master data bundle containing all experiences, projects, etc. */
  data: DataBundle;
  /** AI enhancement level (1-5, where 1 is conservative and 5 is aggressive) */
  glazeLevel?: number;
}

/**
 * AI-generated optimization suggestions for a resume
 */
export interface OptimizationResult {
  /** Optimized personal information (summary, etc.) */
  personalInfo?: {
    summary?: string;
  };
  /** Optimized experience bullet points and tags */
  experienceOptimizations?: Array<{
    id: string;
    bullets: string[];
    tags: string[];
  }>;
  /** Optimized project bullet points and tags */
  projectOptimizations?: Array<{
    id: string;
    bullets: string[];
    tags: string[];
  }>;
  /** Recommended order for experience items (most relevant first) */
  recommendedExperienceOrder?: string[];
  /** Recommended order for project items (most relevant first) */
  recommendedProjectOrder?: string[];
  /** Recommended order for skill categories (most relevant first) */
  recommendedSkillOrder?: string[];
  /** Key insights about what was optimized and why */
  keyInsights: string[];
}

/**
 * Profile updates structure for applying AI optimizations
 * Extends Profile with partial updates that can be applied selectively
 */
export interface ProfileUpdates extends Partial<Profile> {
  /** AI optimization metadata for tracking and caching */
  aiOptimization?: {
    timestamp: string;
    keyInsights: string[];
    jobDescriptionHash: string;
  };
}

/**
 * Service for AI-powered resume optimization using Google Gemini
 * 
 * This service analyzes job descriptions and automatically optimizes resumes by:
 * - Rewriting bullet points to better match job requirements
 * - Suggesting new professional summaries
 * - Reordering sections based on relevance
 * - Adding relevant keywords and tags
 * - Providing insights about the changes made
 * 
 * The service supports different "glaze levels" for controlling how aggressive
 * the optimization should be, from conservative (truthful, minor improvements)
 * to aggressive (maximum enhancement while staying plausible).
 */
export class ResumeOptimizationService {
  
  /**
   * Optimizes a resume profile based on a job description using AI
   * 
   * This is the main entry point for resume optimization. It coordinates the entire
   * process from validation through AI generation to profile update creation.
   * 
   * @param request - Optimization request containing job description, profile, and settings
   * @returns Promise resolving to profile updates that can be applied to the resume
   * @throws Error if validation fails or AI generation encounters issues
   * 
   * @example
   * ```typescript
   * const updates = await ResumeOptimizationService.optimizeResume({
   *   jobDescription: "Software Engineer position requiring React and Node.js...",
   *   profile: userProfile,
   *   data: masterData,
   *   glazeLevel: 2
   * });
   * ```
   */
  static async optimizeResume(request: OptimizationRequest): Promise<ProfileUpdates> {
    const { jobDescription, profile, data, glazeLevel = 2 } = request;
    
    // Validate input
    this.validateOptimizationRequest(request);
    
    // Get current profile data
    const profileData = this.extractProfileData(profile, data);
    
    // Generate optimization prompt
    const { systemPrompt, userPrompt } = this.buildOptimizationPrompt(
      jobDescription,
      profileData,
      glazeLevel
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
   * Validates the optimization request parameters
   * 
   * Ensures all required fields are present and meet minimum quality requirements.
   * Throws descriptive errors for any validation failures.
   * 
   * @param request - The optimization request to validate
   * @throws Error with specific message if validation fails
   * @private
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
   * Extracts relevant data from profile and master data bundle
   * 
   * Resolves profile item IDs to actual data objects and filters out any
   * missing items. This creates a clean dataset for AI optimization.
   * 
   * @param profile - The profile containing item IDs
   * @param data - Master data bundle containing all available items
   * @returns Structured profile data with resolved objects
   * @private
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
   * Builds system and user prompts for AI optimization
   * 
   * Creates detailed prompts that instruct the AI on how to optimize the resume
   * based on the specified glaze level. The system prompt defines the role and
   * output format, while the user prompt provides the specific data to optimize.
   * 
   * @param jobDescription - The job description to optimize against
   * @param profileData - Structured profile data to be optimized
   * @param glazeLevel - Enhancement level (1-5) controlling optimization aggressiveness
   * @returns Object containing system and user prompts for AI generation
   * @private
   */
  private static buildOptimizationPrompt(
    jobDescription: string, 
    profileData: {
      personalInfo: Profile['personalInfo'];
      experiences: Experience[];
      projects: Project[];
      skills: Skill[];
      education: Education[];
    }, 
    glazeLevel: number = 2
  ) {
    // Define glaze level characteristics
    const glazeInstructions = this.getGlazeInstructions(glazeLevel);
    
    const systemPrompt = `You are an expert resume optimization AI. Your task is to analyze a job description and optimize a resume to better match the requirements.

${glazeInstructions}

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
   * Converts AI optimization results into profile updates structure
   * 
   * Transforms the AI's suggested changes into the proper profile update format
   * that can be applied to the user's profile. Preserves existing data while
   * adding optimization overrides and metadata.
   * 
   * @param optimizations - AI-generated optimization suggestions
   * @param profile - Original profile being optimized
   * @param jobDescription - Job description used for optimization (for metadata)
   * @returns Profile updates object ready to be applied
   * @private
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

    // Create profile-specific overrides for experiences
    // This allows customizing experience bullet points for this profile
    // without affecting the master data used by other profiles
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

    // Create profile-specific overrides for projects
    // Similar to experiences, this allows per-profile customization
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
   * Generates a short hash of the job description for caching and comparison
   * 
   * Used to track whether an optimization is still valid for the same job
   * description, enabling intelligent caching of optimization results.
   * 
   * @param jobDescription - Job description text to hash
   * @returns Short base64 hash string
   */
  static generateJobDescriptionHash(jobDescription: string): string {
    return Buffer.from(jobDescription).toString('base64').slice(0, 20);
  }

  /**
   * Determines if an existing optimization is outdated and should be refreshed
   * 
   * Checks both the age of the optimization and whether the job description
   * has changed since the optimization was generated.
   * 
   * @param profile - Profile containing potential optimization metadata
   * @param currentJobDescription - Current job description to compare against
   * @param maxAgeHours - Maximum age in hours before optimization is considered stale
   * @returns true if optimization should be regenerated, false if still valid
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

  /**
   * Gets glaze-level specific instructions for AI optimization
   * 
   * Each glaze level represents a different approach to resume enhancement:
   * - Level 1: Conservative, truthful improvements only
   * - Level 2: Professional optimization with industry keywords
   * - Level 3: Confident presentation of achievements
   * - Level 4: Aggressive enhancement (use with caution)
   * - Level 5: Maximum enhancement (requires careful review)
   * 
   * @param glazeLevel - Enhancement level (1-5)
   * @returns Detailed instructions for the AI on how to optimize content
   * @private
   */
  private static getGlazeInstructions(glazeLevel: number): string {
    switch (glazeLevel) {
      case 1:
        return `Enhancement Level: CONSERVATIVE (1/5)
Guidelines:
1. Only suggest modifications that are completely truthful and based on existing experience
2. Use exact facts and achievements without embellishment
3. Focus on better phrasing and organization rather than content changes
4. Maintain very professional and modest tone
5. Avoid any language that could be considered exaggerated`;

      case 2:
        return `Enhancement Level: PROFESSIONAL (2/5) 
Guidelines:
1. Optimize bullet points to highlight relevant skills and achievements
2. Use strong action verbs and quantified results when available
3. Suggest skill emphasis that matches job requirements
4. Recommend summary changes that align with the role
5. Maintain professional tone and truthful representation
6. Use industry keywords from the job description when appropriate`;

      case 3:
        return `Enhancement Level: CONFIDENT (3/5)
Guidelines:
1. Use bold, assertive language to present achievements
2. Emphasize impact and leadership aspects of experiences
3. Frame responsibilities in terms of outcomes and value delivered
4. Use confident phrasing like "led," "drove," "delivered," "achieved"
5. Highlight potential and growth trajectory
6. Present experience in most favorable but truthful light`;

      case 4:
        return `Enhancement Level: AGGRESSIVE (4/5) - Use with caution
Guidelines:
1. Amplify achievements and use generous interpretations of experience
2. Present responsibilities as if they had maximum possible impact
3. Use superlative language where reasonable ("key," "critical," "essential")
4. Stretch timelines and scope within reasonable bounds
5. Present learning experiences as expertise where plausible
6. Focus on potential applications of skills rather than just demonstrated use
WARNING: Ensure enhanced content could reasonably be defended in an interview`;

      case 5:
        return `Enhancement Level: MAXIMUM (5/5) - EXTREME CAUTION REQUIRED
Guidelines:
1. Use maximum enhancement and ambitious interpretations
2. Present any exposure to technology/skill as proficiency
3. Frame any team participation as leadership experience  
4. Amplify project scope and personal contribution significantly
5. Use strongest possible language for all achievements
6. Present aspirational skills as current capabilities
CRITICAL WARNING: This level may produce content that significantly embellishes reality. Review carefully for accuracy and ethical considerations.`;

      default:
        return this.getGlazeInstructions(2); // Default to professional
    }
  }
}
