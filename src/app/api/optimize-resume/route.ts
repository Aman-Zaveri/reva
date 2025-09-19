import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ScrapingService } from '@/services/scraping.service';
import { ResumeOptimizationService } from '@/services/resume-optimization.service';
import { validateOptimizeRequest } from '@/utils/validation';
import { ERROR_MESSAGES } from '@/utils/constants';
import { prisma } from '@/lib/prisma';

/**
 * API Route: POST /api/optimize-resume
 * 
 * Handles AI-powered resume optimization requests. This endpoint:
 * 1. Validates the incoming request data
 * 2. Extracts job descriptions from LinkedIn URLs (if provided)
 * 3. Sends resume data and job requirements to AI for optimization
 * 4. Returns optimized content suggestions
 * 
 * Request body should contain:
 * - jobUrl (optional): LinkedIn job posting URL to extract description from
 * - jobDescription (optional): Manual job description text
 * - jobId (optional): ID of job record in database to use for optimization
 * - profile: Resume profile to optimize
 * - data: Master data bundle with experiences, projects, etc.
 * - glazeLevel (optional): Optimization aggressiveness level (1-5)
 * 
 * @param req - Next.js request object containing optimization parameters
 * @returns JSON response with optimization results or error information
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

    // Validate request data
    const validation = validateOptimizeRequest(requestData);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { jobUrl, jobDescription, jobId, isAutomaticExtraction, profile, data, glazeLevel = 2, customInstructions } = validation.data!;

    let finalJobDescription = jobDescription;
    let jobInfo = null;

    // Priority: jobId > jobUrl > jobDescription
    // If jobId is provided, fetch job information from database
    if (jobId) {
      try {
        const job = await prisma.$queryRaw<Array<{
          id: string;
          title: string;
          company: string;
          description: string | null;
          requirements: string | null;
          responsibilities: string | null;
          skills: string | null;
          url: string | null;
        }>>`
          SELECT id, title, company, description, requirements, responsibilities, skills, url
          FROM jobs 
          WHERE id = ${jobId} AND "userId" = ${session.user.id}
        `;

        if (job.length === 0) {
          return NextResponse.json(
            { error: 'Job not found or access denied' },
            { status: 404 }
          );
        }

        const jobRecord = job[0];
        jobInfo = jobRecord;
        
        // Build comprehensive job description from database record
        const jobParts = [];
        if (jobRecord.description) jobParts.push(jobRecord.description);
        if (jobRecord.requirements) jobParts.push(`Requirements: ${jobRecord.requirements}`);
        if (jobRecord.responsibilities) jobParts.push(`Responsibilities: ${jobRecord.responsibilities}`);
        if (jobRecord.skills) jobParts.push(`Skills: ${jobRecord.skills}`);
        
        finalJobDescription = jobParts.join('\n\n');
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Failed to fetch job information from database',
            details: error instanceof Error ? error.message : 'Database error'
          },
          { status: 500 }
        );
      }
    }
    // If LinkedIn URL is provided, extract job description from it
    // This allows users to simply paste a LinkedIn job URL instead of copying the description
    else if (jobUrl && !jobDescription) {
      try {
        const extractedJobInfo = await ScrapingService.extractJobInfo(jobUrl);
        finalJobDescription = extractedJobInfo.description;
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Failed to extract job description from URL. Please paste the job description directly.',
            details: error instanceof Error ? error.message : 'Unknown scraping error'
          },
          { status: 400 }
        );
      }
    }

    if (!finalJobDescription) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.VALIDATION_ERROR },
        { status: 400 }
      );
    }

    // Send resume and job data to AI for optimization
    // This is the core AI processing step that analyzes the job requirements
    // and generates optimized resume content suggestions
    const optimizations = await ResumeOptimizationService.optimizeResume({
      jobDescription: finalJobDescription,
      profile,
      data,
      glazeLevel,
      customInstructions
    });

    return NextResponse.json({
      success: true,
      optimizations,
      jobDescriptionLength: finalJobDescription.length,
      jobInfo: jobInfo // Include job information from database if available
    });

  } catch (error) {
    
    // Provide specific error handling for different types of failures
    // This helps users understand what went wrong and how to fix it
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.API_KEY_ERROR },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.RATE_LIMIT_ERROR },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERAL_ERROR },
      { status: 500 }
    );
  }
}
