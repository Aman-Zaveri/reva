import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/shared/services/scraping.service';
import { ResumeOptimizationService } from '@/features/ai-optimization/services/resume-optimization.service';
import { validateOptimizeRequest } from '@/shared/utils/validation';
import { ERROR_MESSAGES } from '@/shared/utils/constants';

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
 * - profile: Resume profile to optimize
 * - data: Master data bundle with experiences, projects, etc.
 * - glazeLevel (optional): Optimization aggressiveness level (1-5)
 * 
 * @param req - Next.js request object containing optimization parameters
 * @returns JSON response with optimization results or error information
 */
export async function POST(req: NextRequest) {
  try {
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

    const { jobUrl, jobDescription, profile, data, glazeLevel = 2, customInstructions } = validation.data!;

    let finalJobDescription = jobDescription;

    // If LinkedIn URL is provided, extract job description from it
    // This allows users to simply paste a LinkedIn job URL instead of copying the description
    if (jobUrl && !jobDescription) {
      try {
        const jobInfo = await ScrapingService.extractJobInfo(jobUrl);
        finalJobDescription = jobInfo.description;
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
      jobDescriptionLength: finalJobDescription.length
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
