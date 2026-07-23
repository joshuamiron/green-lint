const Audit = require('lighthouse').Audit;

/**
 * Audit: Check if images use modern formats
 *
 * Based on study measurement: 22.4% file size reduction under test conditions (p=0.00045)
 */
class ModernFormatsActualAudit extends Audit {
  static get meta() {
    return {
      id: 'modern-formats-actual',
      title: 'Images use modern formats',
      failureTitle: 'Images should use modern formats (WebP/AVIF)',
      description: 'Serving images in modern formats such as WebP or AVIF reduces file sizes. ' +
                   'A controlled study measured a 22.4% reduction serving WebP instead of JPEG under test conditions (p<0.001).',

      requiredArtifacts: ['ImageElements'],
    };
  }
  
  static audit(artifacts) {
    const images = artifacts.ImageElements;
    
    if (!images || images.length === 0) {
      return {
        score: null,
        notApplicable: true,
      };
    }
    
    // Find images using legacy formats without modern format sources
    const legacyFormatImages = [];
    
    for (const img of images) {
      const src = img.src || '';
      const mimeType = img.mimeType || '';
      
      // Check if using legacy format
      const isLegacyFormat = 
        src.match(/\.(jpg|jpeg|png)$/i) ||
        mimeType === 'image/jpeg' ||
        mimeType === 'image/png';
      
      // Check if wrapped in <picture> with modern formats
      const hasPictureParent = img.isPicture || false;
      
      if (isLegacyFormat && !hasPictureParent) {
        legacyFormatImages.push(img);
      }
    }
    
    const totalSize = legacyFormatImages.reduce((sum, img) => {
      return sum + (img.resourceSize || 0);
    }, 0);

    const legacyFormatKB = (totalSize / 1024).toFixed(0);
    
    // Pass/fail
    const passed = legacyFormatImages.length === 0;
    const score = passed ? 1 : Math.max(0, 1 - (legacyFormatImages.length / images.length));
    
    return {
      score,
      numericValue: legacyFormatImages.length,
      numericUnit: 'element',
      displayValue: passed 
        ? 'All images use modern formats'
        : `${legacyFormatImages.length} image${legacyFormatImages.length === 1 ? '' : 's'} using legacy formats`,
      
      details: {
        type: 'table',
        headings: [
          { key: 'url', itemType: 'url', text: 'Image' },
          { key: 'format', itemType: 'text', text: 'Current Format' },
          { key: 'size', itemType: 'bytes', text: 'Size' },
          { key: 'savings', itemType: 'text', text: 'Legacy Format Size' },
        ],
        items: legacyFormatImages.map(img => {
          const imgLegacyKB = ((img.resourceSize || 0) / 1024).toFixed(1);
          return {
            url: img.src,
            format: img.mimeType || 'JPEG/PNG',
            size: img.resourceSize || 0,
            savings: `~${imgLegacyKB} KB in legacy format`,
          };
        }),
        summary: {
          wastedBytes: totalSize,
        },
      },
    };
  }
}

module.exports = ModernFormatsActualAudit;