'use client';

import { useParams } from 'next/navigation';
import { useProfilesStore } from '@/lib/store';
import { useEffect, useMemo, useState } from 'react';
import { A4Resume } from '@/components/A4Resume';

export default function PrintPage() {
  const params = useParams<{ id: string }>();
  const { profiles, data, loadFromStorage } = useProfilesStore();
  const [isLoading, setIsLoading] = useState(true);
  const profile = useMemo(() => profiles.find((p) => p.id === params.id), [profiles, params.id]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Ensure data is loaded from database
        await loadFromStorage();
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [loadFromStorage]);

  useEffect(() => {
    // Auto-open print dialog once profile is found
    if (profile && !isLoading) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [profile, isLoading]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Profile not found</h1>
          <p className="text-gray-600 mb-4">The profile with ID &quot;{params.id}&quot; could not be found.</p>
          <button 
            onClick={() => window.close()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="print:p-0 print:m-0 bg-white">
      <A4Resume profile={profile} data={data} compact showPrintView />
    </div>
  );
}