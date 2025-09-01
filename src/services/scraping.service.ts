import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ScrapingResult {
  content: string;
  title?: string;
  length: number;
}

export interface ScrapingError {
  message: string;
  code: 'FETCH_ERROR' | 'PARSE_ERROR' | 'INVALID_URL';
}

/**
 * Service for extracting content from web pages
 */
export class ScrapingService {
  private static readonly USER_AGENT = 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  /**
   * Extract job description from LinkedIn URL
   */
  static async extractJobDescription(url: string): Promise<ScrapingResult> {
    try {
      // Validate URL
      if (!this.isValidLinkedInJobUrl(url)) {
        throw new Error('Invalid LinkedIn job URL format');
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.USER_AGENT
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      const dom = new JSDOM(html);
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      if (!article || !article.textContent) {
        throw new Error('Failed to parse job description from the page');
      }
      
      return {
        content: article.textContent.trim(),
        title: article.title || undefined,
        length: article.textContent.length
      };
    } catch (error) {
      console.error('Error extracting job description:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to extract job description: ${error.message}`);
      }
      
      throw new Error('Failed to extract job description from URL');
    }
  }

  /**
   * Validate if URL is a LinkedIn job posting
   */
  private static isValidLinkedInJobUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'www.linkedin.com' && 
             urlObj.pathname.includes('/jobs/view/');
    } catch {
      return false;
    }
  }

  /**
   * Clean and normalize text content
   */
  static cleanTextContent(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }
}
