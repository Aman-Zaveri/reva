import { NextRequest, NextResponse } from 'next/server';
import { PostgreSQLProfileRepository } from '@/shared/repositories/postgresql.repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backup } = body;

    if (!backup) {
      return NextResponse.json(
        { success: false, error: 'Missing backup data' },
        { status: 400 }
      );
    }

    const repository = new PostgreSQLProfileRepository();
    const result = await repository.restoreData(backup);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in migrate API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
