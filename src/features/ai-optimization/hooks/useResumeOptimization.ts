import { useState } from "react";
import type { Profile, DataBundle } from "@/shared/lib/types";
import type { OptimizationResult, GlazeLevel } from "../types";

export function useResumeOptimization() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const optimizeResume = async (
    jobUrl: string,
    jobDescription: string,
    profile: Profile,
    data: DataBundle,
    activeTab: string,
    glazeLevel: GlazeLevel
  ) => {
    if (!jobUrl && !jobDescription) {
      setError(
        "Please provide either a LinkedIn job URL or paste the job description"
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobUrl: activeTab === "url" && jobUrl ? jobUrl : undefined,
          jobDescription: activeTab === "text" && jobDescription ? jobDescription : undefined,
          profile,
          data,
          glazeLevel,
        }),
      });

      const data_response = await response.json();

      if (!response.ok) {
        throw new Error(data_response.error || "Failed to optimize resume");
      }

      setResult({
        optimizations: data_response.optimizations,
        keyInsights:
          data_response.optimizations.aiOptimization?.keyInsights || [],
        jobDescriptionLength: data_response.jobDescriptionLength,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to optimize resume"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetOptimization = () => {
    setResult(null);
    setError("");
  };

  return {
    result,
    isLoading,
    error,
    optimizeResume,
    resetOptimization,
    setError,
  };
}
