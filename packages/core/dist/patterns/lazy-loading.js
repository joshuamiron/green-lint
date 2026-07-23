"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyLoadingPattern = void 0;
const base_pattern_1 = require("./base-pattern");
const ast_helpers_1 = require("../utils/ast-helpers");
/**
 * Pattern: Defer Offscreen Images (Lazy Loading)
 * Based on study measurement: 88% network reduction under test conditions
 */
class LazyLoadingPattern extends base_pattern_1.BasePattern {
    constructor() {
        super(...arguments);
        this.id = 'lazy-loading';
        this.name = 'Defer Offscreen Images';
        this.category = 'images';
        this.description = 'Add loading="lazy" to defer loading of offscreen images';
        this.research = {
            measuredNetworkReduction: '88% (study conditions)',
            measuredCpuImpact: '+20% (study conditions)',
            pValue: 0.008,
            sampleSize: 5,
            citation: 'Miron, 2026', // TODO: exact section
        };
    }
    detect(context) {
        const issues = [];
        // Parse HTML into AST
        const ast = (0, ast_helpers_1.parseHTML)(context.sourceCode);
        // Find all <img> elements
        const images = (0, ast_helpers_1.findAllImages)(ast);
        // Get threshold from config (default: skip first 1 image)
        const threshold = context.config?.thresholds?.lazyLoadThreshold || 1;
        // Check each image (skip first N based on threshold)
        images.forEach((img, index) => {
            // Skip first N images (hero/header)
            if (index < threshold) {
                return;
            }
            const loading = (0, ast_helpers_1.getAttribute)(img, 'loading');
            // Flag if missing loading="lazy"
            if (loading !== 'lazy') {
                const location = (0, ast_helpers_1.getLocation)(img);
                if (location) {
                    issues.push(this.createIssue(context, {
                        file: context.filePath,
                        startLine: location.line,
                        startColumn: location.column,
                        endLine: location.line,
                        endColumn: location.column + 50,
                    }, `Add loading="lazy" to defer loading of offscreen images until needed`, {
                        level: 'high',
                        metric: 'Reduces network transfer for offscreen images',
                        source: this.research.citation,
                    }, [{
                            id: 'add-lazy-loading',
                            description: 'Add loading="lazy" attribute',
                            isPreferred: true,
                            changes: [{
                                    file: context.filePath,
                                    range: {
                                        startLine: location.line,
                                        startColumn: location.column,
                                        endLine: location.line,
                                        endColumn: location.column,
                                    },
                                    newText: '',
                                }],
                        }]));
                    // Store reference for fixing
                    issues[issues.length - 1]._imgElement = img;
                }
            }
        });
        return issues;
    }
}
exports.LazyLoadingPattern = LazyLoadingPattern;
//# sourceMappingURL=lazy-loading.js.map