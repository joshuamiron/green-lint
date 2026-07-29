const { Audit, NetworkRecords } = require('lighthouse');

/**
 * Audit: Check if images use modern formats
 *
 * Runtime counterpart to green-lint's "Serve Images in Modern Formats"
 * pattern (packages/core/src/patterns/modern-formats.ts). Title matches
 * the core pattern's name for traceability across the CLI, VS Code
 * extension, and this Lighthouse audit.
 *
 * Based on study measurement (Miron, 2026): 22.4% file size reduction
 * under test conditions (p=0.00045, n=8)
 */
class ModernFormatsActualAudit extends Audit {
  static get meta() {
    return {
      id: 'modern-formats-actual',
      title: 'Serve Images in Modern Formats',
      failureTitle: 'Serve Images in Modern Formats',
      description: 'Use a <picture> element to serve modern formats (WebP/AVIF) with a JPEG/PNG fallback. ' +
                   'A controlled study (Miron, 2026) measured a 22.4% reduction serving WebP instead of JPEG ' +
                   'under test conditions (p=0.00045, n=8).',

      requiredArtifacts: ['ImageElements', 'devtoolsLogs'],
    };
  }

  /**
   * ImageElements doesn't carry transfer size - only the network log does.
   * Correlate by URL, the same approach Lighthouse's own built-in
   * offscreen-images/modern-image-formats audits use. Then follow any
   * redirect chain to the final response - some image CDNs (e.g.
   * picsum.photos) redirect the requested URL to a different signed CDN
   * URL, and the redirect record itself has no real mimeType or size.
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

    if (!images || images.length === 0) {
      return {
        score: null,
        notApplicable: true,
      };
    }

    const devtoolsLog = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLog, context);
    const findNetworkRecord = url => this.findFinalNetworkRecord(networkRecords, url);

    // Find images using legacy formats without modern format sources
    const legacyFormatImages = [];

    for (const img of images) {
      const src = img.src || '';
      const networkRecord = findNetworkRecord(src);
      // The real response MIME type is the source of truth (a URL's
      // extension can't be trusted: query-string image URLs have no
      // extension at all, and some CDNs content-negotiate a modern format
      // despite a .jpg-looking URL). Only fall back to the URL extension
      // if we have no matching network record.
      const mimeType = (networkRecord && networkRecord.mimeType) || '';
      const isLegacyFormat = mimeType
        ? (mimeType === 'image/jpeg' || mimeType === 'image/png')
        : /\.(jpg|jpeg|png)$/i.test(src);

      // Check if wrapped in <picture> with modern formats
      const hasPictureParent = img.isPicture || false;

      if (isLegacyFormat && !hasPictureParent) {
        legacyFormatImages.push({ img, networkRecord, mimeType });
      }
    }

    const totalSize = legacyFormatImages.reduce((sum, { networkRecord }) => {
      return sum + this.resourceSize(networkRecord);
    }, 0);

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
        items: legacyFormatImages.map(({ img, networkRecord, mimeType }) => {
          const bytes = this.resourceSize(networkRecord);
          const imgLegacyKB = (bytes / 1024).toFixed(1);
          return {
            url: img.src,
            format: mimeType || 'JPEG/PNG',
            size: bytes,
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