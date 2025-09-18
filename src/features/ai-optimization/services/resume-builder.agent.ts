import type { Profile, DataBundle, Experience, Project } from '@/shared/lib/types';
import { AIAgent, AgentContext, AgentConfig } from './ai-agent-orchestrator.service';

/**
 * Input for the Resume Builder Agent
 */
export interface ResumeBuilderInput {
  /** Maximum number of experiences to select */
  maxExperiences?: number;
  /** Maximum number of projects to select */
  maxProjects?: number;
  /** Whether to enforce minimum selections */
  enforceMinimums?: boolean;
  /** Custom selection criteria */
  selectionCriteria?: string;
}

/**
 * Output from the Resume Builder Agent
 */
export interface ResumeBuilderOutput {
  /** Selected experiences with relevance scores */
  selectedExperiences: Array<{
    experience: Experience;
    relevanceScore: number;
    reasons: string[];
    suggestedOrder: number;
  }>;
  /** Selected projects with relevance scores */
  selectedProjects: Array<{
    project: Project;
    relevanceScore: number;
    reasons: string[];
    suggestedOrder: number;
  }>;
  /** Analysis of selection decisions */
  selectionAnalysis: {
    totalExperiencesConsidered: number;
    totalProjectsConsidered: number;
    selectionStrategy: string;
    keyFactors: string[];
    missingSkillsNeeded: string[];
  };
  /** Recommendations for the user */
  recommendations: {
    experienceGaps: string[];
    skillsToHighlight: string[];
    suggestedImprovements: string[];
  };
}

/**
 * AI Agent that analyzes job descriptions and intelligently selects 
 * the most relevant experiences and projects for a resume
 */
export class ResumeBuilderAgent extends AIAgent<ResumeBuilderInput, ResumeBuilderOutput> {
  
  constructor() {
    super(
      'resume-builder',
      'Resume Builder Agent',
      'Analyzes job descriptions and selects optimal experiences and projects for resume building with minimum 3 selections'
    );
  }

  protected async process(
    input: ResumeBuilderInput,
    context: AgentContext,
    config: AgentConfig
  ): Promise<ResumeBuilderOutput> {
    this.validateInput(input, context);

    const systemPrompt = this.generateSystemPrompt(context, config);
    const userPrompt = this.generateUserPrompt(input, context);

    const result = await this.executeAI<ResumeBuilderOutput>(
      systemPrompt,
      userPrompt,
      config
    );

    // Ensure minimum requirements are met
    return this.enforceMinimumSelections(result, context, input);
  }

  protected validateInput(input: ResumeBuilderInput, context: AgentContext): void {
    if (!context.jobDescription?.trim()) {
      throw new Error('Job description is required for resume building');
    }

    if (!context.data?.experiences?.length && !context.data?.projects?.length) {
      throw new Error('No experiences or projects available to select from');
    }

    if (context.jobDescription.length < 50) {
      throw new Error('Job description is too short for meaningful analysis');
    }
  }

  protected generateSystemPrompt(context: AgentContext, config: AgentConfig): string {
    return `You are an expert AI Resume Builder that specializes in analyzing job descriptions and selecting the most relevant experiences and projects for resume optimization.

CORE MISSION:
- Analyze the job description to understand required skills, technologies, and responsibilities
- Select the most relevant experiences and projects from the candidate's background
- Ensure a MINIMUM of 3 total items are selected (experiences + projects combined)
- If the user has fewer than 3 total items, select all available items
- Prioritize quality and relevance over quantity

SELECTION CRITERIA:
1. **Technical Skill Match (40%)**: How well the experience/project technologies match job requirements
2. **Responsibility Alignment (30%)**: How similar the role responsibilities are to job duties
3. **Industry Relevance (15%)**: How relevant the industry/domain experience is
4. **Impact and Scale (10%)**: The scope and impact of the work
5. **Recency (5%)**: How recent the experience is

MANDATORY MINIMUMS:
- Select AT LEAST 3 total items (experiences + projects combined)
- If fewer than 3 items available, select ALL available items
- If more than needed, prioritize the highest scoring items
- Always explain the selection rationale clearly

SCORING SYSTEM:
- Rate each item from 0-100 based on relevance to the job
- Provide specific reasons for high/low scores
- Consider both explicit matches (mentioned technologies) and implicit matches (transferable skills)

OUTPUT REQUIREMENTS:
- Return valid JSON with no markdown formatting
- Include relevance scores and detailed reasoning
- Provide suggested ordering for optimal presentation
- Include analysis of selection strategy and gaps
- Suggest areas for improvement

${config.customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}`;
  }

