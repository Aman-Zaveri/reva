import { useState } from "react";
import type { JobInfo } from "../types";

/**
 * Custom hook for extracting job information from LinkedIn URLs
 * 
 * This hook manages the entire job extraction workflow including:
 * - URL validation
 * - API calls to the extraction service
 * - Loading states and error handling
 * - Extracted job information state
 * 
 * @returns Object containing job extraction state and methods
 * 
 * @example
 * ```typescript
 * const { jobInfo, isExtractingJob, extractJobInfo } = useJobExtraction();
 * 
 * // Extract job info from LinkedIn URL
 * await extractJobInfo('https://linkedin.com/jobs/view/123456');
 * 
 * // Check results
 * if (jobInfo) {
 *   console.log(jobInfo.title, jobInfo.company);
 * }
 * ```
 */
export function useJobExtraction() {
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [isExtractingJob, setIsExtractingJob] = useState(false);
  const [extractionError, setExtractionError] = useState("");

  /**
   * Extracts job information from a LinkedIn job posting URL
   * 
   * Validates the URL format, makes an API call to extract job data,
   * and updates the component state with results or errors.
   * 
   * @param jobUrl - LinkedIn job posting URL to extract from
   */
  const extractJobInfo = async (jobUrl: string) => {
    // Validate URL format - only process LinkedIn job URLs
    if (!jobUrl || !jobUrl.includes("linkedin.com/jobs/view/")) {
      setJobInfo(null);
      setExtractionError("");
      return;
    }

    setIsExtractingJob(true);
    setExtractionError("");
    setJobInfo(null);

    try {
      // Make API call to extract job information
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
    /** Extracted job information object (null if not extracted yet) */
    jobInfo,
    /** Whether job extraction is currently in progress */
    isExtractingJob,
    /** Error message from extraction process (empty string if no error) */
    extractionError,
    /** Function to extract job info from a LinkedIn URL */
    extractJobInfo,
    /** Function to manually set job info (for testing or manual input) */
    setJobInfo,
    /** Function to manually set extraction error state */
    setExtractionError,
  };
}
