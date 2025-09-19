import type { Profile, DataBundle } from '@/lib/types';
import { AIAgent, AgentContext, AgentConfig } from './ai-agent-orchestrator.service';

/**
 * Input for the ATS Optimization Agent
 */
export interface ATSOptimizationInput {
  /** The profile/resume to optimize for ATS */
  profile: Profile;
  /** Master data bundle */
  data: DataBundle;
  /** Specific ATS systems to optimize for */
  targetATS?: Array<'workday' | 'taleo' | 'greenhouse' | 'lever' | 'icims' | 'bamboohr' | 'generic'>;
  /** Keyword optimization aggressiveness */
  keywordDensity?: 'conservative' | 'moderate' | 'aggressive';
  /** Focus areas for optimization */
  focusAreas?: Array<'keywords' | 'formatting' | 'sections' | 'content' | 'file-structure'>;
  /** Whether to maintain human readability */
  preserveReadability?: boolean;
}

/**
 * ATS compatibility issue
 */
export interface ATSIssue {
  /** Severity of the issue */
  severity: 'critical' | 'high' | 'medium' | 'low';
  /** Category of the issue */
  category: 'keywords' | 'formatting' | 'structure' | 'content' | 'sections';
  /** Issue title */
  title: string;
  /** Detailed description */
  description: string;
  /** Current value causing the issue */
  currentValue?: string;
  /** Recommended fix */
  recommendedFix: string;
  /** Specific location in resume */
  location: string;
  /** Impact on ATS score */
  atsImpact: number; // 0-100
}

/**
 * Keyword optimization suggestion
 */
export interface KeywordSuggestion {
  /** The keyword/phrase to add */
  keyword: string;
  /** Where to add it */
  suggestedLocation: string;
  /** Why it's important */
  importance: string;
  /** Frequency in typical job descriptions */
  frequency: 'very-high' | 'high' | 'medium' | 'low';
  /** Context for natural integration */
  integrationContext: string;
  /** Current count in resume */
  currentCount: number;
  /** Recommended count */
  recommendedCount: number;
}

/**
 * Output from the ATS Optimization Agent
 */
export interface ATSOptimizationOutput {
  /** Overall ATS compatibility score */
  overallATSScore: {
    score: number; // 0-100
    grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
    summary: string;
    keyStrengths: string[];
    criticalWeaknesses: string[];
  };

  /** Compatibility scores by ATS system */
  systemCompatibility: {
    [system: string]: {
      score: number;
      specificIssues: string[];
      optimizationPotential: number;
    };
  };

  /** Identified ATS issues */
  atsIssues: {
    critical: ATSIssue[];
    high: ATSIssue[];
    medium: ATSIssue[];
    low: ATSIssue[];
  };

  /** Keyword analysis and optimization */
  keywordOptimization: {
    currentKeywordScore: number;
    potentialKeywordScore: number;
    missingKeywords: KeywordSuggestion[];
    overusedKeywords: Array<{
      keyword: string;
      currentCount: number;
      recommendedCount: number;
      locations: string[];
    }>;
    keywordDensity: {
      current: number;
      optimal: number;
      recommendation: string;
    };
  };

  /** Formatting optimization */
  formattingOptimization: {
    score: number;
    issues: Array<{
      issue: string;
      solution: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    recommendations: string[];
  };

  /** Section structure analysis */
  sectionAnalysis: {
    score: number;
    currentSections: string[];
    recommendedSections: string[];
    sectionIssues: Array<{
      section: string;
      issue: string;
      recommendation: string;
    }>;
  };

  /** Content optimization for ATS */
  contentOptimization: {
    score: number;
    improvementAreas: Array<{
      area: string;
      currentIssue: string;
      atsOptimization: string;
      impact: 'high' | 'medium' | 'low';
    }>;
  };

  /** Prioritized action plan */
  actionPlan: {
    immediate: Array<{
      action: string;
      impact: number;
      effort: 'low' | 'medium' | 'high';
      expectedScoreGain: number;
    }>;
    shortTerm: Array<{
      action: string;
      impact: number;
      effort: 'low' | 'medium' | 'high';
      expectedScoreGain: number;
    }>;
    longTerm: Array<{
      action: string;
      impact: number;
      effort: 'low' | 'medium' | 'high';
      expectedScoreGain: number;
    }>;
  };

  /** ATS-optimized content suggestions */
  optimizedContent?: {
    optimizedSummary?: string;
    optimizedExperiences?: Array<{
      experienceId: string;
      optimizedBullets: string[];
      addedKeywords: string[];
    }>;
    optimizedProjects?: Array<{
      projectId: string;
      optimizedBullets: string[];
      addedKeywords: string[];
    }>;
    optimizedSkills?: Array<{
      skillId: string;
      optimizedDetails: string;
      addedKeywords: string[];
    }>;
  };

  /** Confidence in optimization analysis */
  optimizationConfidence: number;
}

/**
 * AI Agent that specializes in ATS (Applicant Tracking System) optimization.
 * Analyzes resumes for ATS compatibility and provides specific recommendations
 * to improve parsing, keyword matching, and overall ATS scores.
 */
export class ATSOptimizationAgent extends AIAgent<ATSOptimizationInput, ATSOptimizationOutput> {
  
