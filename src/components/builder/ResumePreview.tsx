'use client';

import type { Profile, DataBundle } from '@/lib/types';
import { Resume } from '@/components/Resume';

interface ResumePreviewProps {
  profile: Profile;
  data: DataBundle;
}

export function ResumePreview({ profile, data }: ResumePreviewProps) {
  return (
    <div className="fixed top-0 right-0 h-screen flex flex-col border-l border-border/20 bg-background animate-fade-in" style={{ width: '50vw' }}>
      {/* Header spacing to account for fixed header */}
      <div className="h-20 flex-shrink-0"></div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="animate-slide-up">
          {/* Document-sized container with proper dimensions */}
          <div className="bg-white rounded-xl dark:bg-gray-900 shadow-lg border border-border p-8 max-w-[8.5in] mx-auto min-h-[11in]">
            <Resume profile={profile} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
