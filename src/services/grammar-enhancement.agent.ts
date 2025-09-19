import { AIAgent, AgentContext, AgentConfig } from './ai-agent-orchestrator.service';

/**
 * Input for the Grammar Enhancement Agent
 */
export interface GrammarEnhancementInput {
  /** The bullet point or text to enhance */
  text: string;
  /** User's specific instructions for changes */
  userPrompt: string;
  /** Context about the item (experience, project, etc.) */
  itemContext?: {
    type: 'experience' | 'project' | 'skill';
    title?: string;
    company?: string;
    existingBullets?: string[];
  };
  /** Enhancement preferences */
  preferences?: {
    tone?: 'professional' | 'dynamic' | 'technical' | 'creative';
    length?: 'shorter' | 'longer' | 'same';
    focus?: 'grammar' | 'impact' | 'keywords' | 'clarity' | 'all';
    preserveStructure?: boolean;
  };
}

/**
 * Output from the Grammar Enhancement Agent
 */
export interface GrammarEnhancementOutput {
  /** The enhanced text */
  enhancedText: string;
  /** Original text for comparison */
  originalText: string;
  /** Specific changes made */
  changesSummary: {
    grammarFixes: string[];
    styleImprovements: string[];
    keywordsAdded: string[];
    impactEnhancements: string[];
    structuralChanges: string[];
  };
  /** Alternative suggestions */
  alternatives: Array<{
    text: string;
    focus: string;
    reasoning: string;
  }>;
  /** Enhancement analysis */
  analysis: {
    improvementScore: number;
    readabilityImprovement: number;
    impactIncrease: number;
    jobAlignmentBoost: number;
    suggestedNextSteps: string[];
  };
  /** Confidence in the enhancement */
  confidence: number;
}

/**
 * AI Agent that provides intelligent grammar and content enhancement for manual resume editing.
 * This agent is context-aware and can make suggestions based on job requirements while
 * respecting user intentions and maintaining professional quality.
 */
export class GrammarEnhancementAgent extends AIAgent<GrammarEnhancementInput, GrammarEnhancementOutput> {
  
  constructor() {
    super(
      'grammar-enhancer',
      'Grammar Enhancement Agent',
      'Provides intelligent grammar and content enhancement for manual resume editing with job context awareness'
    );
  }

  protected async process(
    input: GrammarEnhancementInput,
    context: AgentContext,
    config: AgentConfig
  ): Promise<GrammarEnhancementOutput> {
    this.validateInput(input, context);

    const systemPrompt = this.generateSystemPrompt(context, config);
    const userPrompt = this.generateUserPrompt(input, context);

    const result = await this.executeAI<GrammarEnhancementOutput>(
      systemPrompt,
      userPrompt,
      config
    );

    return this.validateAndEnhanceOutput(result, input);
  }

  protected validateInput(input: GrammarEnhancementInput, context: AgentContext): void {
    if (!input.text?.trim()) {
      throw new Error('Text is required for grammar enhancement');
    }

    if (!input.userPrompt?.trim()) {
      throw new Error('User prompt is required to understand desired changes');
    }

    if (input.text.length > 1000) {
      throw new Error('Text is too long. Please provide shorter content for enhancement.');
    }
  }

