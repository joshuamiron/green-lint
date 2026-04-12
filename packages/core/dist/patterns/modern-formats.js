"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModernFormatsPattern = void 0;
const base_pattern_1 = require("./base-pattern");
const ast_helpers_1 = require("../utils/ast-helpers");
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
        // Parse HTML into AST
        const ast = (0, ast_helpers_1.parseHTML)(context.sourceCode);
        // Find all <img> elements
        const images = (0, ast_helpers_1.findAllImages)(ast);
        for (const img of images) {
            const src = (0, ast_helpers_1.getAttribute)(img, 'src');
            // Check if image uses legacy format (.jpg, .jpeg, .png)
            if (src && /\.(jpg|jpeg|png)$/i.test(src)) {
                // Check if already wrapped in <picture>
                const isWrapped = (0, ast_helpers_1.hasParentWithTag)(img, 'picture', ast);
                if (!isWrapped) {
                    const location = (0, ast_helpers_1.getLocation)(img);
                    if (location) {
                        issues.push(this.createIssue(context, {
                            file: context.filePath,
                            startLine: location.line,
                            startColumn: location.column,
                            endLine: location.line,
                            endColumn: location.column + 50, // Approximate
                        }, `Use <picture> element to serve modern formats (WebP/AVIF) with fallback`, {
                            level: 'medium',
                            metric: '22.4% file size reduction',
                            estimatedSavings: '~23 KB per 6 images',
                            source: this.research.citation,
                        }, [{
                                id: 'wrap-in-picture',
                                description: 'Wrap in <picture> with WebP source',
                                isPreferred: true,
                                changes: [{
                                        file: context.filePath,
                                        range: {
                                            startLine: location.line,
                                            startColumn: location.column,
                                            endLine: location.line,
                                            endColumn: location.column,
                                        },
                                        newText: '', // Not used with AST approach
                                    }],
                            }]));
                        // Store reference to the img element for fixing
                        issues[issues.length - 1]._imgElement = img;
                        issues[issues.length - 1]._ast = ast;
                    }
                }
            }
        }
        return issues;
    }
}
exports.ModernFormatsPattern = ModernFormatsPattern;
//# sourceMappingURL=modern-formats.js.map