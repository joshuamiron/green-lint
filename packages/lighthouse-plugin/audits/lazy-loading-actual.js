const Audit = require('lighthouse').Audit;

/**
 * Audit: Check if offscreen images use lazy loading
 * 
 * Based on research: 88% network reduction (p<0.01)
 * 
 * This audit checks ACTUAL viewport positions (impossible in static analysis!)
 */
class LazyLoadingActualAudit extends Audit {
  static get meta() {
    return {
      id: 'lazy-loading-actual',
      title: 'Offscreen images use lazy loading',
      failureTitle: 'Offscreen images should use lazy loading',
      description: 'Images below the fold should have `loading="lazy"` to reduce initial network transfer. ' +
                   'Research shows 88% network reduction for offscreen images.',
      
      // Your dissertation citation!
      helpText: 'Based on empirical testing showing 88% network savings (p=0.008, n=5). ' +
                '[Learn more](https://your-dissertation-url)',
      
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
    
    // 88% savings from research
    const energySavingsBytes = totalImageSize * 0.88;
    const energySavingsKB = (energySavingsBytes / 1024).toFixed(0);
    
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
          { key: 'size', itemType: 'bytes', text: 'Size' },
          { key: 'savings', itemType: 'text', text: 'Potential Savings' },
        ],
        items: offscreenImages.map(({ img, position }) => {
          const sizeSavings = ((img.resourceSize || 0) * 0.88 / 1024).toFixed(1);
          return {
            url: img.src,
            position: `${position.toFixed(0)}px (${(position - viewport.innerHeight).toFixed(0)}px below fold)`,
            size: img.resourceSize || 0,
            savings: `~${sizeSavings} KB (88%)`,
          };
        }),
        summary: {
          wastedBytes: energySavingsBytes,
        },
      },
    };
  }
}

module.exports = LazyLoadingActualAudit;