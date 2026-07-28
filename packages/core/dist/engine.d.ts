import { Pattern, Issue, UserConfig } from './types';
/**
 * A targeted source-offset edit: replace source[start, end) with text (a
 * point insertion has start === end).
 */
export interface Edit {
    start: number;
    end: number;
    text: string;
}
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
     * Compute targeted source-offset edits for a fix, without applying them
     * or replacing the whole document. Only JSX/TSX is supported today -
     * HTML fixes still require the mutate-and-reserialize approach in
     * `applyHTMLFixes` (no offset-based edit list is computed for it), so
     * this returns an empty array for HTML: callers should fall back to
     * `applyFixes` in that case.
     */
    computeEdits(filePath: string, sourceCode: string, issues: Issue[]): Edit[];
    /**
     * Build the JSX/TSX edit list from Babel node offsets. Offsets are all
     * computed against the original (untouched) source. Returned sorted
     * highest-start-first, so that applying them sequentially - or any
     * subset of them, in this order - never invalidates an earlier
     * (smaller) offset.
     */
    private computeJSXEdits;
    /**
     * Apply fixes to JSX/TSX source via targeted text splices, rather than
     * mutating and re-serializing the whole AST (which would require a
     * JSX-aware code generator and risks reformatting code well outside the
     * fix itself).
     */
    private applyJSXFixes;
    private applyHTMLFixes;
}
//# sourceMappingURL=engine.d.ts.map