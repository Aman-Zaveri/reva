import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2, X } from "lucide-react";
import { usePersonalInfo } from "@/hooks";

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

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Personal Information Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-medium mb-2">Personal Information</h2>
                    <p className="text-sm">Update your personal details here.</p>
                </div>
                <div className="flex gap-2">
                    {hasUnsavedChanges && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={discardChanges}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Discard Changes
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={savePersonalInfo}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Form */}
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
        </div>
    );
}
