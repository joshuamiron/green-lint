const Audit = require('lighthouse').Audit;

/**
 * Audit: Excessive DOM size
 *
 * Runtime counterpart to green-lint's static excessive-dom pattern. Uses
 * Lighthouse's built-in DOMStats artifact to measure the real, rendered
 * element count - this catches DOM bloat from client-side rendering that
 * static source analysis can't see (and vice versa: it can't see
 * unnecessary wrapper elements the way the static check can, since there's
 * no built-in artifact for that).
 *
 * Deliberately does not duplicate Lighthouse core's own "dom-size" audit,
 * which scores against HTTP Archive percentiles. This uses the same
 * maxDOMNodes default (1500) as green-lint's CLI/extension checks, so the
 * threshold is consistent across all three surfaces.
 */
class ExcessiveDomActualAudit extends Audit {
  static get meta() {
    return {
      id: 'excessive-dom-actual',
      title: 'Avoids an excessive DOM size',
      failureTitle: 'DOM size is excessive',
      description: 'A large DOM increases memory usage and can slow down style and layout calculations. ' +
                   'Measured via the real, rendered element count.',

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
