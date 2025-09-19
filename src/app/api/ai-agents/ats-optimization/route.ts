import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIAgentCoordinator } from '@/services/ai-agent-coordinator.service';
import { prisma } from '@/lib/prisma';

/**
 * API Route: POST /api/ai-agents/ats-optimization
 * 
 * Specialized endpoint for ATS (Applicant Tracking System) optimization.
 * Analyzes resume content for ATS compatibility, keyword optimization,
 * and provides specific recommendations for different ATS systems.
 * 
 * Request body should contain:
 * - profileData: Complete profile data bundle
 * - jobId: Optional job ID to analyze against specific position
 * - jobDescription: Optional job description text for keyword analysis
 * - atsSystem: Target ATS system ('workday', 'greenhouse', 'lever', 'bamboohr', 'generic')
 * - optimizationLevel: Level of optimization ('conservative', 'moderate', 'aggressive')
 * - focusAreas: Areas to focus on ('keywords', 'format', 'structure', 'compatibility')
 * 
 * @param req - Next.js request object containing optimization parameters
 * @returns JSON response with ATS optimization recommendations and fixes
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
      atsSystem = 'generic',
      optimizationLevel = 'moderate',
      focusAreas = ['keywords', 'format', 'structure', 'compatibility'],
      includeKeywordDensity = true,
      generateAlternatives = true
    } = requestData;

    // Validate required fields
    if (!profileData || !profileData.profile) {
      return NextResponse.json(
        { error: 'Profile data is required for ATS optimization' },
        { status: 400 }
      );
    }

    if (!['workday', 'greenhouse', 'lever', 'bamboohr', 'generic'].includes(atsSystem)) {
      return NextResponse.json(
        { error: 'Invalid ATS system type' },
        { status: 400 }
      );
    }

    if (!['conservative', 'moderate', 'aggressive'].includes(optimizationLevel)) {
      return NextResponse.json(
        { error: 'Invalid optimization level' },
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
        }>>`
          SELECT title, company, description, requirements, responsibilities, skills
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

    // Prepare input for ATS optimization agent
    const optimizationInput = {
      profileData,
      jobContext,
      atsSystem,
      optimizationLevel,
      focusAreas,
      includeKeywordDensity,
      generateAlternatives,
      preserveAccuracy: optimizationLevel === 'conservative',
      maximizeCompatibility: true
    };

    // Execute the ATS optimization agent
    const coordinator = AIAgentCoordinator.getInstance();
    
    const workflowConfig = {
      type: 'ats-optimization' as const,
      profileData,
      jobContext: jobContext ? {
        jobDescription: jobContext
      } : undefined
    };

    const result = await coordinator.executeSingleAgent(
      'ats-optimizer',
      optimizationInput,
      workflowConfig
    );

    // Calculate optimization score
    let optimizationScore = null;
    if (result.issues && result.suggestions) {
      const totalIssues = result.issues.length;
      const resolvedIssues = result.suggestions.filter((s: any) => s.impact === 'high').length;
      optimizationScore = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;
    }

    return NextResponse.json({
      success: true,
      atsSystem,
      optimizationLevel,
      optimizationScore,
      compatibilityAnalysis: result.compatibilityAnalysis,
      keywordAnalysis: result.keywordAnalysis,
      formatIssues: result.formatIssues,
      structureRecommendations: result.structureRecommendations,
      criticalIssues: result.issues?.filter((issue: any) => issue.severity === 'critical') || [],
      suggestions: result.suggestions,
      keywordSuggestions: result.keywordSuggestions,
      optimizedSections: result.optimizedSections,
      atsSpecificTips: result.atsSpecificTips,
      beforeAfterComparison: result.beforeAfterComparison,
      implementationGuide: result.implementationGuide,
      focusAreas,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ATS optimization error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to perform ATS optimization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
