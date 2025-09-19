import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIAgentCoordinator } from '@/services/ai-agent-coordinator.service';
import { prisma } from '@/lib/prisma';

/**
 * API Route: POST /api/ai-agents/skills-analysis
 * 
 * Specialized endpoint for comprehensive skills analysis.
 * Extracts skills from job descriptions and resumes, and performs
 * gap analysis to identify missing skills.
 * 
 * Request body should contain:
 * - analysisType: Type of analysis ('job-requirements', 'resume-skills', 'gap-analysis')
 * - sourceText: Text to analyze (job description or resume content)
 * - jobId: Optional job ID to fetch from database
 * - profileData: Profile and data for gap analysis
 * - existingSkills: Current skills for comparison
 * 
 * @param req - Next.js request object containing analysis parameters
 * @returns JSON response with extracted skills and analysis
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
      analysisType, 
      sourceText, 
      jobId, 
      profileData, 
      existingSkills,
      focusCategories,
      includeSoftSkills = true,
      confidenceThreshold = 60
    } = requestData;

    // Validate required fields
    if (!analysisType) {
      return NextResponse.json(
        { error: 'Analysis type is required' },
        { status: 400 }
      );
    }

    if (!['job-requirements', 'resume-skills', 'skill-gap-analysis'].includes(analysisType)) {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      );
    }

    let finalSourceText = sourceText;

    // If jobId is provided, fetch job information from database
    if (jobId && !sourceText) {
      try {
        const job = await prisma.$queryRaw<Array<{
          description: string | null;
          requirements: string | null;
          responsibilities: string | null;
          skills: string | null;
        }>>`
          SELECT description, requirements, responsibilities, skills
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
          
          finalSourceText = jobParts.join('\n\n');
        }
      } catch (error) {
        console.error('Failed to fetch job information:', error);
        return NextResponse.json(
          { error: 'Failed to fetch job information from database' },
          { status: 500 }
        );
      }
    }

    if (!finalSourceText?.trim()) {
      return NextResponse.json(
        { error: 'Source text is required for skills analysis' },
        { status: 400 }
      );
    }

    // Prepare input for skills extraction agent
    const extractionInput = {
      sourceText: finalSourceText,
      extractionType: analysisType,
      existingSkills,
      focusCategories,
      includeSoftSkills,
      confidenceThreshold
    };

    // Execute the skills extraction agent
    const coordinator = AIAgentCoordinator.getInstance();
    
    const workflowConfig = {
      type: 'skills-analysis' as const,
      profileData: profileData || { profile: {}, data: {} }
    };

    const result = await coordinator.executeSingleAgent(
      'skills-extractor',
      extractionInput,
      workflowConfig
    );

    return NextResponse.json({
      success: true,
      analysisType,
      extractedSkills: result.extractedSkills,
      extractionSummary: result.extractionSummary,
      skillGaps: result.skillGaps,
      insights: result.insights,
      confidence: result.overallConfidence,
      sourceTextLength: finalSourceText.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Skills analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze skills',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
