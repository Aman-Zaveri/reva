"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { JobInputTabs } from "./JobInputTabs";
import { OptimizationResults } from "./OptimizationResults";
import { OptimizationControls } from "./OptimizationControls";
import { GlazeControl } from "./GlazeControl";
import { CustomInstructionsInput } from "./CustomInstructionsInput";
import { useJobExtraction } from "@/hooks/useJobExtraction";
import { useResumeOptimization } from "@/hooks/useResumeOptimization";
import type { AIOptimizerProps, TabType, GlazeLevel } from "@/types";

/**
 * AI Resume Optimizer Dialog Component
 * 
 * This component provides a complete AI-powered resume optimization workflow:
 * 1. Job input (URL extraction or manual description entry)
 * 2. Glaze level selection for optimization aggressiveness
 * 3. AI-powered analysis and optimization
 * 4. Results review and application
 * 
 * The component manages the entire optimization flow including job extraction,
 * AI processing, and applying results back to the user's profile.
 * 
 * @param props - Component props containing profile data and callbacks
 */
export function AIOptimizer({
  profile,
  data,
  onApplyOptimizations,
}: AIOptimizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("url");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [glazeLevel, setGlazeLevel] = useState<GlazeLevel>(2); // Default to Professional level
  const [customInstructions, setCustomInstructions] = useState("");

  // Hooks for job extraction and resume optimization
  const {
    jobInfo,
    isExtractingJob,
    extractionError,
    extractJobInfo,
  } = useJobExtraction();

  const {
    result,
    isLoading,
    error,
    optimizeResume,
    resetOptimization,
  } = useResumeOptimization();

  // Automatically extract job info when URL changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => extractJobInfo(jobUrl), 1000);
    return () => clearTimeout(timeoutId);
  }, [jobUrl, extractJobInfo]);

  /**
   * Initiates the AI optimization process
   * Sends job description and profile data to the optimization service
   */
  const handleOptimize = () => {
    optimizeResume(jobUrl, jobDescription, profile, data, activeTab, glazeLevel, customInstructions);
  };

  /**
   * Applies the AI-generated optimizations to the user's profile
   * Closes the dialog and resets the optimization state
   */
  const handleApplyOptimizations = () => {
    if (result) {
      onApplyOptimizations(result.optimizations);
      handleReset();
      setIsOpen(false);
    }
  };

  /**
   * Resets all optimization state and form inputs
   * Used when starting over or canceling the optimization
   */
  const handleReset = () => {
    resetOptimization();
    setJobUrl("");
    setJobDescription("");
    setActiveTab("url");
    setGlazeLevel(2); // Reset to professional level
    setCustomInstructions(""); // Reset custom instructions
  };

  const hasJobInput = Boolean(jobUrl || jobDescription);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles size={8} />
          AI Optimize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} />
            AI Resume Optimizer
          </DialogTitle>
          <DialogDescription>
            Analyze a LinkedIn job posting and automatically optimize your
            resume to better match the requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <>
              <GlazeControl
                glazeLevel={glazeLevel}
                onGlazeLevelChange={setGlazeLevel}
              />
              
              <JobInputTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                jobUrl={jobUrl}
                onJobUrlChange={setJobUrl}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                isExtractingJob={isExtractingJob}
                extractionError={extractionError}
                jobInfo={jobInfo}
              />

              <CustomInstructionsInput
                value={customInstructions}
                onChange={setCustomInstructions}
              />

              <OptimizationControls
                isLoading={isLoading}
                isExtractingJob={isExtractingJob}
                error={error}
                hasJobInput={hasJobInput}
                onOptimize={handleOptimize}
                onCancel={() => setIsOpen(false)}
              />
            </>
          ) : (
            <>
              <OptimizationResults 
                result={result} 
                data={data} 
                originalProfile={profile} 
                glazeLevel={glazeLevel}
              />
              <OptimizationControls
                isLoading={false}
                isExtractingJob={false}
                error=""
                hasJobInput={true}
                onOptimize={() => {}}
                onCancel={() => {}}
                showResults={true}
                onApply={handleApplyOptimizations}
                onTryAgain={handleReset}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
