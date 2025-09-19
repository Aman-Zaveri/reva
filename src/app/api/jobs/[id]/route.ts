import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers for Chrome extension
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    const { id: jobId } = await params;

    if (!jobId) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      ));
    }

    // Use raw SQL until Prisma client is regenerated
    const jobs = await prisma.$queryRaw<Array<{
      id: string;
      userId: string;
      title: string;
      company: string;
      description: string | null;
      requirements: string | null;
      responsibilities: string | null;
      skills: string | null;
      url: string | null;
      source: string;
      extractedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM jobs 
      WHERE id = ${jobId} AND "userId" = ${session.user.id}
      LIMIT 1
    `;

    if (jobs.length === 0) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      ));
    }

    const job = jobs[0];

    return addCorsHeaders(NextResponse.json({ 
      success: true, 
      data: {
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        extractedAt: job.extractedAt?.toISOString(),
      }
    }));
  } catch (error) {
    console.error('Error fetching job:', error);
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    ));
  }
}