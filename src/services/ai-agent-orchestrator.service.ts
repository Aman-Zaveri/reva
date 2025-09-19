import type { Profile, DataBundle, Experience, Project, Skill } from '@/lib/types';
import { GeminiService } from '@/services/gemini.service';

/**
 * Base interface for all AI agents
 */
export interface BaseAgent {
  /** Unique identifier for the agent */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of agent capabilities */
  description: string;
  /** Current processing status */
  status: 'idle' | 'processing' | 'completed' | 'error';
}

/**
 * Configuration for agent behavior
 */
export interface AgentConfig {
  /** Response temperature (0.0-1.0) */
  temperature?: number;
  /** Maximum output tokens */
  maxTokens?: number;
  /** Custom instructions for the agent */
  customInstructions?: string;
  /** Context window size */
  contextSize?: number;
}

/**
 * Standard context passed to all agents
 */
export interface AgentContext {
  /** Job description text */
  jobDescription?: string;
  /** Target position/title */
  position?: string;
  /** Company information */
  company?: string;
  /** User's profile data */
  profile?: Profile;
  /** Master data bundle */
  data?: DataBundle;
  /** Additional context */
  metadata?: Record<string, any>;
}

/**
 * Base response structure for all agents
 */
export interface BaseAgentResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** The main response data */
  data?: T;
  /** Any error message */
  error?: string;
  /** Processing metadata */
  metadata?: {
    processingTime: number;
    tokensUsed?: number;
    agentId: string;
    version: string;
  };
  /** Confidence score (0-100) */
  confidence?: number;
}

/**
 * Agent execution options
 */
export interface AgentExecutionOptions {
  /** Agent configuration */
  config?: AgentConfig;
  /** Execution timeout in milliseconds */
  timeout?: number;
  /** Whether to cache results */
  cache?: boolean;
  /** Cache TTL in seconds */
  cacheTtl?: number;
}

/**
 * Abstract base class for all AI agents
 */
export abstract class AIAgent<TInput = any, TOutput = any> implements BaseAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public status: BaseAgent['status'] = 'idle';

  protected readonly defaultConfig: AgentConfig = {
    temperature: 0.3,
    maxTokens: 4096,
    contextSize: 8192
  };

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  /**
   * Execute the agent with given input and context
   */
  public async execute(
    input: TInput,
    context: AgentContext,
    options: AgentExecutionOptions = {}
  ): Promise<BaseAgentResponse<TOutput>> {
    const startTime = Date.now();
    this.status = 'processing';

    try {
      const config = { ...this.defaultConfig, ...options.config };
      const result = await this.process(input, context, config);
      
      this.status = 'completed';
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        metadata: {
          processingTime,
          agentId: this.id,
          version: '1.0.0'
        },
        confidence: this.calculateConfidence(result, context)
      };
    } catch (error) {
      this.status = 'error';
      const processingTime = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          processingTime,
          agentId: this.id,
          version: '1.0.0'
        }
      };
    }
  }

  /**
   * Abstract method to be implemented by concrete agents
   */
  protected abstract process(
    input: TInput,
    context: AgentContext,
    config: AgentConfig
  ): Promise<TOutput>;

  /**
   * Calculate confidence score for the result
   */
  protected calculateConfidence(result: TOutput, context: AgentContext): number {
    // Default implementation - can be overridden by specific agents
    return 85;
  }

  /**
   * Validate input data
   */
  protected validateInput(input: TInput, context: AgentContext): void {
    // Default implementation - can be overridden by specific agents
  }

  /**
   * Generate system prompt for this agent
   */
  protected abstract generateSystemPrompt(context: AgentContext, config: AgentConfig): string;

  /**
   * Generate user prompt for this agent
   */
  protected abstract generateUserPrompt(input: TInput, context: AgentContext): string;

  /**
   * Execute AI generation with proper error handling
   */
  protected async executeAI<T>(
    systemPrompt: string,
    userPrompt: string,
    config: AgentConfig
  ): Promise<T> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const response = await GeminiService.generateContent<T>(fullPrompt, {
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens
    });

    return response.data;
  }
}

/**
 * Orchestrates multiple AI agents and manages their interactions
 */
export class AIAgentOrchestrator {
  private static instance: AIAgentOrchestrator;
  private agents: Map<string, AIAgent> = new Map();
  private executionHistory: Array<{
    agentId: string;
    timestamp: Date;
    duration: number;
    success: boolean;
  }> = [];

  /**
   * Singleton instance getter
   */
  public static getInstance(): AIAgentOrchestrator {
    if (!this.instance) {
      this.instance = new AIAgentOrchestrator();
    }
    return this.instance;
  }

  /**
   * Register an agent with the orchestrator
   */
  public registerAgent(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get a registered agent by ID
   */
  public getAgent(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List all registered agents
   */
  public listAgents(): BaseAgent[] {
    return Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status
    }));
  }

  /**
   * Execute a single agent
   */
  public async executeAgent<TInput, TOutput>(
    agentId: string,
    input: TInput,
    context: AgentContext,
    options: AgentExecutionOptions = {}
  ): Promise<BaseAgentResponse<TOutput>> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const startTime = Date.now();
    const result = await agent.execute(input, context, options);
    const duration = Date.now() - startTime;

    // Record execution history
    this.executionHistory.push({
      agentId,
      timestamp: new Date(),
      duration,
      success: result.success
    });

    return result;
  }

  /**
   * Execute multiple agents in sequence
   */
  public async executeSequence(
    sequence: Array<{
      agentId: string;
      input: any;
      options?: AgentExecutionOptions;
    }>,
    context: AgentContext
  ): Promise<Array<BaseAgentResponse<any>>> {
    const results: Array<BaseAgentResponse<any>> = [];

    for (const step of sequence) {
      const result = await this.executeAgent(
        step.agentId,
        step.input,
        context,
        step.options
      );
      results.push(result);

      // Stop execution if any step fails
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute multiple agents in parallel
   */
  public async executeParallel(
    executions: Array<{
      agentId: string;
      input: any;
      options?: AgentExecutionOptions;
    }>,
    context: AgentContext
  ): Promise<Array<BaseAgentResponse<any>>> {
    const promises = executions.map(execution =>
      this.executeAgent(execution.agentId, execution.input, context, execution.options)
    );

    return Promise.all(promises);
  }

  /**
   * Get execution statistics
   */
  public getExecutionStats(): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    agentUsage: Record<string, number>;
  } {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(h => h.success).length;
    const avgDuration = total > 0 
      ? this.executionHistory.reduce((sum, h) => sum + h.duration, 0) / total 
      : 0;

    const agentUsage: Record<string, number> = {};
    this.executionHistory.forEach(h => {
      agentUsage[h.agentId] = (agentUsage[h.agentId] || 0) + 1;
    });

    return {
      totalExecutions: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageDuration: Math.round(avgDuration),
      agentUsage
    };
  }

  /**
   * Clear execution history
   */
  public clearHistory(): void {
    this.executionHistory = [];
  }
}