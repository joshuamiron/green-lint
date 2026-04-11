import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue, Fix } from '../types';
/**
 * Pattern: Defer Offscreen Images (Lazy Loading)
 *
 * Based on research showing 88% network reduction for offscreen images
 */
export declare class LazyLoadingPattern extends BasePattern {
    id: string;
    name: string;
    category: "images";
    description: string;
    research: {
        networkSavings: string;
        cpuImpact: string;
        totalEnergySavings: string;
        pValue: number;
        sampleSize: number;
        citation: string;
    };
    detect(context: AnalysisContext): Issue[];
    generateFixes(issue: Issue): Fix[];
    /**
     * Find all <img> elements in the context
     */
    private findImageElements;
    /**
     * Check if image has loading="lazy"
     */
    private hasLazyLoadingAttribute;
    /**
     * Check if image is above the fold
     */
    private isAboveFold;
    /**
     * Parse HTML attributes from string
     */
    private parseAttributes;
    /**
     * Add loading="lazy" to an <img> tag
     */
    private addLazyLoadingAttribute;
}
//# sourceMappingURL=lazy-loading.d.ts.map