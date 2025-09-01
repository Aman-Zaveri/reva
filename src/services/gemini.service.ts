import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse<T = any> {
  data: T;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface GeminiError {
  message: string;
  code: 'API_KEY_MISSING' | 'GENERATION_ERROR' | 'PARSING_ERROR' | 'RATE_LIMIT';
}

/**
 * Service for interacting with Google Gemini AI
 */
export class GeminiService {
  private static client: GoogleGenerativeAI | null = null;
  
  private static readonly DEFAULT_CONFIG: Required<GeminiConfig> = {
    temperature: 0.3,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096,
  };

  /**
   * Initialize the Gemini client
   */
  private static getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }
      
      this.client = new GoogleGenerativeAI(apiKey);
    }
    
    return this.client;
  }

  /**
   * Generate content using Gemini AI
   */
  static async generateContent<T = any>(
    prompt: string,
    config: GeminiConfig = {}
  ): Promise<GeminiResponse<T>> {
    try {
      const client = this.getClient();
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      
      const model = client.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: finalConfig,
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response from Gemini');
      }

      // Clean the response text - remove markdown code blocks if present
      const cleanedText = this.cleanResponse(text);
      
      // For JSON responses, parse them
      let data: T;
      try {
        data = JSON.parse(cleanedText) as T;
      } catch (parseError) {
        // If it's not JSON, return as string
        data = cleanedText as T;
      }

      return {
        data,
        usage: {
          inputTokens: 0, // Gemini doesn't provide token counts in free tier
          outputTokens: 0
        }
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Gemini API key not configured or invalid');
        }
        
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw new Error(`AI generation failed: ${error.message}`);
      }
      
      throw new Error('Unknown error occurred during AI generation');
    }
  }

  /**
   * Clean AI response by removing markdown code blocks
   */
  private static cleanResponse(text: string): string {
    let cleanedText = text.trim();
    
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    return cleanedText;
  }

  /**
   * Generate structured JSON response
   */
  static async generateStructuredResponse<T = any>(
    systemPrompt: string,
    userPrompt: string,
    config: GeminiConfig = {}
  ): Promise<T> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const response = await this.generateContent<T>(fullPrompt, config);
    return response.data;
  }

  /**
   * Test if the service is properly configured
   */
  static async testConnection(): Promise<boolean> {
    try {
      await this.generateContent('Hello, respond with "OK"');
      return true;
    } catch {
      return false;
    }
  }
}
