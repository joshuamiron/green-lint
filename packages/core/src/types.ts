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
  
  // Energy impact data (from your research!)
  energyImpact: {
    level: 'high' | 'medium' | 'low';
    metric: string;              // e.g., "88% network reduction"
    estimatedSavings?: string;   // e.g., "100 mJ per page load"
    source: string;              // Citation to your research
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
 * Pattern category type - DEFINE THIS FIRST
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
  
  // Your research data
  research: {
    networkSavings?: string;     // e.g., "88%"
    cpuImpact?: string;          // e.g., "+20%"
    totalEnergySavings?: string; // e.g., "19.6%"
    pValue?: number;             // e.g., 0.008
    sampleSize?: number;         // e.g., 5
    citation?: string;           // Link to your dissertation section
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
    lazyLoadThreshold?: number;  // Pixels from top: 1000
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