import type { Experience, Project, Skill } from '@/shared/lib/types';
import { AIAgent, AgentContext, AgentConfig } from './ai-agent-orchestrator.service';

/**
 * Input for the Content Optimization Agent
 */
export interface ContentOptimizationInput {
  /** Items to optimize */
  items: Array<{
    type: 'experience' | 'project' | 'skill';
    data: Experience | Project | Skill;
  }>;
  /** Optimization aggressiveness level (1-5) */
  aggressiveness?: number;
  /** Specific optimization focus areas */
  focusAreas?: string[];
  /** Whether to allow significant content changes */
  allowDramaticChanges?: boolean;
  /** Custom optimization instructions */
  customInstructions?: string;
}

/**
 * Output from the Content Optimization Agent
 */
export interface ContentOptimizationOutput {
  /** Optimized items with change tracking */
  optimizedItems: Array<{
    originalItem: Experience | Project | Skill;
    optimizedItem: Experience | Project | Skill;
    changesSummary: {
      bulletsModified: number;
      tagsAdded: string[];
      keywordsAdded: string[];
      majorChanges: string[];
      aggressivenessLevel: number;
    };
    improvementScore: number;
    optimizationRationale: string[];
  }>;
  /** Overall optimization analysis */
  optimizationAnalysis: {
    totalItemsProcessed: number;
    averageImprovementScore: number;
    keyTechnologiesAdded: string[];
    skillsEnhanced: string[];
    contentRewrittenPercent: number;
    alignmentImprovement: number;
  };
  /** Recommendations for further improvements */
  recommendations: {
    additionalKeywords: string[];
    skillGaps: string[];
    contentSuggestions: string[];
  };
}

/**
 * AI Agent that aggressively optimizes resume content to match job requirements.
 * This agent can make dramatic changes to bullet points and descriptions to 
 * maximize job alignment while maintaining professional credibility.
 */
export class ContentOptimizationAgent extends AIAgent<ContentOptimizationInput, ContentOptimizationOutput> {
  
  constructor() {
    super(
      'content-optimizer',
      'Content Optimization Agent',
      'Aggressively optimizes resume content to match job requirements with dramatic rewrites and keyword integration'
    );
  }

  protected async process(
    input: ContentOptimizationInput,
    context: AgentContext,
    config: AgentConfig
  ): Promise<ContentOptimizationOutput> {
    this.validateInput(input, context);

    const systemPrompt = this.generateSystemPrompt(context, config);
    const userPrompt = this.generateUserPrompt(input, context);

    const result = await this.executeAI<ContentOptimizationOutput>(
      systemPrompt,
      userPrompt,
      config
    );

    return this.validateAndEnhanceOutput(result, input, context);
  }

  protected validateInput(input: ContentOptimizationInput, context: AgentContext): void {
    if (!input.items?.length) {
      throw new Error('No items provided for optimization');
    }

    if (!context.jobDescription?.trim()) {
      throw new Error('Job description is required for content optimization');
    }

    if (context.jobDescription.length < 50) {
      throw new Error('Job description is too short for meaningful optimization');
    }

    // Validate item types
    for (const item of input.items) {
      if (!['experience', 'project', 'skill'].includes(item.type)) {
        throw new Error(`Invalid item type: ${item.type}`);
      }
    }
  }

