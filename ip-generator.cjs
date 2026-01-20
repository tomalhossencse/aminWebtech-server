// IP Generator for Development
const crypto = require('crypto');

class IPGenerator {
  constructor() {
    this.sessionIPs = new Map();
  }

  // Generate a consistent IP for a session
  generateSessionIP(sessionId) {
    if (this.sessionIPs.has(sessionId)) {
      return this.sessionIPs.get(sessionId);
    }

    // Create a hash from the session ID
    const hash = crypto.createHash('md5').update(sessionId).digest('hex');
    
    // Generate IP components from hash
    const ip1 = parseInt(hash.substring(0, 2), 16) % 223 + 1; // 1-223 (avoid reserved ranges)
    const ip2 = parseInt(hash.substring(2, 4), 16) % 255;
    const ip3 = parseInt(hash.substring(4, 6), 16) % 255;
    const ip4 = parseInt(hash.substring(6, 8), 16) % 254 + 1; // 1-254 (avoid .0 and .255)
    
    const ip = `${ip1}.${ip2}.${ip3}.${ip4}`;
    this.sessionIPs.set(sessionId, ip);
    
    return ip;
  }

  // Generate random realistic IPs for different scenarios
  generateRealisticIP(type = 'random') {
    switch (type) {
      case 'us':
        // US IP ranges
        const usRanges = [
          [8, 8, 8, 8], // Google DNS
          [208, 67, 222, 222], // OpenDNS
          [173, 252, 0, 0], // Facebook range
          [199, 16, 156, 0] // Twitter range
        ];
        const usRange = usRanges[Math.floor(Math.random() * usRanges.length)];
        return `${usRange[0]}.${usRange[1]}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
      
      case 'eu':
        // European IP ranges
        return `${Math.floor(Math.random() * 50) + 80}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
      
      case 'asia':
        // Asian IP ranges
        return `${Math.floor(Math.random() * 50) + 110}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
      
      default:
        // Random but realistic
        const firstOctet = Math.floor(Math.random() * 223) + 1;
        const secondOctet = Math.floor(Math.random() * 255);
        const thirdOctet = Math.floor(Math.random() * 255);
        const fourthOctet = Math.floor(Math.random() * 254) + 1;
        return `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`;
    }
  }

  // Get country info for IP (mock data)
  getIPInfo(ip) {
    const hash = crypto.createHash('md5').update(ip).digest('hex');
    const countryIndex = parseInt(hash.substring(0, 2), 16) % 10;
    
    const countries = [
      { country: 'United States', code: 'US', city: 'New York' },
      { country: 'United Kingdom', code: 'GB', city: 'London' },
      { country: 'Germany', code: 'DE', city: 'Berlin' },
      { country: 'France', code: 'FR', city: 'Paris' },
      { country: 'Japan', code: 'JP', city: 'Tokyo' },
      { country: 'Canada', code: 'CA', city: 'Toronto' },
      { country: 'Australia', code: 'AU', city: 'Sydney' },
      { country: 'Netherlands', code: 'NL', city: 'Amsterdam' },
      { country: 'Singapore', code: 'SG', city: 'Singapore' },
      { country: 'Brazil', code: 'BR', city: 'São Paulo' }
    ];
    
    return countries[countryIndex];
  }
}

module.exports = IPGenerator;