import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Resume Hub API',
    version: '1.0.0',
    endpoints: {
      'personal-info': '/api/hub/personal-info',
      'experiences': '/api/hub/experiences',
      'educations': '/api/hub/educations',
      'projects': '/api/hub/projects',
      'skills': '/api/hub/skills'
    },
    description: 'API endpoints for managing resume data'
  })
}