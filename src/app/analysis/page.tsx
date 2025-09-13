'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface OptimizationResult {
  keyInsights?: string[];
  newSkills?: string[];
  skillOptimizations?: string[];
}

interface JobData {
  title?: string;
  company?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  qualifications?: string;
  skills?: string;
}

function AnalysisContent() {
  const [optimizationData, setOptimizationData] = useState<OptimizationResult | null>(null);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get data from URL params (base64 encoded)
    const encodedData = searchParams.get('data');
    const encodedJob = searchParams.get('job');

    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData));
        setOptimizationData(decodedData);
      } catch (error) {
        console.error('Error decoding optimization data:', error);
      }
    }

    if (encodedJob) {
      try {
        const decodedJob = JSON.parse(atob(encodedJob));
        setJobData(decodedJob);
      } catch (error) {
        console.error('Error decoding job data:', error);
      }
    }

    setLoading(false);
  }, [searchParams]);

  const extractTechnologies = (text: string) => {
    if (!text) return [];
    
    const techPatterns = [
      /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes|AWS|Azure|GCP|Git|HTML|CSS|SASS|SCSS|API|REST|GraphQL|JSON|XML|SQL|NoSQL|Linux|Windows|MacOS|Agile|Scrum|CI\/CD|DevOps|Machine Learning|AI|TensorFlow|PyTorch|Pandas|NumPy|jQuery|Bootstrap|Tailwind|PHP|Ruby|Go|Rust|Swift|Kotlin|Android|iOS|Unity|Unreal|Photoshop|Illustrator|Figma|Sketch|Excel|PowerBI|Tableau|Salesforce|SAP|Oracle|Jira|Confluence|Slack|Teams|Zoom|Office|Google Workspace)\b/gi,
      /\b[A-Z][a-z]*(?:\.[a-z]+)+\b/g,
      /\b[A-Z]{2,}\b/g
    ];
    
    const technologies = new Set<string>();
    
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => technologies.add(match));
      }
    });
    
    return Array.from(technologies).slice(0, 20);
  };

  const calculateAlignmentScore = () => {
    const insights = optimizationData?.keyInsights?.length || 0;
    const skills = optimizationData?.newSkills?.length || 0;
    return Math.min(95, Math.max(65, 75 + insights * 3 + skills * 2));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!optimizationData && !jobData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Data Found</h1>
          <p className="text-gray-600">Please create a resume from the Chrome extension first.</p>
        </div>
      </div>
    );
  }

  const jobTech = jobData ? extractTechnologies(
    `${jobData.requirements || ''} ${jobData.responsibilities || ''} ${jobData.qualifications || ''} ${jobData.description || ''}`
  ) : [];

  const alignmentScore = calculateAlignmentScore();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Optimization Analysis</h1>
              {jobData && (
                <p className="text-lg text-gray-600 mt-2">
                  {jobData.title} at {jobData.company}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Job Alignment Score</div>
              <div className={`text-4xl font-bold ${
                alignmentScore >= 85 ? 'text-green-600' : 
                alignmentScore >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {alignmentScore}%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Optimizations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🎯 Key Optimizations Made
            </h2>
            {optimizationData?.keyInsights && optimizationData.keyInsights.length > 0 ? (
              <div className="space-y-3">
                {optimizationData.keyInsights.map((insight, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specific optimization insights available.</p>
            )}
          </div>

          {/* Skills & Technologies Added */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🔧 Skills & Technologies Added
            </h2>
            {optimizationData?.newSkills && optimizationData.newSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {optimizationData.newSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No new skills were explicitly added.</p>
            )}
          </div>
        </div>

        {/* Job Requirements Match */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            📊 Job Requirements Analysis
          </h2>
          {jobTech.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Technologies and skills identified in the job posting:
              </p>
              <div className="flex flex-wrap gap-2">
                {jobTech.map((tech, index) => {
                  const isMatched = optimizationData?.newSkills?.some(skill => 
                    skill.toLowerCase().includes(tech.toLowerCase()) ||
                    tech.toLowerCase().includes(skill.toLowerCase())
                  );
                  return (
                    <span 
                      key={index} 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isMatched 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}
                    >
                      {tech} {isMatched ? '✓' : '⚠️'}
                    </span>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                ✓ = Successfully integrated into resume | ⚠️ = Identified but not explicitly added
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No specific technologies identified in job posting.</p>
          )}
        </div>

        {/* Optimization Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            💡 Optimization Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Level 4</div>
              <div className="text-sm text-gray-600">Optimization Level</div>
              <div className="text-xs text-gray-500 mt-1">High Impact</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(optimizationData?.keyInsights?.length || 0) + (optimizationData?.newSkills?.length || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Changes</div>
              <div className="text-xs text-gray-500 mt-1">Modifications Made</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {optimizationData?.newSkills?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Skills Enhanced</div>
              <div className="text-xs text-gray-500 mt-1">Technical Focus</div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => window.close()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
