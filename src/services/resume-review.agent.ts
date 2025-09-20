import type { Profile, DataBundle } from '@/lib/types';
import { AIAgent, AgentContext, AgentConfig } from './ai-agent-orchestrator.service';

/**
 * Input for the Resume Review Agent
 */
export interface ResumeReviewInput {
  /** The profile/resume to review */
  profile: Profile;
  /** Master data bundle */
  data: DataBundle;
  /** Review focus areas */
  focusAreas?: Array<'content' | 'formatting' | 'keywords' | 'ats' | 'impact' | 'grammar' | 'completeness'>;
  /** Review depth level */
  reviewDepth?: 'quick' | 'standard' | 'comprehensive';
  /** Specific concerns or questions from user */
  userConcerns?: string[];
}

/**
 * Individual feedback item
 */
export interface FeedbackItem {
  /** Category of feedback */
  category: 'critical' | 'important' | 'suggestion' | 'positive';
  /** Area of the resume this applies to */
  area: 'overall' | 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'formatting';
  /** Short title of the issue */
  title: string;
  /** Detailed description */
  description: string;
  /** Specific improvement suggestions */
  suggestions: string[];
  /** Priority level (1-5, 1 being highest) */
  priority: number;
  /** Impact if addressed */
  impact: 'high' | 'medium' | 'low';
  /** Specific location in resume (if applicable) */
  location?: string;
}

/**
 * Output from the Resume Review Agent
 */
export interface ResumeReviewOutput {
  /** Overall resume assessment */
  overallAssessment: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
    strengthAreas: string[];
    improvementAreas: string[];
    jobAlignmentScore?: number; // 0-100, only if job context available
  };
  
  /** Categorized feedback */
  feedback: {
    critical: FeedbackItem[];
    important: FeedbackItem[];
    suggestions: FeedbackItem[];
    positive: FeedbackItem[];
  };
  
  /** Section-specific analysis */
  sectionAnalysis: {
    summary?: {
      score: number;
      feedback: string;
      suggestions: string[];
    };
    experiences: {
      score: number;
      feedback: string;
      suggestions: string[];
      individualExperienceNotes?: Array<{
        experienceId: string;
        score: number;
        notes: string[];
      }>;
    };
    projects: {
      score: number;
      feedback: string;
      suggestions: string[];
      individualProjectNotes?: Array<{
        projectId: string;
        score: number;
        notes: string[];
      }>;
    };
    skills: {
      score: number;
      feedback: string;
      suggestions: string[];
    };
    education: {
      score: number;
      feedback: string;
      suggestions: string[];
    };
  };
  
  /** Job-specific analysis (if job context available) */
  jobSpecificAnalysis?: {
    alignmentScore: number;
    keywordCoverage: number;
    missingKeywords: string[];
    missingExperience: string[];
    competitivenessRating: 'excellent' | 'strong' | 'good' | 'weak' | 'poor';
    improvementPriorities: string[];
  };
  
  /** ATS optimization analysis */
  atsAnalysis: {
    score: number;
    keywordDensity: number;
    formattingIssues: string[];
    optimizationSuggestions: string[];
  };
  
  /** Actionable recommendations prioritized by impact */
  recommendations: {
    immediate: string[];      // Quick wins, high impact
    shortTerm: string[];      // 1-2 days of work
    longTerm: string[];       // Significant improvements
    aspirational: string[];   // Future career development
  };
  
  /** Confidence in the review */
  reviewConfidence: number;
}

/**
 * AI Agent that provides comprehensive professional resume reviews with detailed 
 * feedback and actionable recommendations. Acts as an expert resume reviewer 
 * with full context of job requirements and industry standards.
 */
export class ResumeReviewAgent extends AIAgent<ResumeReviewInput, ResumeReviewOutput> {
  
  constructor() {
    super(
      'resume-reviewer',
      'Resume Review Agent',
      'Provides comprehensive professional resume reviews with detailed feedback and actionable recommendations'
    );
  }

