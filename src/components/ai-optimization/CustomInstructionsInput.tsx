import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, MessageSquare, Lightbulb } from "lucide-react";

interface CustomInstructionsInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomInstructionsInput({ value, onChange }: CustomInstructionsInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exampleInstructions = [
    "Focus on leadership experience and team management skills",
    "Emphasize technical skills related to cloud computing",
    "Highlight international experience and cross-cultural communication",
    "Showcase data analysis and quantitative achievements",
    "Focus on startup experience and adaptability",
    "Emphasize customer-facing experience and communication skills"
  ];

  const addExample = (example: string) => {
    const currentValue = value.trim();
    const newValue = currentValue ? `${currentValue}\n${example}` : example;
    onChange(newValue);
  };

  return (
    <Card className="border-dashed">
      <CardHeader 
        className="cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
            Custom Instructions (Optional)
          </div>
          <div className="flex items-center gap-2">
            {value && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                Added
              </span>
            )}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-instructions">
              Additional instructions for the AI
            </Label>
            <Textarea
              id="custom-instructions"
              placeholder="Focus on leadership experience, emphasize technical skills in cloud computing, highlight international experience..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Add specific instructions to guide how the AI optimizes your resume. 
              This will be added to the standard optimization prompt.
            </p>
          </div>

          {!value && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb size={14} />
                Quick Examples
              </div>
              <div className="grid grid-cols-1 gap-2">
                {exampleInstructions.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-3 text-xs"
                    onClick={() => addExample(example)}
                  >
                    + {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {value && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange("")}
              >
                Clear Instructions
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
