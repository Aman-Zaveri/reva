import { AIAgentOrchestrator, AgentContext } from './ai-agent-orchestrator.service';
import { ResumeBuilderAgent } from './resume-builder.agent';
import { ContentOptimizationAgent } from './content-optimization.agent';
import { GrammarEnhancementAgent } from './grammar-enhancement.agent';
import { SkillsExtractionAgent } from './skills-extraction.agent';
import { ResumeReviewAgent } from './resume-review.agent';
import { ATSOptimizationAgent } from './ats-optimization.agent';
import type { Profile, DataBundle } from '@/shared/lib/types';

/**
 * Predefined workflows for common AI agent combinations
 */
export type WorkflowType = 
  | 'full-resume-optimization'
  | 'job-specific-optimization'
  | 'content-enhancement'
  | 'skills-analysis'
  | 'resume-review'
  | 'ats-optimization'
  | 'manual-editing-assistance'
  | 'custom';

/**
 * Configuration for workflow execution
 */
export interface WorkflowConfig {
  /** Type of workflow to execute */
  type: WorkflowType;
  /** Job context for optimization */
  jobContext?: {
    jobDescription: string;
    position?: string;
    company?: string;
  };
  /** Profile and data to work with */
  profileData: {
    profile: Profile;
    data: DataBundle;
  };
  /** Workflow-specific parameters */
  parameters?: {
    aggressiveness?: number;
    focusAreas?: string[];
    customInstructions?: string;
    preserveReadability?: boolean;
    minExperiences?: number;
    minProjects?: number;
  };
  /** Whether to execute agents in parallel where possible */
  parallelExecution?: boolean;
}

/**
 * Result from workflow execution
 */
export interface WorkflowResult {
  /** Whether the workflow completed successfully */
  success: boolean;
  /** Workflow type that was executed */
  workflowType: WorkflowType;
  /** Results from individual agents */
  agentResults: Array<{
    agentId: string;
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
  }>;
  /** Combined workflow insights */
  workflowInsights?: {
    overallScore?: number;
    keyRecommendations: string[];
    priorityActions: string[];
    estimatedImpact: string;
  };
  /** Total execution time */
  totalExecutionTime: number;
  /** Any workflow-level errors */
  error?: string;
}

/**
 * High-level AI Agent Coordination System that manages complex workflows
 * involving multiple AI agents working together to accomplish user goals.
 */
export class AIAgentCoordinator {
  private static instance: AIAgentCoordinator;
  private orchestrator: AIAgentOrchestrator;

