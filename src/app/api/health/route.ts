import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    database: {
      connected: false,
      version: null as string | null,
      latency: null as number | null,
      tableCount: 0,
      recordCounts: {} as Record<string, number>
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlFormat: process.env.DATABASE_URL ? 'configured' : 'missing'
    }
  };

  try {
    // Test database connection and measure latency
    const startTime = Date.now();
    await prisma.$connect();
    const latency = Date.now() - startTime;
    
    healthCheck.database.connected = true;
    healthCheck.database.latency = latency;

    // Get PostgreSQL version
    const versionResult = await prisma.$queryRaw`SELECT version()` as any[];
    healthCheck.database.version = versionResult[0]?.version || 'Unknown';

    // Count tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ` as any[];
    
    healthCheck.database.tableCount = tables.length;

    // Get record counts for each model
    const [
      personalInfoCount,
      profileCount,
      experienceCount,
      projectCount,
      skillCount,
      educationCount
    ] = await Promise.all([
      prisma.personalInfo.count(),
      prisma.profile.count(),
      prisma.experience.count(),
      prisma.project.count(),
      prisma.skill.count(),
      prisma.education.count()
    ]);

    healthCheck.database.recordCounts = {
      personalInfo: personalInfoCount,
      profiles: profileCount,
      experiences: experienceCount,
      projects: projectCount,
      skills: skillCount,
      education: educationCount
    };

    healthCheck.status = 'healthy';

    return NextResponse.json(healthCheck);

  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.database.connected = false;
    
    return NextResponse.json({
      ...healthCheck,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code || 'UNKNOWN'
      }
    }, { status: 503 });

  } finally {
    await prisma.$disconnect();
  }
}