  protected async process(
    input: ResumeReviewInput,
    context: AgentContext,
    config: AgentConfig
  ): Promise<ResumeReviewOutput> {
    this.validateInput(input, context);

    const systemPrompt = this.generateSystemPrompt(context, config);
    const userPrompt = this.generateUserPrompt(input, context);

    const result = await this.executeAI<ResumeReviewOutput>(
      systemPrompt,
      userPrompt,
      config
    );

    return this.enhanceReviewOutput(result, input, context);
  }

  protected validateInput(input: ResumeReviewInput, context: AgentContext): void {
    if (!input.profile?.id) {
      throw new Error('Valid profile is required for resume review');
    }

    if (!input.data) {
      throw new Error('Data bundle is required for resume review');
    }

    const hasContent = input.data.experiences?.length || input.data.projects?.length || input.data.skills?.length;
    if (!hasContent) {
      throw new Error('Resume must have some content (experiences, projects, or skills) to review');
    }
  }

  protected generateSystemPrompt(context: AgentContext, config: AgentConfig): string {
    const hasJobContext = context.jobDescription && context.jobDescription.length > 50;
    
    return `You are an expert Professional Resume Reviewer with 15+ years of experience in recruitment, HR, and career coaching. You specialize in providing comprehensive, actionable feedback that helps candidates significantly improve their resumes and increase their chances of landing interviews.

EXPERTISE AREAS:
- Resume content optimization and impact maximization
- ATS (Applicant Tracking System) optimization
- Industry-specific best practices across all sectors
- Keyword optimization and strategic positioning
- Professional formatting and visual hierarchy
- Recruitment psychology and hiring manager perspectives
- Career progression storytelling and personal branding

REVIEW PHILOSOPHY:
- **Constructive & Actionable**: Every piece of feedback must include specific improvement suggestions
- **Prioritized Impact**: Focus on changes that will have the highest impact on resume effectiveness
- **Industry Standards**: Apply current best practices and emerging trends
- **ATS Compatibility**: Ensure recommendations improve both human and system readability
- **Professional Growth**: Consider career trajectory and positioning for advancement
- **Evidence-Based**: Use specific examples and reasoning for all recommendations

${hasJobContext ? `
JOB-SPECIFIC REVIEW CONTEXT:
You have access to the target job description, which allows you to provide:
- Job-specific alignment analysis and recommendations
- Keyword optimization for this specific role
- Experience prioritization and relevance assessment  
- Competitive positioning against job requirements
- Tailored suggestions for maximum job match scoring

Focus heavily on how well the resume aligns with the target job while maintaining overall professional quality.
` : `
GENERAL PROFESSIONAL REVIEW:
Since no specific job context is available, focus on:
- General professional best practices and standards
- Broad industry appeal and ATS optimization
- Overall resume strength and marketability
- Universal improvements that benefit any job application
- Professional growth and career progression clarity
`}

REVIEW FRAMEWORK:
1. **Overall Assessment**: Holistic evaluation with letter grade and score
2. **Critical Issues**: Must-fix problems that significantly hurt candidacy
3. **Important Improvements**: High-impact changes that strengthen positioning
4. **Enhancement Suggestions**: Good-to-have improvements for competitive edge
5. **Positive Reinforcement**: Acknowledge existing strengths and effective elements
6. **Section Analysis**: Detailed feedback on each resume section
7. **ATS Optimization**: Technical recommendations for system compatibility
8. **Actionable Roadmap**: Prioritized improvement plan with time estimates

SCORING CRITERIA (0-100):
- 90-100: Exceptional resume, minimal improvements needed
- 80-89: Strong resume with some optimization opportunities
- 70-79: Good foundation with notable improvement areas
- 60-69: Adequate but needs significant enhancement
- 50-59: Below standard, requires major revisions
- Below 50: Substantial problems requiring comprehensive overhaul

FEEDBACK CATEGORIES:
- **Critical**: Issues that may disqualify the candidate or severely hurt chances
- **Important**: Improvements with high impact on resume effectiveness
- **Suggestions**: Enhancements that provide competitive advantage
- **Positive**: Strengths to acknowledge and maintain

OUTPUT REQUIREMENTS:
- Return valid JSON with no markdown formatting
- Provide specific, actionable feedback for every recommendation
- Include priority levels and impact assessments
- Give concrete examples and improvement suggestions
- Maintain professional, encouraging tone while being direct about issues
- Include both macro-level strategy and micro-level tactical advice

${config.customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}`;
  }