  private constructor() {
    this.orchestrator = AIAgentOrchestrator.getInstance();
    this.initializeAgents();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AIAgentCoordinator {
    if (!this.instance) {
      this.instance = new AIAgentCoordinator();
    }
    return this.instance;
  }

  /**
   * Initialize all available agents
   */
  private initializeAgents(): void {
    this.orchestrator.registerAgent(new ResumeBuilderAgent());
    this.orchestrator.registerAgent(new ContentOptimizationAgent());
    this.orchestrator.registerAgent(new GrammarEnhancementAgent());
    this.orchestrator.registerAgent(new SkillsExtractionAgent());
    this.orchestrator.registerAgent(new ResumeReviewAgent());
    this.orchestrator.registerAgent(new ATSOptimizationAgent());
  }

  /**
   * Execute a predefined workflow
   */
  public async executeWorkflow(config: WorkflowConfig): Promise<WorkflowResult> {
    const startTime = Date.now();
    
    try {
      const context = this.buildAgentContext(config);
      const workflow = this.getWorkflowDefinition(config.type);
      
      let agentResults: WorkflowResult['agentResults'];
      
      if (config.parallelExecution && workflow.parallelizable) {
        agentResults = await this.executeParallelWorkflow(workflow, context, config);
      } else {
        agentResults = await this.executeSequentialWorkflow(workflow, context, config);
      }
      
      const workflowInsights = this.generateWorkflowInsights(agentResults, config.type);
      
      return {
        success: true,
        workflowType: config.type,
        agentResults,
        workflowInsights,
        totalExecutionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        workflowType: config.type,
        agentResults: [],
        totalExecutionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown workflow error'
      };
    }
  }

  /**
   * Execute a single agent with context
   */
  public async executeSingleAgent<T = any>(
    agentId: string,
    input: any,
    config: WorkflowConfig
  ): Promise<T> {
    const context = this.buildAgentContext(config);
    const result = await this.orchestrator.executeAgent(agentId, input, context);
    
    if (!result.success) {
      throw new Error(`Agent execution failed: ${result.error}`);
    }
    
    return result.data as T;
  }

  /**
   * Get list of available agents
   */
  public getAvailableAgents() {
    return this.orchestrator.listAgents();
  }

  /**
   * Get execution statistics
   */
  public getExecutionStats() {
    return this.orchestrator.getExecutionStats();
  }

  /**
   * Build agent context from workflow configuration
   */
  private buildAgentContext(config: WorkflowConfig): AgentContext {
    return {
      jobDescription: config.jobContext?.jobDescription,
      position: config.jobContext?.position,
      company: config.jobContext?.company,
      profile: config.profileData.profile,
      data: config.profileData.data,
      metadata: {
        workflowType: config.type,
        parameters: config.parameters
      }
    };
  }

  /**
   * Get workflow definition for a given type
   */
  private getWorkflowDefinition(type: WorkflowType) {
    const workflows: Record<string, any> = {
      'full-resume-optimization': {
        agents: [
          { id: 'skills-extractor', input: { extractionType: 'job-requirements' } },
          { id: 'resume-builder', input: { enforceMinimums: true } },
          { id: 'content-optimizer', input: { aggressiveness: 4, allowDramaticChanges: true } },
          { id: 'ats-optimizer', input: { keywordDensity: 'aggressive' } },
          { id: 'resume-reviewer', input: { reviewDepth: 'comprehensive' } }
        ],
        parallelizable: false,
        description: 'Complete resume optimization from job analysis to final review'
      },
      
      'job-specific-optimization': {
        agents: [
          { id: 'skills-extractor', input: { extractionType: 'skill-gap-analysis' } },
          { id: 'resume-builder', input: { enforceMinimums: true } },
          { id: 'content-optimizer', input: { aggressiveness: 3, focusAreas: ['keywords', 'impact'] } }
        ],
        parallelizable: false,
        description: 'Optimize resume for specific job with gap analysis'
      },
      
      'content-enhancement': {
        agents: [
          { id: 'content-optimizer', input: { aggressiveness: 2, preserveReadability: true } },
          { id: 'resume-reviewer', input: { focusAreas: ['content', 'impact'] } }
        ],
        parallelizable: false,
        description: 'Enhance content quality and impact'
      },
      
      'skills-analysis': {
        agents: [
          { id: 'skills-extractor', input: { extractionType: 'job-requirements' } },
          { id: 'skills-extractor', input: { extractionType: 'resume-skills' } },
          { id: 'skills-extractor', input: { extractionType: 'skill-gap-analysis' } }
        ],
        parallelizable: true,
        description: 'Comprehensive skills analysis and gap identification'
      },
      
      'resume-review': {
        agents: [
          { id: 'resume-reviewer', input: { reviewDepth: 'comprehensive' } },
          { id: 'ats-optimizer', input: { focusAreas: ['keywords', 'formatting'] } }
        ],
        parallelizable: true,
        description: 'Professional resume review with ATS analysis'
      },
      
      'ats-optimization': {
        agents: [
          { id: 'ats-optimizer', input: { keywordDensity: 'moderate', preserveReadability: true } }
        ],
        parallelizable: false,
        description: 'ATS compatibility optimization'
      },
      
      'manual-editing-assistance': {
        agents: [
          { id: 'grammar-enhancer', input: {} }
        ],
        parallelizable: false,
        description: 'Interactive editing assistance'
      },

      'custom': {
        agents: [],
        parallelizable: true,
        description: 'Custom workflow'
      }
    };

    return workflows[type] || workflows['custom'];
  }

  /**
   * Execute workflow agents in parallel
   */
  private async executeParallelWorkflow(
    workflow: any,
    context: AgentContext,
    config: WorkflowConfig
  ): Promise<WorkflowResult['agentResults']> {
    const executions = workflow.agents.map((agent: any) => ({
      agentId: agent.id,
      input: { ...agent.input, ...config.parameters },
      options: { timeout: 60000 }
    }));

    const results = await this.orchestrator.executeParallel(executions, context);
    
    return results.map((result, index) => ({
      agentId: workflow.agents[index].id,
      success: result.success,
      data: result.data,
      error: result.error,
      executionTime: result.metadata?.processingTime || 0
    }));
  }

  /**
   * Execute workflow agents sequentially
   */
  private async executeSequentialWorkflow(
    workflow: any,
    context: AgentContext,
    config: WorkflowConfig
  ): Promise<WorkflowResult['agentResults']> {
    const agentResults: WorkflowResult['agentResults'] = [];
    
    for (const agent of workflow.agents) {
      const result = await this.orchestrator.executeAgent(
        agent.id,
        { ...agent.input, ...config.parameters },
        context,
        { timeout: 60000 }
      );
      
      agentResults.push({
        agentId: agent.id,
        success: result.success,
        data: result.data,
        error: result.error,
        executionTime: result.metadata?.processingTime || 0
      });
      
      // Stop on critical failures for sequential workflows
      if (!result.success && agent.id !== 'resume-reviewer') {
        break;
      }
    }
    
    return agentResults;
  }

  /**
   * Generate workflow-level insights from agent results
   */
  private generateWorkflowInsights(
    agentResults: WorkflowResult['agentResults'],
    workflowType: WorkflowType
  ): WorkflowResult['workflowInsights'] {
    const successfulResults = agentResults.filter(r => r.success);
    const totalAgents = agentResults.length;
    const successRate = (successfulResults.length / totalAgents) * 100;
    
    // Extract key recommendations from successful agents
    const keyRecommendations: string[] = [];
    const priorityActions: string[] = [];
    
    successfulResults.forEach(result => {
      if (result.data) {
        // Extract recommendations based on agent type
        if (result.agentId === 'resume-reviewer' && result.data.recommendations) {
          keyRecommendations.push(...(result.data.recommendations.immediate || []));
          priorityActions.push(...(result.data.recommendations.shortTerm || []));
        }
        
        if (result.agentId === 'ats-optimizer' && result.data.actionPlan) {
          priorityActions.push(...(result.data.actionPlan.immediate?.map((a: any) => a.action) || []));
        }
        
        if (result.agentId === 'skills-extractor' && result.data.skillGaps) {
          keyRecommendations.push(...(result.data.skillGaps.recommendations || []));
        }
      }
    });
    
    // Calculate estimated impact
    let estimatedImpact = 'Low';
    if (successRate >= 80) estimatedImpact = 'High';
    else if (successRate >= 60) estimatedImpact = 'Medium';
    
    return {
      overallScore: Math.round(successRate),
      keyRecommendations: keyRecommendations.slice(0, 5), // Top 5
      priorityActions: priorityActions.slice(0, 3), // Top 3
      estimatedImpact
    };
  }

  /**
   * Create a custom workflow
   */
  public async executeCustomWorkflow(
    agentSequence: Array<{
      agentId: string;
      input: any;
      parallel?: boolean;
    }>,
    config: WorkflowConfig
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const context = this.buildAgentContext(config);
    
    try {
      // Group agents by parallel execution
      const parallelGroups: Array<Array<typeof agentSequence[0]>> = [];
      let currentGroup: Array<typeof agentSequence[0]> = [];
      
      for (const agent of agentSequence) {
        if (agent.parallel && currentGroup.length === 0) {
          currentGroup.push(agent);
        } else if (agent.parallel && currentGroup.length > 0 && currentGroup[0].parallel) {
          currentGroup.push(agent);
        } else {
          if (currentGroup.length > 0) {
            parallelGroups.push(currentGroup);
            currentGroup = [];
          }
          parallelGroups.push([agent]);
        }
      }
      
      if (currentGroup.length > 0) {
        parallelGroups.push(currentGroup);
      }
      
      // Execute groups
      const allResults: WorkflowResult['agentResults'] = [];
      
      for (const group of parallelGroups) {
        if (group.length === 1) {
          // Single agent execution
          const result = await this.orchestrator.executeAgent(
            group[0].agentId,
            group[0].input,
            context
          );
          allResults.push({
            agentId: group[0].agentId,
            success: result.success,
            data: result.data,
            error: result.error,
            executionTime: result.metadata?.processingTime || 0
          });
        } else {
          // Parallel execution
          const executions = group.map(agent => ({
            agentId: agent.agentId,
            input: agent.input
          }));
          
          const results = await this.orchestrator.executeParallel(executions, context);
          
          results.forEach((result, index) => {
            allResults.push({
              agentId: group[index].agentId,
              success: result.success,
              data: result.data,
              error: result.error,
              executionTime: result.metadata?.processingTime || 0
            });
          });
        }
      }
      
      const workflowInsights = this.generateWorkflowInsights(allResults, 'custom');
      
      return {
        success: true,
        workflowType: 'custom',
        agentResults: allResults,
        workflowInsights,
        totalExecutionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        workflowType: 'custom',
        agentResults: [],
        totalExecutionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown custom workflow error'
      };
    }
  }
}