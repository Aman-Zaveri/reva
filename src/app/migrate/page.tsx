'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, AlertCircle, Database, ArrowRight, Loader2 } from 'lucide-react';

export default function MigrationPage() {
  const [localStorageData, setLocalStorageData] = useState('');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [migratedCount, setMigratedCount] = useState(0);

  const extractLocalStorageData = () => {
    try {
      const data = localStorage.getItem('profilesStore');
      if (data) {
        setLocalStorageData(data);
        const parsed = JSON.parse(data);
        const profileCount = parsed.state?.profiles?.length || 0;
        setMessage(`Found ${profileCount} profiles in localStorage`);
      } else {
        setMessage('No data found in localStorage');
      }
    } catch (error) {
      setMessage('Error reading localStorage data');
    }
  };

  const migrateData = async () => {
    if (!localStorageData) {
      setMessage('Please extract localStorage data first');
      return;
    }

    setMigrationStatus('loading');
    setMessage('Migrating data to Supabase...');

    try {
      const response = await fetch('/api/migrate-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ localStorageData }),
      });

      const result = await response.json();

      if (result.success) {
        setMigrationStatus('success');
        setMessage(result.message);
        setMigratedCount(result.migratedProfiles);
        
        // Clear localStorage after successful migration
        if (confirm('Migration successful! Would you like to clear the old localStorage data?')) {
          localStorage.removeItem('profilesStore');
          setLocalStorageData('');
          setMessage(prev => prev + ' Old localStorage data cleared.');
        }
      } else {
        setMigrationStatus('error');
        setMessage(result.error || 'Migration failed');
      }
    } catch (error) {
      setMigrationStatus('error');
      setMessage('Network error occurred during migration');
    }
  };

  const checkCurrentStorage = () => {
    try {
      const data = localStorage.getItem('profilesStore');
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.state?.profiles?.length || 0;
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
    return 0;
  };

  const currentProfileCount = checkCurrentStorage();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Migration</h1>
        <p className="text-muted-foreground">
          Migrate your resume data from localStorage to Supabase PostgreSQL database
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Current Data Status
            </CardTitle>
            <CardDescription>
              Overview of your current data storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">localStorage</p>
                <p className="text-sm text-muted-foreground">Browser storage (current)</p>
              </div>
              <Badge variant={currentProfileCount > 0 ? "default" : "secondary"}>
                {currentProfileCount} profiles
              </Badge>
            </div>
            
            <div className="flex items-center justify-center py-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Supabase PostgreSQL</p>
                <p className="text-sm text-muted-foreground">Cloud database (target)</p>
              </div>
              <Badge variant={migrationStatus === 'success' ? "default" : "outline"}>
                {migrationStatus === 'success' ? migratedCount : 0} profiles
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Migration Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Steps</CardTitle>
            <CardDescription>
              Follow these steps to migrate your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                  1
                </div>
                <h4 className="font-medium">Extract localStorage Data</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Extract your current profile data from browser storage
              </p>
              <div className="ml-8">
                <Button 
                  onClick={extractLocalStorageData}
                  variant="outline"
                  disabled={migrationStatus === 'loading'}
                >
                  Extract Data from localStorage
                </Button>
              </div>
            </div>

            {/* Data Preview */}
            {localStorageData && (
              <div className="ml-8 space-y-2">
                <label className="text-sm font-medium">Data Preview:</label>
                <Textarea
                  value={localStorageData}
                  onChange={(e) => setLocalStorageData(e.target.value)}
                  placeholder="localStorage data will appear here..."
                  className="h-32 font-mono text-xs"
                />
              </div>
            )}

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                  2
                </div>
                <h4 className="font-medium">Migrate to Supabase</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Upload your data to the Supabase PostgreSQL database
              </p>
              <div className="ml-8">
                <Button 
                  onClick={migrateData}
                  disabled={!localStorageData || migrationStatus === 'loading'}
                  className="gap-2"
                >
                  {migrationStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                  Migrate to Supabase
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {message && (
          <Alert className={`
            ${migrationStatus === 'success' ? 'border-green-200 bg-green-50' : ''}
            ${migrationStatus === 'error' ? 'border-red-200 bg-red-50' : ''}
          `}>
            {migrationStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {migrationStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
            <AlertDescription className={`
              ${migrationStatus === 'success' ? 'text-green-800' : ''}
              ${migrationStatus === 'error' ? 'text-red-800' : ''}
            `}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Actions */}
        {migrationStatus === 'success' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Migration Complete!</CardTitle>
              <CardDescription className="text-green-700">
                Your data has been successfully migrated to Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-green-800">
                  🎉 Successfully migrated {migratedCount} profiles to your Supabase database.
                  Your app will now use the database for all data operations.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="default">
                    <a href="/">Go to App</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/api/health" target="_blank">Check Database Health</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
