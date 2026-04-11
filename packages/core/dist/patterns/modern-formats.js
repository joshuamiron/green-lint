"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModernFormatsPattern = void 0;
const base_pattern_1 = require("./base-pattern");
/**
 * Pattern: Serve Images in Modern Formats
 *
 * Based on research showing 22.4% file size reduction (WebP vs JPEG)
 */
class ModernFormatsPattern extends base_pattern_1.BasePattern {
    constructor() {
        super(...arguments);
        this.id = 'modern-formats';
        this.name = 'Serve Images in Modern Formats';
        this.category = 'images';
        this.description = 'Use modern image formats (WebP/AVIF) with fallback to JPEG/PNG';
        this.research = {
            networkSavings: '22.4%',
            pValue: 0.00045,
            sampleSize: 8,
            citation: 'Your Dissertation, Section 4.2.4',
        };
    }
    detect(context) {
        const issues = [];
        // Find <img> tags with .jpg or .png that aren't wrapped in <picture>
        const legacyImages = this.findLegacyFormatImages(context);
        for (const img of legacyImages) {
            const isWrappedInPicture = this.isWrappedInPicture(img, context);
            if (!isWrappedInPicture) {
                issues.push(this.createIssue(context, img.location, `Use <picture> element to serve modern formats (WebP/AVIF) with fallback`, {
                    level: 'medium',
                    metric: '22.4% file size reduction',
                    estimatedSavings: '~23 KB per 6 images',
                    source: this.research.citation,
                }, this.generateFixes({
                    id: '',
                    patternId: this.id,
                    severity: 'warning',
                    message: '',
                    location: img.location,
                    energyImpact: { level: 'medium', metric: '', source: '' },
                    snippet: img.element,
                    fixes: [],
                })));
            }
        }
        return issues;
    }
    generateFixes(issue) {
        return [
            {
                id: 'wrap-in-picture',
                description: 'Wrap in <picture> with WebP source',
                isPreferred: true,
                changes: [
                    {
                        file: issue.location.file,
                        range: issue.location,
                        newText: this.wrapInPictureElement(issue.snippet),
                    },
                ],
            },
        ];
    }
    /**
     * Find images using legacy formats (.jpg, .png)
     */
    findLegacyFormatImages(context) {
        const images = [];
        // Simplified regex (real version uses AST)
        const imgRegex = /<img\s+[^>]*src=["']([^"']+\.(jpg|jpeg|png))["'][^>]*>/gi;
        let match;
        let lineNumber = 1;
        while ((match = imgRegex.exec(context.sourceCode)) !== null) {
            images.push({
                element: match[0],
                location: {
                    file: context.filePath,
                    startLine: lineNumber,
                    startColumn: match.index,
                    endLine: lineNumber,
                    endColumn: match.index + match[0].length,
                },
                src: match[1],
            });
        }
        return images;
    }
    /**
     * Check if image is already wrapped in <picture>
     */
    isWrappedInPicture(img, context) {
        // Look backwards in source code for <picture> tag
        const linesBefore = context.sourceCode
            .split('\n')
            .slice(Math.max(0, img.location.startLine - 5), img.location.startLine);
        return linesBefore.some(line => line.includes('<picture'));
    }
    /**
     * Wrap <img> in <picture> with WebP source
     */
    wrapInPictureElement(imgTag) {
        // Extract src attribute
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
        if (!srcMatch)
            return imgTag;
        const originalSrc = srcMatch[1];
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  ${imgTag}
</picture>`;
    }
}
exports.ModernFormatsPattern = ModernFormatsPattern;
//# sourceMappingURL=modern-formats.js.map