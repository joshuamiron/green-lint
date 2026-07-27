import { BasePattern } from './base-pattern';
import { AnalysisContext, Issue, DOMNode } from '../types';
import {
  parseHTML,
  getLocation,
  buildDOMTreeFromHTML,
  findUnnecessaryDivWrappers,
} from '../utils/ast-helpers';
import {
  parseJSX,
  getJSXLocation,
  buildDOMTreeFromJSX,
  findUnnecessaryJSXDivWrappers,
} from '../utils/jsx-ast-helpers';

/**
 * Pattern: Avoid Excessive DOM Size
 */
export class ExcessiveDOMPattern extends BasePattern {
  id = 'excessive-dom';
  name = 'Avoid Excessive DOM Size';
  category = 'dom' as const;
  description = 'Reduce DOM complexity by removing unnecessary wrapper elements';

  research = {
    cpuImpact: '7.6% reduction (study conditions)',
    cpuPValue: '0.162 (not statistically significant)',
    sampleSize: 10,
    citation: 'Miron, "Developing a Framework for Retroactively Applying Green Software Engineering Patterns to React Applications", Section 5.2, 2026',
  };

  detect(context: AnalysisContext): Issue[] {
    if (context.language === 'jsx' || context.language === 'tsx') {
      return this.detectJSX(context);
    }
    return this.detectHTML(context);
  }

  private detectHTML(context: AnalysisContext): Issue[] {
    const issues: Issue[] = [];

    const ast = parseHTML(context.sourceCode);
    const domTree = buildDOMTreeFromHTML(ast);

    issues.push(...this.detectTotalNodes(context, domTree));

    for (const wrapper of findUnnecessaryDivWrappers(ast)) {
      const location = getLocation(wrapper);
      if (location) {
        issues.push(this.createWrapperIssue(context, location));
      }
    }

    return issues;
  }

  private detectJSX(context: AnalysisContext): Issue[] {
    const issues: Issue[] = [];

    const ast = parseJSX(context.sourceCode, context.language === 'tsx');
    const domTree = buildDOMTreeFromJSX(ast);

    issues.push(...this.detectTotalNodes(context, domTree));

    for (const wrapper of findUnnecessaryJSXDivWrappers(ast)) {
      const location = getJSXLocation(wrapper.openingElement);
      if (location) {
        issues.push(this.createWrapperIssue(context, location));
      }
    }

    return issues;
  }

  /**
   * Flag the file itself if its DOM tree exceeds the configured threshold.
   * There's no automatic fix for this - reducing complexity requires
   * human judgment - so no `fixes` are attached.
   */
  private detectTotalNodes(context: AnalysisContext, domTree: DOMNode[]): Issue[] {
    const totalNodes = this.countNodes(domTree);
    const maxNodes = context.config?.thresholds?.maxDOMNodes || 1500;

    if (totalNodes <= maxNodes) {
      return [];
    }

    return [
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
          level: 'low',
          metric: 'Minimal CPU impact for static content',
          source: this.research.citation,
        }
      ),
    ];
  }

  /**
   * Informational only - deliberately no auto-fix. A div that looks like a
   * redundant single-child wrapper from markup alone may still be doing
   * real work (a CSS Grid/Flexbox container, a styling/JS hook) that isn't
   * visible without also checking the stylesheet and script.
   */
  private createWrapperIssue(
    context: AnalysisContext,
    location: { line: number; column: number }
  ): Issue {
    return this.createIssue(
      context,
      {
        file: context.filePath,
        startLine: location.line,
        startColumn: location.column,
        endLine: location.line,
        endColumn: location.column + 4, // length of "<div"
      },
      `Wrapper element contains only one child and may be removable. It is not removed automatically, as it could carry styling or scripting the linter cannot detect.`,
      {
        level: 'low',
        metric: 'Improves maintainability, minimal energy impact',
        source: this.research.citation,
      }
    );
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
}
