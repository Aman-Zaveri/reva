import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Configuration options for Gemini AI generation
 */
export interface GeminiConfig {
  /** Controls randomness in generation (0.0-1.0, lower = more deterministic) */
  temperature?: number;
  /** Limits vocabulary to top K tokens at each step */
  topK?: number;
  /** Cumulative probability threshold for token selection */
  topP?: number;
  /** Maximum number of tokens to generate */
  maxOutputTokens?: number;
}

/**
 * Response wrapper for Gemini AI generation results
 */
export interface GeminiResponse<T = unknown> {
  /** The generated content, parsed as requested type */
  data: T;
  /** Token usage information (when available) */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Error information for Gemini API failures
 */
export interface GeminiError {
  /** Human-readable error message */
  message: string;
  /** Categorized error code for programmatic handling */
  code: 'API_KEY_MISSING' | 'GENERATION_ERROR' | 'PARSING_ERROR' | 'RATE_LIMIT';
}

/**
 * Service for interacting with Google's Gemini AI model
 * 
 * Provides a clean interface for AI content generation with proper error handling,
 * response parsing, and configuration management. Supports both text and structured
 * JSON responses from the AI model.
 * 
 * @example
 * ```typescript
 * // Generate text content
 * const response = await GeminiService.generateContent('Write a haiku about coding');
 * 
 * // Generate structured data
 * const structured = await GeminiService.generateStructuredResponse(
 *   'You are a JSON generator',
 *   'Create a person object with name and age',
 *   { temperature: 0.1 }
 * );
 * ```
 */
export class GeminiService {
  /** Singleton instance of the Google Generative AI client */
  private static client: GoogleGenerativeAI | null = null;
  
  /** Default configuration values optimized for resume optimization tasks */
  private static readonly DEFAULT_CONFIG: Required<GeminiConfig> = {
    temperature: 0.3,    // Slightly creative but mostly consistent
    topK: 40,           // Moderate vocabulary restriction
    topP: 0.95,         // High probability threshold for quality
    maxOutputTokens: 4096, // Sufficient for resume content
  };

  /**
   * Initializes and returns the Gemini client instance
   * 
   * Uses singleton pattern to avoid recreating the client on every request.
   * Validates that the API key is available in environment variables.
   * 
   * @returns Initialized GoogleGenerativeAI client
   * @throws Error if GEMINI_API_KEY environment variable is not set
   * @private
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
   * Generates content using Gemini AI model
   * 
   * @param prompt - The input prompt for AI generation
   * @param config - Optional configuration to override defaults
   * @returns Promise resolving to generated content with metadata
   * @throws Error for API key issues, rate limits, or generation failures
   * 
   * @example
   * ```typescript
   * const result = await GeminiService.generateContent(
   *   'Rewrite this bullet point to be more impactful: Fixed bugs',
   *   { temperature: 0.2 }
   * );
   * console.log(result.data); // "Resolved critical software defects..."
   * ```
   */
  static async generateContent<T = unknown>(
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
      
      // For JSON responses, attempt to parse them
      // For plain text responses, return as-is
      let data: T;
      try {
        data = JSON.parse(cleanedText) as T;
      } catch {
        // If it's not JSON, return as string (this is expected for many use cases)
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
   * Cleans AI response by removing markdown code block formatting
   * 
   * Gemini often wraps JSON responses in ```json blocks, which need to be
   * removed before parsing. This method handles various markdown formats.
   * 
   * @param text - Raw response text from Gemini
   * @returns Cleaned text with markdown formatting removed
   * @private
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
   * Generates structured JSON response using system and user prompts
   * 
   * Combines system instructions with user input to generate structured data.
   * Particularly useful for resume optimization where consistent JSON output
   * is required.
   * 
   * @param systemPrompt - Instructions defining the AI's role and output format
   * @param userPrompt - Specific user request or input data
   * @param config - Optional generation configuration
   * @returns Promise resolving to parsed structured data
   * 
   * @example
   * ```typescript
   * const optimizations = await GeminiService.generateStructuredResponse(
   *   'You are a resume optimizer. Return JSON with "summary" and "bullets" fields.',
   *   'Optimize this experience for a software engineering role: ...',
   *   { temperature: 0.1 }
   * );
   * ```
   */
  static async generateStructuredResponse<T = unknown>(
    systemPrompt: string,
    userPrompt: string,
    config: GeminiConfig = {}
  ): Promise<T> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const response = await this.generateContent<T>(fullPrompt, config);
    return response.data;
  }

  /**
   * Tests if the Gemini service is properly configured and accessible
   * 
   * Performs a simple generation request to validate API key and connectivity.
   * Useful for health checks and setup validation.
   * 
   * @returns Promise resolving to true if service is working, false otherwise
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
