/**
 * Represents a detected green software issue
 */
export interface Issue {
    id: string;
    patternId: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    location: {
        file: string;
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
    };
    energyImpact: {
        level: 'high' | 'medium' | 'low';
        metric: string;
        estimatedSavings?: string;
        source: string;
    };
    snippet: string;
    fixes: Fix[];
}
/**
 * Represents an automatic fix
 */
export interface Fix {
    id: string;
    description: string;
    isPreferred: boolean;
    changes: CodeChange[];
}
/**
 * A single code modification
 */
export interface CodeChange {
    file: string;
    range: {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
    };
    newText: string;
}
/**
 * Pattern category type - DEFINE THIS FIRST
 */
export type PatternCategory = 'images' | 'dom' | 'assets' | 'network' | 'performance';
/**
 * A green software pattern
 */
export interface Pattern {
    id: string;
    name: string;
    category: PatternCategory;
    description: string;
    research: {
        networkSavings?: string;
        cpuImpact?: string;
        totalEnergySavings?: string;
        pValue?: number;
        sampleSize?: number;
        citation?: string;
    };
    detect: (context: AnalysisContext) => Issue[];
    generateFixes?: (issue: Issue) => Fix[];
}
/**
 * Context provided to pattern detectors
 */
export interface AnalysisContext {
    sourceCode: string;
    filePath: string;
    language: 'html' | 'jsx' | 'tsx' | 'vue';
    ast?: any;
    dom?: DOMNode[];
    projectRoot?: string;
    config?: UserConfig;
    runtimeData?: {
        viewportHeight?: number;
        imagePositions?: Map<string, number>;
    };
}
/**
 * User configuration
 */
export interface UserConfig {
    patterns: {
        [patternId: string]: {
            enabled: boolean;
            severity?: 'error' | 'warning' | 'info';
            options?: Record<string, any>;
        };
    };
    thresholds?: {
        maxDOMNodes?: number;
        maxDOMDepth?: number;
        lazyLoadThreshold?: number;
    };
    autoFix?: {
        enabled: boolean;
        confirmBeforeFix?: boolean;
        patterns?: string[];
    };
}
/**
 * Simplified DOM representation
 */
export interface DOMNode {
    type: 'element' | 'text';
    tag?: string;
    attributes?: Record<string, string>;
    children?: DOMNode[];
    position: {
        line: number;
        column: number;
    };
}
//# sourceMappingURL=types.d.ts.map