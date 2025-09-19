import type { Profile, DataBundle } from '@/lib/types';

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProfileRepository {
  saveProfiles(profiles: Profile[], data: DataBundle, userId: string): Promise<StorageResult<void>>;
  loadProfiles(userId: string): Promise<StorageResult<{ profiles: Profile[]; data: DataBundle }>>;
  backupData(userId: string): Promise<StorageResult<string>>;
  restoreData(backup: string, userId: string): Promise<StorageResult<void>>;
  clearData(userId: string): Promise<StorageResult<void>>;
}
