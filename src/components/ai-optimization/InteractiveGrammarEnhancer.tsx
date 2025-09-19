"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Wand2, 
  Send, 
  Loader2, 
  CheckCircle2, 
  X,
  Copy,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import type { Profile, DataBundle } from "@/lib/types";

interface InteractiveGrammarEnhancerProps {
  profile: Profile;
  data: DataBundle;
  initialText?: string;
  jobContext?: string;
  onTextApproved?: (text: string) => void;
}

interface Suggestion {
  id: string;
  originalText: string;
  suggestedText: string;
  explanation: string;
  confidence: number;
  category: 'grammar' | 'style' | 'impact' | 'keywords' | 'clarity';
  approved?: boolean;
}

interface EnhancementResult {
  suggestions: Suggestion[];
  enhancedText: string;
  overallScore: number;
  insights: string[];
}

/**
 * Interactive Grammar Enhancement Component
 * 
 * Provides real-time AI-powered text enhancement with interactive suggestions.
 * Users can chat with the AI to refine specific parts of their resume content.
 */
export function InteractiveGrammarEnhancer({
  profile,
  data,
  initialText = "",
  jobContext,
  onTextApproved
}: InteractiveGrammarEnhancerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentText, setCurrentText] = useState(initialText);
  const [userPrompt, setUserPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>>([]);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentText]);

  const enhanceText = async (userInstruction?: string) => {
    if (!currentText.trim()) return;

    setIsProcessing(true);
    const instruction = userInstruction || userPrompt;

    try {
      const response = await fetch('/api/ai-agents/grammar-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: currentText,
          userPrompt: instruction || "Improve this text for maximum impact and clarity",
          jobContext: jobContext || profile.aiOptimization?.jobData?.description,
          enhancementFocus: ['clarity', 'impact', 'grammar', 'keywords'],
          generateAlternatives: true
        })
      });

      const result = await response.json();

      if (result.success) {
        setEnhancementResult({
          suggestions: result.suggestions || [],
          enhancedText: result.enhancedText || currentText,
          overallScore: result.qualityScore || 0,
          insights: result.insights || []
        });

        // Add to conversation history
        if (instruction) {
          setConversationHistory(prev => [
            ...prev,
            { type: 'user', content: instruction, timestamp: new Date() },
            { type: 'ai', content: result.enhancedText || 'Text enhanced successfully', timestamp: new Date() }
          ]);
        }

        setUserPrompt("");
      } else {
        throw new Error(result.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('Grammar enhancement error:', error);
      alert('Failed to enhance text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    const newText = currentText.replace(suggestion.originalText, suggestion.suggestedText);
    setCurrentText(newText);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const applyEnhancedText = () => {
    if (enhancementResult?.enhancedText) {
      setCurrentText(enhancementResult.enhancedText);
      setEnhancementResult(null);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleApprove = () => {
    if (onTextApproved) {
      onTextApproved(currentText);
    }
    setIsOpen(false);
  };

  const quickPrompts = [
    "Make this more impactful with stronger action verbs",
    "Add more quantified achievements and metrics",
    "Optimize for ATS and keyword density",
    "Make it more concise while keeping key information",
    "Enhance technical terminology and industry buzzwords"
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grammar': return 'bg-red-100 text-red-700';
      case 'style': return 'bg-blue-100 text-blue-700';
      case 'impact': return 'bg-green-100 text-green-700';
      case 'keywords': return 'bg-purple-100 text-purple-700';
      case 'clarity': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 size={16} />
          Enhance Text
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 size={20} className="text-blue-600" />
            Interactive Grammar & Content Enhancer
          </DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions to improve your resume content with interactive editing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Text Editor */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Text
              </label>
              <Textarea
                ref={textareaRef}
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Paste your resume bullet point or section here..."
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                onClick={() => enhanceText()} 
                disabled={!currentText.trim() || isProcessing}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isProcessing ? (
                  <Loader2 size={14} className="animate-spin mr-2" />
                ) : (
                  <Lightbulb size={14} className="mr-2" />
                )}
                Quick Enhance
              </Button>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy size={14} className="mr-2" />
                Copy
              </Button>
              <Button onClick={() => setCurrentText("")} variant="outline" size="sm">
                <RefreshCw size={14} className="mr-2" />
                Clear
              </Button>
            </div>

            {/* Custom Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Custom Instructions
              </label>
              <div className="flex gap-2">
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Tell the AI how to improve your text..."
                  className="min-h-[60px] resize-none"
                />
                <Button 
                  onClick={() => enhanceText(userPrompt)}
                  disabled={!currentText.trim() || !userPrompt.trim() || isProcessing}
                  size="sm"
                  className="self-end"
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Prompts</label>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => enhanceText(prompt)}
                    disabled={!currentText.trim() || isProcessing}
                    className="justify-start text-left h-auto p-2 text-xs"
                  >
                    <MessageSquare size={12} className="mr-2 flex-shrink-0" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Results & Suggestions */}
          <div className="space-y-4">
            {/* Enhancement Result */}
            {enhancementResult && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    Enhanced Version
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Quality Score: {enhancementResult.overallScore}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white p-3 rounded border text-sm">
                    {enhancementResult.enhancedText}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={applyEnhancedText}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <ArrowRight size={14} className="mr-1" />
                      Apply
                    </Button>
                    <Button 
                      onClick={() => setEnhancementResult(null)}
                      variant="outline"
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                  
                  {enhancementResult.insights.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium">AI Insights:</label>
                      {enhancementResult.insights.map((insight, index) => (
                        <p key={index} className="text-xs text-green-700 bg-green-100 p-2 rounded">
                          {insight}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Individual Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Suggestions</h4>
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={getCategoryColor(suggestion.category)}>
                            {suggestion.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {suggestion.confidence}% confidence
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <div className="bg-red-50 p-2 rounded mb-2">
                            <span className="text-red-700 font-medium">Original: </span>
                            {suggestion.originalText}
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="text-green-700 font-medium">Suggested: </span>
                            {suggestion.suggestedText}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600">
                          {suggestion.explanation}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => applySuggestion(suggestion)}
                            size="sm"
                            variant="default"
                          >
                            <CheckCircle2 size={12} className="mr-1" />
                            Apply
                          </Button>
                          <Button 
                            onClick={() => dismissSuggestion(suggestion.id)}
                            size="sm"
                            variant="outline"
                          >
                            <X size={12} className="mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="space-y-2">
                <Separator />
                <h4 className="text-sm font-medium">Conversation History</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {conversationHistory.map((entry, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded text-xs ${
                        entry.type === 'user' 
                          ? 'bg-blue-50 text-blue-700 ml-4' 
                          : 'bg-gray-50 text-gray-700 mr-4'
                      }`}
                    >
                      <div className="font-medium mb-1">
                        {entry.type === 'user' ? 'You' : 'AI Assistant'}
                      </div>
                      <div>{entry.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!enhancementResult && suggestions.length === 0 && conversationHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Wand2 size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Start by entering text and clicking "Quick Enhance" or use custom instructions.</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy size={14} className="mr-2" />
              Copy Final Text
            </Button>
            {onTextApproved && (
              <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 size={14} className="mr-2" />
                Apply to Resume
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
