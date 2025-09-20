"use client"

import { AppSidebar } from "@/components/sidebar/AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PersonalInfoSection } from "@/components/hub/PersonalInfoForm"
import { ExperienceSection } from "@/components/hub/ExperienceSection"
import { ProjectsSection } from "@/components/hub/ProjectsSection"
import { SkillsSection } from "@/components/hub/SkillsSection"
import { EducationSection } from "@/components/hub/EducationSection"
import { useSearchParams } from "next/navigation"

export default function Page() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section') || 'overview'

  const getSectionTitle = () => {
    switch (section) {
      case 'personal':
        return 'Personal Information'
      case 'experience':
        return 'Experience'
      case 'projects':
        return 'Projects'
      case 'skills':
        return 'Skills'
      case 'education':
        return 'Education'
      default:
        return 'Profile Hub'
    }
  }

  const renderContent = () => {
    switch (section) {
      case 'personal':
        return <PersonalInfoSection />
      case 'experience':
        return <ExperienceSection />
      case 'projects':
        return <ProjectsSection />
      case 'skills':
        return <SkillsSection />
      case 'education':
        return <EducationSection />
      default:
        return (
          <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          </>
        )
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-2">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/hub">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getSectionTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
