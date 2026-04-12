import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue } from '../types';
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
}
//# sourceMappingURL=lazy-loading.d.ts.map