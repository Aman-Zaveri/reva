import { JSDOM } from 'jsdom';

export interface JobInfo {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  selectorInfo?: {
    titleSelector?: string;
    companySelector?: string;
    locationSelector?: string;
    descriptionSelector?: string;
  };
}

/**
 * Simplified service for extracting LinkedIn job information
 */
export class ScrapingService {
  private static readonly USER_AGENT = 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  private static readonly SELECTORS = {
    title: 'h1',
    company: '.topcard__flavor-row a',
    location: '.topcard__flavor--bullet',
    description: '.description__text'
  };

  /**
   * Extract job information from LinkedIn URL
   */
  static async extractJobInfo(url: string): Promise<JobInfo> {
    if (!this.isValidLinkedInJobUrl(url)) {
      throw new Error('Invalid LinkedIn job URL format');
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }
    
    const html = await response.text();
    const document = new JSDOM(html).window.document;

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
   * Extract text using a single selector
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
   * Validate LinkedIn job URL
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
   * Clean description text by removing only "Show more Show less" text
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
