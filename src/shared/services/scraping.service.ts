import { JSDOM } from 'jsdom';

/**
 * Interface representing extracted job information from LinkedIn job postings
 */
export interface JobInfo {
  /** Job title extracted from the posting */
  title: string;
  /** Company name offering the position */
  company: string;
  /** Job location (city, state, country, etc.) */
  location: string;
  /** Full job description text content */
  description: string;
  /** Original URL of the job posting */
  url: string;
  /** Metadata about which CSS selectors were successful for extraction */
  selectorInfo?: {
    titleSelector?: string;
    companySelector?: string;
    locationSelector?: string;
    descriptionSelector?: string;
  };
}

/**
 * Service for extracting job information from LinkedIn job postings
 * 
 * This service scrapes LinkedIn job URLs to extract structured job data
 * for use in AI resume optimization. It handles various LinkedIn page layouts
 * and provides fallback mechanisms for content extraction.
 */
export class ScrapingService {
  /** User agent string to mimic a real browser for web scraping */
  private static readonly USER_AGENT = 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  /** CSS selectors used to extract different parts of LinkedIn job postings */
  private static readonly SELECTORS = {
    title: 'h1',
    company: '.topcard__flavor-row a',
    location: '.topcard__flavor--bullet',
    description: '.description__text'
  };

  /**
   * Extracts job information from a LinkedIn job posting URL
   * 
   * @param url - Valid LinkedIn job posting URL (format: https://linkedin.com/jobs/view/[id])
   * @returns Promise resolving to structured job information
   * @throws Error if URL format is invalid or scraping fails
   * 
   * @example
   * ```typescript
   * const jobInfo = await ScrapingService.extractJobInfo('https://linkedin.com/jobs/view/123456');
   * console.log(jobInfo.title); // "Software Engineer"
   * ```
   */
  static async extractJobInfo(url: string): Promise<JobInfo> {
    if (!this.isValidLinkedInJobUrl(url)) {
      throw new Error('Invalid LinkedIn job URL format');
    }

    // Fetch the LinkedIn job page with browser-like headers
    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }
    
    const html = await response.text();
    const document = new JSDOM(html).window.document;

    // Extract each piece of job information using CSS selectors
    // If extraction fails, provide fallback values to ensure valid JobInfo object
    const titleResult = this.extractText(document, this.SELECTORS.title);
    const title = titleResult.text || 'Job Title Not Found';
    
    const companyResult = this.extractText(document, this.SELECTORS.company);
    const company = companyResult.text || 'Company Not Found';
    
    const locationResult = this.extractText(document, this.SELECTORS.location);
    const location = locationResult.text || 'Location Not Found';
    
    const descriptionResult = this.extractText(document, this.SELECTORS.description);
    const description = descriptionResult.text ? this.cleanDescription(descriptionResult.text) : 'Description not found';
    
    return {
      title,
      company,
      location,
      description,
      url,
      selectorInfo: {
        titleSelector: titleResult.selector ? `${titleResult.selector}` : 'No selector worked',
        companySelector: companyResult.selector ? `${companyResult.selector}` : 'No selector worked',
        locationSelector: locationResult.selector ? `${locationResult.selector}` : 'No selector worked',
        descriptionSelector: descriptionResult.selector ? `${descriptionResult.selector}` : 'No selector worked'
      }
    };
  }

  /**
   * Extracts text content from a DOM element using a CSS selector
   * 
   * @param document - The DOM document to search within
   * @param selector - CSS selector to locate the target element
   * @returns Object containing extracted text and the selector used (for debugging)
   * @private
   */
  private static extractText(document: Document, selector: string): { text: string | null; selector: string | null } {
    const element = document.querySelector(selector);
    const text = element?.textContent?.trim();
    if (text) {
      return { 
        text: text, 
        selector: selector
      };
    }
    return { text: null, selector: null };
  }

  /**
   * Validates that a URL is a properly formatted LinkedIn job posting URL
   * 
   * @param url - URL string to validate
   * @returns true if URL matches LinkedIn job posting format, false otherwise
   * @private
   */
  private static isValidLinkedInJobUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'www.linkedin.com' && urlObj.pathname.includes('/jobs/view/');
    } catch {
      return false;
    }
  }

  /**
   * Cleans job description text by removing LinkedIn-specific UI elements
   * 
   * Removes "Show more"/"Show less" text that appears in LinkedIn's expandable
   * job descriptions but isn't part of the actual job content.
   * 
   * @param text - Raw job description text from LinkedIn
   * @returns Cleaned description text with UI elements removed
   * @private
   */
  private static cleanDescription(text: string): string {
    return text
      .replace(/\s*Show more\s*Show less\s*/gi, '')
      .replace(/\s*Show less\s*Show more\s*/gi, '')
      .replace(/\s*Show more\s*/gi, '')
      .replace(/\s*Show less\s*/gi, '')
      .trim();
  }
}
