"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModernFormatsPattern = void 0;
const base_pattern_1 = require("./base-pattern");
const ast_helpers_1 = require("../utils/ast-helpers");
const jsx_ast_helpers_1 = require("../utils/jsx-ast-helpers");
/**
 * Pattern: Serve Images in Modern Formats
 * Based on study measurement: 22.4% file size reduction under test conditions
 */
class ModernFormatsPattern extends base_pattern_1.BasePattern {
    constructor() {
        super(...arguments);
        this.id = 'modern-formats';
        this.name = 'Serve Images in Modern Formats';
        this.category = 'images';
        this.description = 'Use modern image formats (WebP/AVIF) with fallback to JPEG/PNG. ' +
            'Modern formats are typically 25-50% smaller than JPEG ' +
            '(Google, Alliance for Open Media)';
        this.research = {
            networkImpact: '22.4% reduction (study conditions)',
            networkPValue: '0.00045 (statistically significant)',
            sampleSize: 8,
            citation: 'Miron, "Developing a Framework for Retroactively Applying Green Software Engineering Patterns to React Applications", Section 5.1, 2026',
        };
    }
    detect(context) {
        if (context.language === 'jsx' || context.language === 'tsx') {
            return this.detectJSX(context);
        }
        return this.detectHTML(context);
    }
    detectHTML(context) {
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
                            metric: 'Reduces image transfer size via modern formats',
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
    detectJSX(context) {
        const issues = [];
        const ast = (0, jsx_ast_helpers_1.parseJSX)(context.sourceCode, context.language === 'tsx');
        const images = (0, jsx_ast_helpers_1.findAllJSXImages)(ast);
        for (const img of images) {
            const src = (0, jsx_ast_helpers_1.getJSXAttribute)(img.openingElement, 'src');
            if (src && /\.(jpg|jpeg|png)$/i.test(src)) {
                if (img.parentTag !== 'picture') {
                    const location = (0, jsx_ast_helpers_1.getJSXLocation)(img.openingElement);
                    if (location) {
                        issues.push(this.createIssue(context, {
                            file: context.filePath,
                            startLine: location.line,
                            startColumn: location.column,
                            endLine: location.line,
                            endColumn: location.column + 50, // Approximate
                        }, `Use <picture> element to serve modern formats (WebP/AVIF) with fallback`, {
                            level: 'medium',
                            metric: 'Reduces image transfer size via modern formats',
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
                    }
                }
            }
        }
        return issues;
    }
}
exports.ModernFormatsPattern = ModernFormatsPattern;
//# sourceMappingURL=modern-formats.js.map