  constructor() {
    super(
      'ats-optimizer',
      'ATS Optimization Agent',
      'Specializes in ATS compatibility analysis and optimization with keyword enhancement and formatting recommendations'
    );
  }

  protected async process(
    input: ATSOptimizationInput,
    context: AgentContext,
    config: AgentConfig
  ): Promise<ATSOptimizationOutput> {
    this.validateInput(input, context);

    const systemPrompt = this.generateSystemPrompt(context, config);
    const userPrompt = this.generateUserPrompt(input, context);

    const result = await this.executeAI<ATSOptimizationOutput>(
      systemPrompt,
      userPrompt,
      config
    );

    return this.enhanceATSAnalysis(result, input, context);
  }

  protected validateInput(input: ATSOptimizationInput, context: AgentContext): void {
    if (!input.profile?.id) {
      throw new Error('Valid profile is required for ATS optimization');
    }

    if (!input.data) {
      throw new Error('Data bundle is required for ATS optimization');
    }

    const hasContent = input.data.experiences?.length || input.data.projects?.length || input.data.skills?.length;
    if (!hasContent) {
      throw new Error('Resume must have some content to optimize for ATS');
    }
  }

  protected generateSystemPrompt(context: AgentContext, config: AgentConfig): string {
    const hasJobContext = context.jobDescription && context.jobDescription.length > 50;
    
    return `You are an expert ATS (Applicant Tracking System) Optimization Specialist with deep knowledge of how modern ATS systems parse, analyze, and score resumes. You understand the technical requirements and algorithmic behaviors of major ATS platforms including Workday, Taleo, Greenhouse, Lever, iCIMS, and BambooHR.

CORE EXPERTISE:
- ATS parsing algorithms and content extraction methods
- Keyword optimization strategies and density calculations
- Resume formatting requirements for maximum ATS compatibility
- Section structure and labeling best practices
- Content optimization for both ATS scoring and human readability
- Industry-specific ATS requirements and variations
- File format optimization and metadata considerations

ATS OPTIMIZATION PRINCIPLES:
1. **Keyword Optimization**: Strategic placement and frequency of relevant keywords
2. **Format Compatibility**: Clean, parseable structure that ATS systems can reliably read
3. **Section Recognition**: Standard section headers and logical content organization
4. **Content Clarity**: Clear, unambiguous text that algorithms can categorize
5. **Metadata Optimization**: Proper use of job titles, company names, and dates
6. **Hierarchy Preservation**: Logical information hierarchy for proper parsing
7. **Redundancy Strategy**: Strategic keyword repetition without over-optimization

${hasJobContext ? `
JOB-SPECIFIC ATS OPTIMIZATION:
With access to the target job description, focus on:
- Exact keyword matching from job requirements
- Industry-specific terminology optimization
- Role-specific skill emphasis and frequency
- Company-specific technology stack alignment
- Seniority-appropriate language and responsibilities
- Job-specific achievement metrics and KPIs
` : `
GENERAL ATS OPTIMIZATION:
Without specific job context, focus on:
- Universal ATS compatibility best practices
- Industry-standard keyword optimization
- Broad professional terminology enhancement
- General formatting and structure optimization
- Universal section naming conventions
`}

ATS SCORING FACTORS:
1. **Keyword Match (40%)**: Presence and frequency of relevant keywords
2. **Format Compatibility (25%)**: Clean parsing and section recognition
3. **Content Quality (20%)**: Professional language and clear achievements
4. **Structure Organization (10%)**: Logical flow and standard sections
5. **Technical Compliance (5%)**: File format and metadata optimization

CRITICAL ATS ISSUES TO IDENTIFY:
- Non-standard section headers (e.g., "Work History" instead of "Experience")
- Complex formatting that breaks parsing (tables, columns, graphics)
- Missing critical keywords from job descriptions
- Inconsistent date formats and job title structures
- Poor content hierarchy and information organization
- Keyword stuffing or unnatural language patterns
- Missing contact information or unparseable formats

OPTIMIZATION STRATEGIES:
- **Conservative**: Minimal keyword addition, focus on format fixes
- **Moderate**: Balanced keyword integration with content enhancement
- **Aggressive**: Maximum keyword optimization while maintaining readability

ATS SYSTEM CONSIDERATIONS:
- **Workday**: Strong keyword matching, good format flexibility
- **Taleo**: Strict formatting requirements, keyword density sensitive
- **Greenhouse**: Modern parsing, natural language processing
- **Lever**: Clean formatting preferred, context-aware keyword analysis
- **iCIMS**: Traditional parsing, benefits from repetition
- **BambooHR**: Simple structure preferred, clear section delineation

OUTPUT REQUIREMENTS:
- Return valid JSON with no markdown formatting
- Provide specific, actionable ATS optimization recommendations
- Include quantified scores and impact assessments
- Give clear priority levels for all improvements
- Balance ATS optimization with human readability
- Include system-specific recommendations when applicable

${config.customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}`;
  }

