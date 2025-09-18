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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Info, 
  Bot,
  Target,
  Wand2,
  Search,
  FileText,
  Shield,
  MessageSquare
} from "lucide-react";

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  settings: {
    enabled: boolean;
    aggressiveness?: number;
    focusAreas?: string[];
    customInstructions?: string;
    confidenceThreshold?: number;
    preserveAccuracy?: boolean;
    generateAlternatives?: boolean;
    maxSuggestions?: number;
    atsSystem?: string;
    enhancementStyle?: string;
  };
}

interface AIAgentConfigurationProps {
  onConfigSaved?: (configs: AgentConfig[]) => void;
}

/**
 * AI Agent Configuration Panel
 * 
 * Provides comprehensive configuration options for all AI agents,
 * allowing users to customize behavior, aggressiveness levels,
 * focus areas, and other parameters for each specialized agent.
 */
export function AIAgentConfiguration({ onConfigSaved }: AIAgentConfigurationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('resume-builder');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize agent configurations
  useEffect(() => {
    const defaultConfigs: AgentConfig[] = [
      {
        id: 'resume-builder',
        name: 'Resume Builder',
        description: 'Selects optimal experiences and projects for job alignment',
        icon: Target,
        color: 'bg-blue-500',
        settings: {
          enabled: true,
          aggressiveness: 3,
          focusAreas: ['relevance', 'impact', 'skills-match'],
          confidenceThreshold: 70,
          preserveAccuracy: true,
          maxSuggestions: 10
        }
      },
      {
        id: 'content-optimizer',
        name: 'Content Optimization',
        description: 'Enhances bullet points and descriptions for maximum impact',
        icon: Wand2,
        color: 'bg-green-500',
        settings: {
          enabled: true,
          aggressiveness: 3,
          focusAreas: ['keywords', 'impact', 'metrics', 'clarity'],
          preserveAccuracy: true,
          generateAlternatives: true,
          enhancementStyle: 'professional'
        }
      },
      {
        id: 'skills-extractor',
        name: 'Skills Analysis',
        description: 'Extracts skills from job descriptions and identifies gaps',
        icon: Search,
        color: 'bg-orange-500',
        settings: {
          enabled: true,
          focusAreas: ['technical', 'soft', 'tools', 'frameworks'],
          confidenceThreshold: 60,
          maxSuggestions: 15
        }
      },
      {
        id: 'resume-reviewer',
        name: 'Professional Review',
        description: 'Provides comprehensive feedback and improvement suggestions',
        icon: FileText,
        color: 'bg-red-500',
        settings: {
          enabled: true,
          focusAreas: ['content', 'format', 'alignment', 'readability'],
          generateAlternatives: true,
          maxSuggestions: 8
        }
      },
      {
        id: 'ats-optimizer',
        name: 'ATS Optimization',
        description: 'Optimizes for Applicant Tracking Systems',
        icon: Shield,
        color: 'bg-indigo-500',
        settings: {
          enabled: true,
          atsSystem: 'generic',
          focusAreas: ['keywords', 'format', 'structure', 'compatibility'],
          aggressiveness: 2,
          maxSuggestions: 12
        }
      },
      {
        id: 'grammar-enhancer',
        name: 'Grammar Enhancement',
        description: 'Provides interactive text improvement suggestions',
        icon: MessageSquare,
        color: 'bg-purple-500',
        settings: {
          enabled: true,
          focusAreas: ['grammar', 'style', 'clarity', 'impact'],
          generateAlternatives: true,
          enhancementStyle: 'professional'
        }
      }
    ];

    // Load from localStorage if available
    const saved = localStorage.getItem('ai-agent-configs');
    if (saved) {
      try {
        setConfigs(JSON.parse(saved));
      } catch {
        setConfigs(defaultConfigs);
      }
    } else {
      setConfigs(defaultConfigs);
    }
  }, []);

  const updateAgentConfig = (agentId: string, updates: Partial<AgentConfig['settings']>) => {
    setConfigs(prev => prev.map(config => 
      config.id === agentId 
        ? { ...config, settings: { ...config.settings, ...updates } }
        : config
    ));
    setHasUnsavedChanges(true);
  };

  const saveConfigurations = () => {
    localStorage.setItem('ai-agent-configs', JSON.stringify(configs));
    setHasUnsavedChanges(false);
    if (onConfigSaved) {
      onConfigSaved(configs);
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem('ai-agent-configs');
    window.location.reload(); // Force reload to reset state
  };

  const selectedConfig = configs.find(c => c.id === selectedAgent);
  if (!selectedConfig) return null;

  const Icon = selectedConfig.icon;

  const focusAreaOptions = {
    'resume-builder': ['relevance', 'impact', 'skills-match', 'experience-quality', 'project-alignment'],
    'content-optimizer': ['keywords', 'impact', 'metrics', 'clarity', 'action-verbs', 'quantification'],
    'skills-extractor': ['technical', 'soft', 'tools', 'frameworks', 'certifications', 'languages'],
    'resume-reviewer': ['content', 'format', 'alignment', 'readability', 'structure', 'completeness'],
    'ats-optimizer': ['keywords', 'format', 'structure', 'compatibility', 'density', 'placement'],
    'grammar-enhancer': ['grammar', 'style', 'clarity', 'impact', 'conciseness', 'tone']
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings size={16} />
          Configure Agents
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            AI Agent Configuration
          </DialogTitle>
          <DialogDescription>
            Customize the behavior and parameters of each AI agent to match your preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Selector */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Select Agent</h3>
            <div className="space-y-2">
              {configs.map((config) => {
                const AgentIcon = config.icon;
                return (
                  <Card 
                    key={config.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedAgent === config.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedAgent(config.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color} text-white`}>
                          <AgentIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{config.name}</div>
                          <div className="text-xs text-gray-600 truncate">
                            {config.description}
                          </div>
                        </div>
                        <Switch
                          checked={config.settings.enabled}
                          onCheckedChange={(enabled) => updateAgentConfig(config.id, { enabled })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon size={20} className="text-blue-600" />
                  {selectedConfig.name} Settings
                </CardTitle>
                <CardDescription>
                  {selectedConfig.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Enabled Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Agent</Label>
                    <p className="text-xs text-gray-600">
                      Include this agent in workflow executions
                    </p>
                  </div>
                  <Switch
                    checked={selectedConfig.settings.enabled}
                    onCheckedChange={(enabled) => updateAgentConfig(selectedAgent, { enabled })}
                  />
                </div>

                <Separator />

                {/* Aggressiveness Level (for applicable agents) */}
                {selectedConfig.settings.aggressiveness !== undefined && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Aggressiveness Level</Label>
                      <p className="text-xs text-gray-600">
                        How dramatically the agent modifies content (1 = Conservative, 5 = Aggressive)
                      </p>
                    </div>
                    <div className="px-3">
                      <Slider
                        value={[selectedConfig.settings.aggressiveness]}
                        onValueChange={([value]) => updateAgentConfig(selectedAgent, { aggressiveness: value })}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative</span>
                        <span>Balanced</span>
                        <span>Aggressive</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Focus Areas */}
                {selectedConfig.settings.focusAreas && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Focus Areas</Label>
                      <p className="text-xs text-gray-600">
                        Areas where the agent should concentrate its efforts
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {focusAreaOptions[selectedAgent as keyof typeof focusAreaOptions]?.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Switch
                            id={area}
                            checked={selectedConfig.settings.focusAreas?.includes(area) || false}
                            onCheckedChange={(checked) => {
                              const current = selectedConfig.settings.focusAreas || [];
                              const updated = checked 
                                ? [...current, area]
                                : current.filter(a => a !== area);
                              updateAgentConfig(selectedAgent, { focusAreas: updated });
                            }}
                          />
                          <Label htmlFor={area} className="text-xs capitalize">
                            {area.replace('-', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Threshold */}
                {selectedConfig.settings.confidenceThreshold !== undefined && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">
                        Confidence Threshold ({selectedConfig.settings.confidenceThreshold}%)
                      </Label>
                      <p className="text-xs text-gray-600">
                        Minimum confidence level for suggestions to be included
                      </p>
                    </div>
                    <Slider
                      value={[selectedConfig.settings.confidenceThreshold]}
                      onValueChange={([value]) => updateAgentConfig(selectedAgent, { confidenceThreshold: value })}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                {/* ATS System Selection */}
                {selectedConfig.settings.atsSystem !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target ATS System</Label>
                    <Select
                      value={selectedConfig.settings.atsSystem}
                      onValueChange={(value) => updateAgentConfig(selectedAgent, { atsSystem: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generic">Generic ATS</SelectItem>
                        <SelectItem value="workday">Workday</SelectItem>
                        <SelectItem value="greenhouse">Greenhouse</SelectItem>
                        <SelectItem value="lever">Lever</SelectItem>
                        <SelectItem value="bamboohr">BambooHR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Enhancement Style */}
                {selectedConfig.settings.enhancementStyle !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Enhancement Style</Label>
                    <Select
                      value={selectedConfig.settings.enhancementStyle}
                      onValueChange={(value) => updateAgentConfig(selectedAgent, { enhancementStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Boolean Settings */}
                <div className="space-y-4">
                  {selectedConfig.settings.preserveAccuracy !== undefined && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Preserve Accuracy</Label>
                        <p className="text-xs text-gray-600">
                          Ensure all changes maintain factual accuracy
                        </p>
                      </div>
                      <Switch
                        checked={selectedConfig.settings.preserveAccuracy}
                        onCheckedChange={(preserveAccuracy) => updateAgentConfig(selectedAgent, { preserveAccuracy })}
                      />
                    </div>
                  )}

                  {selectedConfig.settings.generateAlternatives !== undefined && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Generate Alternatives</Label>
                        <p className="text-xs text-gray-600">
                          Provide multiple options for each suggestion
                        </p>
                      </div>
                      <Switch
                        checked={selectedConfig.settings.generateAlternatives}
                        onCheckedChange={(generateAlternatives) => updateAgentConfig(selectedAgent, { generateAlternatives })}
                      />
                    </div>
                  )}
                </div>

                {/* Max Suggestions */}
                {selectedConfig.settings.maxSuggestions !== undefined && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">
                        Maximum Suggestions ({selectedConfig.settings.maxSuggestions})
                      </Label>
                      <p className="text-xs text-gray-600">
                        Maximum number of suggestions to generate
                      </p>
                    </div>
                    <Slider
                      value={[selectedConfig.settings.maxSuggestions]}
                      onValueChange={([value]) => updateAgentConfig(selectedAgent, { maxSuggestions: value })}
                      max={20}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Custom Instructions */}
                {selectedConfig.settings.customInstructions !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Custom Instructions</Label>
                    <Textarea
                      value={selectedConfig.settings.customInstructions || ""}
                      onChange={(e) => updateAgentConfig(selectedAgent, { customInstructions: e.target.value })}
                      placeholder="Additional instructions for this agent..."
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Impact Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Performance Impact</p>
                    <p className="text-xs">
                      Higher aggressiveness levels and more focus areas may increase processing time but provide more comprehensive results.
                      Disabled agents will be skipped in workflow executions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw size={14} className="mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveConfigurations}
              disabled={!hasUnsavedChanges}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Save size={14} className="mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-700">
              You have unsaved changes. Click "Save Configuration" to apply them.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}