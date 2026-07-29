const { Audit, NetworkRecords } = require('lighthouse');

/**
 * Audit: Check if offscreen images use lazy loading
 *
 * Runtime counterpart to green-lint's "Defer Offscreen Images" pattern
 * (packages/core/src/patterns/lazy-loading.ts). Title matches the core
 * pattern's name for traceability across the CLI, VS Code extension, and
 * this Lighthouse audit.
 *
 * Based on study measurement (Miron, 2026): 88% network reduction under
 * test conditions (p=0.008, n=5)
 *
 * This audit checks ACTUAL viewport positions (impossible in static analysis!)
 */
class LazyLoadingActualAudit extends Audit {
  static get meta() {
    return {
      id: 'lazy-loading-actual',
      title: 'Defer Offscreen Images',
      failureTitle: 'Defer Offscreen Images',
      description: 'Add loading="lazy" to defer loading of offscreen images until needed. ' +
                   'A controlled study (Miron, 2026) measured an 88% network reduction for offscreen images ' +
                   'under test conditions (p=0.008, n=5). Actual savings depend on the number and size of offscreen images.',

      requiredArtifacts: ['ImageElements', 'ViewportDimensions', 'devtoolsLogs'],
    };
  }

  /**
   * ImageElements doesn't carry transfer size - only the network log does.
   * Correlate by URL, the same approach Lighthouse's own built-in
   * offscreen-images/modern-image-formats audits use. Then follow any
   * redirect chain to the final response - some image CDNs (e.g.
   * picsum.photos) redirect the requested URL to a different signed CDN
   * URL, and the redirect record itself has no real size.
   */
  static findFinalNetworkRecord(networkRecords, url) {
    let record = networkRecords.find(r => r.url === url);
    while (record && record.redirectDestination) {
      record = record.redirectDestination;
    }
    return record;
  }

  static resourceSize(networkRecord) {
    if (!networkRecord) return 0;
    return Math.min(networkRecord.resourceSize || 0, networkRecord.transferSize || Infinity);
  }

  static async audit(artifacts, context) {
    const images = artifacts.ImageElements;
    const viewport = artifacts.ViewportDimensions;

    if (!images || !viewport) {
      return {
        score: null,
        notApplicable: true,
      };
    }

    const devtoolsLog = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLog, context);
    const findNetworkRecord = url => this.findFinalNetworkRecord(networkRecords, url);

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
          networkRecord: findNetworkRecord(img.src),
        });
      }
    }

    console.log(`Found ${offscreenImages.length} offscreen images without lazy loading`);

    const deferredBytes = offscreenImages.reduce((sum, { networkRecord }) => {
      return sum + this.resourceSize(networkRecord);
    }, 0);

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
        ],
        items: offscreenImages.map(({ img, position, networkRecord }) => {
          const bytes = this.resourceSize(networkRecord);
          const imgDeferredKB = (bytes / 1024).toFixed(1);
          return {
            url: img.src,
            position: `${position.toFixed(0)}px (${(position - viewport.innerHeight).toFixed(0)}px below fold)`,
            size: bytes,
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