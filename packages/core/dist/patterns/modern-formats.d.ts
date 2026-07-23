import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue } from '../types';
/**
 * Pattern: Serve Images in Modern Formats
 * Based on study measurement: 22.4% file size reduction under test conditions
 */
export declare class ModernFormatsPattern extends BasePattern {
    id: string;
    name: string;
    category: "images";
    description: string;
    research: {
        measuredNetworkReduction: string;
        pValue: number;
        sampleSize: number;
        citation: string;
    };
    detect(context: AnalysisContext): Issue[];
}
//# sourceMappingURL=modern-formats.d.ts.map