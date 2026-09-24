const BaseScraper = require('./base-scraper');
const BrowserPool = require('../utils/browser-pool');

class AmazonScraper extends BaseScraper {
  constructor(browserPool, logger) {
    super('amazon', {
      baseUrl: 'https://www.amazon.in',
      timeout: 30000,
      retryAttempts: 3
    });
    
    this.browserPool = browserPool;
    this.logger = logger;
    
    // Amazon-specific selectors
    this.selectors = {
      search: {
        results: '[data-component-type="s-search-result"]',
        title: 'h2 a span, .a-size-mini .a-link-normal',
        price: '.a-price-whole, .a-offscreen',
        originalPrice: '.a-price.a-text-price .a-offscreen',
        rating: '.a-icon-alt',
        reviewCount: '.a-size-base',
        image: '.s-image',
        link: 'h2 a, .a-link-normal'
      },
      product: {
        title: '#productTitle, .product-title',
        price: '.a-price-whole, .a-offscreen, #priceblock_dealprice, #priceblock_ourprice',
        originalPrice: '.a-price.a-text-price .a-offscreen, #listPriceValue',
        description: '#feature-bullets ul, .a-unordered-list, #productDescription',
        images: '#landingImage, .a-dynamic-image',
        rating: '.a-icon-alt, .reviewCountTextLinkedHistogram',
        reviewCount: '#acrCustomerReviewText, .reviewCountTextLinkedHistogram',
        availability: '#availability span, .a-color-success, .a-color-price',
        brand: '.a-row .a-link-normal, #bylineInfo',
        specifications: '#productDetails_detailBullets_sections1, .a-keyvalue'
      }
    };
  }

  async getBrowserSession() {
    return await this.browserPool.getBrowser();
  }

  buildSearchUrl(query, options = {}) {
    const params = new URLSearchParams({
      k: query,
      ref: 'sr_pg_1'
    });
    
    if (options.category) {
      params.append('i', options.category);
    }
    
    if (options.minPrice) {
      params.append('low-price', options.minPrice);
    }
    
    if (options.maxPrice) {
      params.append('high-price', options.maxPrice);
    }
    
    if (options.sortBy) {
      params.append('s', options.sortBy);
    }
    
    return `${this.baseUrl}/s?${params.toString()}`;
  }

  async performSearch(browserSession, query, options = {}) {
    const { context } = browserSession;
    const page = await this.browserPool.createPage(browserSession);
    
    try {
      const searchUrl = this.buildSearchUrl(query, options);
      this.logger.info(`Amazon search: ${searchUrl}`);
      
      // Navigate to search page
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: this.timeout 
      });
      
      // Handle CAPTCHA or bot detection
      await this.handleBotDetection(page);
      
      // Wait for search results
      await this.waitForSelector(page, this.selectors.search.results);
      
      // Extract search results
      const results = await this.parseSearchResults(page, query);
      
