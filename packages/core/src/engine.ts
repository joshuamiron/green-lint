import { Pattern, AnalysisContext, Issue, UserConfig, CodeChange } from './types';
import { LazyLoadingPattern } from './patterns/lazy-loading';
import { ModernFormatsPattern } from './patterns/modern-formats';
import { ExcessiveDOMPattern } from './patterns/excessive-dom';

/**
 * Main analysis engine
 */
export class GreenLintEngine {
  private patterns: Map<string, Pattern> = new Map();
  
  constructor() {
    // Register all patterns
    this.registerPattern(new LazyLoadingPattern());
    this.registerPattern(new ModernFormatsPattern());
    this.registerPattern(new ExcessiveDOMPattern());
    // ... register remaining 10 patterns
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
      // AST/DOM would be parsed here in real implementation
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
    return 'html';  // Default
  }
  
  /**
   * Apply fixes to source code
   */
  applyFixes(sourceCode: string, issues: Issue[]): string {
    let modifiedCode = sourceCode;
    
    // Sort issues by position (apply from end to start to preserve positions)
    const sortedIssues = issues.sort((a, b) => {
      return b.location.startLine - a.location.startLine;
    });
    
    for (const issue of sortedIssues) {
      const preferredFix = issue.fixes.find(f => f.isPreferred) || issue.fixes[0];
      
      if (preferredFix) {
        for (const change of preferredFix.changes) {
          modifiedCode = this.applyChange(modifiedCode, change);
        }
      }
    }
    
    return modifiedCode;
  }
  
  /**
   * Apply a single code change
   */
  private applyChange(sourceCode: string, change: CodeChange): string {
    const lines = sourceCode.split('\n');
    
    // Replace the specified range
    const startLine = change.range.startLine - 1;
    const endLine = change.range.endLine - 1;
    
    const before = lines.slice(0, startLine);
    const after = lines.slice(endLine + 1);
    
    return [
      ...before,
      change.newText,
      ...after,
    ].join('\n');
  }
}