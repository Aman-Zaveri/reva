import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIAgentCoordinator } from '@/features/ai-optimization/services/ai-agent-coordinator.service';
import { prisma } from '@/shared/lib/prisma';

/**
 * API Route: POST /api/ai-agents/execute-workflow
 * 
 * Executes predefined AI agent workflows for resume optimization.
 * Supports various workflow types including full optimization, job-specific
 * optimization, content enhancement, skills analysis, and more.
 * 
 * Request body should contain:
 * - workflowType: Type of workflow to execute
 * - jobContext: Optional job description and details
 * - profileData: Profile and data to work with
 * - parameters: Workflow-specific parameters
 * - parallelExecution: Whether to run agents in parallel when possible
 * 
 * @param req - Next.js request object containing workflow parameters
 * @returns JSON response with workflow results or error information
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestData = await req.json();
    const { 
      workflowType, 
      jobContext, 
      profileData, 
      parameters = {}, 
      parallelExecution = false,
      jobId 
    } = requestData;

    // Validate required fields
    if (!workflowType) {
      return NextResponse.json(
        { error: 'Workflow type is required' },
        { status: 400 }
      );
    }

    if (!profileData?.profile || !profileData?.data) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // If jobId is provided, fetch job information from database
    let finalJobContext = jobContext;
    if (jobId && !jobContext?.jobDescription) {
      try {
        const job = await prisma.$queryRaw<Array<{
          id: string;
          title: string;
          company: string;
          description: string | null;
          requirements: string | null;
          responsibilities: string | null;
          skills: string | null;
        }>>`
          SELECT id, title, company, description, requirements, responsibilities, skills
          FROM jobs 
          WHERE id = ${jobId} AND "userId" = ${session.user.id}
        `;

        if (job.length > 0) {
          const jobRecord = job[0];
          const jobParts = [];
          if (jobRecord.description) jobParts.push(jobRecord.description);
          if (jobRecord.requirements) jobParts.push(`Requirements: ${jobRecord.requirements}`);
          if (jobRecord.responsibilities) jobParts.push(`Responsibilities: ${jobRecord.responsibilities}`);
          if (jobRecord.skills) jobParts.push(`Skills: ${jobRecord.skills}`);
          
          finalJobContext = {
            jobDescription: jobParts.join('\n\n'),
            position: jobRecord.title,
            company: jobRecord.company
          };
        }
      } catch (error) {
        console.error('Failed to fetch job information:', error);
        // Continue without job context if database fetch fails
      }
    }

    // Execute the workflow
    const coordinator = AIAgentCoordinator.getInstance();
    const result = await coordinator.executeWorkflow({
      type: workflowType,
      jobContext: finalJobContext,
      profileData,
      parameters,
      parallelExecution
    });

    return NextResponse.json({
      success: result.success,
      workflowType: result.workflowType,
      results: result.agentResults,
      insights: result.workflowInsights,
      executionTime: result.totalExecutionTime,
      error: result.error
    });

  } catch (error) {
    console.error('Workflow execution error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/ai-agents/execute-workflow
 * 
 * Returns information about available workflows and agents.
 */
export async function GET() {
  try {
    const coordinator = AIAgentCoordinator.getInstance();
    const agents = coordinator.getAvailableAgents();
    const stats = coordinator.getExecutionStats();

    const availableWorkflows = [
      {
        type: 'full-resume-optimization',
        name: 'Full Resume Optimization',
        description: 'Complete resume optimization from job analysis to final review',
        agents: ['skills-extractor', 'resume-builder', 'content-optimizer', 'ats-optimizer', 'resume-reviewer'],
        estimatedTime: '60-90 seconds'
      },
      {
        type: 'job-specific-optimization',
        name: 'Job-Specific Optimization',
        description: 'Optimize resume for specific job with gap analysis',
        agents: ['skills-extractor', 'resume-builder', 'content-optimizer'],
        estimatedTime: '30-45 seconds'
      },
      {
        type: 'content-enhancement',
        name: 'Content Enhancement',
        description: 'Enhance content quality and impact',
        agents: ['content-optimizer', 'resume-reviewer'],
        estimatedTime: '20-30 seconds'
      },
      {
        type: 'skills-analysis',
        name: 'Skills Analysis',
        description: 'Comprehensive skills analysis and gap identification',
        agents: ['skills-extractor'],
        estimatedTime: '15-20 seconds'
      },
      {
        type: 'resume-review',
        name: 'Resume Review',
        description: 'Professional resume review with ATS analysis',
        agents: ['resume-reviewer', 'ats-optimizer'],
        estimatedTime: '25-35 seconds'
      },
      {
        type: 'ats-optimization',
        name: 'ATS Optimization',
        description: 'ATS compatibility optimization',
        agents: ['ats-optimizer'],
        estimatedTime: '15-20 seconds'
      },
      {
        type: 'manual-editing-assistance',
        name: 'Manual Editing Assistance',
        description: 'Interactive editing assistance',
        agents: ['grammar-enhancer'],
        estimatedTime: '5-10 seconds'
      }
    ];

    return NextResponse.json({
      success: true,
      agents,
      workflows: availableWorkflows,
      stats
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get agent information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}