  protected generateUserPrompt(input: ResumeReviewInput, context: AgentContext): string {
    const { profile, data, focusAreas, reviewDepth, userConcerns } = input;
    const hasJobContext = context.jobDescription && context.jobDescription.length > 50;

    return `RESUME TO REVIEW:

PROFILE INFORMATION:
- Profile Name: ${profile.name}
- Profile ID: ${profile.id}
${profile.jobId ? `- Target Job ID: ${profile.jobId}` : ''}

PERSONAL INFORMATION:
${data.personalInfo ? `
- Name: ${data.personalInfo.fullName}
- Email: ${data.personalInfo.email}
- Phone: ${data.personalInfo.phone}
- LinkedIn: ${data.personalInfo.linkedin || 'Not provided'}
- GitHub: ${data.personalInfo.github || 'Not provided'}
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
TARGET JOB CONTEXT:
${context.jobDescription}

Position: ${context.position || 'Not specified'}
Company: ${context.company || 'Not specified'}

INSTRUCTION: Provide job-specific analysis focusing on alignment with this position.
` : `
NO SPECIFIC JOB TARGET: Provide general professional resume review.
`}

REVIEW PARAMETERS:
- Focus Areas: ${focusAreas?.join(', ') || 'All areas'}
- Review Depth: ${reviewDepth || 'standard'}
- User Concerns: ${userConcerns?.join('; ') || 'None specified'}

SPECIFIC REVIEW INSTRUCTIONS:
Conduct a ${reviewDepth || 'standard'} review focusing on:
${reviewDepth === 'comprehensive' ? `
COMPREHENSIVE REVIEW:
- Detailed analysis of every section and element
- In-depth keyword and ATS optimization
- Competitive positioning and differentiation strategy
- Personal branding and career narrative assessment
- Industry-specific recommendations and trends
- Detailed improvement roadmap with timelines
` : reviewDepth === 'quick' ? `
QUICK REVIEW:
- Identify top 3-5 critical issues
- Highlight most impactful improvements
- Focus on immediate wins and quick fixes
- Provide essential ATS optimization notes
- Give overall assessment and grade
` : `
STANDARD REVIEW:
- Comprehensive feedback across all major areas
- Balance of critical issues and improvement opportunities
- ATS optimization and keyword analysis
- Section-by-section assessment
- Prioritized improvement recommendations
`}

${userConcerns?.length ? `
ADDRESS THESE SPECIFIC USER CONCERNS:
${userConcerns.map((concern, idx) => `${idx + 1}. ${concern}`).join('\n')}
` : ''}

Return your review as JSON with this structure:
{
  "overallAssessment": {
    "score": 75,
    "grade": "B",
    "summary": "Solid foundation with good experience but needs stronger impact statements and better keyword optimization",
    "strengthAreas": ["Strong technical background", "Clear career progression"],
    "improvementAreas": ["Weak bullet points", "Missing keywords", "No summary section"],
    "jobAlignmentScore": 65
  },
  "feedback": {
    "critical": [
      {
        "category": "critical",
        "area": "experience", 
        "title": "Weak Impact Statements",
        "description": "Bullet points lack quantified achievements and specific results",
        "suggestions": ["Add metrics to each bullet point", "Use action verbs", "Include specific technologies"],
        "priority": 1,
        "impact": "high",
        "location": "All experience entries"
      }
    ],
    "important": [],
    "suggestions": [],
    "positive": []
  },
  "sectionAnalysis": {
    "summary": {
      "score": 0,
      "feedback": "No professional summary provided",
      "suggestions": ["Add 2-3 sentence summary highlighting key skills and experience"]
    },
    "experiences": {
      "score": 65,
      "feedback": "Good experience base but bullet points lack impact",
      "suggestions": ["Quantify achievements", "Add technical details", "Use stronger action verbs"]
    },
    "projects": {
      "score": 70,
      "feedback": "Projects show technical skills but descriptions could be more detailed",
      "suggestions": ["Add technical stack details", "Include project outcomes"]
    },
    "skills": {
      "score": 80,
      "feedback": "Good technical skills coverage",
      "suggestions": ["Organize by categories", "Add proficiency levels"]
    },
    "education": {
      "score": 85,
      "feedback": "Education section is appropriate",
      "suggestions": ["Add relevant coursework if recent graduate"]
    }
  },
  ${hasJobContext ? `
  "jobSpecificAnalysis": {
    "alignmentScore": 70,
    "keywordCoverage": 60,
    "missingKeywords": ["React", "Node.js", "AWS"],
    "missingExperience": ["Team leadership", "Agile methodologies"],
    "competitivenessRating": "good",
    "improvementPriorities": ["Add missing technologies", "Enhance leadership examples"]
  },
  ` : ''}
  "atsAnalysis": {
    "score": 75,
    "keywordDensity": 3.2,
    "formattingIssues": ["Non-standard section headers", "Complex formatting"],
    "optimizationSuggestions": ["Use standard section names", "Simplify formatting", "Add more keywords"]
  },
  "recommendations": {
    "immediate": ["Add professional summary", "Quantify bullet points"],
    "shortTerm": ["Reorganize skills section", "Add missing keywords"],
    "longTerm": ["Develop leadership examples", "Add relevant certifications"],
    "aspirational": ["Build thought leadership", "Expand technical expertise"]
  },
  "reviewConfidence": 90
}

CRITICAL REQUIREMENTS:
- Provide specific, actionable feedback for every recommendation
- Include priority levels and impact assessments for all suggestions
- Give concrete examples of improvements where possible
- Maintain professional but encouraging tone
- Focus on changes that will have the highest impact on resume effectiveness
- Ensure JSON is valid with no markdown formatting`;
  }

