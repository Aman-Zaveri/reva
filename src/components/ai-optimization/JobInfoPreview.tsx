import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Building,
  MapPin,
  Clock,
} from "lucide-react";
import type { JobInfo } from "@/types";

interface JobInfoPreviewProps {
  jobInfo: JobInfo;
}

export function JobInfoPreview({ jobInfo }: JobInfoPreviewProps) {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-green-800">
          <CheckCircle size={16} />
          Job Information Extracted
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{jobInfo.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Building size={14} />
              {jobInfo.company}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {jobInfo.location}
            </div>
            {jobInfo.employmentType && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {jobInfo.employmentType}
              </div>
            )}
          </div>
        </div>

        {(jobInfo.experienceLevel || jobInfo.salary) && (
          <div className="flex gap-2">
            {jobInfo.experienceLevel && (
              <Badge variant="secondary">{jobInfo.experienceLevel}</Badge>
            )}
            {jobInfo.salary && (
              <Badge variant="secondary">{jobInfo.salary}</Badge>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-4">Job Description:</p>
          <div className="bg-muted/20 border border-border rounded-md overflow-hidden">
            <div className="p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {jobInfo.description
                  .replace(/<[^>]*>/g, "") // Strip HTML tags
                  .replace(/([a-z])([A-Z])/g, "$1\n\n$2") // Add breaks between lowercase and uppercase letters
                  .replace(/\n{3,}/g, "\n\n") // Clean up excessive line breaks
                }
              </pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {jobInfo.description.length} characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
