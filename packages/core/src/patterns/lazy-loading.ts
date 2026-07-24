import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue } from '../types';
import {
  parseHTML,
  findAllImages,
  getAttribute,
  getLocation,
} from '../utils/ast-helpers';

/**
 * Pattern: Defer Offscreen Images (Lazy Loading)
 * Based on study measurement: 88% network reduction under test conditions
 */
export class LazyLoadingPattern extends BasePattern {
  id = 'lazy-loading';
  name = 'Defer Offscreen Images';
  category = 'images' as const;
  description = 'Add loading="lazy" to defer loading of offscreen images';

  research = {
    cpuImpact: '20% increase (study conditions)',
    cpuPValue: '0.0008 (statistically significant)',
    networkImpact: '88% reduction (study conditions)',
    networkPValue: '0.008 (statistically significant)',
    sampleSize: 5,
    citation: 'Miron, "Developing a Framework for Retroactively Applying Green Software Engineering Patterns to React Applications", Section 5.1, 2026',
  };
  
  detect(context: AnalysisContext): Issue[] {
    const issues: Issue[] = [];
    
    // Parse HTML into AST
    const ast = parseHTML(context.sourceCode);
    
    // Find all <img> elements
    const images = findAllImages(ast);
    
    // Get threshold from config (default: skip first 1 image)
    const threshold = context.config?.thresholds?.lazyLoadThreshold || 1;
    
    // Check each image (skip first N based on threshold)
    images.forEach((img, index) => {
      // Skip first N images (hero/header)
      if (index < threshold) {
        return;
      }
      
      const loading = getAttribute(img, 'loading');
      
      // Flag if missing loading="lazy"
      if (loading !== 'lazy') {
        const location = getLocation(img);
        
        if (location) {
          issues.push(
            this.createIssue(
              context,
              {
                file: context.filePath,
                startLine: location.line,
                startColumn: location.column,
                endLine: location.line,
                endColumn: location.column + 50,
              },
              `Add loading="lazy" to defer loading of offscreen images until needed`,
              {
                level: 'high',
                metric: 'Reduces network transfer for offscreen images',
                source: this.research.citation,
              },
              [{
                id: 'add-lazy-loading',
                description: 'Add loading="lazy" attribute',
                isPreferred: true,
                changes: [{
                  file: context.filePath,
                  range: {
                    startLine: location.line,
                    startColumn: location.column,
                    endLine: location.line,
                    endColumn: location.column,
                  },
                  newText: '',
                }],
              }]
            )
          );
          
          // Store reference for fixing
          (issues[issues.length - 1] as any)._imgElement = img;
        }
      }
    });
    
    return issues;
  }
}