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
  /** Additional custom instructions for the AI optimization */
  customInstructions?: string;
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
    changes: string[]; // What specific changes were made to this experience
  }>;
  /** Optimized project bullet points and tags */
  projectOptimizations?: Array<{
    id: string;
    bullets: string[];
    tags: string[];
    changes: string[]; // What specific changes were made to this project
  }>;
  /** Optimized skill categories with new technical skills */
  skillOptimizations?: Array<{
    id: string;
    name: string;
    details: string;
    changes: string[]; // What specific changes were made to this skill
  }>;
  /** New skills to add that are mentioned in job but missing from resume */
  newSkills?: Array<{
    name: string;
    details: string;
    reason: string; // Why this skill was added (from job requirements)
  }>;
  /** Recommended order for experience items (most relevant first) */
  recommendedExperienceOrder?: string[];
  /** Recommended order for project items (most relevant first) */
  recommendedProjectOrder?: string[];
  /** Recommended order for skill categories (most relevant first) */
  recommendedSkillOrder?: string[];
  /** Key insights about what was optimized and why */
  keyInsights: string[];
  /** Detailed analysis of changes made */
  changeAnalysis: {
    /** Overall score of how well the resume matches the job (0-100) */
    jobAlignmentScore: number;
    /** Explanation of how the score is calculated */
    scoreExplanation: string;
    /** Technologies from job that were added to resume */
    technologiesAdded: string[];
    /** Skills that were enhanced or modified */
    skillsEnhanced: string[];
    /** Content areas that were rewritten */
    contentRewritten: string[];
    /** Keywords from job description that were incorporated */
    keywordsIncorporated: string[];
    /** Summary of all changes made */
    totalChanges: number;
  };
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
    changeAnalysis?: {
      jobAlignmentScore: number;
      scoreExplanation: string;
      technologiesAdded: string[];
      skillsEnhanced: string[];
      contentRewritten: string[];
      keywordsIncorporated: string[];
      totalChanges: number;
    };
    newSkills?: Array<{
      name: string;
      details: string;
      reason: string;
    }>;
    skillOptimizations?: Array<{
      id: string;
      name: string;
      details: string;
      changes: string[];
    }>;
    jobData?: {
      title: string;
      company: string;
      description: string;
      url: string;
      extractedAt: string;
    };
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
    const { jobDescription, profile, data, glazeLevel = 2, customInstructions } = request;
    
    // Validate input
    this.validateOptimizationRequest(request);
    
    // Get current profile data
    const profileData = this.extractProfileData(profile, data);
    
    // Generate optimization prompt
    const { systemPrompt, userPrompt } = this.buildOptimizationPrompt(
      jobDescription,
      profileData,
      glazeLevel,
      customInstructions
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
   * @param customInstructions - Additional user-provided instructions for optimization
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
    glazeLevel: number = 2,
    customInstructions?: string
  ) {
    // Define glaze level characteristics
    const glazeInstructions = this.getGlazeInstructions(glazeLevel);
    
    const systemPrompt = `You are an expert resume optimization AI specializing in technical content enhancement. Your primary task is to analyze job descriptions and aggressively add technical skills, frameworks, and technologies to resumes.

CORE MISSION: Extract EVERY technical term, tool, framework, programming language, platform, and methodology from the job description and integrate them into the resume. YOU MUST MAKE SUBSTANTIAL CHANGES - aim for 15-30+ individual modifications.

${glazeInstructions}

TECHNICAL CONTENT REQUIREMENTS:
1. SCAN the job description for ALL technical terms (React, Python, AWS, Docker, Kubernetes, etc.)
2. ADD these technologies to relevant experience bullets, projects, and skills sections
3. CREATE new skill categories if needed to accommodate job-required technologies
4. INJECT specific technical implementations into existing experience descriptions
5. ENSURE every job-required technology appears somewhere in the optimized resume
6. REWRITE experience bullets to include specific technologies and methodologies
7. ENHANCE project descriptions with detailed technical implementations
8. ADD performance metrics, scalability details, and technical achievements

COMPREHENSIVE CHANGE REQUIREMENTS:
- Modify AT LEAST 80% of existing experience bullet points
- Add specific technologies to ALL project descriptions
- Create/enhance skill categories to match job requirements
- Incorporate industry-specific terminology and methodologies
- Add quantifiable metrics where possible (performance, scale, impact)
- Rewrite content to match the exact technical stack mentioned in the job

JOB ALIGNMENT SCORE CALCULATION:
Calculate a score (0-100) based on:
- Technology Match (50%): How many job-required technologies are now in the resume
- Experience Relevance (30%): How well experiences align with job responsibilities  
- Keyword Optimization (20%): How many job keywords are incorporated

CHANGE TRACKING: You must track and report EVERY change made including:
- Specific technologies added to each section
- Content that was rewritten or enhanced
- New skills added and why
- Keywords incorporated from job description
- Total count of all modifications made

CRITICAL FORMATTING RULES:
- NEVER use markdown formatting in your response (no **bold**, *italic*, or any asterisks)
- All text must be plain text only - no special formatting symbols
- Do not wrap words or phrases in ** or any other markdown syntax
- Return clean, professional text without any formatting marks
- Bullet points should be plain text without any markdown emphasis

IMPORTANT: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. The response must be parseable JSON.

CRITICAL RULE FOR SUMMARY: Only include a "summary" field in personalInfo if the user already has an existing summary in their profile. If they have no summary, do not create one - leave the personalInfo object empty or omit it entirely.

${customInstructions ? `
ADDITIONAL USER INSTRUCTIONS:
${customInstructions}

Please incorporate these specific instructions into your optimization while following all other guidelines above.
` : ''}

Return your response as a JSON object with the following structure:
{
  "personalInfo": {
    "summary": "optimized summary that aligns with the job" // ONLY if user already has a summary
  },
  "experienceOptimizations": [
    {
      "id": "experience_id",
      "bullets": ["optimized bullet points with specific technologies from job"],
      "tags": ["relevant technical tags from job description"],
      "changes": ["Added React framework", "Enhanced cloud deployment details", "Incorporated specific metrics"]
    }
  ],
  "projectOptimizations": [
    {
      "id": "project_id", 
      "bullets": ["optimized bullet points with job-specific technologies"],
      "tags": ["technical frameworks and tools from job"],
      "changes": ["Added Docker containerization", "Enhanced API development details"]
    }
  ],
  "skillOptimizations": [
    {
      "id": "skill_id",
      "name": "Enhanced skill category name",
      "details": "Enhanced details with job-specific technologies added",
      "changes": ["Added TypeScript", "Enhanced database technologies", "Added cloud platforms"]
    }
  ],
  "newSkills": [
    {
      "name": "New Technical Category",
      "details": "Technologies from job description that weren't in original resume",
      "reason": "Job requires expertise in X technology which was missing from resume"
    }
  ],
  "recommendedExperienceOrder": ["exp_id_1", "exp_id_2"],
  "recommendedProjectOrder": ["proj_id_1", "proj_id_2"],
  "recommendedSkillOrder": ["skill_id_1", "skill_id_2"],
  "keyInsights": [
    "Added specific technologies from job description",
    "Enhanced technical skills to match requirements"
  ],
  "changeAnalysis": {
    "jobAlignmentScore": 85,
    "scoreExplanation": "Score calculated based on: 70% technology match (added React, Node.js, AWS), 15% experience relevance (enhanced backend experience), 15% keyword optimization",
    "technologiesAdded": ["React", "Node.js", "AWS", "Docker"],
    "skillsEnhanced": ["Frontend Development", "Cloud Computing", "Backend Development"],
    "contentRewritten": ["Experience bullet points", "Project descriptions", "Technical skills"],
    "keywordsIncorporated": ["microservices", "scalable", "RESTful API", "CI/CD"],
    "totalChanges": 23
  }
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

IMPORTANT NOTE: The user currently ${profileData.personalInfo?.summary ? 'HAS' : 'DOES NOT HAVE'} a summary in their profile. ${!profileData.personalInfo?.summary ? 'Do not create a new summary - only optimize existing content.' : 'You may optimize the existing summary to better match the job description.'}

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
      
      // Safety check: Don't add a summary if the original profile doesn't have one
      if (!profile.personalInfo.summary && optimizations.personalInfo.summary) {
        delete profileUpdates.personalInfo.summary;
      }
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

    // Create profile-specific overrides for skills
    // This allows enhancing existing skills with job-specific technologies
    if (optimizations.skillOptimizations) {
      profileUpdates.skillOverrides = { ...profile.skillOverrides };
      optimizations.skillOptimizations.forEach((opt) => {
        if (profileUpdates.skillOverrides) {
          profileUpdates.skillOverrides[opt.id] = {
            name: opt.name,
            details: opt.details
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
      jobDescriptionHash: Buffer.from(jobDescription).toString('base64').slice(0, 20),
      changeAnalysis: optimizations.changeAnalysis,
      newSkills: optimizations.newSkills,
      skillOptimizations: optimizations.skillOptimizations
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
        return `Enhancement Level: AGGRESSIVE TECHNICAL TRANSFORMATION (4/5)
CRITICAL MANDATE: You MUST add technical skills, frameworks, and technologies from the job description to the resume, even if they weren't originally mentioned.

Guidelines:
1. EXTRACT every technical term from the job description (programming languages, frameworks, tools, platforms, methodologies)
2. INJECT these technologies into relevant experience bullets and project descriptions
3. ADD new technical skills to the skills section that are mentioned in the job but missing from resume
4. INCORPORATE specific technical implementations and use cases from the job requirements
5. PRESENT experience as if it utilized the exact technology stack mentioned in the job
6. ADD cloud platforms, databases, DevOps tools, and infrastructure mentioned in the job
7. INCLUDE methodologies (Agile, Scrum, CI/CD) and technical practices from the job description
8. ENHANCE project descriptions with specific technical details that align with job requirements
9. CREATE technical skill categories if needed to accommodate new technologies
10. TRANSFORM generic tasks into technology-specific implementations

TECHNICAL INJECTION STRATEGY:
- If job mentions "React" → Add React to frontend projects and skills
- If job mentions "Python" → Integrate Python into relevant backend experience
- If job mentions "AWS" → Add AWS to deployment/infrastructure experience
- If job mentions "Docker" → Include Docker in DevOps and deployment tasks
- If job mentions "MongoDB" → Add MongoDB to database-related experience
- If job mentions "Kubernetes" → Integrate Kubernetes into container orchestration tasks

SKILLS SECTION TRANSFORMATION:
- ADD every technical skill mentioned in the job description
- CREATE new skill categories if needed (Cloud Platforms, Frontend Frameworks, etc.)
- ENSURE job-required technologies are prominently featured

GOAL: Make the resume appear as if the candidate has hands-on experience with EVERY technology mentioned in the job description.`;

      case 5:
        return `Enhancement Level: MAXIMUM (5/5) - EXTREME TRANSFORMATION
Guidelines:
1. Completely rewrite content to match job requirements perfectly
2. Transform any relevant experience into exactly what the job is seeking  
3. Include every technology, skill, and keyword mentioned in the job description
4. Present all projects and experiences as directly relevant to the target role
5. Use maximum quantification and impact statements
6. Add industry expertise and domain knowledge that aligns with the position
7. Reframe educational background to emphasize relevant coursework and projects
8. Present any exposure to required technologies as proficiency
9. Create narrative threads that position the candidate as ideal for this specific role
10. Use the strongest possible language and most favorable interpretations
CRITICAL: This creates maximum tailoring but requires careful review for accuracy.`;

      default:
        return this.getGlazeInstructions(2); // Default to professional
    }
  }
}
