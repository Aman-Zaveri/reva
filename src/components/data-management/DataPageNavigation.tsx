"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Briefcase,
  FolderOpen,
  Award,
  GraduationCap,
  Building,
} from "lucide-react";
import { Sidebar, SidebarInset, SidebarProvider } from "../ui/sidebar";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    id: "personal-info",
    label: "Personal Info",
    icon: <User className="h-4 w-4" />,
  },
  {
    id: "experience",
    label: "Experience",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  { id: "skills", label: "Skills", icon: <Award className="h-4 w-4" /> },
  {
    id: "education",
    label: "Education",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    id: "jobs",
    label: "Job Applications",
    icon: <Building className="h-4 w-4" />,
  },
];

export function DataPageNavigation() {
  const [activeSection, setActiveSection] = useState<string>("personal-info");

  useEffect(() => {
    const handleScroll = () => {
      // Update active section based on scroll position
      const sections = navigationItems.map((item) =>
        document.getElementById(item.id)
      );
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navigationItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset" />
      <SidebarInset>
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(item.id)}
            className={`w-full justify-start text-sm ${
              activeSection === item.id
                ? "bg-blue-50 text-blue-900 border-r-2 border-r-blue-300"
                : "text-muted-foreground hover:text-blue-700 hover:bg-blue-50/50"
            }`}
          >
            <div className={activeSection === item.id ? "text-blue-600" : ""}>
              {item.icon}
            </div>
            <span className="ml-2">{item.label}</span>
          </Button>
        ))}
      </SidebarInset>
    </SidebarProvider>
  );
}
