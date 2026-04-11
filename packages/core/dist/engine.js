"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenLintEngine = void 0;
const lazy_loading_1 = require("./patterns/lazy-loading");
const modern_formats_1 = require("./patterns/modern-formats");
const excessive_dom_1 = require("./patterns/excessive-dom");
/**
 * Main analysis engine
 */
class GreenLintEngine {
    constructor() {
        this.patterns = new Map();
        // Register all patterns
        this.registerPattern(new lazy_loading_1.LazyLoadingPattern());
        this.registerPattern(new modern_formats_1.ModernFormatsPattern());
        this.registerPattern(new excessive_dom_1.ExcessiveDOMPattern());
        // ... register remaining 10 patterns
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
            // AST/DOM would be parsed here in real implementation
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
        return 'html'; // Default
    }
    /**
     * Apply fixes to source code
     */
    applyFixes(sourceCode, issues) {
        let modifiedCode = sourceCode;
        // Sort issues by position (apply from end to start to preserve positions)
        const sortedIssues = issues.sort((a, b) => {
            return b.location.startLine - a.location.startLine;
        });
        for (const issue of sortedIssues) {
            const preferredFix = issue.fixes.find(f => f.isPreferred) || issue.fixes[0];
            if (preferredFix) {
                for (const change of preferredFix.changes) {
                    modifiedCode = this.applyChange(modifiedCode, change);
                }
            }
        }
        return modifiedCode;
    }
    /**
     * Apply a single code change
     */
    applyChange(sourceCode, change) {
        const lines = sourceCode.split('\n');
        // Replace the specified range
        const startLine = change.range.startLine - 1;
        const endLine = change.range.endLine - 1;
        const before = lines.slice(0, startLine);
        const after = lines.slice(endLine + 1);
        return [
            ...before,
            change.newText,
            ...after,
        ].join('\n');
    }
}
exports.GreenLintEngine = GreenLintEngine;
//# sourceMappingURL=engine.js.map