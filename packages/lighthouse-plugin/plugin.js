/**
 * Green Lint - Lighthouse Plugin
 * 
 * Extends Lighthouse with green software patterns audits
 */

module.exports = {
  // Plugin metadata
  audits: [
    { path: 'lighthouse-plugin-green-lint/audits/lazy-loading-actual.js' },
    { path: 'lighthouse-plugin-green-lint/audits/modern-formats-actual.js' },
    { path: 'lighthouse-plugin-green-lint/audits/third-party-energy.js' },
    { path: 'lighthouse-plugin-green-lint/audits/excessive-dom-actual.js' },
  ],

  // Custom category in Lighthouse report
  category: {
    title: 'Green Software',
    auditRefs: [
      { id: 'lazy-loading-actual', weight: 3 },
      { id: 'modern-formats-actual', weight: 2 },
      { id: 'third-party-energy', weight: 3 },
      // Weight 1: matches this pattern's 'low' energy-impact rating in the
      // core engine, the lowest of the three (lazy-loading is 'high',
      // modern-formats is 'medium').
      { id: 'excessive-dom-actual', weight: 1 },
    ],
  },
};