import { Pattern, AnalysisContext, Issue, Fix, PatternCategory } from '../types';
/**
 * Base class for all patterns
 */
export declare abstract class BasePattern implements Pattern {
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
    protected createIssue(context: AnalysisContext, location: Issue['location'], message: string, energyImpact: Issue['energyImpact'], fixes?: Fix[]): Issue;
    /**
     * Extract code snippet
     */
    private extractSnippet;
    /**
     * Map energy impact to severity
     */
    private getSeverity;
}
//# sourceMappingURL=base-pattern.d.ts.map