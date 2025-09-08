import { ApiStorageService } from '@/shared/services/storage.service';

/**
 * Storage types available in the application
 */
export type StorageType = 'localStorage' | 'postgresql';

/**
 * Enhanced storage manager supporting both localStorage and PostgreSQL
 * 
 * This provides a consistent interface for database operations
 * throughout the application with dynamic storage switching.
 */
export class StorageManager {
  private postgresqlStorage: ApiStorageService;
  private currentStorageType: StorageType;

  constructor() {
    this.postgresqlStorage = new ApiStorageService();
    // Default to localStorage for better user experience
    this.currentStorageType = 'localStorage';
  }

  /**
   * Get the current storage type
   */
  getStorageType(): StorageType {
    return this.currentStorageType;
  }

  /**
   * Switch storage type
   */
  setStorageType(type: StorageType): void {
    this.currentStorageType = type;
  }

  /**
   * Get the appropriate storage instance based on current type
   */
  getStorage(): ApiStorageService {
    // For now, always return PostgreSQL storage since that's what's implemented
    // In the future, you could add a LocalStorageService here
    return this.postgresqlStorage;
  }
}

// Create a singleton instance that can be imported throughout the app
export const storageManager = new StorageManager();

// Helper function for easy access
export const getStorageService = () => storageManager.getStorage();
