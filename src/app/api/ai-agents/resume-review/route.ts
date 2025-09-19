import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIAgentCoordinator } from '@/services/ai-agent-coordinator.service';
import { prisma } from '@/lib/prisma';

/**
 * API Route: POST /api/ai-agents/resume-review
 * 
 * Professional resume review endpoint that provides comprehensive
 * feedback on resume quality, structure, and job alignment.
 * Analyzes content against job requirements and provides
 * actionable improvement suggestions.
 * 
 * Request body should contain:
 * - profileData: Complete profile data bundle with experiences, projects, etc.
 * - jobId: Optional job ID to analyze against specific position
 * - jobDescription: Optional job description text for analysis
 * - reviewFocus: Areas to focus on ('content', 'format', 'ats', 'alignment', 'comprehensive')
 * - includeScoring: Whether to include numerical scores
 * - detailLevel: Level of detail ('summary', 'detailed', 'comprehensive')
 * 
 * @param req - Next.js request object containing review parameters
 * @returns JSON response with detailed review feedback and recommendations
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
      profileData,
      jobId, 
      jobDescription,
      reviewFocus = 'comprehensive',
      includeScoring = true,
      detailLevel = 'detailed',
      sections = ['header', 'summary', 'experience', 'projects', 'skills', 'education']
    } = requestData;

    // Validate required fields
    if (!profileData || !profileData.profile) {
      return NextResponse.json(
        { error: 'Profile data is required for resume review' },
        { status: 400 }
      );
    }

    if (!['content', 'format', 'ats', 'alignment', 'comprehensive'].includes(reviewFocus)) {
      return NextResponse.json(
        { error: 'Invalid review focus type' },
        { status: 400 }
      );
    }

    let jobContext = jobDescription;

    // If jobId is provided, fetch job information from database
    if (jobId && !jobDescription) {
      try {
        const job = await prisma.$queryRaw<Array<{
          title: string | null;
          company: string | null;
          description: string | null;
          requirements: string | null;
          responsibilities: string | null;
          skills: string | null;
          salary: string | null;
          location: string | null;
        }>>`
          SELECT title, company, description, requirements, responsibilities, skills, salary, location
          FROM jobs 
          WHERE id = ${jobId} AND "userId" = ${session.user.id}
        `;

        if (job.length > 0) {
          const jobRecord = job[0];
          const jobParts = [];
          if (jobRecord.title) jobParts.push(`Position: ${jobRecord.title}`);
          if (jobRecord.company) jobParts.push(`Company: ${jobRecord.company}`);
          if (jobRecord.description) jobParts.push(`Description: ${jobRecord.description}`);
          if (jobRecord.requirements) jobParts.push(`Requirements: ${jobRecord.requirements}`);
          if (jobRecord.responsibilities) jobParts.push(`Responsibilities: ${jobRecord.responsibilities}`);
          if (jobRecord.skills) jobParts.push(`Skills: ${jobRecord.skills}`);
          if (jobRecord.salary) jobParts.push(`Salary: ${jobRecord.salary}`);
          if (jobRecord.location) jobParts.push(`Location: ${jobRecord.location}`);
          
          jobContext = jobParts.join('\n\n');
        }
      } catch (error) {
        console.error('Failed to fetch job information:', error);
        return NextResponse.json(
          { error: 'Failed to fetch job information from database' },
          { status: 500 }
        );
      }
    }

    // Prepare input for resume review agent
    const reviewInput = {
      profileData,
      jobContext,
      reviewFocus,
      includeScoring,
      detailLevel,
      sectionsToReview: sections,
      generateActionableItems: true,
      includePriorityRanking: true
    };

    // Execute the resume review agent
    const coordinator = AIAgentCoordinator.getInstance();
    
    const workflowConfig = {
      type: 'resume-review' as const,
      profileData,
      jobContext: jobContext ? {
        jobDescription: jobContext
      } : undefined
    };

    const result = await coordinator.executeSingleAgent(
      'resume-reviewer',
      reviewInput,
      workflowConfig
    );

    // Calculate overall readiness score if requested
    let overallReadiness = null;
    if (includeScoring && result.feedback) {
      const scores = result.feedback
        .filter((item: any) => item.score)
        .map((item: any) => item.score);
      
      if (scores.length > 0) {
        overallReadiness = Math.round(
          scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
        );
      }
    }

    return NextResponse.json({
      success: true,
      reviewType: reviewFocus,
      detailLevel,
      overallReadiness,
      feedback: result.feedback,
      recommendations: result.recommendations,
      criticalIssues: result.criticalIssues,
      strengths: result.strengths,
      improvementPriorities: result.improvementPriorities,
      sectionAnalysis: result.sectionAnalysis,
      atsCompatibility: result.atsCompatibility,
      jobAlignment: jobContext ? result.jobAlignment : null,
      reviewSummary: result.reviewSummary,
      actionableItems: result.actionableItems,
      reviewedSections: sections,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Resume review error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to perform resume review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
