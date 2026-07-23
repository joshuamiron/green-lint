/**
 * Represents a detected green software issue
 */
export interface Issue {
  id: string;                    // Unique issue ID
  patternId: string;             // Which pattern detected this
  severity: 'error' | 'warning' | 'info';
  message: string;               // Human-readable description
  
  // Location in source code
  location: {
    file: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  
  // Energy impact data (Empirical evidence from the underlying study)
  energyImpact: {
    level: 'high' | 'medium' | 'low';
    metric: string;              // e.g., "Reduces network transfer for offscreen images"
    source: string;              // Citation to the underlying study
  };
  
  // The problematic code
  snippet: string;
  
  // Available fixes
  fixes: Fix[];
}

/**
 * Represents an automatic fix
 */
export interface Fix {
  id: string;
  description: string;           // e.g., "Add loading='lazy' attribute"
  isPreferred: boolean;          // Mark the recommended fix
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
  newText: string;               // Replacement text
}

/**
 * Pattern category type
 */
export type PatternCategory = 
  | 'images'
  | 'dom'
  | 'assets'
  | 'network'
  | 'performance';

/**
 * A green software pattern
 */
export interface Pattern {
  id: string;                    // e.g., 'lazy-loading'
  name: string;                  // e.g., 'Defer Offscreen Images'
  category: PatternCategory;
  description: string;
  
  // Empirical evidence from the underlying study
  research: {
    measuredNetworkReduction?: string; // e.g., "88% (measured under study conditions)"
    measuredCpuImpact?: string;        // e.g., "+20% (measured under study conditions)"
    pValue?: number;             // e.g., 0.008
    sampleSize?: number;         // e.g., 5
    citation?: string;           // Reference to the underlying study
  };
  
  // Detection logic
  detect: (context: AnalysisContext) => Issue[];
  
  // Fix generation
  generateFixes?: (issue: Issue) => Fix[];
}

/**
 * Context provided to pattern detectors
 */
export interface AnalysisContext {
  // Source code
  sourceCode: string;
  filePath: string;
  language: 'html' | 'jsx' | 'tsx' | 'vue';
  
  // Parsed representations
  ast?: any;                     // Abstract Syntax Tree
  dom?: DOMNode[];              // DOM tree (for HTML)
  
  // Project context
  projectRoot?: string;
  config?: UserConfig;
  
  // Runtime analysis (optional, for advanced patterns)
  runtimeData?: {
    viewportHeight?: number;
    imagePositions?: Map<string, number>;  // Distance from top
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
  
  // Thresholds
  thresholds?: {
    maxDOMNodes?: number;        // Default: 1500
    maxDOMDepth?: number;        // Default: 10
    lazyLoadThreshold?: number;  // Number of initial images to skip, default: 1
  };
  
  // Auto-fix preferences
  autoFix?: {
    enabled: boolean;
    confirmBeforeFix?: boolean;
    patterns?: string[];         // Which patterns to auto-fix
  };
}

/**
 * Simplified DOM representation
 */
export interface DOMNode {
  type: 'element' | 'text';
  tag?: string;                  // e.g., 'img', 'div'
  attributes?: Record<string, string>;
  children?: DOMNode[];
  position: {
    line: number;
    column: number;
  };
}