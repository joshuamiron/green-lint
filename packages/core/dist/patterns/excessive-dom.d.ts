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
    private detectHTML;
    private detectJSX;
    /**
     * Flag the file itself if its DOM tree exceeds the configured threshold.
     * There's no automatic fix for this - reducing complexity requires
     * human judgment - so no `fixes` are attached.
     */
    private detectTotalNodes;
    private createWrapperIssue;
    /**
     * Count total DOM nodes
     */
    private countNodes;
}
//# sourceMappingURL=excessive-dom.d.ts.map