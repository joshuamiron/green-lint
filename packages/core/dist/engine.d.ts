import { Pattern, Issue, UserConfig } from './types';
/**
 * Main analysis engine
 */
export declare class GreenLintEngine {
    private patterns;
    constructor();
    /**
     * Register a pattern
     */
    registerPattern(pattern: Pattern): void;
    /**
     * Analyze a file
     */
    analyzeFile(filePath: string, sourceCode: string, config?: UserConfig): Promise<Issue[]>;
    /**
     * Create analysis context
     */
    private createContext;
    /**
     * Detect file language
     */
    private detectLanguage;
    /**
    * Apply fixes to source code using AST
    */
    applyFixes(sourceCode: string, issues: Issue[]): Promise<string>;
}
//# sourceMappingURL=engine.d.ts.map