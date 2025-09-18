'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, Download, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Separator } from '@/shared/components/ui/separator';
import { AIOptimizer, AIAgentControlPanel, AIAgentConfiguration, AIAnalysisModal, JobInfoModal } from '@/features/ai-optimization/components';
import { wordExportService } from '@/shared/services';
import type { Profile, DataBundle } from '@/shared/lib/types';

interface BuilderHeaderProps {
  profile: Profile;
  data: DataBundle;
  saveStatus: 'saved' | 'saving' | 'idle';
  onDeleteProfile: () => void;
  onApplyOptimizations: (optimizations: Partial<Profile>) => void;
  showAnalysisOnLoad?: boolean;
}

export function BuilderHeader({ profile, data, saveStatus, onDeleteProfile, onApplyOptimizations, showAnalysisOnLoad }: BuilderHeaderProps) {
  const router = useRouter();

  const handleDelete = () => {
    onDeleteProfile();
    router.replace('/');
  };

  const handleExportToPDF = () => {
    window.open(`/print/${profile.id}`, '_blank');
  };

  const handleExportToWord = async () => {
    try {
      await wordExportService.exportToWord(profile, data, {
        fileName: `${profile.personalInfo?.fullName || profile.name}_Resume.docx`,
        includeHyperlinks: true,
      });
    } catch (error) {
      console.error('Failed to export to Word:', error);
      alert('Failed to export resume to Word document. Please try again.');
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm py-4 px-6">
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
          <Separator orientation="vertical" className="h-6" />
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

          <JobInfoModal 
            profile={profile} 
            onOptimizeWithAI={() => {/* This will be handled by the AIAgentControlPanel */}}
          />

          <AIAnalysisModal profile={profile} data={data} showOnLoad={showAnalysisOnLoad} />

          <AIAgentControlPanel
            profile={profile}
            data={data}
            onApplyOptimizations={onApplyOptimizations}
          />

          <AIAgentConfiguration />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export
                <ChevronDown size={14} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportToPDF}>
                <FileText size={16} className="mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportToWord}>
                <FileText size={16} className="mr-2" />
                Export as Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Resume Profile</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this profile? This action cannot be undone and will permanently remove all data associated with this resume.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Profile
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
