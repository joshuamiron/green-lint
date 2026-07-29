const Audit = require('lighthouse').Audit;

/**
 * Audit: Excessive DOM size
 *
 * Runtime counterpart to green-lint's "Avoid Excessive DOM Size" pattern
 * (packages/core/src/patterns/excessive-dom.ts). Title matches the core
 * pattern's name for traceability across the CLI, VS Code extension, and
 * this Lighthouse audit - deliberately NOT "Avoids an excessive DOM size"
 * (Lighthouse core's own built-in "dom-size" audit uses that exact title,
 * which produced two identically-titled rows in the same report).
 *
 * Uses Lighthouse's built-in DOMStats artifact to measure the real,
 * rendered TOTAL element count only - this catches DOM bloat from
 * client-side rendering that static source analysis can't see. It does
 * NOT detect unnecessary wrapper elements the way the CLI/VS Code
 * extension's static check does, since Lighthouse has no built-in
 * artifact for that; the description below says so explicitly.
 *
 * Deliberately does not duplicate Lighthouse core's own "dom-size" audit,
 * which scores against HTTP Archive percentiles. This uses the same
 * maxDOMNodes default (1500) as green-lint's CLI/extension checks, so the
 * threshold is consistent across all three surfaces.
 *
 * Study measurement (Miron, 2026): 7.6% CPU reduction from simplifying
 * DOM structure, but not statistically significant (p=0.162, n=10) -
 * stated as such below rather than as a claimed improvement.
 */
class ExcessiveDomActualAudit extends Audit {
  static get meta() {
    return {
      id: 'excessive-dom-actual',
      title: 'Avoid Excessive DOM Size',
      failureTitle: 'Avoid Excessive DOM Size',
      description: 'A large DOM increases memory usage and can slow down style and layout calculations. ' +
                   'This measures the real, rendered total element count only - it does not detect unnecessary ' +
                   'wrapper elements the way the CLI/VS Code extension do, since Lighthouse has no built-in artifact ' +
                   'for that. A controlled study (Miron, 2026) measured a 7.6% CPU reduction from simplifying DOM ' +
                   'structure, but this was not statistically significant (p=0.162, n=10).',

      requiredArtifacts: ['DOMStats'],
    };
  }

  static audit(artifacts) {
    const stats = artifacts.DOMStats;
    const totalElements = stats.totalBodyElements;
    const maxNodes = 1500;

    // Score based on how far over the threshold the page is.
    // <=1500 = Good (score 1), 1500-3000 = Moderate (score 0.5), 3000+ = Poor (score 0)
    let score = 1;
    if (totalElements > maxNodes * 2) score = 0;
    else if (totalElements > maxNodes) score = 0.5;

    const passed = totalElements <= maxNodes;

    return {
      score,
      numericValue: totalElements,
      numericUnit: 'element',
      displayValue: passed
        ? `${totalElements} DOM elements`
        : `${totalElements} DOM elements (recommended: <${maxNodes})`,

      details: {
        type: 'table',
        headings: [
          { key: 'statistic', itemType: 'text', text: 'Statistic' },
          { key: 'value', itemType: 'numeric', text: 'Value' },
        ],
        items: [
          { statistic: 'Total DOM Elements', value: totalElements },
          { statistic: 'Maximum DOM Depth', value: stats.depth.max },
          { statistic: 'Maximum Child Elements', value: stats.width.max },
        ],
      },
    };
  }
}

module.exports = ExcessiveDomActualAudit;
