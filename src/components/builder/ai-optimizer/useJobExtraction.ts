import { useState } from "react";
import type { JobInfo } from "./types";

export function useJobExtraction() {
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [isExtractingJob, setIsExtractingJob] = useState(false);
  const [extractionError, setExtractionError] = useState("");

  const extractJobInfo = async (jobUrl: string) => {
    if (!jobUrl || !jobUrl.includes("linkedin.com/jobs/view/")) {
      setJobInfo(null);
      setExtractionError("");
      return;
    }

    setIsExtractingJob(true);
    setExtractionError("");
    setJobInfo(null);

    try {
      const response = await fetch(
        `/api/extract-job?url=${encodeURIComponent(jobUrl)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to extract job information");
      }

      setJobInfo(result.data);
    } catch (error) {
      setExtractionError(
        error instanceof Error
          ? error.message
          : "Failed to extract job information"
      );
    } finally {
      setIsExtractingJob(false);
    }
  };

  return {
    jobInfo,
    isExtractingJob,
    extractionError,
    extractJobInfo,
    setJobInfo,
    setExtractionError,
  };
}