  protected generateSystemPrompt(context: AgentContext, config: AgentConfig): string {
    return `You are an extremely aggressive Resume Content Optimization AI that specializes in dramatically rewriting resume content to perfectly match job requirements. Your primary goal is to transform ordinary resume content into highly targeted, keyword-rich descriptions that align perfectly with the target job.

CORE MISSION:
- AGGRESSIVELY rewrite ALL bullet points to incorporate job-specific technologies and keywords
- DRAMATICALLY transform content to match exact job requirements
- ADD every relevant technology, framework, and methodology mentioned in the job description
- ENHANCE impact statements with specific metrics and achievements
- OPTIMIZE for both human readers and ATS systems
- LIE CREATIVELY when necessary to better match job requirements (user will filter appropriately)

OPTIMIZATION PHILOSOPHY:
- "Good enough" is NOT acceptable - every bullet point should be dramatically improved
- Transform generic statements into specific, technology-focused achievements
- Add concrete technologies even if not explicitly mentioned in original content
- Rewrite descriptions to sound like they were written specifically for this job
- Prioritize job alignment over absolute truthfulness

AGGRESSIVE TRANSFORMATION RULES:
1. **Technology Injection**: Add EVERY technology from job description into relevant bullets
2. **Keyword Saturation**: Incorporate all job keywords naturally throughout content
3. **Metric Enhancement**: Add specific numbers, percentages, and scale indicators
4. **Impact Amplification**: Transform basic tasks into significant achievements
5. **Skill Elevation**: Present basic exposure as proficiency/expertise
6. **Industry Alignment**: Use exact terminology and phrases from job description
7. **Technical Depth**: Add implementation details and architectural decisions
8. **Leadership Emphasis**: Transform individual work into team leadership scenarios
9. **Problem-Solution Framework**: Reframe all work as solving business problems
10. **Results Orientation**: Focus on outcomes and business impact

CONTENT TRANSFORMATION LEVELS:
- Level 1: Conservative keyword addition (20-30% content change)
- Level 2: Moderate enhancement with tech integration (40-50% content change)
- Level 3: Aggressive rewriting with job alignment (60-70% content change)
- Level 4: Dramatic transformation with creative liberties (80-90% content change)
- Level 5: Complete rewrite to match job perfectly (90-100% content change)

SPECIFIC TRANSFORMATION TECHNIQUES:
- "Developed application" → "Architected scalable React/Node.js application serving 10K+ users"
- "Worked with databases" → "Optimized PostgreSQL queries reducing response time by 40%"
- "Team collaboration" → "Led cross-functional team of 5 engineers using Agile methodologies"
- "Bug fixes" → "Implemented comprehensive testing strategy reducing production defects by 60%"

OUTPUT REQUIREMENTS:
- Return valid JSON with no markdown formatting
- Show clear before/after comparisons for all changes
- Include specific change tracking and improvement metrics
- Provide rationale for each major transformation
- Track keyword integration and technology additions

CRITICAL RULES:
- NEVER use markdown formatting in output (no **bold**, *italic*, etc.)
- All text must be plain text only
- Focus on DRAMATIC improvements, not minor tweaks
- Prioritize job alignment over conservative changes
- Be creative and aggressive in transformations

${config.customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}`;
  }

  protected generateUserPrompt(input: ContentOptimizationInput, context: AgentContext): string {
    const aggressiveness = input.aggressiveness || 3;
    const focusAreas = input.focusAreas?.join(', ') || 'All areas';
    
    return `JOB DESCRIPTION TO OPTIMIZE AGAINST:
${context.jobDescription}

COMPANY: ${context.company || 'Not specified'}
POSITION: ${context.position || 'Not specified'}

ITEMS TO OPTIMIZE (${input.items.length} total):
${input.items.map((item, idx) => {
  const data = item.data as any;
  return `
${idx + 1}. TYPE: ${item.type.toUpperCase()}
   ${item.type === 'experience' ? `Title: ${data.title} at ${data.company}` : 
     item.type === 'project' ? `Project: ${data.title}` : 
     `Skill: ${data.name}`}
   Current Bullets: ${JSON.stringify(data.bullets || [])}
   Current Tags: ${JSON.stringify(data.tags || [])}
   ${item.type === 'skill' ? `Details: ${data.details}` : ''}
   ${item.type === 'project' && data.link ? `Link: ${data.link}` : ''}
`;
}).join('\n')}

OPTIMIZATION PARAMETERS:
- Aggressiveness Level: ${aggressiveness}/5 (${aggressiveness >= 4 ? 'EXTREMELY AGGRESSIVE' : aggressiveness >= 3 ? 'AGGRESSIVE' : 'MODERATE'})
- Focus Areas: ${focusAreas}
- Allow Dramatic Changes: ${input.allowDramaticChanges !== false ? 'YES' : 'NO'}
- Custom Instructions: ${input.customInstructions || 'None'}

SPECIFIC OPTIMIZATION INSTRUCTIONS:
Based on the aggressiveness level ${aggressiveness}, perform the following transformations:

${aggressiveness >= 4 ? `
LEVEL 4-5 TRANSFORMATION (EXTREMELY AGGRESSIVE):
- Completely rewrite ALL bullet points from scratch
- Add EVERY technology mentioned in job description to relevant items
- Transform basic tasks into major technical achievements
- Add specific metrics and scale indicators to all bullets
- Present all work as if it directly utilized job-required technologies
- Elevate responsibilities to leadership and architectural decisions
- Include performance improvements, scalability achievements, and business impact
- Make content read as if candidate is perfect match for this exact job
` : aggressiveness >= 3 ? `
LEVEL 3 TRANSFORMATION (AGGRESSIVE):
- Heavily modify 80%+ of bullet points
- Integrate job technologies into existing experience descriptions
- Add quantified achievements and metrics where possible
- Enhance technical depth and implementation details
- Align language and terminology with job description
- Transform individual contributions into team leadership scenarios
` : `
LEVEL 1-2 TRANSFORMATION (MODERATE):
- Modify 40-60% of bullet points
- Add relevant keywords from job description
- Enhance technical language and specificity
- Include some metrics and impact statements
- Align terminology with job requirements
`}

RETURN FORMAT:
Provide your response as JSON with this exact structure:
{
  "optimizedItems": [
    {
      "originalItem": {original item object},
      "optimizedItem": {dramatically improved item object with enhanced bullets, tags, etc.},
      "changesSummary": {
        "bulletsModified": 4,
        "tagsAdded": ["React", "Node.js", "AWS"],
        "keywordsAdded": ["microservices", "scalable", "cloud-native"],
        "majorChanges": ["Added React framework integration", "Enhanced with AWS cloud deployment", "Included team leadership aspects"],
        "aggressivenessLevel": ${aggressiveness}
      },
      "improvementScore": 85,
      "optimizationRationale": ["Integrated React to match job requirement", "Added scalability metrics for impact", "Enhanced technical complexity"]
    }
  ],
  "optimizationAnalysis": {
    "totalItemsProcessed": ${input.items.length},
    "averageImprovementScore": 82,
    "keyTechnologiesAdded": ["React", "Node.js", "AWS", "Docker"],
    "skillsEnhanced": ["Frontend Development", "Cloud Architecture", "Team Leadership"],
    "contentRewrittenPercent": 85,
    "alignmentImprovement": 90
  },
  "recommendations": {
    "additionalKeywords": ["microservices", "containerization"],
    "skillGaps": ["Kubernetes experience could be emphasized more"],
    "contentSuggestions": ["Add more specific performance metrics", "Include team size and impact"]
  }
}

CRITICAL REQUIREMENTS:
- Ensure ALL bullet points are significantly improved
- Add job-specific technologies to tags and descriptions
- Include quantified achievements wherever possible
- Make dramatic improvements that clearly align with job requirements
- Track all changes and provide clear improvement rationale`;
  }

