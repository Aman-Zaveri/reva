'use client';

import type { Profile, DataBundle } from '@/lib/types';
import { Resume } from '@/components/Resume';

interface ResumePreviewProps {
  profile: Profile;
  data: DataBundle;
}

export function ResumePreview({ profile, data }: ResumePreviewProps) {
  return (
    <div className="fixed top-0 right-0 h-screen flex flex-col bg-background" style={{ width: '50vw' }}>
      {/* Scrollable content area - matches left side exactly */}
      <div className="overflow-y-auto hide-scrollbar p-6" style={{ height: 'calc(100vh - 60px)', marginTop: '73px' }}>
        <div className="bg-card dark:bg-card shadow-sm border border-border p-8 max-w-[8.5in] mx-auto min-h-[11in] rounded-lg">
          <Resume profile={profile} data={data} />
        </div>
      </div>
    </div>
  );
}
