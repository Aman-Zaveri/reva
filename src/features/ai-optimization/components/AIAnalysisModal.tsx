'use client';

import { useState, useEffect } from 'react';
import { Brain, X, Target, Code, TrendingUp, CheckCircle, AlertCircle, ExternalLink, FileText, Calculator } from 'lucide-react';
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
import type { Profile } from '@/shared/lib/types';

interface AIAnalysisModalProps {
  profile: Profile;
  showOnLoad?: boolean;
}

export function AIAnalysisModal({ profile, showOnLoad }: AIAnalysisModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if this profile has AI optimization data
  const hasAIOptimization = profile.aiOptimization && profile.aiOptimization.timestamp;
  
  // Auto-open modal if showOnLoad is true and we have AI optimization data
  useEffect(() => {
    if (showOnLoad && hasAIOptimization) {
      setIsOpen(true);
    }
  }, [showOnLoad, hasAIOptimization]);
  
  if (!hasAIOptimization) {
    return null; // Don't show the button if no AI optimization data
  }

  const aiData = profile.aiOptimization!;
  const jobData = aiData.jobData || {};
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
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {jobData.title || 'Job Position'} at {jobData.company || 'Company'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Optimized on {new Date(aiData.timestamp).toLocaleDateString()} at {new Date(aiData.timestamp).toLocaleTimeString()}
                </p>
                {jobData.url && (
                  <a 
                    href={jobData.url} 
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
          </div>

          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="changes">Changes Made</TabsTrigger>
              <TabsTrigger value="technologies">Technologies</TabsTrigger>
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

            <TabsContent value="job-info" className="space-y-6">
              {/* Job Description */}
              {jobData.description && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Job Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {jobData.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Position Details</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {jobData.title || 'N/A'}</div>
                    <div><strong>Company:</strong> {jobData.company || 'N/A'}</div>
                    {jobData.extractedAt && (
                      <div><strong>Posted:</strong> {new Date(jobData.extractedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                {jobData.url && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Job Posting</h5>
                    <a 
                      href={jobData.url} 
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
