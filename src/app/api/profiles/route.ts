import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PostgreSQLProfileRepository } from '@/repositories/postgresql.repository';
import type { Profile, DataBundle } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profiles, data }: { profiles: Profile[]; data: DataBundle } = body;

    if (!profiles || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing profiles or data' },
        { status: 400 }
      );
    }

    const repository = new PostgreSQLProfileRepository();
    const result = await repository.saveProfiles(profiles, data, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save-profiles API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const repository = new PostgreSQLProfileRepository();
    const result = await repository.loadProfiles(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error in load-profiles API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
