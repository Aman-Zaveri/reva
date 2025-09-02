import type { Profile, DataBundle } from '@/lib/types';

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProfileRepository {
  saveProfiles(profiles: Profile[], data: DataBundle): Promise<StorageResult<void>>;
  loadProfiles(): Promise<StorageResult<{ profiles: Profile[]; data: DataBundle }>>;
  backupData(): Promise<StorageResult<string>>;
  restoreData(backup: string): Promise<StorageResult<void>>;
  clearData(): Promise<StorageResult<void>>;
}

/**
 * Repository for managing profile data persistence
 */
export class LocalStorageProfileRepository implements ProfileRepository {
  private static readonly STORAGE_KEY = 'resume_profiles_v2';
  private static readonly BACKUP_KEY = 'resume_profiles_backup';

  /**
   * Save profiles and data to localStorage
   */
  async saveProfiles(profiles: Profile[], data: DataBundle): Promise<StorageResult<void>> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'localStorage not available in server environment' };
      }

      const payload = { profiles, data };
      localStorage.setItem(LocalStorageProfileRepository.STORAGE_KEY, JSON.stringify(payload));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while saving'
      };
    }
  }

  /**
   * Load profiles and data from localStorage
   */
  async loadProfiles(): Promise<StorageResult<{ profiles: Profile[]; data: DataBundle }>> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'localStorage not available in server environment' };
      }

      const raw = localStorage.getItem(LocalStorageProfileRepository.STORAGE_KEY);
      
      if (!raw) {
        return { success: false, error: 'No data found' };
      }

      const parsed = JSON.parse(raw);
      
      // Validate the data structure
      if (!this.isValidStorageData(parsed)) {
        return { success: false, error: 'Invalid data structure' };
      }

      return { 
        success: true, 
        data: parsed 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while loading'
      };
    }
  }

  /**
   * Create a backup of current data
   */
  async backupData(): Promise<StorageResult<string>> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'localStorage not available in server environment' };
      }

      const raw = localStorage.getItem(LocalStorageProfileRepository.STORAGE_KEY);
      
      if (!raw) {
        return { success: false, error: 'No data to backup' };
      }

      const backup = {
        version: 'v2',
        timestamp: new Date().toISOString(),
        data: raw
      };

      const backupString = JSON.stringify(backup);
      localStorage.setItem(LocalStorageProfileRepository.BACKUP_KEY, backupString);

      return { success: true, data: backupString };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while backing up'
      };
    }
  }

  /**
   * Restore data from backup
   */
  async restoreData(backup: string): Promise<StorageResult<void>> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'localStorage not available in server environment' };
      }

      const backupData = JSON.parse(backup);
      
      if (!backupData.data || !backupData.version) {
        return { success: false, error: 'Invalid backup format' };
      }

      localStorage.setItem(LocalStorageProfileRepository.STORAGE_KEY, backupData.data);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while restoring backup'
      };
    }
  }

  /**
   * Clear all data
   */
  async clearData(): Promise<StorageResult<void>> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'localStorage not available in server environment' };
      }

      localStorage.removeItem(LocalStorageProfileRepository.STORAGE_KEY);
      localStorage.removeItem(LocalStorageProfileRepository.BACKUP_KEY);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while clearing data'
      };
    }
  }

  /**
   * Check if storage data is valid
   */
  private isValidStorageData(data: unknown): data is { profiles: Profile[]; data: DataBundle } {
    try {
      if (!data || typeof data !== 'object' || data === null) {
        return false;
      }
      
      const obj = data as Record<string, unknown>;
      const dataObj = obj.data as Record<string, unknown>;
      
      return !!(
        Array.isArray(obj.profiles) &&
        obj.data &&
        typeof obj.data === 'object' &&
        obj.data !== null &&
        Array.isArray(dataObj.experiences) &&
        Array.isArray(dataObj.projects) &&
        Array.isArray(dataObj.skills) &&
        Array.isArray(dataObj.education)
      );
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{ used: number; available: number; percentage: number }> {
    if (typeof window === 'undefined') {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      // Estimate localStorage usage
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }

      // Most browsers have ~5-10MB localStorage limit
      const available = 5 * 1024 * 1024; // 5MB estimate
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}
