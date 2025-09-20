import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ExternalHyperlink } from 'docx';
import { saveAs } from 'file-saver';
import type { Profile, DataBundle, Experience, Project, Skill, Education } from '@/lib/types';

// Word Document Formatting Constants
// All measurements in this file use the docx library's units:
// - Font sizes: half-points (22 = 11pt)
// - Spacing/margins: twips (720 twips = 0.5 inch, 240 twips = 1 line at 12pt)
const FORMATTING = {
  // Font sizes (in half-points for docx library)
  FONT_SIZE: {
    NAME: 36,           // 18pt - Name header
    SECTION_HEADER: 24, // 12pt - Section headers
    BODY: 22,           // 11pt - Regular body text
    BULLET: 20,         // 10pt - Bullet character size
  },
  
  // Colors (hex values without #)
  COLOR: {
    PRIMARY: '215E99',  // Blue color for headers and links
  },
  
  // Font family
  FONT_FAMILY: 'Cambria',
  
  // Line spacing (in twips - 240 twips = 12pt line height)
  LINE_SPACING: {
    NORMAL: 240,        // Standard line spacing
    REDUCED: 180,       // Slightly reduced for skills section
  },
  
  // Paragraph spacing (in twips - 240 twips = 12pt line height)
  // Minimal spacing values for maximum content density
  SPACING: {
    HEADER_TO_CONTENT: 60,  // Gap between section headers and their content (very tight)
    BULLET_GAP: 20,         // Gap between bullet points and other elements (minimal)
    SECTION_DIVIDER: 180,   // Gap before horizontal line dividers between sections (moderate)
    AFTER_DIVIDER: 5,       // Minimal gap between horizontal line and section header below it
  },
  
  // Page margins (in twips - 720 twips = 0.5 inch)
  MARGINS: 720,
  
  // Bullet point formatting
  BULLET: {
    INDENT_LEFT: 720,     // Left indent (0.5 inch)
    INDENT_HANGING: 360,  // Hanging indent (0.25 inch)
    CHARACTER: '•',       // Bullet character
  },
  
  // Border styling
  BORDER_SIZE: 6,         // Border thickness for horizontal lines
} as const;

interface WordExportOptions {
  fileName?: string;
  includeHyperlinks?: boolean;
}

