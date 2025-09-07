import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageProfileRepository } from '@/shared/repositories/profile.repository';
import { PostgreSQLProfileRepository } from '@/shared/repositories/postgresql.repository';

export async function POST() {
  try {
    console.log('🔄 Starting migration from localStorage to PostgreSQL...');
    
    const localRepo = new LocalStorageProfileRepository();
    const pgRepo = new PostgreSQLProfileRepository();
    
    // This won't work in API route since localStorage isn't available on server
    // So we'll return instructions for client-side migration
    
    return NextResponse.json({
      success: true,
      message: 'Migration endpoint ready. Use client-side migration.',
      instructions: [
        '1. Open browser console on your site',
        '2. Run: localStorage.getItem("profilesStore")',
        '3. Copy the JSON data',
        '4. Send POST request to /api/migrate-data with that data'
      ]
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { localStorageData } = body;
    
    if (!localStorageData) {
      return NextResponse.json(
        { success: false, error: 'No localStorage data provided' },
        { status: 400 }
      );
    }
    
    console.log('🔄 Migrating localStorage data to PostgreSQL...');
    
    // Parse the localStorage data
    let parsedData;
    try {
      parsedData = typeof localStorageData === 'string' 
        ? JSON.parse(localStorageData) 
        : localStorageData;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON data' },
        { status: 400 }
      );
    }
    
    // Extract profiles and data from the parsed structure
    const { profiles, data } = parsedData.state || parsedData;
    
    if (!profiles || !data) {
      return NextResponse.json(
        { success: false, error: 'Invalid data structure - missing profiles or data' },
        { status: 400 }
      );
    }
    
    console.log(`📊 Found ${profiles.length} profiles to migrate`);
    
    // Save to PostgreSQL
    const pgRepo = new PostgreSQLProfileRepository();
    const result = await pgRepo.saveProfiles(profiles, data);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to save to PostgreSQL' },
        { status: 500 }
      );
    }
    
    console.log('✅ Migration completed successfully');
    
    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${profiles.length} profiles to PostgreSQL`,
      migratedProfiles: profiles.length
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}
