'use client';

import type { Profile, DataBundle } from '@/lib/types';
import { Resume } from '@/components/Resume';

interface ResumePreviewProps {
  profile: Profile;
  data: DataBundle;
}

export function ResumePreview({ profile, data }: ResumePreviewProps) {
  return (
    <div className="fixed top-6 right-0 h-screen flex flex-col glass border-l border-border/10 animate-fade-in" style={{ width: '50vw' }}>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="animate-slide-up">
          {/* Document-sized container with fixed document height */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-border p-8 h-[1056px] max-w-[8.5in] mx-auto overflow-y-auto">
            <Resume profile={profile} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