class WordExportService {
  /**
   * Export resume as Word document
   */
  async exportToWord(profile: Profile, data: DataBundle, options: WordExportOptions = {}) {
    try {
      // Default to including hyperlinks
      const exportOptions = { includeHyperlinks: true, ...options };
      const doc = this.createWordDocument(profile, data, exportOptions);
      const blob = await Packer.toBlob(doc);
      
      const fileName = options.fileName || `${profile.personalInfo?.fullName || profile.name}_Resume.docx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      throw new Error('Failed to export resume to Word document');
    }
  }

  private createWordDocument(profile: Profile, data: DataBundle, options: WordExportOptions): Document {
    const sections = [];
    let isFirstSection = true;

    // Header section with personal info
    sections.push(...this.createHeaderSection(profile, data, options));

    // Summary section
    if (profile.personalInfo?.summary) {
      sections.push(...this.createSummarySection(profile.personalInfo.summary));
      isFirstSection = false;
    }

    // Create sections based on profile order
    const sectionOrder = profile.sectionOrder || ['experiences', 'projects', 'skills', 'education'];
    
    for (const sectionType of sectionOrder) {
      switch (sectionType) {
        case 'experiences':
          if (profile.experienceIds.length > 0) {
            sections.push(...this.createExperienceSection(profile, data, isFirstSection));
            isFirstSection = false;
          }
          break;
        case 'projects':
          if (profile.projectIds.length > 0) {
            sections.push(...this.createProjectSection(profile, data, isFirstSection));
            isFirstSection = false;
          }
          break;
        case 'skills':
          if (profile.skillIds.length > 0) {
            sections.push(...this.createSkillsSection(profile, data, isFirstSection));
            isFirstSection = false;
          }
          break;
        case 'education':
          if (profile.educationIds.length > 0) {
            sections.push(...this.createEducationSection(profile, data, isFirstSection));
            isFirstSection = false;
          }
          break;
      }
    }

    return new Document({
      numbering: {
        config: [
          {
            reference: "customBullet",
            levels: [
              {
                level: 0,
                format: "bullet",
                text: FORMATTING.BULLET.CHARACTER,
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { 
                      left: FORMATTING.BULLET.INDENT_LEFT, 
                      hanging: FORMATTING.BULLET.INDENT_HANGING 
                    },
                  },
                  run: {
                    size: FORMATTING.FONT_SIZE.BULLET,
                    font: FORMATTING.FONT_FAMILY,
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: FORMATTING.MARGINS,
              right: FORMATTING.MARGINS,
              bottom: FORMATTING.MARGINS,
              left: FORMATTING.MARGINS,
            },
          },
        },
        children: sections,
      }],
    });
  }

  private createHeaderSection(profile: Profile, data: DataBundle, options: WordExportOptions): Paragraph[] {
    const sections: Paragraph[] = [];
    const personalInfo = profile.personalInfo || data.personalInfo;

    // Name - larger and more prominent
    sections.push(new Paragraph({
      children: [
        new TextRun({
          text: personalInfo?.fullName || 'Your Name',
          bold: true,
          size: FORMATTING.FONT_SIZE.NAME,
          color: FORMATTING.COLOR.PRIMARY,
          font: FORMATTING.FONT_FAMILY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { 
        after: FORMATTING.SPACING.BULLET_GAP, 
        line: FORMATTING.LINE_SPACING.NORMAL, 
        lineRule: "auto" 
      },
    }));

    // Contact information - single line with pipes and hyperlinks
    const contactParts: (TextRun | ExternalHyperlink)[] = [];
    
    if (personalInfo?.phone) {
      if (contactParts.length > 0) contactParts.push(new TextRun({ 
        text: ' | ', 
        size: FORMATTING.FONT_SIZE.BODY, 
        font: FORMATTING.FONT_FAMILY 
      }));
      contactParts.push(new TextRun({
        text: personalInfo.phone,
        size: FORMATTING.FONT_SIZE.BODY,
        font: FORMATTING.FONT_FAMILY,
      }));
    }
    
    if (personalInfo?.email) {
      if (contactParts.length > 0) contactParts.push(new TextRun({ 
        text: ' | ', 
        size: FORMATTING.FONT_SIZE.BODY, 
        font: FORMATTING.FONT_FAMILY 
      }));
      contactParts.push(new TextRun({
        text: personalInfo.email,
        size: FORMATTING.FONT_SIZE.BODY,
        font: FORMATTING.FONT_FAMILY,
      }));
    }
    
    // Add LinkedIn with hyperlink
    if (personalInfo?.linkedin) {
      if (contactParts.length > 0) contactParts.push(new TextRun({ 
        text: ' | ', 
        size: FORMATTING.FONT_SIZE.BODY, 
        font: FORMATTING.FONT_FAMILY 
      }));
      
      const linkedinUrl = personalInfo.linkedin.startsWith('http') 
        ? personalInfo.linkedin 
        : `https://linkedin.com/in/${personalInfo.linkedin}`;
        
      contactParts.push(new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'LinkedIn',
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
            color: FORMATTING.COLOR.PRIMARY,
            underline: {},
          })
        ],
        link: linkedinUrl,
      }));
    }
    
    // Add GitHub with hyperlink
    if (personalInfo?.github) {
      if (contactParts.length > 0) contactParts.push(new TextRun({ 
        text: ' | ', 
        size: FORMATTING.FONT_SIZE.BODY, 
        font: FORMATTING.FONT_FAMILY 
      }));
      
      const githubUrl = personalInfo.github.startsWith('http') 
        ? personalInfo.github 
        : `https://github.com/${personalInfo.github}`;
        
      contactParts.push(new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'GitHub',
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
            color: FORMATTING.COLOR.PRIMARY,
            underline: {},
          })
        ],
        link: githubUrl,
      }));
    }

    if (contactParts.length > 0) {
      sections.push(new Paragraph({
        children: contactParts,
        alignment: AlignmentType.CENTER,
        spacing: { 
          after: FORMATTING.SPACING.BULLET_GAP, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
      }));
    }

    return sections;
  }

  private createSummarySection(summary: string): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: FORMATTING.FONT_SIZE.SECTION_HEADER,
            allCaps: true,
            color: FORMATTING.COLOR.PRIMARY,
            font: FORMATTING.FONT_FAMILY,
          }),
        ],
        spacing: { 
          before: FORMATTING.SPACING.SECTION_DIVIDER, 
          after: FORMATTING.SPACING.HEADER_TO_CONTENT, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: summary,
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }),
        ],
        spacing: { 
          after: FORMATTING.SPACING.BULLET_GAP, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
      }),
    ];
  }

  private createExperienceSection(profile: Profile, data: DataBundle, isFirstSection: boolean = false): Paragraph[] {
    const sections: Paragraph[] = [];
    
    // Add horizontal line above section header (except for first section)
    if (!isFirstSection) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: '', font: FORMATTING.FONT_FAMILY })],
        spacing: { 
          before: FORMATTING.SPACING.SECTION_DIVIDER, 
          after: 0, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: FORMATTING.BORDER_SIZE,
            color: FORMATTING.COLOR.PRIMARY,
          },
        },
      }));
    }
    
    // Section header - blue, all caps (no underline)
    sections.push(new Paragraph({
      children: [
        new TextRun({
          text: 'WORK EXPERIENCES',
          bold: true,
          size: FORMATTING.FONT_SIZE.SECTION_HEADER,
          allCaps: true,
          color: FORMATTING.COLOR.PRIMARY,
          font: FORMATTING.FONT_FAMILY,
        }),
      ],
      spacing: { 
        before: isFirstSection ? FORMATTING.SPACING.SECTION_DIVIDER : FORMATTING.SPACING.AFTER_DIVIDER, 
        after: FORMATTING.SPACING.HEADER_TO_CONTENT, 
        line: FORMATTING.LINE_SPACING.NORMAL, 
        lineRule: "auto" 
      },
    }));

    // Get experiences with overrides
    const experiences = profile.experienceIds.map(id => {
      const baseExp = data.experiences.find(exp => exp.id === id);
      if (!baseExp) return null;
      
      const override = profile.experienceOverrides?.[id];
      return override ? { ...baseExp, ...override } : baseExp;
    }).filter(Boolean) as Experience[];

    experiences.forEach((experience, index) => {
      // Job title (bold) | Company | Date format (only title is bold)
      sections.push(new Paragraph({
        children: [
          new TextRun({
            text: experience.title,
            bold: true,
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }),
          new TextRun({
            text: ` | ${experience.company} | ${experience.date}`,
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }),
        ],
        spacing: { 
          before: index === 0 ? FORMATTING.SPACING.HEADER_TO_CONTENT : FORMATTING.SPACING.HEADER_TO_CONTENT, 
          after: FORMATTING.SPACING.BULLET_GAP, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
      }));

      // Bullet points - using custom bullet formatting
      experience.bullets.forEach((bullet) => {
        sections.push(new Paragraph({
          children: [
            new TextRun({
              text: this.stripRichText(bullet),
              size: FORMATTING.FONT_SIZE.BODY,
              font: FORMATTING.FONT_FAMILY,
            }),
          ],
          spacing: { 
            after: FORMATTING.SPACING.BULLET_GAP, 
            line: FORMATTING.LINE_SPACING.NORMAL, 
            lineRule: "auto" 
          },
          numbering: {
            reference: "customBullet",
            level: 0,
          },
        }));
      });
    });

    return sections;
  }

  private createProjectSection(profile: Profile, data: DataBundle, isFirstSection: boolean = false): Paragraph[] {
    const sections: Paragraph[] = [];
    
    // Add horizontal line above section header (except for first section)
    if (!isFirstSection) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: '', font: FORMATTING.FONT_FAMILY })],
        spacing: { 
          before: FORMATTING.SPACING.SECTION_DIVIDER, 
          after: 0, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: FORMATTING.BORDER_SIZE,
            color: FORMATTING.COLOR.PRIMARY,
          },
        },
      }));
    }
    
    // Section header - blue, all caps (no underline)
    sections.push(new Paragraph({
      children: [
        new TextRun({
          text: 'PROJECTS',
          bold: true,
          size: FORMATTING.FONT_SIZE.SECTION_HEADER,
          allCaps: true,
          color: FORMATTING.COLOR.PRIMARY,
          font: FORMATTING.FONT_FAMILY,
        }),
      ],
      spacing: { 
        before: isFirstSection ? FORMATTING.SPACING.SECTION_DIVIDER : FORMATTING.SPACING.AFTER_DIVIDER, 
        after: FORMATTING.SPACING.HEADER_TO_CONTENT, 
        line: FORMATTING.LINE_SPACING.NORMAL, 
        lineRule: "auto" 
      },
    }));

    // Get projects with overrides
    const projects = profile.projectIds.map(id => {
      const baseProject = data.projects.find(proj => proj.id === id);
      if (!baseProject) return null;
      
      const override = profile.projectOverrides?.[id];
      return override ? { ...baseProject, ...override } : baseProject;
    }).filter(Boolean) as Project[];

    projects.forEach((project, index) => {
      // Project title (bold) and link (hyperlink if URL, otherwise regular text)
      const titleChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: project.title,
          bold: true,
          size: FORMATTING.FONT_SIZE.BODY,
          font: FORMATTING.FONT_FAMILY,
        }),
      ];

      if (project.link) {
        titleChildren.push(new TextRun({
          text: ' | ',
          size: FORMATTING.FONT_SIZE.BODY,
          font: FORMATTING.FONT_FAMILY,
        }));

        // Check if the link is a URL (contains http/https or www)
        const isUrl = project.link.includes('http') || project.link.includes('www') || project.link.includes('.com') || project.link.includes('.org') || project.link.includes('.net');
        
        if (isUrl) {
          const url = project.link.startsWith('http') ? project.link : `https://${project.link}`;
          titleChildren.push(new ExternalHyperlink({
            children: [
              new TextRun({
                text: project.link,
                size: FORMATTING.FONT_SIZE.BODY,
                font: FORMATTING.FONT_FAMILY,
                color: FORMATTING.COLOR.PRIMARY,
                underline: {},
              })
            ],
            link: url,
          }));
        } else {
          titleChildren.push(new TextRun({
            text: project.link,
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }));
        }
      }
      
      sections.push(new Paragraph({
        children: titleChildren,
        spacing: { 
          before: index === 0 ? FORMATTING.SPACING.HEADER_TO_CONTENT : FORMATTING.SPACING.HEADER_TO_CONTENT, 
          after: FORMATTING.SPACING.BULLET_GAP, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
      }));

      // Bullet points - using custom bullet formatting
      project.bullets.forEach((bullet) => {
        sections.push(new Paragraph({
          children: [
            new TextRun({
              text: this.stripRichText(bullet),
              size: FORMATTING.FONT_SIZE.BODY,
              font: FORMATTING.FONT_FAMILY,
            }),
          ],
          spacing: { 
            after: FORMATTING.SPACING.BULLET_GAP, 
            line: FORMATTING.LINE_SPACING.NORMAL, 
            lineRule: "auto" 
          },
          numbering: {
            reference: "customBullet",
            level: 0,
          },
        }));
      });
    });

    return sections;
  }

  private createSkillsSection(profile: Profile, data: DataBundle, isFirstSection: boolean = false): Paragraph[] {
    const sections: Paragraph[] = [];
    
    // Add horizontal line above section header (except for first section)
    if (!isFirstSection) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: '', font: FORMATTING.FONT_FAMILY })],
        spacing: { 
          before: FORMATTING.SPACING.SECTION_DIVIDER, 
          after: 0, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
        border: {
          top: {
            style: BorderStyle.INSET,
            size: FORMATTING.BORDER_SIZE,
            color: FORMATTING.COLOR.PRIMARY,
          },
        },
      }));
    }
    
    // Section header - blue, all caps (no underline)
    sections.push(new Paragraph({
      children: [
        new TextRun({
          text: 'SKILLS',
          bold: true,
          size: FORMATTING.FONT_SIZE.SECTION_HEADER,
          allCaps: true,
          color: FORMATTING.COLOR.PRIMARY,
          font: FORMATTING.FONT_FAMILY,
        }),
      ],
      spacing: { 
        before: isFirstSection ? FORMATTING.SPACING.SECTION_DIVIDER : FORMATTING.SPACING.AFTER_DIVIDER, 
        after: FORMATTING.SPACING.HEADER_TO_CONTENT, 
        line: FORMATTING.LINE_SPACING.NORMAL, 
        lineRule: "auto" 
      },
    }));

    // Get skills with overrides
    const skills = profile.skillIds.map(id => {
      const baseSkill = data.skills.find(skill => skill.id === id);
      if (!baseSkill) return null;
      
      const override = profile.skillOverrides?.[id];
      return override ? { ...baseSkill, ...override } : baseSkill;
    }).filter(Boolean) as Skill[];

    skills.forEach((skill) => {
      sections.push(new Paragraph({
        children: [
          new TextRun({
            text: `${skill.name}: `,
            bold: true,
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }),
          new TextRun({
            text: this.stripRichText(skill.details),
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }),
        ],
        spacing: { 
          after: FORMATTING.SPACING.HEADER_TO_CONTENT, 
          line: FORMATTING.LINE_SPACING.REDUCED, 
          lineRule: "auto" 
        },
      }));
    });

    return sections;
  }

  private createEducationSection(profile: Profile, data: DataBundle, isFirstSection: boolean = false): Paragraph[] {
    const sections: Paragraph[] = [];
    
    // Add horizontal line above section header (except for first section)
    if (!isFirstSection) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: '', font: FORMATTING.FONT_FAMILY })],
        spacing: { 
          before: FORMATTING.SPACING.SECTION_DIVIDER, 
          after: 0, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: FORMATTING.BORDER_SIZE,
            color: FORMATTING.COLOR.PRIMARY,
          },
        },
      }));
    }
    
    // Section header - blue, all caps (no underline)
    sections.push(new Paragraph({
      children: [
        new TextRun({
          text: 'EDUCATION',
          bold: true,
          size: FORMATTING.FONT_SIZE.SECTION_HEADER,
          allCaps: true,
          color: FORMATTING.COLOR.PRIMARY,
          font: FORMATTING.FONT_FAMILY,
        }),
      ],
      spacing: { 
        before: isFirstSection ? FORMATTING.SPACING.SECTION_DIVIDER : FORMATTING.SPACING.AFTER_DIVIDER, 
        after: FORMATTING.SPACING.HEADER_TO_CONTENT, 
        line: FORMATTING.LINE_SPACING.NORMAL, 
        lineRule: "auto" 
      },
    }));

    // Get education with overrides
    const education = profile.educationIds.map(id => {
      const baseEdu = data.education.find(edu => edu.id === id);
      if (!baseEdu) return null;
      
      const override = profile.educationOverrides?.[id];
      return override ? { ...baseEdu, ...override } : baseEdu;
    }).filter(Boolean) as Education[];

    education.forEach((eduItem) => {
      sections.push(new Paragraph({
        children: [
          new TextRun({
            text: `${eduItem.title} — `,
            bold: true,
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }),
          new TextRun({
            text: this.stripRichText(eduItem.details),
            size: FORMATTING.FONT_SIZE.BODY,
            font: FORMATTING.FONT_FAMILY,
          }),
        ],
        spacing: { 
          after: FORMATTING.SPACING.BULLET_GAP, 
          line: FORMATTING.LINE_SPACING.NORMAL, 
          lineRule: "auto" 
        },
      }));
    });

    return sections;
  }

  /**
   * Strip HTML tags and formatting from rich text for Word export
   */
  private stripRichText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

export const wordExportService = new WordExportService();
