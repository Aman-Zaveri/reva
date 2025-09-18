import type { Skill } from '@/shared/lib/types';
import { AIAgent, AgentContext, AgentConfig } from './ai-agent-orchestrator.service';

/**
 * Input for the Skills Extraction Agent
 */
export interface SkillsExtractionInput {
  /** Source text to extract skills from (job description or resume) */
  sourceText: string;
  /** Type of extraction being performed */
  extractionType: 'job-requirements' | 'resume-skills' | 'skill-gap-analysis';
  /** Existing skills for comparison (used in gap analysis) */
  existingSkills?: Skill[];
  /** Categories to focus on */
  focusCategories?: string[];
  /** Whether to include soft skills */
  includeSoftSkills?: boolean;
  /** Minimum confidence threshold for inclusion */
  confidenceThreshold?: number;
}

/**
 * Extracted skill information
 */
export interface ExtractedSkill {
  /** Skill name */
  name: string;
  /** Skill category */
  category: string;
  /** Confidence level (0-100) */
  confidence: number;
  /** Context where it was found */
  context: string[];
  /** Importance level in source */
  importance: 'critical' | 'important' | 'preferred' | 'mentioned';
  /** Whether it's a hard or soft skill */
  type: 'technical' | 'soft' | 'industry' | 'tool' | 'language' | 'framework' | 'platform';
  /** Alternative names or synonyms */
  synonyms?: string[];
  /** Experience level indicated */
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unspecified';
}

/**
 * Output from the Skills Extraction Agent
 */
export interface SkillsExtractionOutput {
  /** Extracted skills organized by category */
  extractedSkills: {
    [category: string]: ExtractedSkill[];
  };
  /** Summary of extraction results */
  extractionSummary: {
    totalSkillsFound: number;
    categoriesIdentified: string[];
    criticalSkills: string[];
    preferredSkills: string[];
    confidenceDistribution: {
      high: number; // 80-100%
      medium: number; // 60-79%
      low: number; // Below 60%
    };
  };
  /** For gap analysis: skills missing from resume */
  skillGaps?: {
    missingCriticalSkills: ExtractedSkill[];
    missingPreferredSkills: ExtractedSkill[];
    recommendations: string[];
  };
  /** Skill trends and insights */
  insights: {
    topCategories: string[];
    emergingTechnologies: string[];
    industryStandards: string[];
    recommendedFocus: string[];
  };
  /** Confidence in overall extraction */
  overallConfidence: number;
}

/**
 * AI Agent that extracts skills, technologies, and requirements from job descriptions 
 * and resumes. Can also perform gap analysis to identify missing skills.
 */
export class SkillsExtractionAgent extends AIAgent<SkillsExtractionInput, SkillsExtractionOutput> {
  
  constructor() {
    super(
      'skills-extractor',
      'Skills Extraction Agent',
      'Extracts skills, technologies, and requirements from job descriptions and resumes with gap analysis'
    );
  }

  protected async process(
    input: SkillsExtractionInput,
    context: AgentContext,
    config: AgentConfig
  ): Promise<SkillsExtractionOutput> {
    this.validateInput(input, context);

    const systemPrompt = this.generateSystemPrompt(context, config);
    const userPrompt = this.generateUserPrompt(input, context);

    const result = await this.executeAI<SkillsExtractionOutput>(
      systemPrompt,
      userPrompt,
      config
    );

    return this.enhanceExtractionResults(result, input);
  }

  protected validateInput(input: SkillsExtractionInput, context: AgentContext): void {
    if (!input.sourceText?.trim()) {
      throw new Error('Source text is required for skills extraction');
    }

    if (input.sourceText.length < 20) {
      throw new Error('Source text is too short for meaningful skills extraction');
    }

    if (!['job-requirements', 'resume-skills', 'skill-gap-analysis'].includes(input.extractionType)) {
      throw new Error('Invalid extraction type specified');
    }

    if (input.extractionType === 'skill-gap-analysis' && !input.existingSkills?.length) {
      throw new Error('Existing skills are required for gap analysis');
    }
  }