  protected generateSystemPrompt(context: AgentContext, config: AgentConfig): string {
    const hasJobContext = context.jobDescription && context.jobDescription.length > 50;
    
    return `You are an expert AI Grammar and Content Enhancement Agent that specializes in improving resume bullet points and content based on user instructions. You have deep expertise in professional writing, resume optimization, and grammatical excellence.

CORE CAPABILITIES:
- Fix grammar, punctuation, and spelling errors with precision
- Enhance sentence structure and readability
- Improve impact and professional tone
- Add relevant keywords when appropriate (especially if job context available)
- Maintain user intent while making improvements
- Provide multiple enhancement options
- Explain changes clearly and professionally

ENHANCEMENT PRINCIPLES:
1. **User Intent First**: Always respect the user's specific instructions and goals
2. **Context Awareness**: Use job description context to enhance relevance when available
3. **Professional Quality**: Ensure all output meets high professional standards
4. **Clarity and Impact**: Prioritize clear, impactful communication
5. **Grammatical Excellence**: Fix all grammatical and structural issues
6. **Keyword Intelligence**: Naturally incorporate relevant keywords from job description
7. **Tone Consistency**: Maintain appropriate professional tone throughout
8. **Multiple Options**: Provide alternatives to give users choice

${hasJobContext ? `
JOB CONTEXT INTEGRATION:
Since you have access to the job description, you should:
- Incorporate relevant keywords naturally when they fit the content
- Suggest terminology that aligns with the job requirements
- Enhance technical accuracy based on job technologies mentioned
- Improve alignment with job responsibilities where appropriate
- BUT ALWAYS prioritize the user's specific instructions first
` : `
NO JOB CONTEXT:
Focus purely on grammar, clarity, and general professional enhancement since no job context is available.
`}

ENHANCEMENT CATEGORIES:
1. **Grammar Fixes**: Correct syntax, punctuation, verb tense, subject-verb agreement
2. **Style Improvements**: Enhance flow, eliminate redundancy, improve conciseness
3. **Impact Enhancement**: Strengthen action verbs, add specificity, improve metrics
4. **Keyword Integration**: Add relevant terms naturally (when job context available)
5. **Structural Changes**: Improve sentence structure and logical flow

OUTPUT REQUIREMENTS:
- Return valid JSON with no markdown formatting
- Provide clear before/after comparison
- Explain all changes made and reasoning
- Offer alternative versions with different focuses
- Rate improvement across multiple dimensions
- Suggest next steps for further enhancement

TONE AND STYLE GUIDELINES:
- Professional yet engaging
- Action-oriented and results-focused
- Concise but comprehensive
- Industry-appropriate terminology
- Confident and accomplished tone

${config.customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}`;
  }

  protected generateUserPrompt(input: GrammarEnhancementInput, context: AgentContext): string {
    const { text, userPrompt, itemContext, preferences } = input;
    const hasJobContext = context.jobDescription && context.jobDescription.length > 50;

    return `ORIGINAL TEXT TO ENHANCE:
"${text}"

USER'S SPECIFIC INSTRUCTIONS:
"${userPrompt}"

${itemContext ? `
ITEM CONTEXT:
- Type: ${itemContext.type}
- Title: ${itemContext.title || 'Not specified'}
- Company: ${itemContext.company || 'Not specified'}
- Other bullets in this item: ${itemContext.existingBullets?.length ? itemContext.existingBullets.join('; ') : 'None'}
` : ''}

${preferences ? `
ENHANCEMENT PREFERENCES:
- Preferred tone: ${preferences.tone || 'professional'}
- Length preference: ${preferences.length || 'appropriate length'}
- Focus area: ${preferences.focus || 'all aspects'}
- Preserve structure: ${preferences.preserveStructure ? 'Yes' : 'No'}
` : ''}

${hasJobContext ? `
JOB CONTEXT FOR ENHANCEMENT:
${context.jobDescription}

Position: ${context.position || 'Not specified'}
Company: ${context.company || 'Not specified'}

INSTRUCTION: Use this job context to enhance relevance and add appropriate keywords, but ALWAYS prioritize the user's specific instructions above job alignment.
` : `
NO JOB CONTEXT AVAILABLE: Focus on general grammar and professional enhancement.
`}

ENHANCEMENT TASK:
Please enhance the provided text according to the user's specific instructions. Your response should:

1. **Primary Enhancement**: Create an improved version that directly addresses the user's instructions
2. **Grammar and Style**: Fix any grammatical issues and improve professional presentation
3. **Impact Optimization**: Strengthen the content to be more compelling and results-focused
4. **Alternative Options**: Provide 2-3 alternative versions with different approaches
5. **Change Analysis**: Clearly explain what changes were made and why

Return your response as JSON with this structure:
{
  "enhancedText": "The primary enhanced version addressing user instructions",
  "originalText": "${text}",
  "changesSummary": {
    "grammarFixes": ["Fixed verb tense consistency", "Corrected punctuation"],
    "styleImprovements": ["Enhanced action verb strength", "Improved flow"],
    "keywordsAdded": ["scalable", "cloud-native"] // only if job context used,
    "impactEnhancements": ["Added specific metrics", "Strengthened results focus"],
    "structuralChanges": ["Reordered for better flow", "Combined related concepts"]
  },
  "alternatives": [
    {
      "text": "Alternative version 1 with different focus",
      "focus": "Technical emphasis",
      "reasoning": "This version emphasizes technical skills mentioned in user request"
    },
    {
      "text": "Alternative version 2",
      "focus": "Impact focus",
      "reasoning": "This version prioritizes quantifiable results and business impact"
    }
  ],
  "analysis": {
    "improvementScore": 85,
    "readabilityImprovement": 20,
    "impactIncrease": 30,
    "jobAlignmentBoost": ${hasJobContext ? '25' : '0'},
    "suggestedNextSteps": ["Consider adding specific metrics", "Could enhance with industry terminology"]
  },
  "confidence": 90
}

CRITICAL REQUIREMENTS:
- Directly address the user's specific instructions first and foremost
- Maintain the core meaning and intent of the original text
- Ensure grammatical correctness and professional quality
- Provide meaningful alternatives that offer different approaches
- Explain changes clearly so user understands the improvements made
- Never use markdown formatting in the JSON response`;
  }

