# Resume Manager with AI Optimization

A powerful Next.js application for building and managing multiple resume profiles with AI-powered optimization for job applications.

## Features

- **Multi-Profile Management**: Create and manage multiple resume profiles for different job types
- **AI-Powered Optimization**: Automatically optimize your resume based on LinkedIn job descriptions using OpenAI
- **Real-time Preview**: See your resume changes in real-time with a live preview
- **Drag & Drop**: Easily reorder sections and items within your resume
- **Export to PDF**: Generate professional PDF versions of your resume
- **Profile-Specific Customization**: Override content for specific profiles without affecting master data

## AI Resume Optimization

The AI feature analyzes LinkedIn job postings and automatically optimizes your resume using Google's Gemini AI by:

- **Content Enhancement**: Rewrites bullet points to better match job requirements
- **Keyword Optimization**: Incorporates relevant industry keywords from the job description
- **Summary Tailoring**: Updates your professional summary to align with the target role
- **Section Prioritization**: Reorders experiences and projects based on relevance
- **Skills Highlighting**: Emphasizes skills that match the job requirements

### How to Use AI Optimization

1. Click the "AI Optimize" button in the builder
2. Either paste a LinkedIn job URL or copy/paste the job description directly
3. The AI will analyze the job requirements and generate optimizations
4. Review the suggested changes and apply them to your resume
5. Your resume is now tailored for that specific job application

## Setup

### Prerequisites

- Node.js 18+ installed
- Google AI API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey)) - **Free!**

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume_manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Google AI API key to `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   └── optimize-resume/ # AI optimization endpoint
│   ├── builder/[id]/      # Resume builder page
│   ├── data/              # Master data management
│   └── print/[id]/        # PDF export page
├── components/            # Reusable UI components
│   ├── builder/          # Builder-specific components
│   │   ├── AIOptimizer.tsx    # AI optimization dialog
│   │   ├── BuilderHeader.tsx  # Builder navigation
│   │   ├── ContentSections.tsx # Section editor
│   │   ├── ProfileSettings.tsx # Profile settings
│   │   └── ResumePreview.tsx  # Live preview
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and data
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **AI Integration**: Google Gemini 1.5 Flash (Free)
- **Web Scraping**: Mozilla Readability + JSDOM
- **TypeScript**: Full type safety
- **PDF Export**: Browser print functionality

## Environment Variables

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Deployment

This application can be deployed on Vercel, Netlify, or any platform supporting Next.js:

1. Build the application:
```bash
npm run build
```

2. Set the `GEMINI_API_KEY` environment variable on your deployment platform

3. Deploy the build output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