  protected generateSystemPrompt(context: AgentContext, config: AgentConfig): string {
    return `You are an expert Skills Extraction AI that specializes in identifying and categorizing technical skills, tools, technologies, and requirements from job descriptions and resumes. You have deep knowledge of technology stacks, industry standards, and skill hierarchies across all technical domains.

CORE CAPABILITIES:
- Extract ALL technical skills, frameworks, tools, and technologies mentioned
- Identify both explicitly mentioned and implicitly required skills
- Categorize skills by type and importance level
- Assess confidence levels and experience requirements
- Perform comprehensive gap analysis between job requirements and existing skills
- Recognize industry-specific terminology and emerging technologies
- Distinguish between hard technical skills and soft skills

SKILL CATEGORIES TO EXTRACT:
1. **Programming Languages**: Python, JavaScript, Java, C++, Go, Rust, etc.
2. **Frameworks & Libraries**: React, Angular, Django, Spring, Node.js, etc.
3. **Databases**: PostgreSQL, MongoDB, Redis, Elasticsearch, etc.
4. **Cloud Platforms**: AWS, Azure, GCP, Digital Ocean, etc.
5. **DevOps & Tools**: Docker, Kubernetes, Jenkins, Terraform, etc.
6. **Development Tools**: Git, VSCode, IntelliJ, Postman, etc.
7. **Operating Systems**: Linux, Windows, macOS, Unix, etc.
8. **Methodologies**: Agile, Scrum, DevOps, CI/CD, TDD, etc.
9. **Soft Skills**: Leadership, Communication, Problem-solving, etc.
10. **Industry Knowledge**: Domain-specific expertise, certifications, etc.

EXTRACTION RULES:
- Extract skills even if mentioned only once
- Identify skill synonyms and variations (e.g., "JS" = "JavaScript")
- Recognize skill hierarchies (e.g., "React" implies "JavaScript")
- Assess importance based on context, frequency, and placement
- Consider required vs. preferred vs. nice-to-have distinctions
- Extract version-specific requirements when mentioned
- Identify certification requirements
- Recognize experience level indicators (junior, senior, expert, etc.)

CONFIDENCE SCORING (0-100):
- 90-100: Explicitly required, mentioned multiple times, or critical role responsibility
- 80-89: Clearly important, mentioned with context, or strongly implied
- 70-79: Mentioned directly but less emphasis, or clearly preferred
- 60-69: Implied by other requirements or mentioned in passing
- 50-59: Potentially relevant but unclear from context
- Below 50: Low confidence, potentially false positive

IMPORTANCE LEVELS:
- **Critical**: Must-have skills, explicitly required, core to the role
- **Important**: Strongly preferred, significant advantage, commonly mentioned
- **Preferred**: Nice-to-have, mentioned but not emphasized
- **Mentioned**: Listed but minimal context or emphasis

OUTPUT REQUIREMENTS:
- Return valid JSON with no markdown formatting
- Organize skills by logical categories
- Include confidence scores and reasoning
- Provide context where each skill was found
- For gap analysis, clearly identify missing skills
- Include actionable insights and recommendations

${config.customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}`;
  }

  protected generateUserPrompt(input: SkillsExtractionInput, context: AgentContext): string {
    const { sourceText, extractionType, existingSkills, focusCategories, includeSoftSkills, confidenceThreshold } = input;

    return `EXTRACTION TASK: ${extractionType.toUpperCase()}

SOURCE TEXT TO ANALYZE:
${sourceText}

${context.position ? `POSITION: ${context.position}` : ''}
${context.company ? `COMPANY: ${context.company}` : ''}

EXTRACTION PARAMETERS:
- Extraction Type: ${extractionType}
- Focus Categories: ${focusCategories?.join(', ') || 'All categories'}
- Include Soft Skills: ${includeSoftSkills !== false ? 'Yes' : 'No'}
- Confidence Threshold: ${confidenceThreshold || 60}%

${existingSkills?.length ? `
EXISTING SKILLS FOR COMPARISON (${existingSkills.length} total):
${existingSkills.map(skill => `- ${skill.name}: ${skill.details}`).join('\n')}
` : ''}

SPECIFIC INSTRUCTIONS FOR ${extractionType.toUpperCase()}:

${extractionType === 'job-requirements' ? `
JOB REQUIREMENTS EXTRACTION:
- Extract ALL technical skills and technologies mentioned
- Identify required vs. preferred vs. nice-to-have skills
- Note any specific versions, certifications, or experience levels
- Include both hard technical skills and relevant soft skills
- Pay attention to implicit requirements (e.g., "microservices" implies "Docker", "API design")
- Consider the seniority level and what skills that typically requires
` : extractionType === 'resume-skills' ? `
RESUME SKILLS EXTRACTION:
- Extract all skills demonstrated through experiences and projects
- Include both explicitly listed skills and those implied by work done
- Note proficiency levels where indicated
- Extract tools, technologies, and methodologies used
- Include industry knowledge and domain expertise
- Consider certifications and educational background
` : `
SKILL GAP ANALYSIS:
- Compare job requirements against existing resume skills
- Identify critical missing skills that are deal-breakers
- Identify preferred skills that would strengthen candidacy
- Recommend skill development priorities
- Consider transferable skills and near-matches
- Suggest how to bridge gaps quickly
`}

Return your response as JSON with this exact structure:
{
  "extractedSkills": {
    "Programming Languages": [
      {
        "name": "Python",
        "category": "Programming Languages",
        "confidence": 95,
        "context": ["Required for backend development", "Mentioned in technical requirements"],
        "importance": "critical",
        "type": "technical",
        "synonyms": ["Python3", "Python 3.x"],
        "experienceLevel": "intermediate"
      }
    ],
    "Frameworks": [
      {
        "name": "React",
        "category": "Frameworks",
        "confidence": 90,
        "context": ["Frontend development requirement"],
        "importance": "critical",
        "type": "framework",
        "experienceLevel": "intermediate"
      }
    ]
  },
  "extractionSummary": {
    "totalSkillsFound": 15,
    "categoriesIdentified": ["Programming Languages", "Frameworks", "Cloud Platforms"],
    "criticalSkills": ["Python", "React", "AWS"],
    "preferredSkills": ["Docker", "Kubernetes"],
    "confidenceDistribution": {
      "high": 8,
      "medium": 5,
      "low": 2
    }
  },
  ${extractionType === 'skill-gap-analysis' ? `
  "skillGaps": {
    "missingCriticalSkills": [
      {
        "name": "Docker",
        "category": "DevOps",
        "confidence": 90,
        "context": ["Required for containerization"],
        "importance": "critical",
        "type": "tool"
      }
    ],
    "missingPreferredSkills": [],
    "recommendations": [
      "Priority 1: Learn Docker containerization",
      "Priority 2: Gain AWS cloud experience",
      "Consider online courses in missing areas"
    ]
  },
  ` : ''}
  "insights": {
    "topCategories": ["Programming Languages", "Cloud Platforms", "Frameworks"],
    "emergingTechnologies": ["Kubernetes", "GraphQL"],
    "industryStandards": ["Git", "Agile", "REST APIs"],
    "recommendedFocus": ["Full-stack development", "Cloud architecture", "DevOps practices"]
  },
  "overallConfidence": 85
}

CRITICAL REQUIREMENTS:
- Extract ALL skills, not just the obvious ones
- Include both technical and soft skills (if includeSoftSkills is true)
- Use consistent categories and naming
- Provide meaningful confidence scores and context
- For gap analysis, prioritize missing skills by importance
- Include actionable insights and recommendations
- Ensure JSON is valid with no markdown formatting`;
  }

