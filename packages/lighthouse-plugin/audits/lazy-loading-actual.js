const Audit = require('lighthouse').Audit;

/**
 * Audit: Check if offscreen images use lazy loading
 *
 * Based on study measurement: 88% network reduction under test conditions (p=0.008, n=5)
 *
 * This audit checks ACTUAL viewport positions (impossible in static analysis!)
 */
class LazyLoadingActualAudit extends Audit {
  static get meta() {
    return {
      id: 'lazy-loading-actual',
      title: 'Offscreen images use lazy loading',
      failureTitle: 'Offscreen images should use lazy loading',
      description: 'Deferring offscreen images reduces network transfer during page load.',

      helpText: 'A controlled study measured an 88% network reduction for offscreen images under test conditions ' +
                '(p=0.008, n=5). Actual savings depend on the number and size of offscreen images.',

      requiredArtifacts: ['ImageElements', 'ViewportDimensions'],
    };
  }
  
  static audit(artifacts) {
    const images = artifacts.ImageElements;
    const viewport = artifacts.ViewportDimensions;
    
    if (!images || !viewport) {
      return {
        score: null,
        notApplicable: true,
      };
    }
    
    console.log(`Viewport height: ${viewport.innerHeight}px`);
    console.log(`Total images: ${images.length}`);
    
    // Find images below the fold without lazy loading
    const offscreenImages = [];
    let firstImageSkipped = false;
    
    for (const img of images) {
      const rect = img.clientRect || {};
      const imgTop = rect.top || 0;
      
      // Skip first image (hero) - matches CLI behavior
      if (!firstImageSkipped) {
        firstImageSkipped = true;
        console.log(`Skipping first image (hero): ${img.src}`);
        continue;
      }
      
      const isOffscreen = imgTop > viewport.innerHeight;
      const hasLazyLoading = img.loading === 'lazy';
      
      console.log(`Image: ${img.src}, top: ${imgTop}px, offscreen: ${isOffscreen}, lazy: ${hasLazyLoading}`);
      
      if (isOffscreen && !hasLazyLoading) {
        offscreenImages.push({
          img,
          position: imgTop,
        });
      }
    }
    
    console.log(`Found ${offscreenImages.length} offscreen images without lazy loading`);
    
    // Calculate energy impact
    const totalImageSize = offscreenImages.reduce((sum, { img }) => {
      return sum + (img.resourceSize || 0);
    }, 0);
    
    const deferredBytes = totalImageSize;
    const deferredKB = (deferredBytes / 1024).toFixed(0);
    
    // Pass/fail
    const passed = offscreenImages.length === 0;
    const score = passed ? 1 : Math.max(0, 1 - (offscreenImages.length / images.length));
    
    return {
      score,
      numericValue: offscreenImages.length,
      numericUnit: 'element',
      displayValue: passed 
        ? 'All offscreen images use lazy loading'
        : `${offscreenImages.length} offscreen image${offscreenImages.length === 1 ? '' : 's'} without lazy loading`,
      
      details: {
        type: 'table',
        headings: [
          { key: 'url', itemType: 'url', text: 'Image' },
          { key: 'position', itemType: 'text', text: 'Position from Top' },
          { key: 'size', itemType: 'bytes', text: 'Deferred size' },
          // { key: 'savings', itemType: 'text', text: 'Potential Savings' },
        ],
        items: offscreenImages.map(({ img, position }) => {
          const imgDeferredKB = ((img.resourceSize || 0) / 1024).toFixed(1);
          return {
            url: img.src,
            position: `${position.toFixed(0)}px (${(position - viewport.innerHeight).toFixed(0)}px below fold)`,
            size: img.resourceSize || 0,
            savings: `~${imgDeferredKB} KB deferred`,
          };
        }),
        summary: {
          wastedBytes: deferredBytes,
        },
      },
    };
  }
}

module.exports = LazyLoadingActualAudit;