import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIAgentCoordinator } from '@/features/ai-optimization/services/ai-agent-coordinator.service';
import { prisma } from '@/shared/lib/prisma';

/**
 * API Route: POST /api/ai-agents/content-optimization
 * 
 * Advanced content optimization endpoint for aggressive resume content transformation.
 * Rewrites experiences, projects, and skills to better match job requirements
 * while maintaining accuracy and professional tone.
 * 
 * Request body should contain:
 * - profileData: Complete profile data bundle with experiences, projects, etc.
 * - jobId: Optional job ID to optimize against specific position
 * - jobDescription: Optional job description text for optimization
 * - aggressiveness: Level of content transformation (1-5, where 5 is most aggressive)
 * - focusAreas: Areas to optimize ('experiences', 'projects', 'skills', 'summary')
 * - preserveAccuracy: Whether to maintain factual accuracy
 * - optimizeForKeywords: Whether to emphasize keyword optimization
 * 
 * @param req - Next.js request object containing optimization parameters
 * @returns JSON response with optimized content and transformation details
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
      aggressiveness = 3,
      focusAreas = ['experiences', 'projects', 'skills', 'summary'],
      preserveAccuracy = true,
      optimizeForKeywords = true,
      enhanceMetrics = true,
      improveReadability = true,
      targetRole,
      industryFocus
    } = requestData;

    // Validate required fields
    if (!profileData || !profileData.profile) {
      return NextResponse.json(
        { error: 'Profile data is required for content optimization' },
        { status: 400 }
      );
    }

    if (aggressiveness < 1 || aggressiveness > 5) {
      return NextResponse.json(
        { error: 'Aggressiveness level must be between 1 and 5' },
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
          salaryRange: string | null;
          location: string | null;
        }>>`
          SELECT title, company, description, requirements, responsibilities, skills, "salaryRange", location
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
          if (jobRecord.salaryRange) jobParts.push(`Salary: ${jobRecord.salaryRange}`);
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

    // Prepare input for content optimization agent
    const optimizationInput = {
      profileData,
      jobContext,
      aggressiveness,
      focusAreas,
      preserveAccuracy,
      optimizeForKeywords,
      enhanceMetrics,
      improveReadability,
      targetRole,
      industryFocus,
      generateComparisons: true,
      highlightChanges: true
    };

    // Execute the content optimization agent
    const coordinator = AIAgentCoordinator.getInstance();
    
    const workflowConfig = {
      type: 'content-enhancement' as const,
      profileData,
      jobContext: jobContext ? {
        jobDescription: jobContext
      } : undefined,
      parameters: {
        aggressiveness,
        focusAreas,
        preserveReadability: improveReadability
      }
    };

    const result = await coordinator.executeSingleAgent(
      'content-optimizer',
      optimizationInput,
      workflowConfig
    );

    // Calculate optimization metrics
    const transformationMetrics = {
      sectionsOptimized: focusAreas.length,
      aggressivenessUsed: aggressiveness,
      keywordsAdded: result.addedKeywords?.length || 0,
      experiencesModified: result.optimizedExperiences?.length || 0,
      projectsModified: result.optimizedProjects?.length || 0,
      skillsEnhanced: result.optimizedSkills?.length || 0
    };

    return NextResponse.json({
      success: true,
      aggressivenessLevel: aggressiveness,
      focusAreas,
      transformationMetrics,
      optimizedProfile: result.optimizedProfile,
      optimizedExperiences: result.optimizedExperiences,
      optimizedProjects: result.optimizedProjects,
      optimizedSkills: result.optimizedSkills,
      optimizedSummary: result.optimizedSummary,
      addedKeywords: result.addedKeywords,
      enhancedMetrics: result.enhancedMetrics,
      improvementSuggestions: result.improvementSuggestions,
      beforeAfterComparison: result.beforeAfterComparison,
      changeLog: result.changeLog,
      qualityScore: result.qualityScore,
      readabilityScore: result.readabilityScore,
      keywordDensity: result.keywordDensity,
      preservedAccuracy: preserveAccuracy,
      optimizationInsights: result.optimizationInsights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Content optimization error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to optimize content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}