import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Eye, Flame, Zap } from "lucide-react";
import { GLAZE_LEVELS, type GlazeLevel } from "./types";

interface GlazeControlProps {
  glazeLevel: GlazeLevel;
  onGlazeLevelChange: (level: GlazeLevel) => void;
}

export function GlazeControl({ glazeLevel, onGlazeLevelChange }: GlazeControlProps) {
  const currentGlaze = GLAZE_LEVELS[glazeLevel];

  const getWarningIcon = () => {
    switch (currentGlaze.warningLevel) {
      case "none":
        return <Shield size={16} className="text-green-600" />;
      case "caution":
        return <Eye size={16} className="text-yellow-600" />;
      case "warning":
        return <AlertTriangle size={16} className="text-orange-600" />;
      case "danger":
        return <Flame size={16} className="text-red-600" />;
    }
  };

  const getWarningColor = () => {
    switch (currentGlaze.warningLevel) {
      case "none":
        return "border-green-200 bg-green-50/50";
      case "caution":
        return "border-yellow-200 bg-yellow-50/50";
      case "warning":
        return "border-orange-200 bg-orange-50/50";
      case "danger":
        return "border-red-200 bg-red-50/50";
    }
  };

  const getWarningText = () => {
    switch (currentGlaze.warningLevel) {
      case "none":
        return "Safe and accurate representation";
      case "caution":
        return "Minor enhancements - generally acceptable";
      case "warning":
        return "⚠️ Significant embellishment - verify claims carefully";
      case "danger":
        return "🚨 High risk of misrepresentation - use with extreme caution";
    }
  };

  const getSliderColor = () => {
    switch (currentGlaze.warningLevel) {
      case "none":
        return "data-[range]:bg-green-500";
      case "caution":
        return "data-[range]:bg-yellow-500";
      case "warning":
        return "data-[range]:bg-orange-500";
      case "danger":
        return "data-[range]:bg-red-500";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap size={16} />
          Glaze Level - Content Enhancement
        </CardTitle>
        <CardDescription>
          Control how much the AI enhances your resume content. Higher levels may introduce embellishments that could misrepresent your actual experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="glaze-slider" className="text-sm font-medium">
              Enhancement Level: {glazeLevel}/5
            </Label>
            <Badge variant="outline" className="text-xs">
              {currentGlaze.description}
            </Badge>
          </div>
          
          <div className="px-2">
            <Slider
              value={[glazeLevel]}
              onValueChange={(value: number[]) => onGlazeLevelChange(value[0] as GlazeLevel)}
              max={5}
              min={1}
              step={1}
              className={`w-full ${getSliderColor()}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Conservative</span>
              <span>Professional</span>
              <span>Confident</span>
              <span>Aggressive</span>
              <span>Maximum</span>
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${getWarningColor()}`}>
          <div className="flex items-start gap-3">
            {getWarningIcon()}
            <div className="flex-1">
              <div className="font-medium text-sm mb-2">
                {getWarningText()}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>This level includes:</strong>
                <ul className="mt-1 space-y-1">
                  {currentGlaze.characteristics.map((char, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {glazeLevel >= 4 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-red-800 mb-1">
                  ⚠️ Ethical Warning
                </div>
                <div className="text-red-700">
                  High glaze levels may produce content that significantly embellishes or misrepresents your actual experience. 
                  Always review and verify that optimized content accurately reflects your skills and achievements before using it in job applications.
                  <strong className="block mt-2">Remember: Honesty in job applications is crucial for long-term career success.</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {glazeLevel === 5 && (
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Flame size={16} className="text-red-700 mt-0.5" />
              <div className="text-sm">
                <div className="font-bold text-red-900 mb-1">
                  🚨 MAXIMUM GLAZE - EXTREME CAUTION REQUIRED
                </div>
                <div className="text-red-800">
                  This level may generate content that contains significant exaggerations or fictional elements. 
                  Use only if you understand the risks and can carefully review every claim for accuracy.
                  <strong className="block mt-2 text-red-900">
                    Consider if this aligns with your personal and professional ethics.
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
