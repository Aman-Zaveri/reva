import type { Profile, DataBundle } from "@/lib/types";

export interface JobInfo {
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: string;
  url: string;
}

export interface OptimizationResult {
  optimizations: Partial<Profile>;
  keyInsights: string[];
  jobDescriptionLength: number;
}

export interface AIOptimizerProps {
  profile: Profile;
  data: DataBundle;
  onApplyOptimizations: (optimizations: Partial<Profile>) => void;
}

export type TabType = "url" | "text";

export type GlazeLevel = 1 | 2 | 3 | 4 | 5;

export interface GlazeSettings {
  level: GlazeLevel;
  description: string;
  warningLevel: "none" | "caution" | "warning" | "danger";
  characteristics: string[];
}

export const GLAZE_LEVELS: Record<GlazeLevel, GlazeSettings> = {
  1: {
    level: 1,
    description: "Conservative - Stick to facts",
    warningLevel: "none",
    characteristics: ["Accurate descriptions", "Factual achievements", "Honest representation"]
  },
  2: {
    level: 2,
    description: "Professional - Standard optimization",
    warningLevel: "none", 
    characteristics: ["Enhanced phrasing", "Strong action verbs", "Quantified results"]
  },
  3: {
    level: 3,
    description: "Confident - Assertive language",
    warningLevel: "caution",
    characteristics: ["Bold statements", "Amplified impact", "Optimistic projections"]
  },
  4: {
    level: 4,
    description: "Aggressive - Heavy embellishment",
    warningLevel: "warning",
    characteristics: ["Inflated achievements", "Generous interpretations", "Stretched responsibilities"]
  },
  5: {
    level: 5,
    description: "Maximum - Extreme enhancement", 
    warningLevel: "danger",
    characteristics: ["Highly exaggerated claims", "Fictional improvements", "Potential misrepresentation"]
  }
};
