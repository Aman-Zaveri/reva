import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, FileText } from "lucide-react";
import { JobUrlInput } from "./JobUrlInput";
import { JobDescriptionInput } from "./JobDescriptionInput";
import type { TabType, JobInfo } from "./types";

interface JobInputTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  jobUrl: string;
  onJobUrlChange: (url: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
  isExtractingJob: boolean;
  extractionError: string;
  jobInfo: JobInfo | null;
}

export function JobInputTabs({
  activeTab,
  onTabChange,
  jobUrl,
  onJobUrlChange,
  jobDescription,
  onJobDescriptionChange,
  isExtractingJob,
  extractionError,
  jobInfo,
}: JobInputTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="url" className="flex items-center gap-2">
          <Link size={16} />
          LinkedIn URL
        </TabsTrigger>
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText size={16} />
          Job Description
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url">
        <JobUrlInput
          jobUrl={jobUrl}
          onJobUrlChange={onJobUrlChange}
          isExtractingJob={isExtractingJob}
          extractionError={extractionError}
          jobInfo={jobInfo}
        />
      </TabsContent>

      <TabsContent value="text">
        <JobDescriptionInput
          jobDescription={jobDescription}
          onJobDescriptionChange={onJobDescriptionChange}
        />
      </TabsContent>
    </Tabs>
  );
}
