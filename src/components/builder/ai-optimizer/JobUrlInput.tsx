import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { JobInfoPreview } from "./JobInfoPreview";
import type { JobInfo } from "./types";

interface JobUrlInputProps {
  jobUrl: string;
  onJobUrlChange: (url: string) => void;
  isExtractingJob: boolean;
  extractionError: string;
  jobInfo: JobInfo | null;
}

export function JobUrlInput({
  jobUrl,
  onJobUrlChange,
  isExtractingJob,
  extractionError,
  jobInfo,
}: JobUrlInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-url">LinkedIn Job URL</Label>
        <Input
          id="job-url"
          placeholder="https://www.linkedin.com/jobs/view/..."
          value={jobUrl}
          onChange={(e) => onJobUrlChange(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Paste the full LinkedIn job posting URL to automatically extract the
          job description.
        </p>
      </div>

      {/* Job extraction loading state */}
      {isExtractingJob && (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Extracting job information...</span>
        </div>
      )}

      {/* Job extraction error */}
      {extractionError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle size={16} />
          <span className="text-sm">{extractionError}</span>
        </div>
      )}

      {/* Job information preview */}
      {jobInfo && <JobInfoPreview jobInfo={jobInfo} />}
    </div>
  );
}
