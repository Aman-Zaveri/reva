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
    <div className="fixed top-0 left-0 right-0 z-50 w-full border-b glass backdrop-blur-xl py-4 px-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-white/10 hover-lift"
          >
            <Link href="/">
              <ArrowLeft size={16} className="mr-2" />
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
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Save size={14} className="animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-emerald-600 animate-scale-subtle">
                <Check size={14} />
                <span>Saved</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/print/${profile.id}`, '_blank')}
            className="border-border hover:bg-accent hover-lift"
          >
            <Printer size={16} className="mr-2" />
            Export PDF
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="border-border hover:bg-destructive/90 hover-lift"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
