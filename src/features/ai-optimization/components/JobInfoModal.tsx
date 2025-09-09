'use client';

import { useState } from 'react';
import { Briefcase, ExternalLink, Calendar, Building, FileText, Target, Code } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import type { Profile } from '@/shared/lib/types';

interface JobInfoModalProps {
  profile: Profile;
}

export function JobInfoModal({ profile }: JobInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if this profile has job data
  const hasJobData = profile.aiOptimization?.jobData;
  
  if (!hasJobData) {
    return null; // Don't show the button if no job data
  }

  const jobData = profile.aiOptimization!.jobData!;

  // Extract technologies from job description
  const extractTechnologies = (text: string) => {
    if (!text) return [];
    
    const techPatterns = [
      /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes|AWS|Azure|GCP|Git|HTML|CSS|SASS|SCSS|API|REST|GraphQL|JSON|XML|SQL|NoSQL|Linux|Windows|MacOS|Agile|Scrum|CI\/CD|DevOps|Machine Learning|AI|TensorFlow|PyTorch|Pandas|NumPy|jQuery|Bootstrap|Tailwind|PHP|Ruby|Go|Rust|Swift|Kotlin|Android|iOS|Unity|Unreal)\b/gi
    ];
    
    let technologies = new Set<string>();
    
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => technologies.add(match));
      }
    });
    
    return Array.from(technologies).slice(0, 15);
  };

  const jobTechnologies = extractTechnologies(jobData.description || '');

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

        <div className="space-y-6">
          {/* Job Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {jobData.title || 'Job Position'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building size={16} />
                    <span>{jobData.company || 'Company'}</span>
                  </div>
                  {jobData.extractedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Extracted on {new Date(jobData.extractedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {jobData.url && (
                  <a 
                    href={jobData.url} 
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

          {/* Technologies Identified */}
          {jobTechnologies.length > 0 && (
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
                These technologies were identified in the job description and integrated into your resume during optimization.
              </p>
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="text-blue-600" size={20} />
              Full Job Description
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {jobData.description || 'No job description available.'}
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
                • <strong>Technology Matching:</strong> All technical requirements from this job posting were identified and integrated into your resume's experience descriptions and skills sections.
              </p>
              <p>
                • <strong>Keyword Optimization:</strong> Industry-specific terms and methodologies mentioned in the job description were incorporated throughout your resume.
              </p>
              <p>
                • <strong>Content Enhancement:</strong> Your experience bullet points were rewritten to highlight relevant skills and achievements that align with this specific role.
              </p>
              <p>
                • <strong>Skills Augmentation:</strong> New technical skills and categories were added to match the job requirements, ensuring your resume demonstrates the necessary expertise.
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
                {profile.aiOptimization?.changeAnalysis?.technologiesAdded?.length || jobTechnologies.length}
              </div>
              <div className="text-xs text-blue-600">Technologies Added</div>
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
      </DialogContent>
    </Dialog>
  );
}
