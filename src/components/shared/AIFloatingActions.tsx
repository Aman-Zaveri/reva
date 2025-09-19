"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Wand2, 
  Target, 
  Search, 
  TrendingUp, 
  CheckCircle2,
  Lightbulb,
  X,
  Plus,
  FileText
} from "lucide-react";
import type { Profile, DataBundle } from "@/lib/types";

interface AIAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'optimization' | 'analysis' | 'enhancement' | 'creation';
  onClick: () => void;
  enabled: boolean;
  badge?: string;
}

interface AIFloatingActionsProps {
  context: 'resume-builder' | 'data-management' | 'import' | 'analysis';
  profile?: Profile;
  data?: DataBundle;
  jobContext?: string;
  onAIAction?: (actionId: string, params?: any) => void;
  className?: string;
}

export type { AIFloatingActionsProps };

/**
 * Contextual AI Floating Action Buttons
 * 
 * Provides quick access to relevant AI agents based on the current context.
 * Actions are intelligently filtered and prioritized based on available data and user context.
 */
export function AIFloatingActions({
  context,
  profile,
  data,
  jobContext,
  onAIAction,
  className = ""
}: AIFloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Generate contextual AI actions based on current context
  const getContextualActions = (): AIAction[] => {
    const actions: AIAction[] = [];

    switch (context) {
      case 'resume-builder':
        // Resume builder specific actions
        actions.push({
          id: 'optimize-resume',
          label: 'AI Optimize',
          description: 'Enhance entire resume with AI optimization',
          icon: <Target size={16} />,
          color: 'bg-blue-500',
          category: 'optimization',
          onClick: () => handleAIAction('optimize-resume'),
          enabled: !!(profile && data && jobContext),
          badge: jobContext ? 'Job Context' : undefined
        });

        actions.push({
          id: 'analyze-skills',
          label: 'Skills Analysis',
          description: 'Extract and analyze skills from job description',
          icon: <Search size={16} />,
          color: 'bg-green-500',
          category: 'analysis',
          onClick: () => handleAIAction('analyze-skills'),
          enabled: !!jobContext,
        });

        actions.push({
          id: 'review-resume',
          label: 'AI Review',
          description: 'Get AI feedback on resume quality and improvements',
          icon: <CheckCircle2 size={16} />,
          color: 'bg-purple-500',
          category: 'analysis',
          onClick: () => handleAIAction('review-resume'),
          enabled: !!(profile && data),
        });

        actions.push({
          id: 'ats-optimize',
          label: 'ATS Optimize',
          description: 'Optimize for Applicant Tracking Systems',
          icon: <TrendingUp size={16} />,
          color: 'bg-orange-500',
          category: 'optimization',
          onClick: () => handleAIAction('ats-optimize'),
          enabled: !!(profile && data),
        });
        break;

      case 'data-management':
        // Data management specific actions
        actions.push({
          id: 'generate-experiences',
          label: 'AI Experiences',
          description: 'Generate experience bullet points with AI',
          icon: <Plus size={16} />,
          color: 'bg-blue-500',
          category: 'creation',
          onClick: () => handleAIAction('generate-experiences'),
          enabled: !!data,
        });

        actions.push({
          id: 'enhance-skills',
          label: 'Enhance Skills',
          description: 'AI-powered skill descriptions and categorization',
          icon: <Wand2 size={16} />,
          color: 'bg-green-500',
          category: 'enhancement',
          onClick: () => handleAIAction('enhance-skills'),
          enabled: !!(data?.skills?.length),
        });

        actions.push({
          id: 'improve-summary',
          label: 'Better Summary',
          description: 'AI-enhanced professional summary',
          icon: <FileText size={16} />,
          color: 'bg-purple-500',
          category: 'enhancement',
          onClick: () => handleAIAction('improve-summary'),
          enabled: !!(data?.personalInfo?.summary),
        });

        actions.push({
          id: 'content-suggestions',
          label: 'Content Ideas',
          description: 'Get AI suggestions for missing content areas',
          icon: <Lightbulb size={16} />,
          color: 'bg-yellow-500',
          category: 'creation',
          onClick: () => handleAIAction('content-suggestions'),
          enabled: !!data,
        });
        break;

      case 'import':
        // Import specific actions
        actions.push({
          id: 'extract-linkedin',
          label: 'LinkedIn Extract',
          description: 'AI-powered extraction from LinkedIn profile',
          icon: <Search size={16} />,
          color: 'bg-blue-500',
          category: 'creation',
          onClick: () => handleAIAction('extract-linkedin'),
          enabled: true,
        });

        actions.push({
          id: 'parse-resume',
          label: 'Parse Resume',
          description: 'Intelligent resume parsing and data extraction',
          icon: <FileText size={16} />,
          color: 'bg-green-500',
          category: 'creation',
          onClick: () => handleAIAction('parse-resume'),
          enabled: true,
        });
        break;

      case 'analysis':
        // Analysis specific actions
        actions.push({
          id: 'job-match-analysis',
          label: 'Job Match',
          description: 'Analyze how well resume matches job requirements',
          icon: <Target size={16} />,
          color: 'bg-blue-500',
          category: 'analysis',
          onClick: () => handleAIAction('job-match-analysis'),
          enabled: !!(profile && data && jobContext),
          badge: 'Match Score'
        });

        actions.push({
          id: 'skill-gaps',
          label: 'Skill Gaps',
          description: 'Identify missing skills and experience gaps',
          icon: <Search size={16} />,
          color: 'bg-orange-500',
          category: 'analysis',
          onClick: () => handleAIAction('skill-gaps'),
          enabled: !!(data && jobContext),
        });

        actions.push({
          id: 'industry-insights',
          label: 'Industry Insights',
          description: 'Get AI insights about industry trends and requirements',
          icon: <TrendingUp size={16} />,
          color: 'bg-purple-500',
          category: 'analysis',
          onClick: () => handleAIAction('industry-insights'),
          enabled: !!jobContext,
        });
        break;
    }

    // Filter out disabled actions and prioritize based on context
    return actions
      .filter(action => action.enabled)
      .sort((a, b) => {
        // Prioritize optimization and analysis actions
        const priorityOrder = { 'optimization': 0, 'analysis': 1, 'enhancement': 2, 'creation': 3 };
        return priorityOrder[a.category] - priorityOrder[b.category];
      })
      .slice(0, 6); // Limit to 6 most relevant actions
  };

  const handleAIAction = async (actionId: string) => {
    setIsProcessing(actionId);
    try {
      if (onAIAction) {
        await onAIAction(actionId, { profile, data, jobContext });
      } else {
        // Default action handlers
        switch (actionId) {
          case 'optimize-resume':
            alert('AI Resume Optimization would be triggered here');
            break;
          case 'analyze-skills':
            alert('Skills Analysis would be triggered here');
            break;
          case 'review-resume':
            alert('AI Resume Review would be triggered here');
            break;
          default:
            alert(`AI Action: ${actionId} would be executed here`);
        }
      }
    } catch (error) {
      console.error('AI Action failed:', error);
      alert('AI action failed. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const actions = getContextualActions();

  if (actions.length === 0) {
    return null; // No relevant actions for current context
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Expanded Actions Menu */}
      {isExpanded && (
        <Card className="mb-4 shadow-lg border-2 border-blue-100 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X size={12} />
              </Button>
            </div>
            
            <div className="space-y-2 max-w-xs">
              {actions.map((action) => (
                <div key={action.id} className="flex items-start gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={action.onClick}
                    disabled={isProcessing === action.id}
                    className={`flex-1 justify-start text-left h-auto p-2 border-gray-200 hover:border-gray-300`}
                  >
                    <div className={`p-1 rounded mr-2 ${action.color} text-white flex-shrink-0`}>
                      {isProcessing === action.id ? (
                        <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full" />
                      ) : (
                        action.icon
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-medium">{action.label}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-tight">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Context: {context.replace('-', ' ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main AI Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative h-14 w-14 rounded-full shadow-lg border-2 border-blue-200
          ${isExpanded 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }
          text-white transition-all duration-200 animate-pulse hover:animate-none
          ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={isProcessing !== null}
      >
        {isProcessing ? (
          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Brain size={24} />
        )}
        
        {/* Notification Badge */}
        {actions.length > 0 && !isExpanded && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {actions.length}
          </div>
        )}
      </Button>
    </div>
  );
}