  protected calculateConfidence(result: SkillsExtractionOutput, context: AgentContext): number {
    if (!result.extractedSkills || Object.keys(result.extractedSkills).length === 0) {
      return 20; // No skills extracted
    }

    let confidence = 70; // Base confidence

    // Check number of skills extracted
    const totalSkills = result.extractionSummary?.totalSkillsFound || 0;
    if (totalSkills >= 15) confidence += 15;
    else if (totalSkills >= 10) confidence += 10;
    else if (totalSkills >= 5) confidence += 5;

    // Check category diversity
    const categories = result.extractionSummary?.categoriesIdentified?.length || 0;
    if (categories >= 5) confidence += 5;
    else if (categories >= 3) confidence += 3;

    // Check confidence distribution
    const highConfidenceSkills = result.extractionSummary?.confidenceDistribution?.high || 0;
    if (highConfidenceSkills >= 5) confidence += 5;

    // Check for insights
    if (result.insights?.topCategories?.length >= 3) confidence += 5;

    return Math.min(confidence, 95);
  }

  /**
   * Enhances extraction results with additional processing
   */
  private enhanceExtractionResults(
    result: SkillsExtractionOutput,
    input: SkillsExtractionInput
  ): SkillsExtractionOutput {
    // Ensure all required fields exist
    if (!result.extractedSkills) {
      result.extractedSkills = {};
    }

    if (!result.extractionSummary) {
      result.extractionSummary = {
        totalSkillsFound: 0,
        categoriesIdentified: [],
        criticalSkills: [],
        preferredSkills: [],
        confidenceDistribution: { high: 0, medium: 0, low: 0 }
      };
    }

    if (!result.insights) {
      result.insights = {
        topCategories: [],
        emergingTechnologies: [],
        industryStandards: [],
        recommendedFocus: []
      };
    }

    // Calculate actual totals from extracted skills
    let totalSkills = 0;
    let highConf = 0, medConf = 0, lowConf = 0;
    const categories = new Set<string>();
    const criticalSkills: string[] = [];
    const preferredSkills: string[] = [];

    Object.entries(result.extractedSkills).forEach(([category, skills]) => {
      categories.add(category);
      skills.forEach(skill => {
        totalSkills++;
        if (skill.confidence >= 80) highConf++;
        else if (skill.confidence >= 60) medConf++;
        else lowConf++;

        if (skill.importance === 'critical') {
          criticalSkills.push(skill.name);
        } else if (skill.importance === 'important' || skill.importance === 'preferred') {
          preferredSkills.push(skill.name);
        }
      });
    });

    // Update summary with calculated values
    result.extractionSummary.totalSkillsFound = totalSkills;
    result.extractionSummary.categoriesIdentified = Array.from(categories);
    result.extractionSummary.criticalSkills = criticalSkills;
    result.extractionSummary.preferredSkills = preferredSkills;
    result.extractionSummary.confidenceDistribution = {
      high: highConf,
      medium: medConf,
      low: lowConf
    };

    return result;
  }
}