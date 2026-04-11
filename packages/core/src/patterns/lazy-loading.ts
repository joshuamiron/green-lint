import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue, Fix } from '../types';
import { parse } from 'parse5';

/**
 * Pattern: Defer Offscreen Images (Lazy Loading)
 * 
 * Based on research showing 88% network reduction for offscreen images
 */
export class LazyLoadingPattern extends BasePattern {
  id = 'lazy-loading';
  name = 'Defer Offscreen Images';
  category = 'images' as const;
  description = 'Images without loading="lazy" attribute should use lazy loading to defer offscreen images';
  
  research = {
    networkSavings: '88%',
    cpuImpact: '+20%',
    totalEnergySavings: '19.6%',
    pValue: 0.008,
    sampleSize: 5,
    citation: 'Your Dissertation, Section 4.2.1',
  };
  
  detect(context: AnalysisContext): Issue[] {
    const issues: Issue[] = [];
    
    // Parse HTML/JSX to find <img> elements
    const images = this.findImageElements(context);
    
    for (const img of images) {
      const hasLazyLoading = this.hasLazyLoadingAttribute(img);
      const isAboveFold = this.isAboveFold(img, context);
      
      // Flag if: no lazy loading AND below fold
      if (!hasLazyLoading && !isAboveFold) {
        issues.push(
          this.createIssue(
            context,
            img.location,
            `Image should use loading="lazy" to defer loading until needed`,
            {
              level: 'high',
              metric: '88% network reduction for offscreen images',
              estimatedSavings: '~100 mJ per page load',
              source: this.research.citation,
            },
            this.generateFixes({
              id: '',
              patternId: this.id,
              severity: 'warning',
              message: '',
              location: img.location,
              energyImpact: { level: 'high', metric: '', source: '' },
              snippet: '',
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
        id: 'add-lazy-loading',
        description: 'Add loading="lazy" attribute',
        isPreferred: true,
        changes: [
          {
            file: issue.location.file,
            range: issue.location,
            newText: this.addLazyLoadingAttribute(issue.snippet),
          },
        ],
      },
    ];
  }
  
  /**
   * Find all <img> elements in the context
   */
  private findImageElements(context: AnalysisContext) {
    // This is simplified - real implementation would:
    // 1. Parse HTML/JSX properly
    // 2. Handle React components
    // 3. Track line/column positions
    
    const images: Array<{
      element: string;
      location: Issue['location'];
      attributes: Record<string, string>;
    }> = [];
    
    // Use regex as simple example (real version uses AST)
    const imgRegex = /<img\s+([^>]+)>/gi;
    let match;
    let lineNumber = 1;
    
    while ((match = imgRegex.exec(context.sourceCode)) !== null) {
      const fullMatch = match[0];
      const attributes = this.parseAttributes(match[1]);
      
      images.push({
        element: fullMatch,
        location: {
          file: context.filePath,
          startLine: lineNumber,
          startColumn: match.index,
          endLine: lineNumber,
          endColumn: match.index + fullMatch.length,
        },
        attributes,
      });
    }
    
    return images;
  }
  
  /**
   * Check if image has loading="lazy"
   */
  private hasLazyLoadingAttribute(img: any): boolean {
    return img.attributes.loading === 'lazy';
  }
  
  /**
   * Check if image is above the fold
   */
  private isAboveFold(img: any, context: AnalysisContext): boolean {
    // In CLI mode, we can't know viewport position
    // So we use heuristics or assume all images below first screen
    
    // If runtime data available (from browser extension):
    if (context.runtimeData?.imagePositions) {
      const position = context.runtimeData.imagePositions.get(img.element);
      const viewportHeight = context.runtimeData.viewportHeight || 800;
      return position !== undefined && position < viewportHeight;
    }
    
    // Otherwise, assume images in first 1000px of document are above fold
    const threshold = context.config?.thresholds?.lazyLoadThreshold || 1000;
    
    // Rough heuristic: count lines before this image
    // (Real implementation would be more sophisticated)
    return img.location.startLine < 20;  // Simplified!
  }
  
  /**
   * Parse HTML attributes from string
   */
  private parseAttributes(attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']+)["']/g;
    let match;
    
    while ((match = attrRegex.exec(attrString)) !== null) {
      attrs[match[1]] = match[2];
    }
    
    return attrs;
  }
  
  /**
   * Add loading="lazy" to an <img> tag
   */
  private addLazyLoadingAttribute(imgTag: string): string {
    // If already has other attributes, add after them
    if (imgTag.includes(' ')) {
      return imgTag.replace(/<img\s+/, '<img loading="lazy" ');
    }
    // If no attributes, add before >
    return imgTag.replace(/<img/, '<img loading="lazy"');
  }
}