  protected generateUserPrompt(input: ResumeBuilderInput, context: AgentContext): string {
    const { data } = context;
    const experiences = data?.experiences || [];
    const projects = data?.projects || [];

    return `JOB DESCRIPTION:
${context.jobDescription}

COMPANY: ${context.company || 'Not specified'}
POSITION: ${context.position || 'Not specified'}

AVAILABLE EXPERIENCES (${experiences.length} total):
${experiences.map((exp, idx) => `
${idx + 1}. ${exp.company} - ${exp.title} (${exp.date})
   Bullets: ${exp.bullets?.join('; ') || 'None'}
   Tags: ${exp.tags?.join(', ') || 'None'}
`).join('\n')}

AVAILABLE PROJECTS (${projects.length} total):
${projects.map((proj, idx) => `
${idx + 1}. ${proj.title}
   Link: ${proj.link || 'None'}
   Bullets: ${proj.bullets?.join('; ') || 'None'}
   Tags: ${proj.tags?.join(', ') || 'None'}
`).join('\n')}

SELECTION PARAMETERS:
- Maximum experiences to select: ${input.maxExperiences || 'No limit'}
- Maximum projects to select: ${input.maxProjects || 'No limit'}
- Enforce minimums: ${input.enforceMinimums !== false ? 'Yes' : 'No'}
- Custom criteria: ${input.selectionCriteria || 'Use standard criteria'}

INSTRUCTIONS:
Analyze the job description and select the most relevant experiences and projects. Ensure you select AT LEAST 3 total items unless fewer are available. For each selected item, provide:

1. The complete item data
2. Relevance score (0-100) 
3. Specific reasons for selection
4. Suggested order for resume presentation

Return your response as JSON with this structure:
{
  "selectedExperiences": [
    {
      "experience": {entire experience object},
      "relevanceScore": 85,
      "reasons": ["Matches React requirement", "Led team similar to job", "Used AWS mentioned in job"],
      "suggestedOrder": 1
    }
  ],
  "selectedProjects": [
    {
      "project": {entire project object},
      "relevanceScore": 92,
      "reasons": ["Uses exact tech stack", "Solves similar problem domain"],
      "suggestedOrder": 1
    }
  ],
  "selectionAnalysis": {
    "totalExperiencesConsidered": ${experiences.length},
    "totalProjectsConsidered": ${projects.length},
    "selectionStrategy": "Prioritized recent experiences with React and backend development matching job requirements",
    "keyFactors": ["React framework expertise", "Backend API development", "Team leadership experience"],
    "missingSkillsNeeded": ["Docker containerization", "Kubernetes orchestration"]
  },
  "recommendations": {
    "experienceGaps": ["No direct experience with microservices architecture"],
    "skillsToHighlight": ["React development", "RESTful API design", "Team collaboration"],
    "suggestedImprovements": ["Add metrics to project descriptions", "Highlight scalability achievements"]
  }
}`;
  }

  protected calculateConfidence(result: ResumeBuilderOutput, context: AgentContext): number {
    if (!result.selectedExperiences && !result.selectedProjects) {
      return 20; // No selections made
    }

    const totalSelected = (result.selectedExperiences?.length || 0) + (result.selectedProjects?.length || 0);
    const hasMinimum = totalSelected >= 3;
    const hasQualityScores = result.selectedExperiences?.every(e => e.relevanceScore >= 60) && 
                           result.selectedProjects?.every(p => p.relevanceScore >= 60);

    let confidence = 70; // Base confidence

    if (hasMinimum) confidence += 15;
    if (hasQualityScores) confidence += 10;
    if (result.selectionAnalysis?.keyFactors?.length >= 3) confidence += 5;

    return Math.min(confidence, 95);
  }

  /**
   * Ensures minimum selection requirements are met
   */
  private enforceMinimumSelections(
    result: ResumeBuilderOutput,
    context: AgentContext,
    input: ResumeBuilderInput
  ): ResumeBuilderOutput {
    const selectedExperiences = result.selectedExperiences || [];
    const selectedProjects = result.selectedProjects || [];
    const totalSelected = selectedExperiences.length + selectedProjects.length;

    // If we have at least 3 items selected, we're good
    if (totalSelected >= 3 || input.enforceMinimums === false) {
      return result;
    }

    // We need to select more items to meet minimum
    const availableExperiences = context.data?.experiences || [];
    const availableProjects = context.data?.projects || [];
    const selectedExpIds = new Set(selectedExperiences.map(se => se.experience.id));
    const selectedProjIds = new Set(selectedProjects.map(sp => sp.project.id));

    // Add remaining experiences
    const remainingExperiences = availableExperiences.filter(exp => !selectedExpIds.has(exp.id));
    const remainingProjects = availableProjects.filter(proj => !selectedProjIds.has(proj.id));

    // Add items until we reach minimum 3
    let currentTotal = totalSelected;
    const enhancedExperiences = [...selectedExperiences];
    const enhancedProjects = [...selectedProjects];

    // Add remaining experiences first
    for (const exp of remainingExperiences) {
      if (currentTotal >= 3) break;
      enhancedExperiences.push({
        experience: exp,
        relevanceScore: 50, // Default score for minimum enforcement
        reasons: ['Selected to meet minimum requirement'],
        suggestedOrder: enhancedExperiences.length + 1
      });
      currentTotal++;
    }

    // Add remaining projects if still needed
    for (const proj of remainingProjects) {
      if (currentTotal >= 3) break;
      enhancedProjects.push({
        project: proj,
        relevanceScore: 50, // Default score for minimum enforcement
        reasons: ['Selected to meet minimum requirement'],
        suggestedOrder: enhancedProjects.length + 1
      });
      currentTotal++;
    }

    return {
      ...result,
      selectedExperiences: enhancedExperiences,
      selectedProjects: enhancedProjects,
      selectionAnalysis: {
        ...result.selectionAnalysis,
        selectionStrategy: result.selectionAnalysis.selectionStrategy + 
          (currentTotal > totalSelected ? ' (Additional items added to meet 3-item minimum)' : '')
      }
    };
  }
}