  protected calculateConfidence(result: GrammarEnhancementOutput, context: AgentContext): number {
    if (!result.enhancedText || result.enhancedText === result.originalText) {
      return 30; // No meaningful enhancement
    }

    let confidence = 75; // Base confidence

    // Check if meaningful changes were made
    const totalChanges = Object.values(result.changesSummary || {}).flat().length;
    if (totalChanges >= 3) confidence += 10;
    else if (totalChanges >= 1) confidence += 5;

    // Check if alternatives were provided
    if (result.alternatives?.length >= 2) confidence += 5;

    // Check improvement score
    const improvement = result.analysis?.improvementScore || 0;
    if (improvement >= 80) confidence += 10;
    else if (improvement >= 70) confidence += 5;

    return Math.min(confidence, 95);
  }

  /**
   * Validates and enhances the AI output
   */
  private validateAndEnhanceOutput(
    result: GrammarEnhancementOutput,
    input: GrammarEnhancementInput
  ): GrammarEnhancementOutput {
    // Ensure enhanced text is different from original
    if (!result.enhancedText || result.enhancedText.trim() === input.text.trim()) {
      // Force some enhancement if none was made
      result.enhancedText = this.createMinimalEnhancement(input.text);
      result.changesSummary = {
        ...result.changesSummary,
        styleImprovements: ['Enhanced professional presentation']
      };
    }

    // Ensure alternatives exist
    if (!result.alternatives || result.alternatives.length === 0) {
      result.alternatives = [
        {
          text: result.enhancedText,
          focus: 'Professional clarity',
          reasoning: 'Focused on clear, professional presentation'
        }
      ];
    }

    // Validate analysis scores
    if (!result.analysis) {
      result.analysis = {
        improvementScore: 70,
        readabilityImprovement: 10,
        impactIncrease: 15,
        jobAlignmentBoost: 0,
        suggestedNextSteps: ['Review for additional opportunities']
      };
    }

    return result;
  }

  /**
   * Creates a minimal enhancement if AI failed to improve the text
   */
  private createMinimalEnhancement(originalText: string): string {
    // Simple fallback enhancement - ensure proper capitalization and add period if missing
    let enhanced = originalText.trim();
    if (enhanced.length > 0) {
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
      if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
        enhanced += '.';
      }
    }
    return enhanced;
  }
}