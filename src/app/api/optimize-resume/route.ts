import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import type { Profile, DataBundle } from '@/lib/types';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Extract job description from LinkedIn URL
async function extractJobDescription(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      throw new Error('Failed to parse job description from the page');
    }
    
    return article.textContent || '';
  } catch (error) {
    console.error('Error extracting job description:', error);
    throw new Error('Failed to extract job description from URL');
  }
}

// Optimize resume using AI
async function optimizeResumeWithAI(
  jobDescription: string,
  profile: Profile,
  data: DataBundle
): Promise<Partial<Profile>> {
  const currentExperiences = profile.experienceIds.map(id => 
    data.experiences.find(exp => exp.id === id)
  ).filter(Boolean);

  const currentProjects = profile.projectIds.map(id => 
    data.projects.find(proj => proj.id === id)
  ).filter(Boolean);

  const currentSkills = profile.skillIds.map(id => 
    data.skills.find(skill => skill.id === id)
  ).filter(Boolean);

  const currentEducation = profile.educationIds.map(id => 
    data.education.find(edu => edu.id === id)
  ).filter(Boolean);

  const systemPrompt = `You are an expert resume optimization AI. Your task is to analyze a job description and optimize a resume to better match the requirements while keeping the content truthful and authentic.

Guidelines:
1. Only suggest modifications that are truthful and based on existing experience
2. Optimize bullet points to highlight relevant skills and achievements
3. Suggest skill emphasis that matches the job requirements
4. Recommend summary changes that align with the role
5. Prioritize experiences and projects that are most relevant
6. Use industry keywords from the job description when appropriate
7. Maintain professional tone and formatting

IMPORTANT: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. The response must be parseable JSON.

Return your response as a JSON object with the following structure:
{
  "personalInfo": {
    "summary": "optimized summary that aligns with the job"
  },
  "experienceOptimizations": [
    {
      "id": "experience_id",
      "bullets": ["optimized bullet points"],
      "tags": ["relevant tags"]
    }
  ],
  "projectOptimizations": [
    {
      "id": "project_id", 
      "bullets": ["optimized bullet points"],
      "tags": ["relevant tags"]
    }
  ],
  "recommendedExperienceOrder": ["exp_id_1", "exp_id_2"],
  "recommendedProjectOrder": ["proj_id_1", "proj_id_2"],
  "recommendedSkillOrder": ["skill_id_1", "skill_id_2"],
  "keyInsights": [
    "Insight about what was optimized and why"
  ]
}`;

  const userPrompt = `
Job Description:
${jobDescription}

Current Resume Data:

Personal Info:
${JSON.stringify(profile.personalInfo, null, 2)}

Experiences:
${JSON.stringify(currentExperiences, null, 2)}

Projects:
${JSON.stringify(currentProjects, null, 2)}

Skills:
${JSON.stringify(currentSkills, null, 2)}

Education:
${JSON.stringify(currentEducation, null, 2)}

Please optimize this resume to better match the job description while keeping all information truthful and authentic.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });
    
    const prompt = `${systemPrompt}

${userPrompt}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Clean the response text - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log('Gemini raw response:', text.substring(0, 200) + '...');
    console.log('Cleaned response:', cleanedText.substring(0, 200) + '...');

    // Parse the JSON response
    let optimizations;
    try {
      optimizations = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Text that failed to parse:', cleanedText);
      throw new Error('Invalid JSON response from AI');
    }
    
    // Convert AI recommendations to profile updates
    const profileUpdates: Partial<Profile> = {};

    // Update personal info if suggested
    if (optimizations.personalInfo) {
      profileUpdates.personalInfo = {
        ...profile.personalInfo,
        ...optimizations.personalInfo
      };
    }

    // Create experience overrides
    if (optimizations.experienceOptimizations) {
      profileUpdates.experienceOverrides = { ...profile.experienceOverrides };
      optimizations.experienceOptimizations.forEach((opt: { id: string; bullets: string[]; tags: string[] }) => {
        if (profileUpdates.experienceOverrides) {
          profileUpdates.experienceOverrides[opt.id] = {
            bullets: opt.bullets,
            tags: opt.tags
          };
        }
      });
    }

    // Create project overrides
    if (optimizations.projectOptimizations) {
      profileUpdates.projectOverrides = { ...profile.projectOverrides };
      optimizations.projectOptimizations.forEach((opt: { id: string; bullets: string[]; tags: string[] }) => {
        if (profileUpdates.projectOverrides) {
          profileUpdates.projectOverrides[opt.id] = {
            bullets: opt.bullets,
            tags: opt.tags
          };
        }
      });
    }

    // Reorder items based on recommendations
    if (optimizations.recommendedExperienceOrder) {
      profileUpdates.experienceIds = optimizations.recommendedExperienceOrder;
    }
    if (optimizations.recommendedProjectOrder) {
      profileUpdates.projectIds = optimizations.recommendedProjectOrder;
    }
    if (optimizations.recommendedSkillOrder) {
      profileUpdates.skillIds = optimizations.recommendedSkillOrder;
    }

    // Add metadata about the optimization
    (profileUpdates as Profile & { aiOptimization: { timestamp: string; keyInsights: string[]; jobDescriptionHash: string } }).aiOptimization = {
      timestamp: new Date().toISOString(),
      keyInsights: optimizations.keyInsights || [],
      jobDescriptionHash: Buffer.from(jobDescription).toString('base64').slice(0, 20)
    };

    return profileUpdates;
  } catch (error) {
    console.error('Error optimizing resume with AI:', error);
    throw new Error('Failed to optimize resume with AI');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { jobUrl, jobDescription, profile, data } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    if (!profile || !data) {
      return NextResponse.json(
        { error: 'Profile and data are required' },
        { status: 400 }
      );
    }

    let finalJobDescription = jobDescription;

    // If URL is provided, extract job description from it
    if (jobUrl && !jobDescription) {
      try {
        finalJobDescription = await extractJobDescription(jobUrl);
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to extract job description from URL. Please paste the job description directly.' },
          { status: 400 }
        );
      }
    }

    if (!finalJobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const optimizations = await optimizeResumeWithAI(
      finalJobDescription,
      profile,
      data
    );

    return NextResponse.json({
      success: true,
      optimizations,
      jobDescriptionLength: finalJobDescription.length
    });

  } catch (error) {
    console.error('Resume optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
