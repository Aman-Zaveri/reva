import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import type { Job } from '@/shared/lib/types';

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const jobData: Partial<Job> & { source: 'manual' | 'extension' } = body;

    if (!jobData.title || !jobData.company || !jobData.source) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Missing required fields: title, company, source' },
        { status: 400 }
      ));
    }

    // Use raw SQL until Prisma client is regenerated
    const result = await prisma.$executeRaw`
      INSERT INTO jobs (
        id, "userId", title, company, description, requirements, 
        responsibilities, skills, url, source, "extractedAt", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${session.user.id}, ${jobData.title}, ${jobData.company}, 
        ${jobData.description || null}, ${jobData.requirements || null},
        ${jobData.responsibilities || null}, ${jobData.skills || null}, 
        ${jobData.url || null}, ${jobData.source}, 
        ${jobData.extractedAt ? new Date(jobData.extractedAt) : null}, NOW(), NOW()
      )
    `;

    // Get the created job
    const createdJob = await prisma.$queryRaw<Array<{
      id: string;
      title: string;
      company: string;
      description: string | null;
      source: string;
      createdAt: Date;
      updatedAt: Date;
      extractedAt: Date | null;
    }>>`
      SELECT * FROM jobs 
      WHERE "userId" = ${session.user.id} 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;

    const job = createdJob[0];
    if (!job) {
      throw new Error('Failed to create job');
    }

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
    console.error('Error creating job:', error);
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    // Use raw SQL until Prisma client is regenerated
    const jobs = await prisma.$queryRaw<Array<{
      id: string;
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
      WHERE "userId" = ${session.user.id} 
      ORDER BY "createdAt" DESC
    `;

    // Get profile count for each job
    const jobsWithProfiles = await Promise.all(
      jobs.map(async (job) => {
        const profiles = await prisma.$queryRaw<Array<{
          id: string;
          profileName: string;
          createdAt: Date;
        }>>`
          SELECT id, "profileName", "createdAt" 
          FROM profiles 
          WHERE "jobId" = ${job.id}
        `;

        return {
          ...job,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
          extractedAt: job.extractedAt?.toISOString(),
          profiles: profiles.map(profile => ({
            ...profile,
            createdAt: profile.createdAt.toISOString(),
          })),
        };
      })
    );

    return addCorsHeaders(NextResponse.json({ success: true, data: jobsWithProfiles }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    ));
  }
}