import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Lightbulb, ArrowRight, FileText, Eye, ToggleLeft, Zap } from "lucide-react";
import { WordDiffDisplay, getWordDiff } from "./WordDiff";
import { GLAZE_LEVELS, type GlazeLevel } from "./types";
import type { OptimizationResult } from "./types";
import type { DataBundle, Profile } from "@/lib/types";

interface OptimizationResultsProps {
  result: OptimizationResult;
  data: DataBundle;
  originalProfile: Profile;
  glazeLevel?: GlazeLevel;
}

export function OptimizationResults({ result, data, originalProfile, glazeLevel = 2 }: OptimizationResultsProps) {
  // Calculate summary statistics
  const summaryChanged = Boolean(result.optimizations.personalInfo?.summary && originalProfile.personalInfo?.summary);
  const experienceChangesCount = result.optimizations.experienceOverrides ? Object.keys(result.optimizations.experienceOverrides).length : 0;
  const projectChangesCount = result.optimizations.projectOverrides ? Object.keys(result.optimizations.projectOverrides).length : 0;
  const totalChanges = (summaryChanged ? 1 : 0) + experienceChangesCount + projectChangesCount;
  
  const currentGlaze = GLAZE_LEVELS[glazeLevel];

  const renderDiffComparison = (original: string, optimized: string, label: string) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <ArrowRight size={14} />
        {label}
      </h4>
      
      <Tabs defaultValue="sidebyside" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="sidebyside" className="text-xs">Side by Side</TabsTrigger>
          <TabsTrigger value="unified" className="text-xs">Unified Diff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sidebyside">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <FileText size={12} />
                Original
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="text-red-800">{original}</p>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Eye size={12} />
                Optimized
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                <p className="text-green-800">{optimized}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="unified">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <ToggleLeft size={12} />
              Changes Highlighted
            </div>
            <div className="bg-gray-50 border rounded p-3 text-sm">
              <WordDiffDisplay diff={getWordDiff(original, optimized)} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderBulletsDiff = (originalBullets: string[], optimizedBullets: string[], title: string) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <ArrowRight size={14} />
        {title}
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <FileText size={12} />
            Original ({originalBullets.length} items)
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
            <ul className="space-y-2 text-red-800">
              {originalBullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1 text-xs">•</span>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Eye size={12} />
            Optimized ({optimizedBullets.length} items)
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
            <ul className="space-y-2 text-green-800">
              {optimizedBullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1 text-xs">•</span>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={20} />
        <h3 className="text-lg font-semibold">Optimization Complete!</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{totalChanges}</div>
          <div className="text-sm text-muted-foreground">Total Changes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summaryChanged ? 1 : 0}</div>
          <div className="text-sm text-muted-foreground">Summary Updated</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{experienceChangesCount}</div>
          <div className="text-sm text-muted-foreground">Experience Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{projectChangesCount}</div>
          <div className="text-sm text-muted-foreground">Project Items</div>
        </div>
      </div>

      <p className="text-muted-foreground">
        Analyzed {result.jobDescriptionLength} characters of job description and
        generated personalized optimizations for your resume.
      </p>

      {glazeLevel && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Zap size={14} />
          <span>
            <strong>Enhancement Level:</strong> {currentGlaze.description} ({glazeLevel}/5)
          </span>
        </div>
      )}

      {result.keyInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb size={16} />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant="secondary"
                    className="px-2 py-1 text-xs shrink-0"
                  >
                    {index + 1}
                  </Badge>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Changes Made</CardTitle>
          <CardDescription>
            Review the before and after comparison of your resume optimizations:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid gap-4">
                {summaryChanged && (
                  <div className="p-4 border rounded-lg bg-blue-50/50">
                    <h5 className="font-medium text-sm text-blue-800 mb-2">✓ Professional Summary Updated</h5>
                    <p className="text-xs text-blue-700">Your summary has been optimized to better match the job requirements.</p>
                  </div>
                )}
                
                {experienceChangesCount > 0 && (
                  <div className="p-4 border rounded-lg bg-purple-50/50">
                    <h5 className="font-medium text-sm text-purple-800 mb-2">✓ {experienceChangesCount} Experience Item{experienceChangesCount > 1 ? 's' : ''} Enhanced</h5>
                    <p className="text-xs text-purple-700">Achievement bullets have been refined to highlight relevant skills and accomplishments.</p>
                  </div>
                )}
                
                {projectChangesCount > 0 && (
                  <div className="p-4 border rounded-lg bg-orange-50/50">
                    <h5 className="font-medium text-sm text-orange-800 mb-2">✓ {projectChangesCount} Project{projectChangesCount > 1 ? 's' : ''} Improved</h5>
                    <p className="text-xs text-orange-700">Project descriptions have been tailored to emphasize technologies and outcomes mentioned in the job posting.</p>
                  </div>
                )}
                
                {totalChanges === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto mb-2" size={24} />
                    <p>No changes were made to your resume</p>
                    <p className="text-xs mt-1">Your resume may already be well-optimized for this position</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-4">
              {result.optimizations.personalInfo?.summary && originalProfile.personalInfo?.summary ? (
                renderDiffComparison(
                  originalProfile.personalInfo.summary,
                  result.optimizations.personalInfo.summary,
                  "Professional Summary"
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto mb-2" size={24} />
                  <p>No summary changes were made</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="experience" className="space-y-6 mt-4">
              {result.optimizations.experienceOverrides &&
              Object.keys(result.optimizations.experienceOverrides).length > 0 ? (
                Object.entries(result.optimizations.experienceOverrides).map(([id, overrides]) => {
                  const experience = data.experiences.find((exp) => exp.id === id);
                  if (!experience || !overrides.bullets) return null;

                  return (
                    <div key={id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {experience.title} at {experience.company}
                        </Badge>
                      </div>
                      {renderBulletsDiff(
                        experience.bullets || [],
                        overrides.bullets,
                        "Achievement Bullets"
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto mb-2" size={24} />
                  <p>No experience changes were made</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-6 mt-4">
              {result.optimizations.projectOverrides &&
              Object.keys(result.optimizations.projectOverrides).length > 0 ? (
                Object.entries(result.optimizations.projectOverrides).map(([id, overrides]) => {
                  const project = data.projects.find((proj) => proj.id === id);
                  if (!project || !overrides.bullets) return null;

                  return (
                    <div key={id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.title}
                        </Badge>
                      </div>
                      {renderBulletsDiff(
                        project.bullets || [],
                        overrides.bullets,
                        "Project Details"
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto mb-2" size={24} />
                  <p>No project changes were made</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
