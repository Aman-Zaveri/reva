"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Link,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Building,
  MapPin,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Profile, DataBundle } from "@/lib/types";

interface AIOptimizerProps {
  profile: Profile;
  data: DataBundle;
  onApplyOptimizations: (optimizations: Partial<Profile>) => void;
}

interface OptimizationResult {
  optimizations: Partial<Profile>;
  keyInsights: string[];
  jobDescriptionLength: number;
}

interface JobInfo {
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: string;
  url: string;
}

export function AIOptimizer({
  profile,
  data,
  onApplyOptimizations,
}: AIOptimizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("url");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingJob, setIsExtractingJob] = useState(false);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [extractionError, setExtractionError] = useState("");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState("");

  // Extract job info when URL changes
  useEffect(() => {
    const extractJobInfo = async () => {
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
        console.error("Job extraction error:", error);
        setExtractionError(
          error instanceof Error
            ? error.message
            : "Failed to extract job information"
        );
      } finally {
        setIsExtractingJob(false);
      }
    };

    const timeoutId = setTimeout(extractJobInfo, 1000); // Debounce for 1 second
    return () => clearTimeout(timeoutId);
  }, [jobUrl]);

  const handleOptimize = async () => {
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
          jobUrl: activeTab === "url" ? jobUrl : "",
          jobDescription: activeTab === "text" ? jobDescription : "",
          profile,
          data,
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
      console.error("Optimization error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to optimize resume"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyOptimizations = () => {
    if (result) {
      onApplyOptimizations(result.optimizations);
      setIsOpen(false);
      setResult(null);
      setJobUrl("");
      setJobDescription("");
      setActiveTab("url");
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    setJobUrl("");
    setJobDescription("");
    setJobInfo(null);
    setExtractionError("");
    setActiveTab("url");
  };

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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-url">LinkedIn Job URL</Label>
                    <Input
                      id="job-url"
                      placeholder="https://www.linkedin.com/jobs/view/..."
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Paste the full LinkedIn job posting URL to automatically
                      extract the job description.
                    </p>
                  </div>

                  {/* Job extraction loading state */}
                  {isExtractingJob && (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">
                        Extracting job information...
                      </span>
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
                  {jobInfo && (
                    <Card className="border-green-200 bg-green-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-green-800">
                          <CheckCircle size={16} />
                          Job Information Extracted
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {jobInfo.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Building size={14} />
                              {jobInfo.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              {jobInfo.location}
                            </div>
                            {jobInfo.employmentType && (
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {jobInfo.employmentType}
                              </div>
                            )}
                          </div>
                        </div>

                        {(jobInfo.experienceLevel || jobInfo.salary) && (
                          <div className="flex gap-2">
                            {jobInfo.experienceLevel && (
                              <Badge variant="secondary">
                                {jobInfo.experienceLevel}
                              </Badge>
                            )}
                            {jobInfo.salary && (
                              <Badge variant="secondary">
                                {jobInfo.salary}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium mb-4">
                            Job Description:
                          </p>
                          <div className="bg-muted/20 border border-border rounded-md overflow-hidden">
                            <div className="p-4 max-h-64 overflow-y-auto">
                              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                {jobInfo.description
                                  .replace(/<[^>]*>/g, '') // Strip HTML tags
                                  .replace(/([a-z])([A-Z])/g, '$1\n\n$2') // Add breaks between lowercase and uppercase letters
                                  .replace(/\n{3,}/g, '\n\n') // Clean up excessive line breaks
                                }
                              </pre>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {jobInfo.description.length} characters
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                      id="job-description"
                      placeholder="Paste the complete job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={10}
                    />
                    <p className="text-sm text-muted-foreground">
                      Copy and paste the job description, including requirements
                      and responsibilities.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleOptimize}
                  disabled={
                    isLoading || isExtractingJob || (!jobUrl && !jobDescription)
                  }
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Optimize Resume
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  <h3 className="text-lg font-semibold">
                    Optimization Complete!
                  </h3>
                </div>

                <p className="text-muted-foreground">
                  Analyzed {result.jobDescriptionLength} characters of job
                  description and generated personalized optimizations for your
                  resume.
                </p>

                {result.keyInsights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb size={16} />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.keyInsights.map((insight, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Badge
                              variant="secondary"
                              className="px-2 py-1 text-xs shrink-0"
                            >
                              {index + 1}
                            </Badge>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Optimization Preview
                    </CardTitle>
                    <CardDescription>
                      The following changes will be applied to your resume:
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.optimizations.personalInfo?.summary && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Updated Summary
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {result.optimizations.personalInfo.summary}
                        </p>
                      </div>
                    )}

                    {result.optimizations.experienceOverrides &&
                      Object.keys(result.optimizations.experienceOverrides)
                        .length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">
                            Experience Optimizations
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(
                              result.optimizations.experienceOverrides
                            ).map(([id, overrides]) => {
                              const experience = data.experiences.find(
                                (exp) => exp.id === id
                              );
                              return (
                                <div
                                  key={id}
                                  className="bg-muted p-3 rounded text-sm"
                                >
                                  <p className="font-medium">
                                    {experience?.title} at {experience?.company}
                                  </p>
                                  {overrides.bullets && (
                                    <ul className="mt-1 space-y-1 text-muted-foreground">
                                      {overrides.bullets.map(
                                        (bullet, index) => (
                                          <li key={index}>• {bullet}</li>
                                        )
                                      )}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {result.optimizations.projectOverrides &&
                      Object.keys(result.optimizations.projectOverrides)
                        .length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">
                            Project Optimizations
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(
                              result.optimizations.projectOverrides
                            ).map(([id, overrides]) => {
                              const project = data.projects.find(
                                (proj) => proj.id === id
                              );
                              return (
                                <div
                                  key={id}
                                  className="bg-muted p-3 rounded text-sm"
                                >
                                  <p className="font-medium">
                                    {project?.title}
                                  </p>
                                  {overrides.bullets && (
                                    <ul className="mt-1 space-y-1 text-muted-foreground">
                                      {overrides.bullets.map(
                                        (bullet, index) => (
                                          <li key={index}>• {bullet}</li>
                                        )
                                      )}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleReset}>
                  Try Again
                </Button>
                <Button onClick={handleApplyOptimizations} className="gap-2">
                  <CheckCircle size={16} />
                  Apply Optimizations
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
