import { NextRequest, NextResponse } from 'next/server';
import { PostgreSQLProfileRepository } from '@/shared/repositories/postgresql.repository';
import type { Profile, DataBundle } from '@/shared/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profiles, data }: { profiles: Profile[]; data: DataBundle } = body;

    if (!profiles || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing profiles or data' },
        { status: 400 }
      );
    }

    const repository = new PostgreSQLProfileRepository();
    const result = await repository.saveProfiles(profiles, data);

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
    const repository = new PostgreSQLProfileRepository();
    const result = await repository.loadProfiles();

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
