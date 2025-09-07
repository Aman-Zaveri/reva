import type { Profile, DataBundle } from '@/shared/lib/types';
import type { StorageResult } from '@/shared/repositories/profile.repository';

/**
 * API-based storage service for PostgreSQL database
 * 
 * This service provides the same interface as the repository but makes
 * HTTP calls to API routes that handle database operations.
 */
export class ApiStorageService {
  
  async saveProfiles(profiles: Profile[], data: DataBundle): Promise<StorageResult<void>> {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profiles, data }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to save data' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async loadProfiles(): Promise<StorageResult<{ profiles: Profile[]; data: DataBundle }>> {
    try {
      const response = await fetch('/api/profiles');
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to load data' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async backupData(): Promise<StorageResult<string>> {
    try {
      const loadResult = await this.loadProfiles();
      if (!loadResult.success || !loadResult.data) {
        return { success: false, error: loadResult.error || 'No data to backup' };
      }

      const backup = {
        version: 'v2',
        timestamp: new Date().toISOString(),
        data: loadResult.data
      };

      return { success: true, data: JSON.stringify(backup) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create backup'
      };
    }
  }

  async restoreData(backup: string): Promise<StorageResult<void>> {
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backup }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to restore data' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async clearData(): Promise<StorageResult<void>> {
    try {
      // Clear by saving empty data
      return await this.saveProfiles([], {
        personalInfo: { fullName: '', email: '', phone: '', location: '' },
        experiences: [],
        projects: [],
        skills: [],
        education: [],
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear data'
      };
    }
  }
}
