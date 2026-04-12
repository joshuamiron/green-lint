"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenLintEngine = void 0;
const lazy_loading_1 = require("./patterns/lazy-loading");
const modern_formats_1 = require("./patterns/modern-formats");
const excessive_dom_1 = require("./patterns/excessive-dom");
const ast_helpers_1 = require("./utils/ast-helpers");
/**
 * Main analysis engine
 */
class GreenLintEngine {
    constructor() {
        this.patterns = new Map();
        // Register all patterns
        this.registerPattern(new modern_formats_1.ModernFormatsPattern());
        this.registerPattern(new lazy_loading_1.LazyLoadingPattern());
        this.registerPattern(new excessive_dom_1.ExcessiveDOMPattern());
    }
    /**
     * Register a pattern
     */
    registerPattern(pattern) {
        this.patterns.set(pattern.id, pattern);
    }
    /**
     * Analyze a file
     */
    async analyzeFile(filePath, sourceCode, config) {
        const context = this.createContext(filePath, sourceCode, config);
        const issues = [];
        // Run each enabled pattern
        for (const [id, pattern] of this.patterns) {
            const enabled = config?.patterns?.[id]?.enabled ?? true;
            if (enabled) {
                const patternIssues = pattern.detect(context);
                issues.push(...patternIssues);
            }
        }
        return issues;
    }
    /**
     * Create analysis context
     */
    createContext(filePath, sourceCode, config) {
        return {
            sourceCode,
            filePath,
            language: this.detectLanguage(filePath),
            config,
        };
    }
    /**
     * Detect file language
     */
    detectLanguage(filePath) {
        if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
            return 'jsx';
        }
        if (filePath.endsWith('.html')) {
            return 'html';
        }
        if (filePath.endsWith('.vue')) {
            return 'vue';
        }
        return 'html';
    }
    /**
   * Apply fixes to source code using AST
   */
    applyFixes(sourceCode, issues) {
        // Parse HTML fresh
        const ast = (0, ast_helpers_1.parseHTML)(sourceCode);
        // Group issues by pattern
        const modernFormatIssues = issues.filter(i => i.patternId === 'modern-formats');
        console.log(`Applying ${modernFormatIssues.length} modern format fixes...`);
        // Find all images in the fresh AST
        const allImages = (0, ast_helpers_1.findAllImages)(ast);
        console.log(`Found ${allImages.length} images in AST`);
        // Apply modern format fixes by matching positions
        for (const issue of modernFormatIssues) {
            // Find the image element at this position in the new AST
            const imgElement = allImages.find(img => {
                const loc = (0, ast_helpers_1.getLocation)(img);
                return loc &&
                    loc.line === issue.location.startLine &&
                    loc.column === issue.location.startColumn;
            });
            if (imgElement) {
                const src = (0, ast_helpers_1.getAttribute)(imgElement, 'src');
                if (src) {
                    console.log(`Fixing image at line ${issue.location.startLine}: ${src}`);
                    // Create WebP source URL
                    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    // Create <source> element
                    const sourceElement = (0, ast_helpers_1.createElement)('source', [
                        { name: 'srcset', value: webpSrc },
                        { name: 'type', value: 'image/webp' },
                    ]);
                    // Wrap img in picture and add source
                    const picture = (0, ast_helpers_1.wrapElement)(ast, imgElement, 'picture');
                    if (picture && picture.childNodes) {
                        // Insert source before img
                        picture.childNodes.unshift(sourceElement);
                        console.log(`Created picture element for ${src}`);
                    }
                }
            }
            else {
                console.log(`Could not find image at line ${issue.location.startLine}`);
            }
        }
        // Serialize back to HTML
        return (0, ast_helpers_1.serializeHTML)(ast);
    }
}
exports.GreenLintEngine = GreenLintEngine;
//# sourceMappingURL=engine.js.map