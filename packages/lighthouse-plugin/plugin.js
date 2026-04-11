/**
 * Green Lint - Lighthouse Plugin
 * 
 * Extends Lighthouse with energy-focused audits based on dissertation research
 */

module.exports = {
  // Plugin metadata
  name: 'green-lint',
  category: 'green-software',
  title: 'Green Software Patterns',
  description: 'Energy efficiency audits based on empirical research',
  
  // Custom audits
  audits: [
    { path: 'green-lint/audits/lazy-loading-actual.js' },
    { path: 'green-lint/audits/modern-formats-actual.js' },
    { path: 'green-lint/audits/dom-complexity-runtime.js' },
    { path: 'green-lint/audits/third-party-energy.js' },
    { path: 'green-lint/audits/cache-effectiveness.js' },
  ],
  
  // Custom category in Lighthouse report
  category: {
    title: 'Green Software',
    description: 'Energy efficiency patterns validated through empirical testing',
    auditRefs: [
      { id: 'lazy-loading-actual', weight: 3 },
      { id: 'modern-formats-actual', weight: 2 },
      { id: 'dom-complexity-runtime', weight: 1 },
      { id: 'third-party-energy', weight: 3 },
      { id: 'cache-effectiveness', weight: 3 },
    ],
  },
};