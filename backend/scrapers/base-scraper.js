const BrowserPool = require('../utils/browser-pool');

class BaseScraper {
  constructor(siteName, options = {}) {
    this.siteName = siteName;
    this.baseUrl = options.baseUrl || '';
    this.selectors = options.selectors || {};
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.requestDelay = options.requestDelay || [1000, 3000];
  }

  // Normalize product data across all sites
  normalizeProduct(rawData) {
    const normalized = {
      // Core product information
      title: this.cleanText(rawData.title),
      brand: this.extractBrand(rawData.title, rawData.brand),
      price: this.normalizePrice(rawData.price),
      originalPrice: this.normalizePrice(rawData.originalPrice),
      discount: this.calculateDiscount(rawData.price, rawData.originalPrice),
      
      // Product details
      description: this.cleanText(rawData.description),
      specifications: rawData.specifications || {},
      features: rawData.features || [],
      
      // Media and links
      images: this.normalizeImages(rawData.images),
      productUrl: rawData.productUrl,
      
      // Ratings and reviews
      rating: this.normalizeRating(rawData.rating),
      reviewCount: this.normalizeNumber(rawData.reviewCount),
      
      // Availability and shipping
      availability: rawData.availability || 'unknown',
      shippingInfo: rawData.shippingInfo || null,
      deliveryTime: rawData.deliveryTime || null,
      
      // Source information
      source: {
        site: this.siteName,
        scrapedAt: new Date().toISOString(),
        confidence: this.calculateConfidence(rawData),
        category: rawData.category || 'unknown'
      },
      
      // Search relevance
      relevanceScore: rawData.relevanceScore || 0,
      matchedKeywords: rawData.matchedKeywords || []
    };

    // Add unique identifier
    normalized.id = this.generateProductId(normalized);
    
    return normalized;
  }

