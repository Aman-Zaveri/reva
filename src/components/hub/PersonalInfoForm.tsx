import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PersonalInfoSection() {
    return (
        <div className="w-full">
            {/* Personal Information Section */}
            <h2 className="text-xl font-medium mb-2">Personal Information</h2>
            <p className="text-sm mb-6">Update your personal details here.</p>

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
                            placeholder=" John"
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
                            placeholder=" Doe"
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
                            placeholder=" john.doe@email.com"
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
                            placeholder=" +1 555 123 4567"
                            className="w-full"
                        />
                    </div>
                </div>

                {/* LinkedIn and GitHub Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-sm font-medium">
                            LinkedIn
                        </Label>
                        <Input
                            id="linkedin"
                            type="url"
                            placeholder=" linkedin.com/in/johndoe"
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="github" className="text-sm font-medium">
                            GitHub
                        </Label>
                        <Input
                            id="github"
                            type="url"
                            placeholder=" github.com/johndoe"
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
                        placeholder=" Experienced frontend developer passionate about building accessible web applications."
                        className="w-full min-h-[120px] resize-y"
                    />
                </div>
            </form>
        </div>
    );
}
