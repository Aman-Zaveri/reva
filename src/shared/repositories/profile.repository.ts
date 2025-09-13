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
 * This interface allows for different storage implementations while
 * maintaining consistent method signatures.
 */
export interface ProfileRepository {
  /** Saves profiles and master data to storage */
  saveProfiles(profiles: Profile[], data: DataBundle, userId: string): Promise<StorageResult<void>>;
  /** Loads profiles and master data from storage */
  loadProfiles(userId: string): Promise<StorageResult<{ profiles: Profile[]; data: DataBundle }>>;
  /** Creates a backup string of all data */
  backupData(userId: string): Promise<StorageResult<string>>;
  /** Restores data from a backup string */
  restoreData(backup: string, userId: string): Promise<StorageResult<void>>;
  /** Clears all stored data */
  clearData(userId: string): Promise<StorageResult<void>>;
}