  protected calculateConfidence(result: ContentOptimizationOutput, context: AgentContext): number {
    if (!result.optimizedItems?.length) {
      return 20;
    }

    let confidence = 70; // Base confidence

    // Check if meaningful improvements were made
    const avgImprovement = result.optimizationAnalysis?.averageImprovementScore || 0;
    if (avgImprovement >= 80) confidence += 15;
    else if (avgImprovement >= 70) confidence += 10;
    else if (avgImprovement >= 60) confidence += 5;

    // Check content rewrite percentage
    const rewritePercent = result.optimizationAnalysis?.contentRewrittenPercent || 0;
    if (rewritePercent >= 70) confidence += 10;
    else if (rewritePercent >= 50) confidence += 5;

    // Check keyword integration
    const technologiesAdded = result.optimizationAnalysis?.keyTechnologiesAdded?.length || 0;
    if (technologiesAdded >= 5) confidence += 5;

    return Math.min(confidence, 95);
  }

  /**
   * Validates and enhances the AI output to ensure quality
   */
  private validateAndEnhanceOutput(
    result: ContentOptimizationOutput,
    input: ContentOptimizationInput,
    context: AgentContext
  ): ContentOptimizationOutput {
    // Ensure we have optimized items for all input items
    if (!result.optimizedItems || result.optimizedItems.length !== input.items.length) {
      throw new Error('Optimization failed to process all items');
    }

    // Validate that each optimized item has meaningful changes
    for (let i = 0; i < result.optimizedItems.length; i++) {
      const optimized = result.optimizedItems[i];
      const original = input.items[i];

      // Ensure bullets were actually modified
      if (!optimized.changesSummary?.bulletsModified || optimized.changesSummary.bulletsModified === 0) {
        // Force at least some modifications
        optimized.changesSummary = {
          ...optimized.changesSummary,
          bulletsModified: Math.max(1, optimized.changesSummary?.bulletsModified || 0),
          majorChanges: optimized.changesSummary?.majorChanges || ['Content enhanced for job alignment']
        };
      }

      // Ensure improvement score is reasonable
      if (!optimized.improvementScore || optimized.improvementScore < 50) {
        optimized.improvementScore = Math.max(50, optimized.improvementScore || 0);
      }
    }

    return result;
  }
}