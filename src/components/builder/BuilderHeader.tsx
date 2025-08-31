'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/types';

interface BuilderHeaderProps {
  profile: Profile;
  saveStatus: 'saved' | 'saving' | 'idle';
  onDeleteProfile: () => void;
}

export function BuilderHeader({ profile, saveStatus, onDeleteProfile }: BuilderHeaderProps) {
  const router = useRouter();

  const handleDelete = () => {
    if (confirm('Delete this profile? This action cannot be undone.')) {
      onDeleteProfile();
      router.replace('/');
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/">
              <ArrowLeft size={16}/>
              Back to Home
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-lg font-semibold">{profile.name}</h1>
            <p className="text-xs text-muted-foreground">Resume Builder</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2 text-sm min-w-[80px]">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Save size={14} />
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={14} />
                <span>Saved</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/print/${profile.id}`, '_blank')}
          >
            <Printer size={16} className="mr-2" />
            Export PDF
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
