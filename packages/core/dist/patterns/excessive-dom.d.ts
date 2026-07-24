import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue } from '../types';
/**
 * Pattern: Avoid Excessive DOM Size
 */
export declare class ExcessiveDOMPattern extends BasePattern {
    id: string;
    name: string;
    category: "dom";
    description: string;
    research: {
        cpuImpact: string;
        cpuPValue: string;
        sampleSize: number;
        citation: string;
    };
    detect(context: AnalysisContext): Issue[];
    /**
     * Build simplified DOM tree
     */
    private buildDOMTree;
    /**
     * Count total DOM nodes
     */
    private countNodes;
    /**
     * Find wrapper divs that serve no purpose
     */
    private findUnnecessaryWrappers;
    /**
     * Check if element has no significant attributes
     */
    private hasNoSignificantAttributes;
    /**
     * Generate fixes for wrapper removal
     */
    private generateWrapperFixes;
}
//# sourceMappingURL=excessive-dom.d.ts.map