  protected generateUserPrompt(input: ATSOptimizationInput, context: AgentContext): string {
    const { profile, data, targetATS, keywordDensity, focusAreas, preserveReadability } = input;
    const hasJobContext = context.jobDescription && context.jobDescription.length > 50;

    return `RESUME FOR ATS OPTIMIZATION:

PROFILE INFORMATION:
- Profile Name: ${profile.name}
- Profile ID: ${profile.id}

CURRENT RESUME CONTENT:

PERSONAL INFORMATION:
${data.personalInfo ? `
- Name: ${data.personalInfo.fullName}
- Email: ${data.personalInfo.email}
- Phone: ${data.personalInfo.phone}
- Location: ${data.personalInfo.location}
- LinkedIn: ${data.personalInfo.linkedin || 'Not provided'}
- GitHub: ${data.personalInfo.github || 'Not provided'}
- Website: ${data.personalInfo.website || 'Not provided'}
- Summary: ${data.personalInfo.summary || 'No summary provided'}
` : 'No personal information provided'}

WORK EXPERIENCES (${data.experiences?.length || 0} total):
${data.experiences?.map((exp, idx) => `
${idx + 1}. ${exp.company} - ${exp.title} (${exp.date})
   Bullets: ${exp.bullets?.length ? exp.bullets.join(' | ') : 'No bullets'}
   Tags: ${exp.tags?.length ? exp.tags.join(', ') : 'No tags'}
`).join('\n') || 'No experiences provided'}

PROJECTS (${data.projects?.length || 0} total):
${data.projects?.map((proj, idx) => `
${idx + 1}. ${proj.title}
   Link: ${proj.link || 'No link'}
   Bullets: ${proj.bullets?.length ? proj.bullets.join(' | ') : 'No bullets'}
   Tags: ${proj.tags?.length ? proj.tags.join(', ') : 'No tags'}
`).join('\n') || 'No projects provided'}

SKILLS (${data.skills?.length || 0} total):
${data.skills?.map((skill, idx) => `
${idx + 1}. ${skill.name}: ${skill.details}
`).join('\n') || 'No skills provided'}

EDUCATION (${data.education?.length || 0} total):
${data.education?.map((edu, idx) => `
${idx + 1}. ${edu.title}: ${edu.details}
`).join('\n') || 'No education provided'}

${hasJobContext ? `
TARGET JOB FOR ATS OPTIMIZATION:
${context.jobDescription}

Position: ${context.position || 'Not specified'}
Company: ${context.company || 'Not specified'}

INSTRUCTION: Optimize specifically for this job description with heavy keyword focus.
` : `
GENERAL ATS OPTIMIZATION: Optimize for broad ATS compatibility and industry standards.
`}

OPTIMIZATION PARAMETERS:
- Target ATS Systems: ${targetATS?.join(', ') || 'Generic optimization'}
- Keyword Density Preference: ${keywordDensity || 'moderate'}
- Focus Areas: ${focusAreas?.join(', ') || 'All areas'}
- Preserve Human Readability: ${preserveReadability !== false ? 'Yes' : 'No'}

SPECIFIC ATS OPTIMIZATION TASKS:

1. **ATS COMPATIBILITY ANALYSIS**:
   - Evaluate current ATS score (0-100)
   - Identify critical compatibility issues
   - Assess parsing risks and formatting problems
   - Analyze section structure and naming

2. **KEYWORD OPTIMIZATION**:
   ${hasJobContext ? `
   - Extract ALL keywords from job description
   - Calculate current keyword coverage and density
   - Identify missing critical keywords
   - Suggest natural keyword integration strategies
   - Optimize for exact keyword matches and variations
   ` : `
   - Analyze current keyword density and coverage
   - Suggest industry-standard keywords to add
   - Identify opportunities for keyword enhancement
   - Ensure balanced keyword distribution
   `}

3. **FORMATTING OPTIMIZATION**:
   - Review section headers for ATS recognition
   - Identify complex formatting that breaks parsing
   - Suggest structure improvements for better extraction
   - Ensure consistent date and format patterns

4. **CONTENT OPTIMIZATION**:
   - Enhance content for ATS scoring algorithms
   - Improve job title and company name clarity
   - Optimize achievement statements for keyword inclusion
   - Ensure clear skill categorization and organization

5. **SYSTEM-SPECIFIC RECOMMENDATIONS**:
   ${targetATS?.length ? `
   Provide specific optimizations for: ${targetATS.join(', ')}
   ` : `
   Provide general ATS optimization recommendations
   `}

Return your analysis as JSON with this structure:
{
  "overallATSScore": {
    "score": 72,
    "grade": "Good",
    "summary": "Resume has solid ATS compatibility but needs keyword optimization and formatting improvements",
    "keyStrengths": ["Clear section structure", "Professional formatting"],
    "criticalWeaknesses": ["Missing key job keywords", "Non-standard section headers"]
  },
  "systemCompatibility": {
    "workday": {
      "score": 75,
      "specificIssues": ["Complex bullet formatting"],
      "optimizationPotential": 20
    }
  },
  "atsIssues": {
    "critical": [
      {
        "severity": "critical",
        "category": "keywords",
        "title": "Missing Critical Job Keywords",
        "description": "Resume lacks 60% of keywords from target job description",
        "currentValue": "2 out of 15 critical keywords present",
        "recommendedFix": "Add React, Node.js, AWS, Docker keywords throughout experience bullets",
        "location": "Experience and Skills sections",
        "atsImpact": 40
      }
    ],
    "high": [],
    "medium": [],
    "low": []
  },
  "keywordOptimization": {
    "currentKeywordScore": 45,
    "potentialKeywordScore": 85,
    "missingKeywords": [
      {
        "keyword": "React",
        "suggestedLocation": "Frontend development experience",
        "importance": "Critical technology mentioned 5 times in job description",
        "frequency": "very-high",
        "integrationContext": "Add to bullet points about UI development",
        "currentCount": 0,
        "recommendedCount": 3
      }
    ],
    "overusedKeywords": [],
    "keywordDensity": {
      "current": 2.1,
      "optimal": 3.5,
      "recommendation": "Increase keyword density by adding technical terms naturally"
    }
  },
  "formattingOptimization": {
    "score": 80,
    "issues": [
      {
        "issue": "Non-standard section header 'Work History'",
        "solution": "Change to 'Experience' or 'Work Experience'",
        "priority": "high"
      }
    ],
    "recommendations": ["Use standard section headers", "Simplify bullet point formatting"]
  },
  "sectionAnalysis": {
    "score": 75,
    "currentSections": ["Contact", "Work History", "Projects", "Skills"],
    "recommendedSections": ["Contact", "Summary", "Experience", "Projects", "Skills", "Education"],
    "sectionIssues": [
      {
        "section": "Summary",
        "issue": "Missing professional summary section",
        "recommendation": "Add 2-3 sentence summary with key job keywords"
      }
    ]
  },
  "contentOptimization": {
    "score": 70,
    "improvementAreas": [
      {
        "area": "Experience bullets",
        "currentIssue": "Generic descriptions without technical keywords",
        "atsOptimization": "Add specific technologies and methodologies from job description",
        "impact": "high"
      }
    ]
  },
  "actionPlan": {
    "immediate": [
      {
        "action": "Add missing critical keywords to experience bullets",
        "impact": 85,
        "effort": "medium",
        "expectedScoreGain": 15
      }
    ],
    "shortTerm": [
      {
        "action": "Restructure skills section with job-relevant categories",
        "impact": 70,
        "effort": "low",
        "expectedScoreGain": 8
      }
    ],
    "longTerm": [
      {
        "action": "Develop comprehensive professional summary with keyword optimization",
        "impact": 75,
        "effort": "medium",
        "expectedScoreGain": 10
      }
    ]
  },
  "optimizedContent": {
    "optimizedSummary": "Full-stack developer with 5+ years experience in React, Node.js, and AWS cloud architecture...",
    "optimizedExperiences": [
      {
        "experienceId": "exp_1",
        "optimizedBullets": ["Developed React applications serving 10K+ users with Node.js backend"],
        "addedKeywords": ["React", "Node.js", "scalable"]
      }
    ]
  },
  "optimizationConfidence": 88
}

CRITICAL REQUIREMENTS:
- Provide specific, actionable ATS optimization recommendations
- Include quantified impact assessments for all suggestions
- Balance ATS optimization with human readability
- Give priority levels and effort estimates for improvements
- Include system-specific recommendations when applicable
- Ensure all keyword suggestions are naturally integrated
- Provide optimized content examples where beneficial`;
  }

