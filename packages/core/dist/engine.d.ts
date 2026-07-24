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
    applyFixes(filePath: string, sourceCode: string, issues: Issue[]): Promise<string>;
    /**
     * Compute a WebP replacement for a legacy-format image src.
     */
    private computeWebPSrc;
    /**
     * Apply fixes to JSX/TSX source via targeted text splices computed from
     * Babel node offsets, rather than mutating and re-serializing the whole
     * AST (which would require a JSX-aware code generator and risks
     * reformatting code well outside the fix itself).
     */
    private applyJSXFixes;
    private applyHTMLFixes;
}
//# sourceMappingURL=engine.d.ts.map