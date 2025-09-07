import { ApiStorageService } from '@/shared/services/storage.service';

/**
 * Simplified storage manager for PostgreSQL database
 * 
 * This provides a consistent interface for database operations
 * throughout the application.
 */
export class StorageManager {
  private postgresqlStorage: ApiStorageService;

  constructor() {
    this.postgresqlStorage = new ApiStorageService();
  }

  /**
   * Get the storage instance
   */
  getStorage(): ApiStorageService {
    return this.postgresqlStorage;
  }
}

// Create a singleton instance that can be imported throughout the app
export const storageManager = new StorageManager();

// Helper function for easy access
export const getStorageService = () => storageManager.getStorage();
