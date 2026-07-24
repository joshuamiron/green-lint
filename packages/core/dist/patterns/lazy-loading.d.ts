import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue } from '../types';
/**
 * Pattern: Defer Offscreen Images (Lazy Loading)
 * Based on study measurement: 88% network reduction under test conditions
 */
export declare class LazyLoadingPattern extends BasePattern {
    id: string;
    name: string;
    category: "images";
    description: string;
    research: {
        cpuImpact: string;
        cpuPValue: string;
        networkImpact: string;
        networkPValue: string;
        sampleSize: number;
        citation: string;
    };
    detect(context: AnalysisContext): Issue[];
    private detectHTML;
    private detectJSX;
}
//# sourceMappingURL=lazy-loading.d.ts.map