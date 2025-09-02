import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/shared/services/scraping.service';
import { ResumeOptimizationService } from '@/features/ai-optimization/services/resume-optimization.service';
import { validateOptimizeRequest } from '@/shared/utils/validation';
import { ERROR_MESSAGES } from '@/shared/utils/constants';

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

    const { jobUrl, jobDescription, profile, data, glazeLevel = 2 } = validation.data!;

    let finalJobDescription = jobDescription;

    // If URL is provided, extract job description from it
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

    // Optimize the resume
    const optimizations = await ResumeOptimizationService.optimizeResume({
      jobDescription: finalJobDescription,
      profile,
      data,
      glazeLevel
    });

    return NextResponse.json({
      success: true,
      optimizations,
      jobDescriptionLength: finalJobDescription.length
    });

  } catch (error) {
    
    // Handle specific error types
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
