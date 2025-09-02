import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";

interface JobDescriptionInputProps {
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
}

export function JobDescriptionInput({
  jobDescription,
  onJobDescriptionChange,
}: JobDescriptionInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="job-description">Job Description</Label>
      <Textarea
        id="job-description"
        placeholder="Paste the complete job description here..."
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        rows={10}
      />
      <p className="text-sm text-muted-foreground">
        Copy and paste the job description, including requirements and
        responsibilities.
      </p>
    </div>
  );
}
