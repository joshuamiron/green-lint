import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue, Fix } from '../types';

/**
 * Pattern: Serve Images in Modern Formats
 * 
 * Based on research showing 22.4% file size reduction (WebP vs JPEG)
 */
export class ModernFormatsPattern extends BasePattern {
  id = 'modern-formats';
  name = 'Serve Images in Modern Formats';
  category = 'images' as const;
  description = 'Use modern image formats (WebP/AVIF) with fallback to JPEG/PNG';
  
  research = {
    networkSavings: '22.4%',
    pValue: 0.00045,
    sampleSize: 8,
    citation: 'Your Dissertation, Section 4.2.4',
  };
  
  detect(context: AnalysisContext): Issue[] {
    const issues: Issue[] = [];
    
    // Find <img> tags with .jpg or .png that aren't wrapped in <picture>
    const legacyImages = this.findLegacyFormatImages(context);
    
    for (const img of legacyImages) {
      const isWrappedInPicture = this.isWrappedInPicture(img, context);
      
      if (!isWrappedInPicture) {
        issues.push(
          this.createIssue(
            context,
            img.location,
            `Use <picture> element to serve modern formats (WebP/AVIF) with fallback`,
            {
              level: 'medium',
              metric: '22.4% file size reduction',
              estimatedSavings: '~23 KB per 6 images',
              source: this.research.citation,
            },
            this.generateFixes({
              id: '',
              patternId: this.id,
              severity: 'warning',
              message: '',
              location: img.location,
              energyImpact: { level: 'medium', metric: '', source: '' },
              snippet: img.element,
              fixes: [],
            })
          )
        );
      }
    }
    
    return issues;
  }
  
  generateFixes(issue: Issue): Fix[] {
    return [
      {
        id: 'wrap-in-picture',
        description: 'Wrap in <picture> with WebP source',
        isPreferred: true,
        changes: [
          {
            file: issue.location.file,
            range: issue.location,
            newText: this.wrapInPictureElement(issue.snippet),
          },
        ],
      },
    ];
  }
  
  /**
   * Find images using legacy formats (.jpg, .png)
   */
  private findLegacyFormatImages(context: AnalysisContext) {
    const images: Array<{
      element: string;
      location: Issue['location'];
      src: string;
    }> = [];
    
    // Simplified regex (real version uses AST)
    const imgRegex = /<img\s+[^>]*src=["']([^"']+\.(jpg|jpeg|png))["'][^>]*>/gi;
    let match;
    let lineNumber = 1;
    
    while ((match = imgRegex.exec(context.sourceCode)) !== null) {
      images.push({
        element: match[0],
        location: {
          file: context.filePath,
          startLine: lineNumber,
          startColumn: match.index,
          endLine: lineNumber,
          endColumn: match.index + match[0].length,
        },
        src: match[1],
      });
    }
    
    return images;
  }
  
  /**
   * Check if image is already wrapped in <picture>
   */
  private isWrappedInPicture(img: any, context: AnalysisContext): boolean {
    // Look backwards in source code for <picture> tag
    const linesBefore = context.sourceCode
      .split('\n')
      .slice(Math.max(0, img.location.startLine - 5), img.location.startLine);
    
    return linesBefore.some(line => line.includes('<picture'));
  }
  
  /**
   * Wrap <img> in <picture> with WebP source
   */
  private wrapInPictureElement(imgTag: string): string {
    // Extract src attribute
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
    if (!srcMatch) return imgTag;
    
    const originalSrc = srcMatch[1];
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    return `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  ${imgTag}
</picture>`;
  }
}