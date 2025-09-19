import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIAgentCoordinator } from '@/services/ai-agent-coordinator.service';

/**
 * API Route: POST /api/ai-agents/grammar-enhance
 * 
 * Specialized endpoint for grammar and content enhancement.
 * Designed for interactive manual editing where users want to
 * improve specific bullet points or text sections.
 * 
 * Request body should contain:
 * - text: The text to enhance
 * - userPrompt: User's specific instructions for changes
 * - itemContext: Context about the item (experience, project, etc.)
 * - preferences: Enhancement preferences
 * - jobContext: Optional job description for context-aware improvements
 * 
 * @param req - Next.js request object containing enhancement parameters
 * @returns JSON response with enhanced text and alternatives
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
      text, 
      userPrompt, 
      itemContext, 
      preferences, 
      jobContext,
      profileData 
    } = requestData;

    // Validate required fields
    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Text is required for enhancement' },
        { status: 400 }
      );
    }

    if (!userPrompt?.trim()) {
      return NextResponse.json(
        { error: 'User prompt is required to understand desired changes' },
        { status: 400 }
      );
    }

    // Prepare input for grammar enhancement agent
    const enhancementInput = {
      text,
      userPrompt,
      itemContext,
      preferences
    };

    // Execute the grammar enhancement agent
    const coordinator = AIAgentCoordinator.getInstance();
    
    const workflowConfig = {
      type: 'manual-editing-assistance' as const,
      jobContext,
      profileData: profileData || { profile: {}, data: {} }
    };

    const result = await coordinator.executeSingleAgent(
      'grammar-enhancer',
      enhancementInput,
      workflowConfig
    );

    return NextResponse.json({
      success: true,
      originalText: text,
      enhancedText: result.enhancedText,
      alternatives: result.alternatives,
      changesSummary: result.changesSummary,
      analysis: result.analysis,
      confidence: result.confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Grammar enhancement error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to enhance text',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
