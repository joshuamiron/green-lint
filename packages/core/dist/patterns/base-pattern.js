"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePattern = void 0;
/**
 * Base class for all patterns
 */
class BasePattern {
    /**
     * Helper: Create an issue
     */
    createIssue(context, location, message, energyImpact, fixes) {
        return {
            id: `${this.id}-${Date.now()}`,
            patternId: this.id,
            severity: this.getSeverity(energyImpact.level),
            message,
            location,
            energyImpact,
            snippet: this.extractSnippet(context.sourceCode, location),
            fixes: fixes || [],
        };
    }
    /**
     * Extract code snippet
     */
    extractSnippet(sourceCode, location) {
        const lines = sourceCode.split('\n');
        const snippetLines = lines.slice(location.startLine - 1, location.endLine);
        return snippetLines.join('\n');
    }
    /**
     * Map energy impact to severity
     */
    getSeverity(level) {
        switch (level) {
            case 'high': return 'warning';
            case 'medium': return 'warning';
            case 'low': return 'info';
        }
    }
}
exports.BasePattern = BasePattern;
//# sourceMappingURL=base-pattern.js.map