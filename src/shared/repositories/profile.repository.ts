import type { Profile, DataBundle } from '@/shared/lib/types';

/**
 * Result wrapper for repository operations
 * Provides consistent success/error handling across all repository methods
 */
export interface StorageResult<T> {
  /** Whether the operation completed successfully */
  success: boolean;
  /** Data returned from successful operations */
  data?: T;
  /** Error message for failed operations */
  error?: string;
}

/**
 * Interface defining the contract for profile data persistence
 * 
 * This interface allows for different storage implementations (localStorage,
 * IndexedDB, remote API, etc.) while maintaining consistent method signatures.
 */
export interface ProfileRepository {
  /** Saves profiles and master data to storage */
  saveProfiles(profiles: Profile[], data: DataBundle): Promise<StorageResult<void>>;
  /** Loads profiles and master data from storage */
  loadProfiles(): Promise<StorageResult<{ profiles: Profile[]; data: DataBundle }>>;
  /** Creates a backup string of all data */
  backupData(): Promise<StorageResult<string>>;
  /** Restores data from a backup string */
  restoreData(backup: string): Promise<StorageResult<void>>;
  /** Clears all stored data */
  clearData(): Promise<StorageResult<void>>;
}

/**
 * localStorage-based implementation of ProfileRepository
 * 
 * This repository provides persistent storage using the browser's localStorage API.
 * It handles data serialization, validation, and error recovery. All operations
 * are wrapped in try-catch blocks to handle storage quota exceeded errors and
 * other localStorage-specific issues.
 * 
 * Storage format: JSON objects with version information for future migration support.
 */
export class LocalStorageProfileRepository implements ProfileRepository {
  /** Storage key for main profile data */
  private static readonly STORAGE_KEY = 'resume_profiles_v2';
  /** Storage key for backup data */
  private static readonly BACKUP_KEY = 'resume_profiles_backup';

  /**
   * Saves profiles and master data to localStorage
   * 
   * Serializes the data as JSON and stores it under the main storage key.
   * Handles localStorage quota exceeded errors gracefully.
   * 
   * @param profiles - Array of profile objects to save
   * @param data - Master data bundle to save
   * @returns Promise resolving to operation result
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
   * Loads profiles and master data from localStorage
   * 
   * Retrieves and parses stored data, validating its structure before returning.
   * Returns an error result if no data exists or if the data is corrupted.
   * 
   * @returns Promise resolving to stored profiles and data, or error result
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
   * Creates a timestamped backup of current data
   * 
   * Generates a backup string that includes version information and timestamp
   * for data recovery purposes. The backup can be saved to a file or shared.
   * 
   * @returns Promise resolving to backup string or error result
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
   * Restores data from a backup string
   * 
   * Parses and validates a backup string, then restores the data to localStorage.
   * Validates backup format and version information before proceeding.
   * 
   * @param backup - Backup string created by backupData method
   * @returns Promise resolving to operation result
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
   * Validates the structure of loaded storage data
   * 
   * Performs basic type checking to ensure the loaded data has the expected
   * structure with profiles and data arrays. Prevents runtime errors from
   * corrupted or outdated data formats.
   * 
   * @param data - Raw data loaded from storage
   * @returns true if data structure is valid, false otherwise
   * @private
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
   * Estimates localStorage usage and capacity
   * 
   * Provides information about current storage usage for monitoring and
   * warning users when approaching storage limits. Uses estimates since
   * browser storage APIs don't provide exact quota information.
   * 
   * @returns Object containing usage statistics in bytes and percentages
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
