import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue } from '../types';
import {
  parseHTML,
  findAllImages,
  getAttribute,
  hasParentWithTag,
  getLocation,
} from '../utils/ast-helpers';

/**
 * Pattern: Serve Images in Modern Formats
 * Based on study measurement: 22.4% file size reduction under test conditions
 */
export class ModernFormatsPattern extends BasePattern {
  id = 'modern-formats';
  name = 'Serve Images in Modern Formats';
  category = 'images' as const;
  description = 'Use modern image formats (WebP/AVIF) with fallback to JPEG/PNG. ' + 
  'Modern formats are typically 25-50% smaller than JPEG ' + 
  '(Google, Alliance for Open Media)';

  research = {
    networkImpact: '22.4% reduction (study conditions)',
    networkPValue: '0.00045 (statistically significant)',
    sampleSize: 8,
citation: 'Miron, "Developing a Framework for Retroactively Applying Green Software Enginnering Patterns to React Applications", Section 5.1, 2026',  };
  
  detect(context: AnalysisContext): Issue[] {
    const issues: Issue[] = [];
    
    // Parse HTML into AST
    const ast = parseHTML(context.sourceCode);
    
    // Find all <img> elements
    const images = findAllImages(ast);
    
    for (const img of images) {
      const src = getAttribute(img, 'src');
      
      // Check if image uses legacy format (.jpg, .jpeg, .png)
      if (src && /\.(jpg|jpeg|png)$/i.test(src)) {
        // Check if already wrapped in <picture>
        const isWrapped = hasParentWithTag(img, 'picture', ast);
        
        if (!isWrapped) {
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
                  endColumn: location.column + 50, // Approximate
                },
                `Use <picture> element to serve modern formats (WebP/AVIF) with fallback`,
                {
                  level: 'medium',
                  metric: 'Reduces image transfer size via modern formats',
                  source: this.research.citation,
                },
                [{
                  id: 'wrap-in-picture',
                  description: 'Wrap in <picture> with WebP source',
                  isPreferred: true,
                  changes: [{
                    file: context.filePath,
                    range: {
                      startLine: location.line,
                      startColumn: location.column,
                      endLine: location.line,
                      endColumn: location.column,
                    },
                    newText: '', // Not used with AST approach
                  }],
                }]
              )
            );
            
            // Store reference to the img element for fixing
            (issues[issues.length - 1] as any)._imgElement = img;
            (issues[issues.length - 1] as any)._ast = ast;
          }
        }
      }
    }
    
    return issues;
  }
}