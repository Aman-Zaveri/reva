'use client';

import { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, Calendar, Building, FileText, Target, Code, Loader2, Bot, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import type { Profile, Job } from '@/shared/lib/types';

interface JobInfoModalProps {
  profile: Profile;
  onOptimizeWithAI?: () => void;
}

export function JobInfoModal({ profile, onOptimizeWithAI }: JobInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillsAnalysis, setSkillsAnalysis] = useState<any>(null);
  const [isAnalyzingSkills, setIsAnalyzingSkills] = useState(false);

  // Check if this profile has job data (either via jobId or legacy aiOptimization.jobData)
  const hasJobData = profile.jobId || profile.aiOptimization?.jobData;
  
  if (!hasJobData) {
    return null; // Don't show the button if no job data
  }

  // Fetch job data from database when modal opens
  useEffect(() => {
    if (isOpen && profile.jobId && !jobData) {
      fetchJobData();
    }
    if (isOpen && jobData && !skillsAnalysis) {
      analyzeJobSkills();
    }
  }, [isOpen, profile.jobId, jobData]);

  const fetchJobData = async () => {
    if (!profile.jobId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/jobs/${profile.jobId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job data: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setJobData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch job data');
      }
    } catch (err) {
      console.error('Error fetching job data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job data');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJobSkills = async () => {
    if (!jobData?.description) return;
    
    setIsAnalyzingSkills(true);
    
    try {
      const response = await fetch('/api/ai-agents/skills-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          analysisType: 'job-requirements',
          sourceText: jobData.description,
          focusCategories: ['technical', 'soft', 'tools'],
          confidenceThreshold: 70
        })
      });

      const result = await response.json();
      if (result.success) {
        setSkillsAnalysis(result);
      }
    } catch (err) {
      console.error('Error analyzing skills:', err);
    } finally {
      setIsAnalyzingSkills(false);
    }
  };

  // Use database job data if available, otherwise fall back to legacy aiOptimization.jobData
  const currentJobData = jobData || profile.aiOptimization?.jobData;

  // Extract technologies from job description
  const extractTechnologies = (text: string) => {
    if (!text) return [];
    
    const techPatterns = [
      /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes|AWS|Azure|GCP|Git|HTML|CSS|SASS|SCSS|API|REST|GraphQL|JSON|XML|SQL|NoSQL|Linux|Windows|MacOS|Agile|Scrum|CI\/CD|DevOps|Machine Learning|AI|TensorFlow|PyTorch|Pandas|NumPy|jQuery|Bootstrap|Tailwind|PHP|Ruby|Go|Rust|Swift|Kotlin|Android|iOS|Unity|Unreal)\b/gi
    ];
    
    const technologies = new Set<string>();
    
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => technologies.add(match));
      }
    });
    
    return Array.from(technologies).slice(0, 15);
  };

  const jobTechnologies = extractTechnologies(currentJobData?.description || '');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
          <Briefcase size={16} className="mr-2" />
          Job Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="text-green-600" />
            Job Information
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading job information...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading job information: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchJobData}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : currentJobData ? (
          <div className="space-y-6">
            {/* Job Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {currentJobData.title || 'Job Position'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      <span>{currentJobData.company || 'Company'}</span>
                    </div>
                    {currentJobData.extractedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Extracted on {new Date(currentJobData.extractedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {currentJobData.url && (
                    <a 
                      href={currentJobData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-3"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      View Original Job Posting on WaterlooWorks
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Resume Optimized</div>
                  <div className="text-lg font-semibold text-green-600">
                    {profile.aiOptimization?.timestamp ? 
                      new Date(profile.aiOptimization.timestamp).toLocaleDateString() : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* AI Actions */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Bot size={20} />
                  AI-Powered Analysis
                </CardTitle>
                <CardDescription>
                  Use our advanced AI agents to get deeper insights and optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-4 bg-white hover:bg-blue-50"
                    onClick={analyzeJobSkills}
                    disabled={isAnalyzingSkills}
                  >
                    <div className="flex items-start gap-3">
                      {isAnalyzingSkills ? (
                        <Loader2 size={20} className="animate-spin text-blue-500 mt-1" />
                      ) : (
                        <TrendingUp size={20} className="text-blue-500 mt-1" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">Skills Gap Analysis</div>
                        <div className="text-sm text-gray-600">Identify missing skills vs job requirements</div>
                      </div>
                    </div>
                  </Button>
                  
                  {onOptimizeWithAI && (
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4 bg-white hover:bg-purple-50"
                      onClick={onOptimizeWithAI}
                    >
                      <div className="flex items-start gap-3">
                        <Zap size={20} className="text-purple-500 mt-1" />
                        <div className="text-left">
                          <div className="font-medium">Re-optimize Resume</div>
                          <div className="text-sm text-gray-600">Run full AI optimization workflow</div>
                        </div>
                      </div>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills Analysis Results */}
            {skillsAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="text-purple-600" />
                    AI Skills Analysis Results
                  </CardTitle>
                  <CardDescription>
                    {skillsAnalysis.extractedSkills?.length || 0} skills identified with AI confidence scoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillsAnalysis.extractedSkills?.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-3">Required Skills & Technologies</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {skillsAnalysis.extractedSkills.map((skill: any, index: number) => (
                            <Badge 
                              key={index} 
                              variant={skill.confidence > 80 ? "default" : "secondary"}
                              className={`justify-center ${
                                skill.confidence > 80 
                                  ? 'bg-purple-500 text-white' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {skill.name} ({skill.confidence}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {skillsAnalysis.insights && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">AI Insights</h5>
                        <p className="text-blue-700 text-sm">{skillsAnalysis.insights}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Legacy Technologies (fallback) */}
            {!skillsAnalysis && jobTechnologies.length > 0 && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold">
                  <Code className="text-purple-600" size={20} />
                  Technologies & Skills Required
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {jobTechnologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 justify-center">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  These technologies were identified in the job description using pattern matching.
                </p>
              </div>
            )}

            <Separator />

            {/* Job Description */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="text-blue-600" size={20} />
                Full Job Description
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {currentJobData.description || 'No job description available.'}
                </pre>
              </div>
            </div>

            {/* Resume Optimization Context */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-blue-800 mb-3">
                <Target className="text-blue-600" size={20} />
                How This Information Was Used
              </h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  • <strong>AI Agent System:</strong> Our specialized AI agents analyzed this job posting to provide targeted resume optimization.
                </p>
                <p>
                  • <strong>Content Optimization:</strong> The content optimization agent rewrote your experience descriptions to better match job requirements.
                </p>
                <p>
                  • <strong>Skills Enhancement:</strong> The skills extraction agent identified and integrated relevant technical skills from the job description.
                </p>
                <p>
                  • <strong>ATS Optimization:</strong> The ATS optimization agent ensured your resume is compatible with applicant tracking systems.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {profile.aiOptimization?.changeAnalysis?.totalChanges || 'N/A'}
                </div>
                <div className="text-xs text-green-600">Total Changes Made</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {skillsAnalysis?.extractedSkills?.length || jobTechnologies.length}
                </div>
                <div className="text-xs text-blue-600">Skills Identified</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {profile.aiOptimization?.newSkills?.length || 0}
                </div>
                <div className="text-xs text-purple-600">New Skills Added</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {profile.aiOptimization?.changeAnalysis?.jobAlignmentScore || 'N/A'}%
                </div>
                <div className="text-xs text-orange-600">Job Alignment Score</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No job information available.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