  protected calculateConfidence(result: ATSOptimizationOutput, context: AgentContext): number {
    if (!result.overallATSScore || !result.atsIssues) {
      return 30; // Incomplete analysis
    }

    let confidence = 80; // Base confidence for ATS optimization

    // Check if comprehensive analysis was provided
    const totalIssues = Object.values(result.atsIssues).flat().length;
    if (totalIssues >= 5) confidence += 10;
    else if (totalIssues >= 3) confidence += 5;

    // Check if keyword analysis was provided
    if (result.keywordOptimization?.missingKeywords?.length >= 3) {
      confidence += 5;
    }

    // Check if action plan was provided
    if (result.actionPlan?.immediate?.length >= 2) {
      confidence += 5;
    }

    return Math.min(confidence, 95);
  }

  /**
   * Enhances the ATS analysis with additional processing
   */
  private enhanceATSAnalysis(
    result: ATSOptimizationOutput,
    input: ATSOptimizationInput,
    context: AgentContext
  ): ATSOptimizationOutput {
    // Ensure all required sections exist
    if (!result.atsIssues) {
      result.atsIssues = { critical: [], high: [], medium: [], low: [] };
    }

    if (!result.actionPlan) {
      result.actionPlan = { immediate: [], shortTerm: [], longTerm: [] };
    }

    if (!result.keywordOptimization) {
      result.keywordOptimization = {
        currentKeywordScore: 60,
        potentialKeywordScore: 80,
        missingKeywords: [],
        overusedKeywords: [],
        keywordDensity: {
          current: 2.0,
          optimal: 3.0,
          recommendation: 'Increase keyword density with natural integration'
        }
      };
    }

    // Ensure overall score is reasonable
    if (!result.overallATSScore) {
      result.overallATSScore = {
        score: 70,
        grade: 'Good',
        summary: 'ATS optimization analysis completed with standard assessment',
        keyStrengths: ['Professional structure'],
        criticalWeaknesses: ['Keyword optimization needed']
      };
    }

    // Ensure grade matches score
    const score = result.overallATSScore.score;
    if (score >= 90) result.overallATSScore.grade = 'Excellent';
    else if (score >= 80) result.overallATSScore.grade = 'Good';
    else if (score >= 70) result.overallATSScore.grade = 'Fair';
    else if (score >= 60) result.overallATSScore.grade = 'Poor';
    else result.overallATSScore.grade = 'Critical';

    return result;
  }
}