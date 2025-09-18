'use client';

import { useState, useEffect } from 'react';
import { Brain, X, Target, Code, TrendingUp, CheckCircle, AlertCircle, ExternalLink, FileText, Calculator, Loader2, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { Profile, Job, DataBundle, Skill } from '@/shared/lib/types';
import type { SkillsExtractionOutput } from '../services/skills-extraction.agent';

interface AIAnalysisModalProps {
  profile: Profile;
  data?: DataBundle;
  showOnLoad?: boolean;
}

export function AIAnalysisModal({ profile, data, showOnLoad }: AIAnalysisModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  
  // AI Skills Extraction State
  const [skillsAnalysis, setSkillsAnalysis] = useState<SkillsExtractionOutput | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // Check if this profile has AI optimization data
  const hasAIOptimization = profile.aiOptimization && profile.aiOptimization.timestamp;
  
  // Auto-open modal if showOnLoad is true and we have AI optimization data
  useEffect(() => {
    if (showOnLoad && hasAIOptimization) {
      setIsOpen(true);
    }
  }, [showOnLoad, hasAIOptimization]);

  // Fetch job data from database when modal opens
  useEffect(() => {
    if (isOpen && profile.jobId && !jobData) {
      fetchJobData();
    }
  }, [isOpen, profile.jobId]);

  // Auto-extract skills when job data is loaded
  useEffect(() => {
    if (jobData && !skillsAnalysis && !isLoadingSkills) {
      extractSkillsFromJob();
    }
  }, [jobData]);

  const fetchJobData = async () => {
    if (!profile.jobId) return;
    
    setIsLoadingJob(true);
    setJobError(null);
    
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
      setJobError(err instanceof Error ? err.message : 'Failed to fetch job data');
    } finally {
      setIsLoadingJob(false);
    }
  };

  const extractSkillsFromJob = async () => {
    if (!jobData) return;

    setIsLoadingSkills(true);
    setSkillsError(null);

    try {
      // Prepare source text from job data
      const sourceParts = [];
      if (jobData.description) sourceParts.push(jobData.description);
      if (jobData.requirements) sourceParts.push(`Requirements: ${jobData.requirements}`);
      if (jobData.responsibilities) sourceParts.push(`Responsibilities: ${jobData.responsibilities}`);
      if (jobData.skills) sourceParts.push(`Skills: ${jobData.skills}`);
      
      const sourceText = sourceParts.join('\n\n');

      if (!sourceText.trim()) {
        throw new Error('No job content available for skills extraction');
      }

      // Extract skills from existing user skills for gap analysis
      const existingSkills = data?.skills?.filter(skill => 
        profile.skillIds.includes(skill.id)
      ).map((skill: Skill) => ({
        name: skill.name,
        category: 'Technical', // Default category since Profile skills don't have categories
        details: skill.details || ''
      })) || [];

      const response = await fetch('/api/ai-agents/skills-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          analysisType: 'skill-gap-analysis',
          sourceText,
          existingSkills,
          includeSoftSkills: true,
          confidenceThreshold: 60,
          profileData: {
            profile,
            data
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Skills analysis failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setSkillsAnalysis(result);
      } else {
        throw new Error(result.error || 'Failed to analyze skills');
      }
    } catch (err) {
      console.error('Error extracting skills:', err);
      setSkillsError(err instanceof Error ? err.message : 'Failed to extract skills');
    } finally {
      setIsLoadingSkills(false);
    }
  };
  
  if (!hasAIOptimization) {
    return null; // Don't show the button if no AI optimization data
  }

  const aiData = profile.aiOptimization!;
  // Use database job data if available, otherwise fall back to legacy aiOptimization.jobData
  const currentJobData = jobData || aiData.jobData || {};
  const newSkills = aiData.newSkills || [];
  const skillOptimizations = aiData.skillOptimizations || [];
  const changeAnalysis = aiData.changeAnalysis;

  // Use the AI-provided alignment score or fall back to calculated one
  const alignmentScore = changeAnalysis?.jobAlignmentScore || 
    Math.min(95, Math.max(65, 75 + (aiData.keyInsights?.length || 0) * 3 + newSkills.length * 2));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
          <Brain size={16} className="mr-2" />
          Analyze AI Changes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="text-blue-600" />
            AI Resume Optimization Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Job Info and Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            {isLoadingJob ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin mr-2" />
                <span>Loading job information...</span>
              </div>
            ) : jobError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">Error loading job information: {jobError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchJobData}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentJobData.title || 'Job Position'} at {currentJobData.company || 'Company'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Optimized on {new Date(aiData.timestamp).toLocaleDateString()} at {new Date(aiData.timestamp).toLocaleTimeString()}
                  </p>
                  {currentJobData.url && (
                    <a 
                      href={currentJobData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      <ExternalLink size={12} className="mr-1" />
                      View Original Job Posting
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Job Alignment Score</div>
                  <div className={`text-3xl font-bold ${
                    alignmentScore >= 85 ? 'text-green-600' : 
                    alignmentScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {alignmentScore}%
                  </div>
                  {changeAnalysis?.scoreExplanation && (
                    <div className="text-xs text-gray-500 mt-1 max-w-xs">
                      <Calculator size={10} className="inline mr-1" />
                      {changeAnalysis.scoreExplanation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="changes">Changes Made</TabsTrigger>
              <TabsTrigger value="technologies">Technologies</TabsTrigger>
              <TabsTrigger value="skills-extraction">Skills Extraction</TabsTrigger>
              <TabsTrigger value="job-info">Job Information</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Optimizations */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-semibold">
                    <Target className="text-blue-600" size={20} />
                    Key Optimizations Made
                  </h4>
                  <div className="space-y-3">
                    {aiData.keyInsights && aiData.keyInsights.length > 0 ? (
                      aiData.keyInsights.map((insight, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-gray-700 text-sm">{insight}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No specific optimization insights available.</p>
                    )}
                  </div>
                </div>

                {/* Skills & Technologies Added */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-semibold">
                    <Code className="text-green-600" size={20} />
                    Skills & Technologies Added
                  </h4>
                  <div className="space-y-3">
                    {newSkills && newSkills.length > 0 ? (
                      <div className="space-y-3">
                        {newSkills.map((skill: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="font-medium text-green-800">
                              {typeof skill === 'string' ? skill : skill.name}
                            </div>
                            {skill.details && (
                              <div className="text-sm text-green-700 mt-1">{skill.details}</div>
                            )}
                            {skill.reason && (
                              <div className="text-xs text-green-600 mt-1 italic">
                                Reason: {skill.reason}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No new skills were explicitly added.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optimization Summary Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">Optimization Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">Level 4</div>
                    <div className="text-xs text-gray-600">Optimization Level</div>
                    <div className="text-xs text-gray-500">Aggressive Enhancement</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {changeAnalysis?.totalChanges || ((aiData.keyInsights?.length || 0) + newSkills.length)}
                    </div>
                    <div className="text-xs text-gray-600">Total Changes</div>
                    <div className="text-xs text-gray-500">Modifications Made</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {changeAnalysis?.technologiesAdded?.length || newSkills.length}
                    </div>
                    <div className="text-xs text-gray-600">Technologies</div>
                    <div className="text-xs text-gray-500">Added/Enhanced</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {changeAnalysis?.keywordsIncorporated?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Keywords</div>
                    <div className="text-xs text-gray-500">Incorporated</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="changes" className="space-y-6">
              {changeAnalysis ? (
                <div className="space-y-6">
                  {/* Content Areas Rewritten */}
                  {changeAnalysis.contentRewritten?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        Content Areas Rewritten
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {changeAnalysis.contentRewritten.map((area, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Enhanced */}
                  {changeAnalysis.skillsEnhanced?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Skills Enhanced</h4>
                      <div className="flex flex-wrap gap-2">
                        {changeAnalysis.skillsEnhanced.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Optimizations Details */}
                  {skillOptimizations && skillOptimizations.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Detailed Skill Changes</h4>
                      <div className="space-y-3">
                        {skillOptimizations.map((skill: any, index: number) => (
                          <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="font-medium text-yellow-800 mb-2">{skill.name}</div>
                            <div className="text-sm text-yellow-700 mb-2">{skill.details}</div>
                            {skill.changes && skill.changes.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-yellow-600 mb-1">Changes made:</div>
                                <ul className="text-xs text-yellow-600 list-disc list-inside">
                                  {skill.changes.map((change: string, changeIndex: number) => (
                                    <li key={changeIndex}>{change}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords Incorporated */}
                  {changeAnalysis.keywordsIncorporated?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Keywords Incorporated</h4>
                      <div className="flex flex-wrap gap-2">
                        {changeAnalysis.keywordsIncorporated.map((keyword, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No detailed change analysis available.</p>
              )}
            </TabsContent>

            <TabsContent value="technologies" className="space-y-6">
              {/* Technologies Added */}
              {changeAnalysis?.technologiesAdded && changeAnalysis.technologiesAdded.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Code className="text-green-600" size={20} />
                    Technologies Added to Resume
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {changeAnalysis.technologiesAdded.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 justify-center">
                        <CheckCircle size={12} className="mr-1" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* New Skills with Technology Details */}
              {newSkills && newSkills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">New Skill Categories Added</h4>
                  <div className="space-y-3">
                    {newSkills.map((skill: any, index: number) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800 mb-1">
                          {typeof skill === 'string' ? skill : skill.name}
                        </div>
                        {skill.details && (
                          <div className="text-sm text-blue-700 mb-2">{skill.details}</div>
                        )}
                        {skill.reason && (
                          <div className="text-xs text-blue-600 italic">
                            <strong>Why added:</strong> {skill.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="skills-extraction" className="space-y-6">
              {isLoadingSkills ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin mr-2" />
                  <span>Extracting skills from job description...</span>
                </div>
              ) : skillsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertCircle size={16} />
                    <span className="font-medium">Skills Extraction Failed</span>
                  </div>
                  <p className="text-red-600 text-sm mb-3">{skillsError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={extractSkillsFromJob}
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <Search size={14} className="mr-1" />
                    Retry Skills Extraction
                  </Button>
                </div>
              ) : skillsAnalysis ? (
                <div className="space-y-6">
                  {/* Skills Extraction Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Search className="text-green-600" size={20} />
                      AI Skills Extraction Results
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {skillsAnalysis.extractionSummary?.totalSkillsFound || 0}
                        </div>
                        <div className="text-xs text-gray-600">Skills Found</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {skillsAnalysis.extractionSummary?.categoriesIdentified?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Categories</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {skillsAnalysis.skillGaps?.missingCriticalSkills?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Missing Critical</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {skillsAnalysis.skillGaps?.missingPreferredSkills?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Missing Preferred</div>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Skills by Category */}
                  {skillsAnalysis.extractedSkills && Object.keys(skillsAnalysis.extractedSkills).length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Extracted Skills by Category</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(skillsAnalysis.extractedSkills).map(([category, skills]) => (
                          <div key={category} className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-3">{category}</h5>
                            <div className="space-y-2">
                              {skills.map((skill, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded p-2 text-sm">
                                  <div className="flex-1">
                                    <div className="font-medium">{skill.name}</div>
                                    {skill.context && skill.context.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Context: {skill.context[0]}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${
                                        skill.importance === 'critical' ? 'bg-red-100 text-red-800' :
                                        skill.importance === 'important' ? 'bg-orange-100 text-orange-800' :
                                        skill.importance === 'preferred' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {skill.importance}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {skill.confidence}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills Analysis */}
                  {skillsAnalysis.skillGaps && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <AlertCircle className="text-amber-600" size={20} />
                        Skills Gap Analysis
                      </h4>
                      
                      {skillsAnalysis.skillGaps.missingCriticalSkills && skillsAnalysis.skillGaps.missingCriticalSkills.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h5 className="font-medium text-red-800 mb-2">Missing Critical Skills</h5>
                          <div className="space-y-2">
                            {skillsAnalysis.skillGaps.missingCriticalSkills.map((skill, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-red-700 font-medium">{skill.name}</span>
                                <Badge className="bg-red-600 text-white text-xs">
                                  {skill.confidence}% match
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {skillsAnalysis.skillGaps.missingPreferredSkills && skillsAnalysis.skillGaps.missingPreferredSkills.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h5 className="font-medium text-orange-800 mb-2">Missing Preferred Skills</h5>
                          <div className="space-y-2">
                            {skillsAnalysis.skillGaps.missingPreferredSkills.map((skill, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-orange-700">{skill.name}</span>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                                  {skill.confidence}% match
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {skillsAnalysis.skillGaps.recommendations && skillsAnalysis.skillGaps.recommendations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                            <Lightbulb size={16} />
                            AI Recommendations
                          </h5>
                          <ul className="space-y-1">
                            {skillsAnalysis.skillGaps.recommendations.map((rec, index) => (
                              <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Insights */}
                  {skillsAnalysis.insights && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-medium text-purple-800 mb-3">AI Insights</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {skillsAnalysis.insights.topCategories && skillsAnalysis.insights.topCategories.length > 0 && (
                          <div>
                            <div className="font-medium text-purple-700 mb-1">Top Skill Categories</div>
                            <div className="flex flex-wrap gap-1">
                              {skillsAnalysis.insights.topCategories.map((cat, index) => (
                                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {skillsAnalysis.insights.emergingTechnologies && skillsAnalysis.insights.emergingTechnologies.length > 0 && (
                          <div>
                            <div className="font-medium text-purple-700 mb-1">Emerging Technologies</div>
                            <div className="flex flex-wrap gap-1">
                              {skillsAnalysis.insights.emergingTechnologies.map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-purple-600 border-purple-300 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {skillsAnalysis.insights.recommendedFocus && skillsAnalysis.insights.recommendedFocus.length > 0 && (
                          <div className="md:col-span-2">
                            <div className="font-medium text-purple-700 mb-1">Recommended Focus Areas</div>
                            <div className="flex flex-wrap gap-1">
                              {skillsAnalysis.insights.recommendedFocus.map((focus, index) => (
                                <Badge key={index} className="bg-purple-600 text-white text-xs">
                                  {focus}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Search className="mx-auto mb-3 text-gray-400" size={48} />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">Skills Extraction Available</h4>
                  <p className="text-gray-500 mb-4">
                    AI can analyze the job description to extract required skills and compare them with your current skills.
                  </p>
                  <Button onClick={extractSkillsFromJob} className="bg-blue-600 hover:bg-blue-700">
                    <Search size={16} className="mr-2" />
                    Extract Skills from Job
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="job-info" className="space-y-6">
              {/* Job Description */}
              {currentJobData.description && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Job Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {currentJobData.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Position Details</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {currentJobData.title || 'N/A'}</div>
                    <div><strong>Company:</strong> {currentJobData.company || 'N/A'}</div>
                    {currentJobData.extractedAt && (
                      <div><strong>Posted:</strong> {new Date(currentJobData.extractedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                {currentJobData.url && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Job Posting</h5>
                    <a 
                      href={currentJobData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      View Original Posting on WaterlooWorks
                    </a>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
