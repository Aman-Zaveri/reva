'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { useProfilesStore } from '@/shared/lib/store';
import { Database, HardDrive, ArrowRightLeft, CheckCircle, AlertCircle } from 'lucide-react';

export function StorageSettings() {
  const [migrating, setMigrating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { 
    getStorageType, 
    migrateToPostgreSQL, 
    migrateToLocalStorage,
    error,
    clearError
  } = useProfilesStore();

  const currentStorage = getStorageType();

  const handleMigrateToPostgreSQL = async () => {
    setMigrating(true);
    setSuccess(null);
    clearError();
    
    try {
      await migrateToPostgreSQL();
      setSuccess('Successfully migrated to PostgreSQL database!');
    } catch (err) {
      console.error('Migration failed:', err);
    } finally {
      setMigrating(false);
    }
  };

  const handleMigrateToLocalStorage = async () => {
    setMigrating(true);
    setSuccess(null);
    clearError();
    
    try {
      await migrateToLocalStorage();
      setSuccess('Successfully migrated to local storage!');
    } catch (err) {
      console.error('Migration failed:', err);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Local Storage</p>
                <p className="text-sm text-muted-foreground">
                  Stores data in your browser (device-specific)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentStorage === 'localStorage' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              )}
              {currentStorage !== 'localStorage' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMigrateToLocalStorage}
                  disabled={migrating}
                >
                  {migrating ? (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Switch to Local
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">PostgreSQL Database</p>
                <p className="text-sm text-muted-foreground">
                  Stores data in a cloud database (synced across devices)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentStorage === 'postgresql' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              )}
              {currentStorage !== 'postgresql' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMigrateToPostgreSQL}
                  disabled={migrating}
                >
                  {migrating ? (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Switch to Database
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Local Storage:</strong> Data is stored in your browser and only available on this device. Good for privacy and offline use.</p>
            <p><strong>PostgreSQL Database:</strong> Data is stored in the cloud and synced across all your devices. Requires internet connection.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
