import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIAgentCoordinator } from '@/services/ai-agent-coordinator.service';

/**
 * API Route: POST /api/ai-agents/single-agent
 * 
 * Executes a single AI agent with specific input parameters.
 * Useful for targeted operations like grammar enhancement, 
 * skills extraction, or content optimization.
 * 
 * Request body should contain:
 * - agentId: ID of the agent to execute
 * - input: Input data for the agent
 * - jobContext: Optional job description and details
 * - profileData: Profile and data to work with
 * - config: Agent-specific configuration
 * 
 * @param req - Next.js request object containing agent parameters
 * @returns JSON response with agent results or error information
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
    const { agentId, input, jobContext, profileData, config = {} } = requestData;

    // Validate required fields
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    if (!input) {
      return NextResponse.json(
        { error: 'Input data is required' },
        { status: 400 }
      );
    }

    // Execute the single agent
    const coordinator = AIAgentCoordinator.getInstance();
    
    const workflowConfig = {
      type: 'custom' as const,
      jobContext,
      profileData: profileData || { profile: {}, data: {} },
      parameters: config
    };

    const result = await coordinator.executeSingleAgent(
      agentId,
      input,
      workflowConfig
    );

    return NextResponse.json({
      success: true,
      agentId,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Single agent execution error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to execute agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
