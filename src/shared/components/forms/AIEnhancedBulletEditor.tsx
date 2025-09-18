"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { 
  Wand2, 
  Loader2, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Lightbulb,
  Target,
  TrendingUp,
  MessageSquare,
  Plus,
  Trash2
} from "lucide-react";
import type { Profile, DataBundle } from "@/shared/lib/types";

interface AIEnhancedBulletEditorProps {
  bullets: string[];
  itemTitle: string;
  itemType: 'experience' | 'project';
  profile: Profile;
  data: DataBundle;
  onBulletsChange: (bullets: string[]) => void;
  jobContext?: string;
}

interface BulletSuggestion {
  id: string;
  originalBullet: string;
  enhancedBullet: string;
  explanation: string;
  category: 'impact' | 'keywords' | 'metrics' | 'clarity' | 'action-verbs';
  confidence: number;
}

/**
 * AI-Enhanced Bullet Point Editor
 * 
 * Provides inline AI assistance for editing bullet points with:
 * - Real-time enhancement suggestions
 * - Context-aware improvements based on job requirements
 * - Individual bullet point optimization
 * - Quick action prompts for common improvements
 */
export function AIEnhancedBulletEditor({
  bullets,
  itemTitle,
  itemType,
  profile,
  data,
  onBulletsChange,
  jobContext
}: AIEnhancedBulletEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Record<number, BulletSuggestion[]>>({});
  const [isEnhancing, setIsEnhancing] = useState<Record<number, boolean>>({});
  const [customPrompts, setCustomPrompts] = useState<Record<number, string>>({});

  const enhanceBullet = async (index: number, customInstruction?: string) => {
    const bullet = bullets[index];
    if (!bullet.trim()) return;

    setIsEnhancing(prev => ({ ...prev, [index]: true }));

    try {
      const response = await fetch('/api/ai-agents/grammar-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: bullet,
          userPrompt: customInstruction || `Enhance this ${itemType} bullet point for maximum impact and clarity`,
          jobContext: jobContext || profile.aiOptimization?.jobData?.description,
          enhancementFocus: ['impact', 'clarity', 'keywords', 'metrics'],
          generateAlternatives: true,
          contextInfo: {
            itemTitle,
            itemType,
            bulletIndex: index
          }
        })
      });

      const result = await response.json();

      if (result.success && result.suggestions) {
        const bulletSuggestions: BulletSuggestion[] = result.suggestions.map((s: any, i: number) => ({
          id: `${index}-${i}`,
          originalBullet: bullet,
          enhancedBullet: s.suggestedText || s.enhancedText,
          explanation: s.explanation || s.reason,
          category: s.category || 'clarity',
          confidence: s.confidence || 85
        }));

        setSuggestions(prev => ({
          ...prev,
          [index]: bulletSuggestions
        }));
      }
    } catch (error) {
      console.error('Bullet enhancement error:', error);
    } finally {
      setIsEnhancing(prev => ({ ...prev, [index]: false }));
    }
  };

  const applySuggestion = (bulletIndex: number, suggestion: BulletSuggestion) => {
    const newBullets = [...bullets];
    newBullets[bulletIndex] = suggestion.enhancedBullet;
    onBulletsChange(newBullets);
    
    // Clear suggestions for this bullet
    setSuggestions(prev => {
      const updated = { ...prev };
      delete updated[bulletIndex];
      return updated;
    });
  };

  const dismissSuggestions = (bulletIndex: number) => {
    setSuggestions(prev => {
      const updated = { ...prev };
      delete updated[bulletIndex];
      return updated;
    });
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    onBulletsChange(newBullets);
  };

  const addBullet = () => {
    onBulletsChange([...bullets, '']);
    setEditingIndex(bullets.length);
  };

  const removeBullet = (index: number) => {
    const newBullets = bullets.filter((_, i) => i !== index);
    onBulletsChange(newBullets);
    
    // Clear any suggestions for removed bullet
    setSuggestions(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const quickPrompts = [
    "Add quantified metrics and numbers",
    "Use stronger action verbs",
    "Optimize for ATS keywords",
    "Make more concise and impactful",
    "Emphasize technical skills used"
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'impact': return 'bg-green-100 text-green-700';
      case 'keywords': return 'bg-purple-100 text-purple-700';
      case 'metrics': return 'bg-blue-100 text-blue-700';
      case 'clarity': return 'bg-orange-100 text-orange-700';
      case 'action-verbs': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Bullet Points</label>
        <Button
          onClick={addBullet}
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
        >
          <Plus size={12} className="mr-1" />
          Add
        </Button>
      </div>

      {bullets.map((bullet, index) => (
        <div key={index} className="space-y-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              {/* Bullet Text Editor */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Textarea
                    value={bullet}
                    onChange={(e) => updateBullet(index, e.target.value)}
                    onFocus={() => setEditingIndex(index)}
                    onBlur={() => setEditingIndex(null)}
                    placeholder="Describe your achievement or responsibility..."
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => enhanceBullet(index)}
                      disabled={!bullet.trim() || isEnhancing[index]}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title="AI Enhance"
                    >
                      {isEnhancing[index] ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Wand2 size={12} />
                      )}
                    </Button>
                    <Button
                      onClick={() => removeBullet(index)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>

                {/* Quick Enhancement Prompts */}
                {editingIndex === index && bullet.trim() && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Quick enhancements:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {quickPrompts.map((prompt, promptIndex) => (
                        <Button
                          key={promptIndex}
                          onClick={() => enhanceBullet(index, prompt)}
                          disabled={isEnhancing[index]}
                          size="sm"
                          variant="ghost"
                          className="justify-start h-auto p-2 text-xs text-left"
                        >
                          <MessageSquare size={10} className="mr-1 flex-shrink-0" />
                          {prompt}
                        </Button>
                      ))}
                    </div>

                    {/* Custom Prompt Input */}
                    <div className="flex gap-2">
                      <Textarea
                        value={customPrompts[index] || ''}
                        onChange={(e) => setCustomPrompts(prev => ({
                          ...prev,
                          [index]: e.target.value
                        }))}
                        placeholder="Custom instructions for AI..."
                        className="min-h-[40px] text-xs"
                      />
                      <Button
                        onClick={() => enhanceBullet(index, customPrompts[index])}
                        disabled={!customPrompts[index]?.trim() || isEnhancing[index]}
                        size="sm"
                        className="self-end"
                      >
                        <Wand2 size={12} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {suggestions[index] && suggestions[index].length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb size={14} className="text-green-600" />
                  AI Suggestions for Bullet Point {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions[index].map((suggestion) => (
                  <div key={suggestion.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(suggestion.category)}>
                        {suggestion.category.replace('-', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {suggestion.confidence}% confidence
                      </span>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm font-medium text-green-700 mb-2">
                        Enhanced version:
                      </p>
                      <p className="text-sm text-gray-800 mb-2">
                        {suggestion.enhancedBullet}
                      </p>
                      <p className="text-xs text-gray-600">
                        {suggestion.explanation}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => applySuggestion(index, suggestion)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <ArrowRight size={12} className="mr-1" />
                        Apply
                      </Button>
                      <Button 
                        onClick={() => dismissSuggestions(index)}
                        size="sm"
                        variant="outline"
                      >
                        <X size={12} className="mr-1" />
                        Dismiss All
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ))}

      {bullets.length === 0 && (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Target size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm mb-3">No bullet points yet</p>
          <Button onClick={addBullet} size="sm" variant="outline">
            <Plus size={14} className="mr-2" />
            Add your first bullet point
          </Button>
        </div>
      )}

      {/* AI Enhancement Summary */}
      {Object.keys(suggestions).length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <TrendingUp size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">AI Enhancement Available</p>
                <p className="text-xs">
                  {Object.keys(suggestions).length} bullet point(s) have AI-generated improvements ready to apply.
                  Review the suggestions above to enhance your {itemType} description.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}