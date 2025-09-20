import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { usePersonalInfo } from "@/hooks";
import { SectionHeader } from "./base";
import { EmptyState } from "./base/EmptyState";

export function PersonalInfoSection() {
    const { 
        personalInfo, 
        updatePersonalInfo,
        savePersonalInfo, 
        discardChanges,
        isLoading, 
        error, 
        isSaving,
        hasUnsavedChanges
    } = usePersonalInfo();

    const handleInputChange = (field: string, value: string) => {
        updatePersonalInfo({ [field]: value });
    };

    const handleCreatePersonalInfo = () => {
        // Initialize with empty personal info to start editing
        updatePersonalInfo({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            summary: ''
        });
    };

    const isEmptyPersonalInfo = !personalInfo || (!personalInfo.firstName && !personalInfo.lastName && !personalInfo.email && !personalInfo.phone && !personalInfo.linkedin && !personalInfo.github && !personalInfo.summary);

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <SectionHeader
                title="Personal Information"
                description="Update your personal details here."
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
                onSave={savePersonalInfo}
                onDiscard={discardChanges}
                showActions={hasUnsavedChanges}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {isEmptyPersonalInfo && !hasUnsavedChanges ? (
                <EmptyState
                    emoji="👤"
                    title="No Personal Information"
                    description="Add your personal information to get started with your resume."
                    buttonText="Add Personal Info"
                    onAdd={handleCreatePersonalInfo}
                />
            ) : (
                <form className="space-y-6">
                {/* First and Last Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                            First name
                        </Label>
                        <Input
                            id="firstName"
                            type="text"
                            value={personalInfo.firstName || ""}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="John"
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                            Last name
                        </Label>
                        <Input
                            id="lastName"
                            type="text"
                            value={personalInfo.lastName || ""}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Doe"
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={personalInfo.email || ""}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john.doe@email.com"
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                            Phone number
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={personalInfo.phone || ""}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+1 555 123 4567"
                            className="w-full"
                        />
                    </div>
                </div>

                {/* LinkedIn and GitHub Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-sm font-medium">
                            LinkedIn Profile
                        </Label>
                        <Input
                            id="linkedin"
                            type="url"
                            value={personalInfo.linkedin || ""}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/in/johndoe"
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="github" className="text-sm font-medium">
                            GitHub Profile
                        </Label>
                        <Input
                            id="github"
                            type="url"
                            value={personalInfo.github || ""}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            placeholder="https://github.com/johndoe"
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Summary Section */}
                <div className="space-y-2">
                    <Label htmlFor="summary" className="text-sm font-medium">
                        Summary
                    </Label>
                    <Textarea
                        id="summary"
                        value={personalInfo.summary || ""}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        placeholder="Experienced frontend developer passionate about building accessible web applications."
                        className="w-full min-h-[120px] resize-y"
                    />
                </div>
                </form>
            )}
        </div>
    );
}
