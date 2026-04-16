import { Pattern, AnalysisContext, Issue, UserConfig } from './types';
import { LazyLoadingPattern } from './patterns/lazy-loading';
import { ModernFormatsPattern } from './patterns/modern-formats';
import { ExcessiveDOMPattern } from './patterns/excessive-dom';
import {
  parseHTML,
  serializeHTML,
  createElement,
  wrapElement,
  getAttribute,
  findAllImages,
  getLocation,
  setAttribute,
} from './utils/ast-helpers';

/**
 * Main analysis engine
 */
export class GreenLintEngine {
  private patterns: Map<string, Pattern> = new Map();
  
  constructor() {
    // Register all patterns
    this.registerPattern(new ModernFormatsPattern());
    this.registerPattern(new LazyLoadingPattern());
    this.registerPattern(new ExcessiveDOMPattern());
  }
  
  /**
   * Register a pattern
   */
  registerPattern(pattern: Pattern): void {
    this.patterns.set(pattern.id, pattern);
  }
  
  /**
   * Analyze a file
   */
  async analyzeFile(
    filePath: string,
    sourceCode: string,
    config?: UserConfig
  ): Promise<Issue[]> {
    const context = this.createContext(filePath, sourceCode, config);
    const issues: Issue[] = [];
    
    // Run each enabled pattern
    for (const [id, pattern] of this.patterns) {
      const enabled = config?.patterns?.[id]?.enabled ?? true;
      
      if (enabled) {
        const patternIssues = pattern.detect(context);
        issues.push(...patternIssues);
      }
    }
    
    return issues;
  }
  
  /**
   * Create analysis context
   */
  private createContext(
    filePath: string,
    sourceCode: string,
    config?: UserConfig
  ): AnalysisContext {
    return {
      sourceCode,
      filePath,
      language: this.detectLanguage(filePath),
      config,
    };
  }
  
  /**
   * Detect file language
   */
  private detectLanguage(filePath: string): AnalysisContext['language'] {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      return 'jsx';
    }
    if (filePath.endsWith('.html')) {
      return 'html';
    }
    if (filePath.endsWith('.vue')) {
      return 'vue';
    }
    return 'html';
  }
  
 /**
 * Apply fixes to source code using AST
 */
  async applyFixes(sourceCode: string, issues: Issue[]): Promise<string> {
    // Parse HTML fresh
    const ast = parseHTML(sourceCode);
    
    // Group issues by pattern
    const modernFormatIssues = issues.filter(i => i.patternId === 'modern-formats');
    const lazyLoadingIssues = issues.filter(i => i.patternId === 'lazy-loading');
    
    console.log(`Applying ${lazyLoadingIssues.length} lazy loading fixes...`);
    console.log(`Applying ${modernFormatIssues.length} modern format fixes...`);
    
    // Find all images in the fresh AST
    const allImages = findAllImages(ast);
    
    console.log(`Found ${allImages.length} images in AST`);
    
    // STEP 1: Apply lazy loading fixes FIRST (before wrapping in picture)
    for (const issue of lazyLoadingIssues) {
      const imgElement = allImages.find(img => {
        const loc = getLocation(img);
        return loc && 
              loc.line === issue.location.startLine &&
              loc.column === issue.location.startColumn;
      });
      
      if (imgElement) {
        const src = getAttribute(imgElement, 'src');
        
        console.log(`Adding lazy loading at line ${issue.location.startLine}: ${src}`);
        
        // Add loading="lazy" attribute
        setAttribute(imgElement, 'loading', 'lazy');
      } else {
        console.log(`Could not find image at line ${issue.location.startLine} for lazy loading`);
      }
    }
    
    // STEP 2: Apply modern format fixes (wraps elements in picture)
    for (const issue of modernFormatIssues) {
      const imgElement = allImages.find(img => {
        const loc = getLocation(img);
        return loc && 
              loc.line === issue.location.startLine &&
              loc.column === issue.location.startColumn;
      });
      
      if (imgElement) {
        const src = getAttribute(imgElement, 'src');
        
        if (src) {
          console.log(`Fixing image at line ${issue.location.startLine}: ${src}`);
          
          // Create WebP source URL
          let webpSrc: string;
          
          if (src.includes('unsplash.com')) {
            webpSrc = src.replace(/[&?]fm=jpg/, '&fm=webp');
          } else {
            webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          }
          
          // Create <source> element
          const sourceElement = createElement('source', [
            { name: 'srcset', value: webpSrc },
            { name: 'type', value: 'image/webp' },
          ]);
          
          // Wrap img in picture and add source
          const picture = wrapElement(ast, imgElement, 'picture');
          
          if (picture && picture.childNodes) {
            picture.childNodes.unshift(sourceElement as any);
            console.log(`Created picture element for ${src}`);
          }
        }
      } else {
        console.log(`Could not find image at line ${issue.location.startLine}`);
      }
    }
    
    // Serialize back to HTML
  return await serializeHTML(ast);  // ADD await
  }
}