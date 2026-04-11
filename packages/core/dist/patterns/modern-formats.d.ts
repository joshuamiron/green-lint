import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue, Fix } from '../types';
/**
 * Pattern: Serve Images in Modern Formats
 *
 * Based on research showing 22.4% file size reduction (WebP vs JPEG)
 */
export declare class ModernFormatsPattern extends BasePattern {
    id: string;
    name: string;
    category: "images";
    description: string;
    research: {
        networkSavings: string;
        pValue: number;
        sampleSize: number;
        citation: string;
    };
    detect(context: AnalysisContext): Issue[];
    generateFixes(issue: Issue): Fix[];
    /**
     * Find images using legacy formats (.jpg, .png)
     */
    private findLegacyFormatImages;
    /**
     * Check if image is already wrapped in <picture>
     */
    private isWrappedInPicture;
    /**
     * Wrap <img> in <picture> with WebP source
     */
    private wrapInPictureElement;
}
//# sourceMappingURL=modern-formats.d.ts.map