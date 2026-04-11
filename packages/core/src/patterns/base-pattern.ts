import { Pattern, AnalysisContext, Issue, Fix, PatternCategory } from '../types';

/**
 * Base class for all patterns
 */
export abstract class BasePattern implements Pattern {
  abstract id: string;
  abstract name: string;
  abstract category: PatternCategory;
  abstract description: string;
  abstract research: Pattern['research'];
  
  /**
   * Detect issues in the given context
   */
  abstract detect(context: AnalysisContext): Issue[];
  
  /**
   * Generate fixes for an issue
   */
  generateFixes?(issue: Issue): Fix[];
  
  /**
   * Helper: Create an issue
   */
  protected createIssue(
    context: AnalysisContext,
    location: Issue['location'],
    message: string,
    energyImpact: Issue['energyImpact'],
    fixes?: Fix[]
  ): Issue {
    return {
      id: `${this.id}-${Date.now()}`,
      patternId: this.id,
      severity: this.getSeverity(energyImpact.level),
      message,
      location,
      energyImpact,
      snippet: this.extractSnippet(context.sourceCode, location),
      fixes: fixes || [],
    };
  }
  
  /**
   * Extract code snippet
   */
  private extractSnippet(
    sourceCode: string,
    location: Issue['location']
  ): string {
    const lines = sourceCode.split('\n');
    const snippetLines = lines.slice(
      location.startLine - 1,
      location.endLine
    );
    return snippetLines.join('\n');
  }
  
  /**
   * Map energy impact to severity
   */
  private getSeverity(
    level: 'high' | 'medium' | 'low'
  ): 'error' | 'warning' | 'info' {
    switch (level) {
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'info';
    }
  }
}