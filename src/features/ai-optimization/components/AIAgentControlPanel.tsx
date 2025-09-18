"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Progress } from "@/shared/components/ui/progress";
import { 
  Bot, 
  Sparkles, 
  Target, 
  FileText, 
  CheckCircle2, 
  Wand2, 
  Search,
  Shield,
  Zap,
  Settings,
  Play,
  Loader2,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { JobInputTabs } from "./JobInputTabs";
import { GlazeControl } from "./GlazeControl";
import { CustomInstructionsInput } from "./CustomInstructionsInput";
import { useJobExtraction } from "../hooks/useJobExtraction";
import type { Profile, DataBundle } from "@/shared/lib/types";
import type { GlazeLevel, TabType } from "../types";

interface AIAgentControlPanelProps {
  profile: Profile;
  data: DataBundle;
  onApplyOptimizations: (optimizations: any) => void;
}

type WorkflowType = 
  | 'full-resume-optimization'
  | 'job-specific-optimization'
  | 'content-enhancement'
  | 'skills-analysis'
  | 'resume-review'
  | 'ats-optimization'
  | 'manual-editing-assistance';

interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

interface WorkflowProgress {
  currentStep: number;
  totalSteps: number;
  currentAgent: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  results: Record<string, AgentResult>;
}

/**
 * AI Agent Control Panel - Modern interface for AI-powered resume optimization
 * 
 * This component provides access to all AI agents through different workflows:
 * - Full Resume Optimization: Complete end-to-end optimization
 * - Job-Specific Optimization: Targeted optimization for specific jobs
 * - Content Enhancement: Aggressive content transformation
 * - Skills Analysis: Comprehensive skills gap analysis
 * - Resume Review: Professional review and feedback
 * - ATS Optimization: ATS compatibility and keyword optimization
 * - Manual Editing: Interactive grammar and content assistance
 */
export function AIAgentControlPanel({
  profile,
  data,
  onApplyOptimizations,
}: AIAgentControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"workflow" | "individual">("workflow");
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('job-specific-optimization');
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [aggressiveness, setAggressiveness] = useState<GlazeLevel>(3);
  const [customInstructions, setCustomInstructions] = useState("");
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress>({
    currentStep: 0,
    totalSteps: 0,
    currentAgent: '',
    status: 'idle',
    results: {}
  });

  // Job extraction hook
  const {
    jobInfo,
    isExtractingJob,
    extractionError,
    extractJobInfo,
    setJobInfo,
    setExtractionError,
  } = useJobExtraction();

  // Auto-extract job info when URL changes
  useEffect(() => {
    const timeoutId = setTimeout(() => extractJobInfo(jobUrl), 1000);
    return () => clearTimeout(timeoutId);
  }, [jobUrl, extractJobInfo]);

  const workflows = [
    {
      id: 'job-specific-optimization',
      title: 'Job-Specific Optimization',
      description: 'Complete optimization tailored to a specific job posting',
      icon: Target,
      color: 'bg-blue-500',
      agents: ['resume-builder', 'content-optimizer', 'skills-extractor', 'ats-optimizer'],
      estimatedTime: '2-3 minutes',
      recommended: true
    },
    {
      id: 'full-resume-optimization',
      title: 'Full Resume Optimization',
      description: 'Comprehensive optimization using all AI agents',
      icon: Sparkles,
      color: 'bg-purple-500',
      agents: ['resume-builder', 'content-optimizer', 'skills-extractor', 'resume-reviewer', 'ats-optimizer'],
      estimatedTime: '3-4 minutes',
      recommended: false
    },
    {
      id: 'content-enhancement',
      title: 'Content Enhancement',
      description: 'Aggressive content transformation for maximum impact',
      icon: Wand2,
      color: 'bg-green-500',
      agents: ['content-optimizer'],
      estimatedTime: '1-2 minutes',
      recommended: false
    },
    {
      id: 'skills-analysis',
      title: 'Skills Gap Analysis',
      description: 'Identify missing skills and technology gaps',
      icon: Search,
      color: 'bg-orange-500',
      agents: ['skills-extractor'],
      estimatedTime: '1 minute',
      recommended: false
    },
    {
      id: 'resume-review',
      title: 'Professional Review',
      description: 'Get comprehensive feedback on your resume quality',
      icon: FileText,
      color: 'bg-red-500',
      agents: ['resume-reviewer'],
      estimatedTime: '1-2 minutes',
      recommended: false
    },
    {
      id: 'ats-optimization',
      title: 'ATS Optimization',
      description: 'Optimize for Applicant Tracking Systems',
      icon: Shield,
      color: 'bg-indigo-500',
      agents: ['ats-optimizer'],
      estimatedTime: '1-2 minutes',
      recommended: false
    }
  ];

  const executeWorkflow = async () => {
    const sourceText = jobUrl || jobDescription;
    if (!sourceText.trim()) {
      alert('Please provide a job URL or description');
      return;
    }

    setWorkflowProgress({
      currentStep: 0,
      totalSteps: workflows.find(w => w.id === selectedWorkflow)?.agents.length || 1,
      currentAgent: '',
      status: 'running',
      results: {}
    });

    try {
      const response = await fetch('/api/ai-agents/execute-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          workflowType: selectedWorkflow,
          profileData: { profile, data },
          jobDescription: sourceText,
          parameters: {
            aggressiveness,
            customInstructions,
            minExperiences: 3,
            minProjects: 2
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setWorkflowProgress(prev => ({
          ...prev,
          status: 'completed',
          currentStep: prev.totalSteps,
          results: { workflow: { success: true, data: result, timestamp: new Date().toISOString() } }
        }));
      } else {
        throw new Error(result.error || 'Workflow execution failed');
      }
    } catch (error) {
      setWorkflowProgress(prev => ({
        ...prev,
        status: 'error',
        results: { 
          workflow: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString() 
          } 
        }
      }));
    }
  };

  const resetWorkflow = () => {
    setWorkflowProgress({
      currentStep: 0,
      totalSteps: 0,
      currentAgent: '',
      status: 'idle',
      results: {}
    });
    setJobUrl("");
    setJobDescription("");
    setJobInfo(null);
    setExtractionError("");
    setAggressiveness(3);
    setCustomInstructions("");
  };

  const applyResults = () => {
    const workflowResult = workflowProgress.results.workflow;
    if (workflowResult?.success && workflowResult.data) {
      onApplyOptimizations(workflowResult.data);
      setIsOpen(false);
      resetWorkflow();
    }
  };

  const hasJobInput = Boolean(jobUrl || jobDescription);
  const isRunning = workflowProgress.status === 'running';
  const isCompleted = workflowProgress.status === 'completed';
  const hasError = workflowProgress.status === 'error';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100">
          <Bot size={16} />
          AI Agents
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot size={24} className="text-blue-600" />
            AI Agent Control Panel
          </DialogTitle>
          <DialogDescription>
            Advanced AI-powered resume optimization using specialized agents for different aspects of your resume.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Zap size={16} />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Settings size={16} />
              Individual Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-6">
            {workflowProgress.status === 'idle' && (
              <>
                {/* Workflow Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Choose Optimization Workflow</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workflows.map((workflow) => {
                      const Icon = workflow.icon;
                      return (
                        <Card 
                          key={workflow.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedWorkflow === workflow.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedWorkflow(workflow.id as WorkflowType)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className={`p-2 rounded-lg ${workflow.color} text-white`}>
                                <Icon size={20} />
                              </div>
                              {workflow.recommended && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base">{workflow.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {workflow.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Agents: {workflow.agents.length}</span>
                                <span className="text-gray-600">{workflow.estimatedTime}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {workflow.agents.slice(0, 3).map((agent) => (
                                  <Badge key={agent} variant="outline" className="text-xs">
                                    {agent.replace('-', ' ')}
                                  </Badge>
                                ))}
                                {workflow.agents.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{workflow.agents.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuration</h3>
                  
                  <GlazeControl
                    glazeLevel={aggressiveness}
                    onGlazeLevelChange={setAggressiveness}
                  />
                  
                  <JobInputTabs
                    activeTab={jobUrl ? "url" : "text"}
                    onTabChange={() => {}}
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
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={executeWorkflow}
                    disabled={!hasJobInput || isExtractingJob}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Play size={16} className="mr-2" />
                    Execute Workflow
                  </Button>
                </div>
              </>
            )}

            {/* Progress View */}
            {isRunning && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin text-blue-500" />
                      Executing Workflow: {workflows.find(w => w.id === selectedWorkflow)?.title}
                    </CardTitle>
                    <CardDescription>
                      Please wait while our AI agents optimize your resume...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{workflowProgress.currentStep} of {workflowProgress.totalSteps} agents</span>
                      </div>
                      <Progress 
                        value={(workflowProgress.currentStep / workflowProgress.totalSteps) * 100} 
                        className="w-full"
                      />
                      {workflowProgress.currentAgent && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 size={14} className="animate-spin" />
                          Running: {workflowProgress.currentAgent.replace('-', ' ')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Results View */}
            {isCompleted && (
              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 size={20} />
                      Workflow Completed Successfully
                    </CardTitle>
                    <CardDescription>
                      Your resume has been optimized using the {workflows.find(w => w.id === selectedWorkflow)?.title} workflow.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {workflowProgress.results.workflow?.data?.executionTime || '2.3'}s
                        </div>
                        <div className="text-sm text-gray-600">Execution Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {workflowProgress.results.workflow?.data?.agentsExecuted || workflowProgress.totalSteps}
                        </div>
                        <div className="text-sm text-gray-600">Agents Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {workflowProgress.results.workflow?.data?.totalChanges || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Changes Made</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {workflowProgress.results.workflow?.data?.optimizationScore || 'N/A'}%
                        </div>
                        <div className="text-sm text-gray-600">Quality Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Start Over
                  </Button>
                  <Button onClick={applyResults} className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 size={16} className="mr-2" />
                    Apply Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Error View */}
            {hasError && (
              <div className="space-y-6">
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertCircle size={20} />
                      Workflow Failed
                    </CardTitle>
                    <CardDescription>
                      An error occurred during the optimization process.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-600 text-sm">
                      {workflowProgress.results.workflow?.error || 'Unknown error occurred'}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Start Over
                  </Button>
                  <Button onClick={executeWorkflow} variant="destructive">
                    Retry Workflow
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <div className="text-center py-8">
              <Bot size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Individual Agent Control</h3>
              <p className="text-gray-500 mb-4">Fine-grained control over individual AI agents will be available in the next update.</p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}