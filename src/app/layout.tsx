import type { Metadata } from "next";
import { ThemeProvider } from "@/shared/components/theme/theme-provider";
import AuthProvider from "@/shared/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Resume Builder',
  description: 'Single-source resume profiles with print to PDF'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
