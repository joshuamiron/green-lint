const Audit = require('lighthouse').Audit;

/**
 * Audit: Third-party script energy impact
 * 
 * This is IMPOSSIBLE to detect from source code alone!
 * Must analyze actual runtime network requests
 */
class ThirdPartyEnergyAudit extends Audit {
  static get meta() {
    return {
      id: 'third-party-energy',
      title: 'Third-party scripts have minimal energy impact',
      failureTitle: 'Third-party scripts consume significant energy',
      description: 'Analytics, ads, and tracking scripts can consume 30-50% of page energy. ' +
                   'Minimize or defer non-essential third-party scripts.',
      
      requiredArtifacts: ['devtoolsLogs'],
    };
  }
  
  static audit(artifacts) {
    const devtoolsLog = artifacts.devtoolsLogs.defaultPass;
    const networkRecords = /* extract network records */;
    
    // Identify third-party requests
    const thirdPartyRequests = networkRecords.filter(record => {
      return this.isThirdParty(record.url, artifacts.URL.finalUrl);
    });
    
    // Calculate total third-party bytes
    const thirdPartyBytes = thirdPartyRequests.reduce((sum, req) => {
      return sum + (req.transferSize || 0);
    }, 0);
    
    const totalBytes = networkRecords.reduce((sum, req) => {
      return sum + (req.transferSize || 0);
    }, 0);
    
    const thirdPartyPercentage = (thirdPartyBytes / totalBytes * 100).toFixed(1);
    
    // Score based on percentage
    // 0-10% = Good (score 1)
    // 10-30% = Moderate (score 0.5)
    // 30%+ = Poor (score 0)
    let score = 1;
    if (thirdPartyPercentage > 30) score = 0;
    else if (thirdPartyPercentage > 10) score = 0.5;
    
    return {
      score,
      numericValue: thirdPartyBytes,
      numericUnit: 'byte',
      displayValue: `Third-party scripts: ${thirdPartyPercentage}% of page weight`,
      
      details: {
        type: 'table',
        headings: [
          { key: 'domain', itemType: 'text', text: 'Domain' },
          { key: 'requests', itemType: 'numeric', text: 'Requests' },
          { key: 'size', itemType: 'bytes', text: 'Transfer Size' },
          { key: 'purpose', itemType: 'text', text: 'Purpose' },
        ],
        items: this.groupByDomain(thirdPartyRequests),
      },
    };
  }
  
  static isThirdParty(url, pageUrl) {
    const urlDomain = new URL(url).hostname;
    const pageDomain = new URL(pageUrl).hostname;
    return urlDomain !== pageDomain;
  }
  
  static groupByDomain(requests) {
    const grouped = {};
    
    for (const req of requests) {
      const domain = new URL(req.url).hostname;
      
      if (!grouped[domain]) {
        grouped[domain] = {
          domain,
          requests: 0,
          size: 0,
          purpose: this.guessPurpose(domain),
        };
      }
      
      grouped[domain].requests++;
      grouped[domain].size += req.transferSize || 0;
    }
    
    return Object.values(grouped);
  }
  
  static guessPurpose(domain) {
    if (domain.includes('google-analytics') || domain.includes('analytics')) {
      return 'Analytics';
    }
    if (domain.includes('facebook') || domain.includes('twitter')) {
      return 'Social Media';
    }
    if (domain.includes('doubleclick') || domain.includes('ads')) {
      return 'Advertising';
    }
    return 'Unknown';
  }
}

module.exports = ThirdPartyEnergyAudit;