      this.logger.info(`Amazon found ${results.length} products for "${query}"`);
      return results;
      
    } catch (error) {
      this.logger.error('Amazon search failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async parseSearchResults(page, query) {
    const results = [];
    
    const productElements = await page.$$(this.selectors.search.results);
    
    for (let i = 0; i < Math.min(productElements.length, 20); i++) {
      try {
        const element = productElements[i];
        
        // Extract basic product data
        const title = await this.extractTitle(element);
        const price = await this.extractPrice(element);
        const originalPrice = await this.extractOriginalPrice(element);
        const rating = await this.extractRating(element);
        const reviewCount = await this.extractReviewCount(element);
        const image = await this.extractImage(element);
        const productUrl = await this.extractProductUrl(element);
        
        // Skip if essential data is missing
        if (!title || !productUrl) continue;
        
        const product = {
          title,
          price,
          originalPrice,
          rating,
          reviewCount,
          images: image ? [image] : [],
          productUrl: this.normalizeUrl(productUrl),
          availability: price ? 'in_stock' : 'unknown',
          source: 'amazon',
          relevanceScore: this.calculateRelevanceScore(title, query),
          matchedKeywords: this.extractMatchedKeywords(title, query)
        };
        
        results.push(product);
        
      } catch (error) {
        this.logger.warn(`Failed to parse Amazon product ${i}:`, error.message);
        continue;
      }
    }
    
    return results;
  }

  async extractTitle(element) {
    const titleSelectors = [
      'h2 a span',
      '.a-size-mini .a-link-normal',
      '.a-size-base-plus',
      '.s-size-mini span'
    ];
    
    for (const selector of titleSelectors) {
      try {
        const titleElement = await element.$(selector);
        if (titleElement) {
          const title = await titleElement.textContent();
          if (title && title.trim()) {
            return title.trim();
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  async extractPrice(element) {
    const priceSelectors = [
      '.a-price-whole',
      '.a-offscreen',
      '.a-price-fraction',
      '.a-symbol-rupee'
    ];
    
    for (const selector of priceSelectors) {
      try {
        const priceElement = await element.$(selector);
        if (priceElement) {
          const priceText = await priceElement.textContent();
          if (priceText) {
            const price = this.normalizePrice(priceText);
            if (price && price > 0) return price;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  async extractOriginalPrice(element) {
    const originalPriceSelectors = [
      '.a-price.a-text-price .a-offscreen',
      '.a-text-strike',
      '.a-price-base .a-offscreen'
    ];
    
    for (const selector of originalPriceSelectors) {
      try {
        const element_price = await element.$(selector);
        if (element_price) {
          const priceText = await element_price.textContent();
          if (priceText) {
            const price = this.normalizePrice(priceText);
            if (price && price > 0) return price;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  async extractRating(element) {
    const ratingSelectors = [
      '.a-icon-alt',
      '.a-star-alt'
    ];
    
    for (const selector of ratingSelectors) {
      try {
        const ratingElement = await element.$(selector);
        if (ratingElement) {
          const ratingText = await ratingElement.getAttribute('alt') || 
                           await ratingElement.textContent();
          if (ratingText) {
            const match = ratingText.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              return parseFloat(match[1]);
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  async extractReviewCount(element) {
    const reviewSelectors = [
      '.a-size-base',
      '.a-link-normal .a-size-base',
      '[aria-label*="reviews"]'
    ];
    
    for (const selector of reviewSelectors) {
      try {
        const reviewElement = await element.$(selector);
        if (reviewElement) {
          const reviewText = await reviewElement.textContent();
          if (reviewText && reviewText.includes('(')) {
            const match = reviewText.match(/\(([0-9,]+)\)/);
            if (match) {
              return this.normalizeNumber(match[1]);
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return 0;
  }

  async extractImage(element) {
    const imageSelectors = [
      '.s-image',
      'img[data-image-index]',
      '.rush-component img'
    ];
    
    for (const selector of imageSelectors) {
      try {
        const imgElement = await element.$(selector);
        if (imgElement) {
          const src = await imgElement.getAttribute('src') || 
                     await imgElement.getAttribute('data-src');
          if (src && !src.includes('transparent-pixel')) {
            return src.startsWith('//') ? `https:${src}` : src;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  async extractProductUrl(element) {
    const linkSelectors = [
      'h2 a',
      '.a-link-normal',
      'a[href*="/dp/"]'
    ];
    
    for (const selector of linkSelectors) {
      try {
        const linkElement = await element.$(selector);
        if (linkElement) {
          const href = await linkElement.getAttribute('href');
          if (href) {
            return href;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  normalizeUrl(url) {
    if (!url) return null;
    
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`;
    }
    
    if (url.startsWith('https://')) {
      return url;
    }
    
    return `${this.baseUrl}/${url}`;
  }

  calculateRelevanceScore(title, query) {
    if (!title || !query) return 0;
    
    const titleLower = title.toLowerCase();
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    let score = 0;
    let matchedWords = 0;
    
    queryWords.forEach(word => {
      if (titleLower.includes(word)) {
        matchedWords++;
        // Bonus for exact matches
        if (titleLower.indexOf(word) === 0) {
          score += 10;
        } else {
          score += 5;
        }
      }
    });
    
    // Bonus for matching multiple words
    if (matchedWords > 1) {
      score += matchedWords * 2;
    }
    
    return Math.min(score, 100);
  }

  extractMatchedKeywords(title, query) {
    if (!title || !query) return [];
    
    const titleLower = title.toLowerCase();
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    return queryWords.filter(word => titleLower.includes(word));
  }

  async handleBotDetection(page) {
    try {
      // Check for CAPTCHA
      const captcha = await page.$('#captchacharacters');
      if (captcha) {
        throw new Error('CAPTCHA detected - need to implement solving mechanism');
      }
      
      // Check for "Enter the characters you see below"
      const botDetection = await page.$('text=Enter the characters you see below');
      if (botDetection) {
        throw new Error('Bot detection triggered');
      }
      
      // Check for access denied
      const accessDenied = await page.$('text=Sorry, we just need to make sure you\'re not a robot');
      if (accessDenied) {
        throw new Error('Access denied - robot check');
      }
      
    } catch (error) {
      if (error.message.includes('CAPTCHA') || error.message.includes('Bot') || error.message.includes('Access denied')) {
        this.logger.warn('Amazon bot detection triggered');
        throw error;
      }
    }
  }

  async extractProductData(browserSession, productUrl) {
    const { context } = browserSession;
    const page = await this.browserPool.createPage(browserSession);
    
    try {
      this.logger.info(`Extracting Amazon product: ${productUrl}`);
      
      await page.goto(productUrl, { 
        waitUntil: 'networkidle',
        timeout: this.timeout 
      });
      
      await this.handleBotDetection(page);
      
      // Wait for product page to load
      await this.waitForSelector(page, this.selectors.product.title);
      
      // Extract detailed product information
      const productData = {
        title: await this.safeGetText(page, this.selectors.product.title),
        price: await this.extractProductPrice(page),
        originalPrice: await this.extractProductOriginalPrice(page),
        description: await this.extractProductDescription(page),
        images: await this.extractProductImages(page),
        rating: await this.extractProductRating(page),
        reviewCount: await this.extractProductReviewCount(page),
        availability: await this.extractProductAvailability(page),
        brand: await this.extractProductBrand(page),
        specifications: await this.extractProductSpecifications(page),
        productUrl: productUrl
      };
      
      return productData;
      
    } catch (error) {
      this.logger.error('Amazon product extraction failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async extractProductPrice(page) {
    const priceSelectors = [
      '.a-price-whole',
      '.a-offscreen',
      '#priceblock_dealprice',
      '#priceblock_ourprice',
      '.a-symbol-rupee'
    ];
    
    return await this.getTextWithFallback(page, priceSelectors);
  }

  async extractProductOriginalPrice(page) {
    const originalPriceSelectors = [
      '.a-price.a-text-price .a-offscreen',
      '#listPriceValue',
      '.a-text-strike'
    ];
    
    return await this.getTextWithFallback(page, originalPriceSelectors);
  }

  async extractProductDescription(page) {
    const descriptionSelectors = [
      '#feature-bullets ul',
      '.a-unordered-list',
      '#productDescription p'
    ];
    
    let description = await this.getTextWithFallback(page, descriptionSelectors);
    
    // Clean up description
    if (description) {
      description = description
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 1000);
    }
    
    return description;
  }

  async extractProductImages(page) {
    const images = [];
    
    try {
      const imageElements = await page.$$('#landingImage, .a-dynamic-image, #altImages img');
      
      for (const img of imageElements.slice(0, 10)) {
        const src = await img.getAttribute('src') || await img.getAttribute('data-src');
        if (src && !src.includes('transparent-pixel') && !images.includes(src)) {
          images.push(src.startsWith('//') ? `https:${src}` : src);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to extract Amazon product images:', error.message);
    }
    
    return images;
  }

  async extractProductRating(page) {
    const ratingSelectors = [
      '.a-icon-alt',
      '.reviewCountTextLinkedHistogram .a-link-normal'
    ];
    
    const ratingText = await this.getTextWithFallback(page, ratingSelectors);
    
    if (ratingText) {
      const match = ratingText.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    }
    
    return null;
  }

  async extractProductReviewCount(page) {
    const reviewSelectors = [
      '#acrCustomerReviewText',
      '.reviewCountTextLinkedHistogram'
    ];
    
    const reviewText = await this.getTextWithFallback(page, reviewSelectors);
    
    if (reviewText) {
      const match = reviewText.match(/([0-9,]+)/);
      return match ? this.normalizeNumber(match[1]) : 0;
    }
    
    return 0;
  }

  async extractProductAvailability(page) {
    const availabilitySelectors = [
      '#availability span',
      '.a-color-success',
      '.a-color-price'
    ];
    
    return await this.getTextWithFallback(page, availabilitySelectors, 'unknown');
  }

  async extractProductBrand(page) {
    const brandSelectors = [
      '#bylineInfo',
      '.a-row .a-link-normal',
      '.po-brand .po-break-word'
    ];
    
    return await this.getTextWithFallback(page, brandSelectors);
  }

  async extractProductSpecifications(page) {
    const specifications = {};
    
    try {
      const specElements = await page.$$('#productDetails_detailBullets_sections1 tr, .a-keyvalue');
      
      for (const spec of specElements) {
        const key = await this.safeGetText(spec, '.a-text-bold, td:first-child');
        const value = await this.safeGetText(spec, 'td:last-child, .a-keyvalue-value');
        
        if (key && value) {
          specifications[key.replace(':', '')] = value;
        }
      }
    } catch (error) {
      this.logger.warn('Failed to extract Amazon specifications:', error.message);
    }
    
    return specifications;
  }
}

module.exports = AmazonScraper;
