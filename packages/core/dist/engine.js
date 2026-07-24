"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenLintEngine = void 0;
const lazy_loading_1 = require("./patterns/lazy-loading");
const modern_formats_1 = require("./patterns/modern-formats");
const excessive_dom_1 = require("./patterns/excessive-dom");
const ast_helpers_1 = require("./utils/ast-helpers");
const jsx_ast_helpers_1 = require("./utils/jsx-ast-helpers");
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
        if (filePath.endsWith('.tsx')) {
            return 'tsx';
        }
        if (filePath.endsWith('.jsx')) {
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
    async applyFixes(filePath, sourceCode, issues) {
        const language = this.detectLanguage(filePath);
        if (language === 'jsx' || language === 'tsx') {
            return this.applyJSXFixes(sourceCode, issues, language === 'tsx');
        }
        return this.applyHTMLFixes(sourceCode, issues);
    }
    /**
     * Compute a WebP replacement for a legacy-format image src.
     */
    computeWebPSrc(src) {
        if (src.includes('unsplash.com')) {
            return src.replace(/[&?]fm=jpg/, '&fm=webp');
        }
        return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    /**
     * Apply fixes to JSX/TSX source via targeted text splices computed from
     * Babel node offsets, rather than mutating and re-serializing the whole
     * AST (which would require a JSX-aware code generator and risks
     * reformatting code well outside the fix itself).
     */
    applyJSXFixes(sourceCode, issues, isTypeScript) {
        const ast = (0, jsx_ast_helpers_1.parseJSX)(sourceCode, isTypeScript);
        const allImages = (0, jsx_ast_helpers_1.findAllJSXImages)(ast);
        const lazyLoadingIssues = issues.filter(i => i.patternId === 'lazy-loading');
        const modernFormatIssues = issues.filter(i => i.patternId === 'modern-formats');
        const findImage = (issue) => allImages.find(img => {
            const loc = (0, jsx_ast_helpers_1.getJSXLocation)(img.openingElement);
            return loc &&
                loc.line === issue.location.startLine &&
                loc.column === issue.location.startColumn;
        });
        // Each splice is applied at a fixed source offset. Since offsets are all
        // computed against the original (untouched) source, applying them from
        // the highest offset down keeps every earlier offset valid.
        const splices = [];
        for (const issue of lazyLoadingIssues) {
            const img = findImage(issue);
            if (img) {
                splices.push({
                    offset: (0, jsx_ast_helpers_1.jsxOpeningTagInsertionOffset)(img.openingElement),
                    text: ' loading="lazy"',
                });
            }
        }
        for (const issue of modernFormatIssues) {
            const img = findImage(issue);
            if (img) {
                const src = (0, jsx_ast_helpers_1.getJSXAttribute)(img.openingElement, 'src');
                if (src) {
                    const webpSrc = this.computeWebPSrc(src);
                    splices.push({
                        offset: img.element.start,
                        text: `<picture><source srcSet="${webpSrc}" type="image/webp" />`,
                    });
                    splices.push({ offset: img.element.end, text: '</picture>' });
                }
            }
        }
        splices.sort((a, b) => b.offset - a.offset);
        let result = sourceCode;
        for (const splice of splices) {
            result = result.slice(0, splice.offset) + splice.text + result.slice(splice.offset);
        }
        return result;
    }
    async applyHTMLFixes(sourceCode, issues) {
        // Parse HTML fresh
        const ast = (0, ast_helpers_1.parseHTML)(sourceCode);
        // Group issues by pattern
        const modernFormatIssues = issues.filter(i => i.patternId === 'modern-formats');
        const lazyLoadingIssues = issues.filter(i => i.patternId === 'lazy-loading');
        console.log(`Applying ${lazyLoadingIssues.length} lazy loading fixes...`);
        console.log(`Applying ${modernFormatIssues.length} modern format fixes...`);
        // Find all images in the fresh AST
        const allImages = (0, ast_helpers_1.findAllImages)(ast);
        console.log(`Found ${allImages.length} images in AST`);
        // STEP 1: Apply lazy loading fixes FIRST (before wrapping in picture)
        for (const issue of lazyLoadingIssues) {
            const imgElement = allImages.find(img => {
                const loc = (0, ast_helpers_1.getLocation)(img);
                return loc &&
                    loc.line === issue.location.startLine &&
                    loc.column === issue.location.startColumn;
            });
            if (imgElement) {
                const src = (0, ast_helpers_1.getAttribute)(imgElement, 'src');
                console.log(`Adding lazy loading at line ${issue.location.startLine}: ${src}`);
                // Add loading="lazy" attribute
                (0, ast_helpers_1.setAttribute)(imgElement, 'loading', 'lazy');
            }
            else {
                console.log(`Could not find image at line ${issue.location.startLine} for lazy loading`);
            }
        }
        // STEP 2: Apply modern format fixes (wraps elements in picture)
        for (const issue of modernFormatIssues) {
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
                    let webpSrc;
                    if (src.includes('unsplash.com')) {
                        webpSrc = src.replace(/[&?]fm=jpg/, '&fm=webp');
                    }
                    else {
                        webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    }
                    // Create <source> element
                    const sourceElement = (0, ast_helpers_1.createElement)('source', [
                        { name: 'srcset', value: webpSrc },
                        { name: 'type', value: 'image/webp' },
                    ]);
                    // Wrap img in picture and add source
                    const picture = (0, ast_helpers_1.wrapElement)(ast, imgElement, 'picture');
                    if (picture && picture.childNodes) {
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
        return await (0, ast_helpers_1.serializeHTML)(ast); // ADD await
    }
}
exports.GreenLintEngine = GreenLintEngine;
//# sourceMappingURL=engine.js.map