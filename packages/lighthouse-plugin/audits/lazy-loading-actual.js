const Audit = require('lighthouse').Audit;

/**
 * Audit: Check if offscreen images actually use lazy loading
 * 
 * Unlike static analysis, this checks the ACTUAL rendered page
 */
class LazyLoadingActualAudit extends Audit {
  static get meta() {
    return {
      id: 'lazy-loading-actual',
      title: 'Offscreen images use lazy loading',
      failureTitle: 'Offscreen images should use lazy loading',
      description: 'Images below the fold should have loading="lazy" to reduce initial network transfer. ' +
                   'Based on research showing 88% network reduction (p<0.01).',
      
      // Link to your dissertation!
      helpText: 'Learn more about [lazy loading energy impact](https://your-dissertation.com/lazy-loading)',
      
      requiredArtifacts: ['ImageElements', 'ViewportDimensions'],
    };
  }
  
  static audit(artifacts) {
    const images = artifacts.ImageElements;
    const viewport = artifacts.ViewportDimensions;
    
    // Find images below the fold without loading="lazy"
    const offscreenImages = images.filter(img => {
      const rect = img.clientRect;
      const isOffscreen = rect.top > viewport.innerHeight;
      const hasLazyLoading = img.loading === 'lazy';
      
      return isOffscreen && !hasLazyLoading;
    });
    
    // Calculate energy impact based on your research
    const totalImageSize = offscreenImages.reduce((sum, img) => {
      return sum + (img.resourceSize || 0);
    }, 0);
    
    const energySavings = totalImageSize * 0.88; // 88% from your research
    const energySavingsKB = (energySavings / 1024).toFixed(0);
    
    // Pass/fail
    const passed = offscreenImages.length === 0;
    
    return {
      score: passed ? 1 : 0,
      numericValue: offscreenImages.length,
      numericUnit: 'element',
      displayValue: passed 
        ? 'All offscreen images use lazy loading'
        : `${offscreenImages.length} offscreen images without lazy loading (potential savings: ${energySavingsKB} KB)`,
      
      details: {
        type: 'table',
        headings: [
          { key: 'url', itemType: 'url', text: 'Image' },
          { key: 'position', itemType: 'text', text: 'Position' },
          { key: 'size', itemType: 'bytes', text: 'Size' },
          { key: 'energy', itemType: 'text', text: 'Energy Impact' },
        ],
        items: offscreenImages.map(img => ({
          url: img.src,
          position: `${img.clientRect.top}px from top`,
          size: img.resourceSize || 0,
          energy: 'High (88% reduction possible)',
        })),
      },
    };
  }
}

module.exports = LazyLoadingActualAudit;