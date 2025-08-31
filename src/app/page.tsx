'use client';

import Link from 'next/link';
import { useProfilesStore } from '@/lib/store';
import { Plus, FileText, Database, Target, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';

export default function Page() {
  const { profiles, createProfile, cloneProfile } = useProfilesStore();

  const features = [
    {
      icon: Target,
      title: "Single Source of Truth",
      description: "Centralize all your professional information"
    },
    {
      icon: Zap,
      title: "Multiple Profiles",
      description: "Create targeted resumes for any opportunity"
    },
    {
      icon: Sparkles,
      title: "Export Ready",
      description: "Professional PDFs in seconds"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto p-6 max-w-6xl">
        <div className="space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-8 py-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/30 border">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Professional Resume Builder
              </span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-purple-600">
                  Build Perfect
                </span>
                <br />
                <span className="text-foreground">Resumes</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Create multiple targeted resumes from one comprehensive profile. 
                Manage experiences, projects, and skills efficiently.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => createProfile()}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your Resume
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                asChild
              >
                <Link href="/data">
                  <Database className="w-5 h-5 mr-2" />
                  Manage Data
                </Link>
              </Button>
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center h-full">
                <CardHeader>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-600 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>

          {/* Profiles Section */}
          <section className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-center mb-3">Your Profiles</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                {profiles.length === 0 
                  ? "Ready to create your first professional resume?" 
                  : `Manage your ${profiles.length} resume profile${profiles.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>

            {profiles.length === 0 ? (
              <div className="max-w-md mx-auto">
                <Card className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Get Started</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first resume profile and start building professional resumes.
                  </p>
                  <Button 
                    onClick={() => createProfile()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="group hover:shadow-lg transition-shadow">
                    <Link href={`/builder/${profile.id}`} className="absolute inset-0 z-10" />
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{profile.name}</CardTitle>
                        <FileText className="text-muted-foreground group-hover:text-purple-600 transition-colors" />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {profile.personalInfo?.summary || 'Click to add a professional summary'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="flex items-center justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            cloneProfile?.(profile.id);
                          }}
                          className="z-20"
                        >
                          Clone
                        </Button>
                        <Badge variant="secondary">
                          {profile.template || 'classic'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
        
        {/* Theme Toggle */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-background border rounded-full p-1 shadow-md">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}