import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue, Fix, DOMNode } from '../types';

/**
 * Pattern: Avoid Excessive DOM Size
 * 
 * Based on research showing minimal CPU impact for static content,
 * but still a best practice for maintainability
 */
export class ExcessiveDOMPattern extends BasePattern {
  id = 'excessive-dom';
  name = 'Avoid Excessive DOM Size';
  category = 'dom' as const;
  description = 'Reduce DOM complexity by removing unnecessary wrapper elements';
  
  research = {
    cpuImpact: '-7.6% (not significant, p=0.162)',
    sampleSize: 10,
    citation: 'Your Dissertation, Section 4.2.2',
  };
  
  detect(context: AnalysisContext): Issue[] {
    const issues: Issue[] = [];
    
    // Build DOM tree
    const domTree = this.buildDOMTree(context);
    
    // Count total nodes
    const totalNodes = this.countNodes(domTree);
    const maxNodes = context.config?.thresholds?.maxDOMNodes || 1500;
    
    if (totalNodes > maxNodes) {
      // Flag the file itself
      issues.push(
        this.createIssue(
          context,
          {
            file: context.filePath,
            startLine: 1,
            startColumn: 0,
            endLine: 1,
            endColumn: 0,
          },
          `DOM has ${totalNodes} nodes (recommended: <${maxNodes})`,
          {
            level: 'low',  // Your research showed minimal energy impact!
            metric: 'Minimal CPU impact for static content',
            source: this.research.citation,
          }
        )
      );
    }
    
    // Find unnecessary wrappers
    const unnecessaryWrappers = this.findUnnecessaryWrappers(domTree);
    
    for (const wrapper of unnecessaryWrappers) {
      issues.push(
        this.createIssue(
          context,
          wrapper.location,
          `Unnecessary wrapper element (contains only one child)`,
          {
            level: 'low',
            metric: 'Improves maintainability, minimal energy impact',
            source: this.research.citation,
          },
          this.generateWrapperFixes(wrapper)
        )
      );
    }
    
    return issues;
  }
  
  /**
   * Build simplified DOM tree
   */
  private buildDOMTree(context: AnalysisContext): DOMNode[] {
    // Simplified - real version would use proper HTML/JSX parser
    // For now, return empty array
    return [];
  }
  
  /**
   * Count total DOM nodes
   */
  private countNodes(tree: DOMNode[]): number {
    let count = 0;
    
    function traverse(nodes: DOMNode[]) {
      for (const node of nodes) {
        count++;
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    
    traverse(tree);
    return count;
  }
  
  /**
   * Find wrapper divs that serve no purpose
   */
  private findUnnecessaryWrappers(tree: DOMNode[]): Array<{
    node: DOMNode;
    location: Issue['location'];
  }> {
    const wrappers: Array<{ node: DOMNode; location: Issue['location'] }> = [];
    
    // Use arrow function to preserve 'this' context
    const traverse = (nodes: DOMNode[], filePath: string) => {
      for (const node of nodes) {
        // Check if this is a wrapper div with:
        // 1. No attributes (or only className/style)
        // 2. Exactly one child
        // 3. Child is another element
        if (
          node.type === 'element' &&
          node.tag === 'div' &&
          node.children?.length === 1 &&
          node.children[0].type === 'element' &&
          this.hasNoSignificantAttributes(node)
        ) {
          wrappers.push({
            node,
            location: {
              file: filePath,
              startLine: node.position.line,
              startColumn: node.position.column,
              endLine: node.position.line,  // Simplified
              endColumn: 0,
            },
          });
        }
        
        if (node.children) {
          traverse(node.children, filePath);
        }
      }
    };
    
    // traverse(tree, context.filePath);
    return wrappers;
  }
  
  /**
   * Check if element has no significant attributes
   */
  private hasNoSignificantAttributes(node: DOMNode): boolean {
    if (!node.attributes) return true;
    
    const insignificantAttrs = new Set(['className', 'class', 'style']);
    const attrs = Object.keys(node.attributes);
    
    return attrs.every(attr => insignificantAttrs.has(attr));
  }
  
  /**
   * Generate fixes for wrapper removal
   */
  private generateWrapperFixes(wrapper: any): Fix[] {
    return [
      {
        id: 'remove-wrapper',
        description: 'Remove unnecessary wrapper element',
        isPreferred: true,
        changes: [
          // Would generate code to unwrap the element
          // Simplified for now
        ],
      },
    ];
  }
}