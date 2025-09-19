import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/services/scraping.service';
import { ERROR_MESSAGES } from '@/utils/constants';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { 
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          details: 'URL parameter is required' 
        },
        { status: 400 }
      );
    }

    // Extract job information from the URL
    const jobInfo = await ScrapingService.extractJobInfo(url);

    return NextResponse.json({
      success: true,
      data: jobInfo
    });

  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERAL_ERROR },
      { status: 500 }
    );
  }
}