  // Clean and standardize text
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?()-]/g, '')
      .trim()
      .substring(0, 500); // Limit length
  }

  // Extract brand from title if not provided separately
  extractBrand(title, explicitBrand) {
    if (explicitBrand) return this.cleanText(explicitBrand);
    if (!title) return '';
    
    // Common brand extraction patterns
    const brandPatterns = [
      /^([A-Z][a-z]+)\s/,  // First capitalized word
      /by\s([A-Z][a-z]+)/i, // "by Brand"
      /([A-Z]{2,})\s/,     // All caps words
    ];
    
    for (const pattern of brandPatterns) {
      const match = title.match(pattern);
      if (match) return match[1];
    }
    
    return '';
  }

  // Normalize price to standard format
  normalizePrice(priceText) {
    if (!priceText) return null;
    
    // Remove currency symbols and extract number
    const cleaned = priceText.toString().replace(/[^\d.,]/g, '');
    const number = parseFloat(cleaned.replace(/,/g, ''));
    
    return isNaN(number) ? null : Math.round(number * 100) / 100;
  }

  // Calculate discount percentage
  calculateDiscount(currentPrice, originalPrice) {
    if (!currentPrice || !originalPrice || currentPrice >= originalPrice) {
      return 0;
    }
    
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  // Normalize image URLs
  normalizeImages(images) {
    if (!images) return [];
    
    const imageList = Array.isArray(images) ? images : [images];
    
    return imageList
      .filter(img => img && typeof img === 'string')
      .map(img => img.startsWith('//') ? `https:${img}` : img)
      .slice(0, 10); // Limit to 10 images
  }

  // Normalize rating (convert to 0-5 scale)
  normalizeRating(rating) {
    if (!rating) return null;
    
    const num = parseFloat(rating.toString().replace(/[^\d.]/g, ''));
    if (isNaN(num)) return null;
    
    // Assume most ratings are out of 5, but handle 10-point scales
    return num > 5 ? Math.round((num / 10) * 5 * 10) / 10 : num;
  }

  // Normalize numbers (remove commas, etc.)
  normalizeNumber(numberText) {
    if (!numberText) return 0;
    
    const cleaned = numberText.toString().replace(/[^\d]/g, '');
    const number = parseInt(cleaned);
    
    return isNaN(number) ? 0 : number;
  }

  // Calculate confidence score based on data completeness
  calculateConfidence(rawData) {
    let score = 0;
    const weights = {
      title: 25,
      price: 25,
      images: 15,
      description: 10,
      rating: 10,
      brand: 10,
      availability: 5
    };
    
    Object.entries(weights).forEach(([field, weight]) => {
      if (rawData[field] && rawData[field].toString().trim()) {
        score += weight;
      }
    });
    
    return Math.min(score, 100);
  }

  // Generate unique product ID
  generateProductId(product) {
    const source = `${this.siteName}_${Date.now()}`;
    const hash = this.simpleHash(product.title + product.price + product.brand);
    return `${source}_${hash}`;
  }

  // Simple hash function
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Search products on the site
  async searchProducts(query, options = {}) {
    const browserSession = await this.getBrowserSession();
    
    try {
      const results = await this.performSearch(browserSession, query, options);
      return results.map(product => this.normalizeProduct(product));
    } catch (error) {
      console.error(`Search failed on ${this.siteName}:`, error);
      throw error;
    } finally {
      browserSession.release();
    }
  }

  // Get product details by URL
  async getProductDetails(productUrl) {
    const browserSession = await this.getBrowserSession();
    
    try {
      const productData = await this.extractProductData(browserSession, productUrl);
      return this.normalizeProduct(productData);
    } catch (error) {
      console.error(`Product extraction failed on ${this.siteName}:`, error);
      throw error;
    } finally {
      browserSession.release();
    }
  }

  // Retry mechanism with exponential backoff
  async withRetry(operation, maxAttempts = this.retryAttempts) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Wait for element with retry
  async waitForSelector(page, selector, options = {}) {
    const maxWait = options.timeout || this.timeout;
    const interval = 500;
    const maxAttempts = Math.ceil(maxWait / interval);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const element = await page.waitForSelector(selector, { 
          timeout: interval,
          state: options.state || 'visible'
        });
        return element;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`Selector '${selector}' not found after ${maxWait}ms`);
        }
        await BrowserPool.randomDelay(100, 200);
      }
    }
  }

  // Safe text extraction
  async safeGetText(page, selector, defaultValue = '') {
    try {
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        return text ? text.trim() : defaultValue;
      }
    } catch (error) {
      console.warn(`Failed to get text from selector '${selector}':`, error.message);
    }
    return defaultValue;
  }

  // Safe attribute extraction
  async safeGetAttribute(page, selector, attribute, defaultValue = '') {
    try {
      const element = await page.$(selector);
      if (element) {
        const value = await element.getAttribute(attribute);
        return value || defaultValue;
      }
    } catch (error) {
      console.warn(`Failed to get attribute '${attribute}' from selector '${selector}':`, error.message);
    }
    return defaultValue;
  }

  // Multiple selectors fallback
  async getTextWithFallback(page, selectors, defaultValue = '') {
    for (const selector of selectors) {
      const text = await this.safeGetText(page, selector);
      if (text) return text;
    }
    return defaultValue;
  }

  // Check if product is available
  isProductAvailable(availability, price) {
    if (!availability) return price ? 'in_stock' : 'unknown';
    
    const availabilityLower = availability.toLowerCase();
    
    if (availabilityLower.includes('out of stock') || 
        availabilityLower.includes('currently unavailable') ||
        availabilityLower.includes('sold out')) {
      return 'out_of_stock';
    }
    
    if (availabilityLower.includes('in stock') || 
        availabilityLower.includes('available') ||
        price) {
      return 'in_stock';
    }
    
    return 'unknown';
  }

  // Abstract methods to be implemented by specific scrapers
  async getBrowserSession() {
    throw new Error('getBrowserSession must be implemented by subclass');
  }

  async performSearch(browserSession, query, options) {
    throw new Error('performSearch must be implemented by subclass');
  }

  async extractProductData(browserSession, productUrl) {
    throw new Error('extractProductData must be implemented by subclass');
  }

  // Utility methods for common operations
  buildSearchUrl(query, options = {}) {
    throw new Error('buildSearchUrl must be implemented by subclass');
  }

  parseSearchResults(page) {
    throw new Error('parseSearchResults must be implemented by subclass');
  }
}

module.exports = BaseScraper;
