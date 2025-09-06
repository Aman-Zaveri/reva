'use client';

import type { Profile, DataBundle } from '@/shared/lib/types';
import { A4Resume } from '@/shared/components/A4Resume';

interface ResumePreviewProps {
  profile: Profile;
  data: DataBundle;
}

export function ResumePreview({ profile, data }: ResumePreviewProps) {
  return (
    <div className="fixed top-0 right-0 h-screen flex flex-col bg-background" style={{ width: '50vw' }}>
      {/* Scrollable content area - matches left side exactly */}
      <div className="overflow-y-auto hide-scrollbar p-4" style={{ height: 'calc(100vh - 73px)', marginTop: '73px' }}>
        <div style={{ paddingTop: '0.5rem' }}>
          <A4Resume profile={profile} data={data} />
        </div>
      </div>
    </div>
  );
}
