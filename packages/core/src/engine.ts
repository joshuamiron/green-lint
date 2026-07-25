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
  findUnnecessaryDivWrappers,
  unwrapElement,
} from './utils/ast-helpers';
import {
  parseJSX,
  findAllJSXImages,
  getJSXAttribute,
  getJSXLocation,
  jsxOpeningTagInsertionOffset,
  findUnnecessaryJSXDivWrappers,
  JSXImage,
} from './utils/jsx-ast-helpers';

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
    if (filePath.endsWith('.tsx')) {
      return 'tsx';
    }
    if (filePath.endsWith('.jsx')) {
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
  async applyFixes(filePath: string, sourceCode: string, issues: Issue[]): Promise<string> {
    const language = this.detectLanguage(filePath);

    if (language === 'jsx' || language === 'tsx') {
      return this.applyJSXFixes(sourceCode, issues, language === 'tsx');
    }

    return this.applyHTMLFixes(sourceCode, issues);
  }

  /**
   * Compute a WebP replacement for a legacy-format image src.
   */
  private computeWebPSrc(src: string): string {
    if (src.includes('unsplash.com')) {
      return src.replace(/[&?]fm=jpg/, '&fm=webp');
    }
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  /**
   * Apply fixes to JSX/TSX source via targeted text splices computed from
   * Babel node offsets, rather than mutating and re-serializing the whole
   * AST (which would require a JSX-aware code generator and risks
   * reformatting code well outside the fix itself).
   */
  private applyJSXFixes(sourceCode: string, issues: Issue[], isTypeScript: boolean): string {
    const ast = parseJSX(sourceCode, isTypeScript);
    const allImages = findAllJSXImages(ast);

    const lazyLoadingIssues = issues.filter(i => i.patternId === 'lazy-loading');
    const modernFormatIssues = issues.filter(i => i.patternId === 'modern-formats');
    const excessiveDomIssues = issues.filter(
      i => i.patternId === 'excessive-dom' && i.message.startsWith('Unnecessary wrapper')
    );

    const findImage = (issue: Issue): JSXImage | undefined =>
      allImages.find(img => {
        const loc = getJSXLocation(img.openingElement);
        return loc &&
          loc.line === issue.location.startLine &&
          loc.column === issue.location.startColumn;
      });

    // Each splice replaces source[start, end) with text (a point insertion
    // has start === end). Since offsets are all computed against the
    // original (untouched) source, applying them from the highest start
    // down keeps every earlier offset valid.
    const splices: Array<{ start: number; end: number; text: string }> = [];

    for (const issue of lazyLoadingIssues) {
      const img = findImage(issue);
      if (img) {
        const offset = jsxOpeningTagInsertionOffset(img.openingElement);
        splices.push({ start: offset, end: offset, text: ' loading="lazy"' });
      }
    }

    for (const issue of modernFormatIssues) {
      const img = findImage(issue);
      if (img) {
        const src = getJSXAttribute(img.openingElement, 'src');
        if (src) {
          const webpSrc = this.computeWebPSrc(src);
          splices.push({
            start: img.element.start!,
            end: img.element.start!,
            text: `<picture><source srcSet="${webpSrc}" type="image/webp" />`,
          });
          splices.push({ start: img.element.end!, end: img.element.end!, text: '</picture>' });
        }
      }
    }

    if (excessiveDomIssues.length > 0) {
      const allWrappers = findUnnecessaryJSXDivWrappers(ast);

      for (const issue of excessiveDomIssues) {
        const wrapper = allWrappers.find(w => {
          const loc = getJSXLocation(w.openingElement);
          return loc &&
            loc.line === issue.location.startLine &&
            loc.column === issue.location.startColumn;
        });

        if (wrapper && wrapper.closingElement) {
          // Delete the opening and closing tags, leaving the single child in place.
          splices.push({
            start: wrapper.openingElement.start!,
            end: wrapper.openingElement.end!,
            text: '',
          });
          splices.push({
            start: wrapper.closingElement.start!,
            end: wrapper.closingElement.end!,
            text: '',
          });
        }
      }
    }

    splices.sort((a, b) => b.start - a.start);

    let result = sourceCode;
    for (const splice of splices) {
      result = result.slice(0, splice.start) + splice.text + result.slice(splice.end);
    }

    return result;
  }

  private async applyHTMLFixes(sourceCode: string, issues: Issue[]): Promise<string> {
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
    
    // STEP 3: Apply excessive-dom wrapper-removal fixes
    const excessiveDomIssues = issues.filter(
      i => i.patternId === 'excessive-dom' && i.message.startsWith('Unnecessary wrapper')
    );

    if (excessiveDomIssues.length > 0) {
      const allWrappers = findUnnecessaryDivWrappers(ast);

      for (const issue of excessiveDomIssues) {
        const wrapper = allWrappers.find(w => {
          const loc = getLocation(w);
          return loc &&
                loc.line === issue.location.startLine &&
                loc.column === issue.location.startColumn;
        });

        if (wrapper) {
          console.log(`Removing unnecessary wrapper at line ${issue.location.startLine}`);
          unwrapElement(ast, wrapper);
        }
      }
    }

    // Serialize back to HTML
  return await serializeHTML(ast);  // ADD await
  }
}