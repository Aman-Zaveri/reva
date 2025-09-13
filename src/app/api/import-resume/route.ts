import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PostgreSQLProfileRepository } from '@/shared/repositories/postgresql.repository';
import { GeminiService } from '@/shared/services/gemini.service';
import type { DataBundle } from '@/shared/lib/types';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No resume file provided' },
        { status: 400 }
      );
    }

    // Read file content
    let resumeText = '';
    const fileType = file.type;
    
    if (fileType === 'text/plain' || fileType === 'application/octet-stream') {
      resumeText = await file.text();
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Handle Word documents (.docx) with hyperlink preservation
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        // First extract with hyperlinks preserved
        const htmlResult = await mammoth.convertToHtml({ buffer: Buffer.from(arrayBuffer) });
        
        // Extract text while preserving hyperlinks
        resumeText = extractTextWithLinks(htmlResult.value);
        
        // Fallback to plain text if HTML conversion fails or returns empty
        if (!resumeText.trim()) {
          const textResult = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
          resumeText = textResult.value;
        }
      } catch (error) {
        console.error('Error processing Word document with mammoth:', error);
        // Final fallback - treat as text file
        resumeText = await file.text();
      }
    } else if (fileType === 'application/pdf') {
      // For PDF files, we'll need to extract text
      // For now, ask user to provide text version
      return NextResponse.json(
        { success: false, error: 'PDF parsing not yet supported. Please upload a .txt or .docx file with your resume.' },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a .txt or .docx file.' },
        { status: 400 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Resume file appears to be empty' },
        { status: 400 }
      );
    }

    // Use AI to parse the resume
    console.log('Starting AI parsing of resume...');
    const parsedData = await parseResumeWithAI(resumeText);
    
    if (!parsedData) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse resume content. This could be due to temporary AI service issues. Please try again in a few moments, or contact support if the problem persists.' },
        { status: 500 }
      );
    }

    // Save to database
    const repository = new PostgreSQLProfileRepository();
    const result = await repository.saveProfiles([], parsedData, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Resume imported successfully!',
      data: parsedData
    });

  } catch (error) {
    console.error('Error importing resume:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractTextWithLinks(html: string): string {
  // Convert HTML to text while preserving hyperlinks
  // Replace <a href="url">text</a> with "text (url)"
  let text = html.replace(/<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '$2 ($1)');
  
  // Remove other HTML tags but keep the content
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Clean up multiple spaces and normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Add line breaks for better formatting
  text = text.replace(/\s*\n\s*/g, '\n');
  
  return text;
}

async function parseResumeWithAI(resumeText: string): Promise<DataBundle | null> {
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prompt = `Parse this resume and extract the information into a structured JSON format. 
    
    IMPORTANT: This resume may contain URLs in the format "text (url)" - extract these URLs properly.
    For example: "LinkedIn (https://linkedin.com/in/username)" should extract the URL for the linkedin field.
    
    The JSON should have this exact structure:
    {
      "personalInfo": {
        "fullName": "string",
        "email": "string", 
        "phone": "string",
        "location": "string",
        "linkedin": "string (extract from LinkedIn URLs)",
        "github": "string (extract from GitHub URLs)", 
        "website": "string (extract from personal website URLs)",
        "summary": "string (optional)"
      },
      "experiences": [
        {
          "id": "unique_id",
          "title": "Job Title",
          "company": "Company Name", 
          "date": "Start Date - End Date",
          "bullets": ["bullet point 1", "bullet point 2"]
        }
      ],
      "projects": [
        {
          "id": "unique_id",
          "title": "Project Name",
          "link": "optional URL (extract from project links)",
          "bullets": ["description 1", "description 2"],
          "tags": ["tech1", "tech2"]
        }
      ],
      "skills": [
        {
          "id": "unique_id", 
          "name": "Skill Category (e.g., Programming Languages)",
          "details": "JavaScript, Python, TypeScript, etc."
        }
      ],
      "education": [
        {
          "id": "unique_id",
          "title": "Degree, Institution", 
          "details": "Field of study, graduation year, etc."
        }
      ]
    }

    Rules:
    - Generate unique IDs using timestamp + random numbers
    - Extract ALL bullet points from experience and project sections
    - Group skills by category (Programming Languages, Frameworks, Tools, etc.)
    - Include graduation years and relevant details in education
    - EXTRACT URLs from hyperlinks: look for patterns like "Text (URL)" and extract the URL part
    - For LinkedIn: extract full LinkedIn profile URLs
    - For GitHub: extract full GitHub profile URLs  
    - For project links: extract any project URLs mentioned
    - Clean up formatting and be consistent
    - Return ONLY the JSON, no other text

    Resume text:
    ${resumeText}`;

      console.log(`AI parsing attempt ${attempt}/${maxRetries}`);
      const result = await GeminiService.generateContent(prompt);
      
      if (!result.data) {
        console.error('AI parsing failed: No data returned');
        if (attempt === maxRetries) return null;
        continue;
      }

      // Clean the response and parse JSON
      const responseData = result.data;
      
      // Handle both string and object responses from AI
      let parsed: any;
      
      if (typeof responseData === 'object' && responseData !== null) {
        // AI returned a parsed object directly
        console.log('AI returned parsed object directly');
        parsed = responseData;
      } else if (typeof responseData === 'string') {
        // AI returned JSON string, need to parse it
        console.log('AI returned JSON string, parsing...');
        let jsonText: string = responseData;
        
        // Remove markdown code block markers if present
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
        }

        try {
          parsed = JSON.parse(jsonText.trim());
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError);
          console.error('Raw response:', jsonText);
          if (attempt === maxRetries) return null;
          continue;
        }
      } else {
        console.error('AI parsing failed: Response is neither string nor object', typeof responseData, responseData);
        if (attempt === maxRetries) return null;
        continue;
      }
      
      // Validate the structure
      if (!parsed.personalInfo || !parsed.experiences || !parsed.skills || !parsed.education) {
        console.error('Invalid parsed structure:', parsed);
        if (attempt === maxRetries) return null;
        continue;
      }

      console.log(`AI parsing successful on attempt ${attempt}`);
      return parsed as DataBundle;

    } catch (error: any) {
      console.error(`AI parsing attempt ${attempt} failed:`, error.message);
      
      // Check if it's a temporary server error
      if (error.message.includes('overloaded') || 
          error.message.includes('503') || 
          error.message.includes('Service Unavailable') ||
          error.message.includes('429') ||
          error.message.includes('Too Many Requests')) {
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // For non-retryable errors or max attempts reached
      if (attempt === maxRetries) {
        console.error('Max retry attempts reached for AI parsing');
        return null;
      }
    }
  }

  return null;
}