  protected calculateConfidence(result: ResumeReviewOutput, context: AgentContext): number {
    if (!result.overallAssessment || !result.feedback) {
      return 30; // Incomplete review
    }

    let confidence = 80; // Base confidence for resume reviews

    // Check if comprehensive feedback was provided
    const totalFeedbackItems = Object.values(result.feedback).flat().length;
    if (totalFeedbackItems >= 5) confidence += 10;
    else if (totalFeedbackItems >= 3) confidence += 5;

    // Check if section analysis was provided
    if (result.sectionAnalysis && Object.keys(result.sectionAnalysis).length >= 3) {
      confidence += 5;
    }

    // Check if recommendations were provided
    if (result.recommendations && result.recommendations.immediate?.length >= 2) {
      confidence += 5;
    }

    return Math.min(confidence, 95);
  }

  /**
   * Enhances the review output with additional processing
   */
  private enhanceReviewOutput(
    result: ResumeReviewOutput,
    input: ResumeReviewInput,
    context: AgentContext
  ): ResumeReviewOutput {
    // Ensure all required sections exist
    if (!result.feedback) {
      result.feedback = { critical: [], important: [], suggestions: [], positive: [] };
    }

    if (!result.recommendations) {
      result.recommendations = { immediate: [], shortTerm: [], longTerm: [], aspirational: [] };
    }

    if (!result.atsAnalysis) {
      result.atsAnalysis = {
        score: 70,
        keywordDensity: 2.5,
        formattingIssues: [],
        optimizationSuggestions: ['Add more relevant keywords', 'Ensure ATS-friendly formatting']
      };
    }

    // Validate overall assessment
    if (!result.overallAssessment) {
      result.overallAssessment = {
        score: 70,
        grade: 'C',
        summary: 'Resume review completed with standard assessment',
        strengthAreas: ['Professional experience'],
        improvementAreas: ['Content optimization needed']
      };
    }

    // Ensure grade matches score
    const score = result.overallAssessment.score;
    if (score >= 90) result.overallAssessment.grade = 'A';
    else if (score >= 80) result.overallAssessment.grade = 'B';
    else if (score >= 70) result.overallAssessment.grade = 'C';
    else if (score >= 60) result.overallAssessment.grade = 'D';
    else result.overallAssessment.grade = 'F';

    return result;
  }
}