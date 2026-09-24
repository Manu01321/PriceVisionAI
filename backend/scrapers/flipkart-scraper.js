const BaseScraper = require('./base-scraper');
const BrowserPool = require('../utils/browser-pool');

class FlipkartScraper extends BaseScraper {
  constructor(browserPool, logger) {
    super('flipkart', {
      baseUrl: 'https://www.flipkart.com',
      timeout: 30000,
      retryAttempts: 3
    });
    
    this.browserPool = browserPool;
    this.logger = logger;
    
    // Flipkart-specific selectors
    this.selectors = {
      search: {
        results: '[data-id], ._1AtVbE, ._13oc-S',
        title: '._4rR01T, .s1Q9rs, ._2WkVRV',
        price: '._30jeq3, ._1_WHN1',
        originalPrice: '._3I9_wc, ._2Tpdn3',
        rating: '._3LWZlK, .gUuXy-',
        reviewCount: '._2_R_DZ span, .gUuXy- span',
        image: '._396cs4, .DByuf4',
        link: '._1fQZEK, ._2rpwqI, .s1Q9rs'
      },
      product: {
        title: '.B_NuCI, ._35KyD6',
        price: '._30jeq3, ._1_WHN1',
        originalPrice: '._3I9_wc, ._2Tpdn3',
        description: '._1mXcCf, ._3WHvuP',
        images: '._396cs4, ._2r_T1I img',
        rating: '._3LWZlK, .gUuXy-',
        reviewCount: '._2_R_DZ span, .gUuXy- span',
        availability: '._16FRp0, ._3xgqrA',
        brand: '.G6XhBa, ._2B099V',
        specifications: '._1s_Smc, ._3dtsli'
      }
    };
  }

  async getBrowserSession() {
    return await this.browserPool.getBrowser();
  }

  buildSearchUrl(query, options = {}) {
    const params = new URLSearchParams({
      q: query
    });
    
    if (options.category) {
      params.append('as', 'on');
      params.append('as-show', 'on');
      params.append('otracker', 'AS_Query_HistoryAutoSuggest_1_0_na_na_na');
    }
    
    if (options.minPrice) {
      params.append('p[]=facets.price_range.gte%3A' + options.minPrice);
    }
    
    if (options.maxPrice) {
      params.append('p[]=facets.price_range.lte%3A' + options.maxPrice);
    }
    
    if (options.sortBy) {
      const sortMapping = {
        'price_low_to_high': 'price_asc',
        'price_high_to_low': 'price_desc',
        'popularity': 'popularity',
        'rating': 'relevance'
      };
      params.append('sort', sortMapping[options.sortBy] || 'relevance');
    }
    
    return `${this.baseUrl}/search?${params.toString()}`;
  }

  async performSearch(browserSession, query, options = {}) {
    const { context } = browserSession;
    const page = await this.browserPool.createPage(browserSession);
    
    try {
      const searchUrl = this.buildSearchUrl(query, options);
      this.logger.info(`Flipkart search: ${searchUrl}`);
      
      // Navigate to search page
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: this.timeout 
      });
      
      // Handle location popup
      await this.handleLocationPopup(page);
      
      // Wait for search results
      await this.waitForSearchResults(page);
      
      // Extract search results
      const results = await this.parseSearchResults(page, query);
      
      this.logger.info(`Flipkart found ${results.length} products for "${query}"`);
      return results;
      
    } catch (error) {
      this.logger.error('Flipkart search failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async handleLocationPopup(page) {
    try {
      // Check for location popup and close it
      const locationClose = await page.$('._2KblmR');
      if (locationClose) {
        await locationClose.click();
        await BrowserPool.randomDelay(500, 1000);
      }
      
      // Check for login popup
      const loginClose = await page.$('._2AkmmA');
      if (loginClose) {
        await loginClose.click();
        await BrowserPool.randomDelay(500, 1000);
      }
      
    } catch (error) {
      // Ignore popup handling errors
      this.logger.debug('Flipkart popup handling:', error.message);
    }
  }

  async waitForSearchResults(page) {
    const possibleSelectors = [
      '[data-id]',
      '._1AtVbE',
      '._13oc-S',
      '._1fQZEK'
    ];
    
    for (const selector of possibleSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('No search results found on Flipkart');
  }

  async parseSearchResults(page, query) {
    const results = [];
    
    // Try different result selectors
    const resultSelectors = [
      '[data-id]',
      '._1AtVbE',
      '._13oc-S'
    ];
    
    let productElements = [];
    
    for (const selector of resultSelectors) {
      productElements = await page.$$(selector);
      if (productElements.length > 0) break;
    }
    
    this.logger.info(`Found ${productElements.length} product elements on Flipkart`);
    
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
        if (!title || !productUrl) {
          this.logger.debug(`Skipping Flipkart product ${i}: missing title or URL`);
          continue;
        }
        
        const product = {
          title,
          price,
          originalPrice,
          rating,
          reviewCount,
          images: image ? [image] : [],
          productUrl: this.normalizeUrl(productUrl),
          availability: price ? 'in_stock' : 'unknown',
          source: 'flipkart',
          relevanceScore: this.calculateRelevanceScore(title, query),
          matchedKeywords: this.extractMatchedKeywords(title, query)
        };
        
        results.push(product);
        
      } catch (error) {
        this.logger.warn(`Failed to parse Flipkart product ${i}:`, error.message);
        continue;
      }
    }
    
    return results;
  }

  async extractTitle(element) {
    const titleSelectors = [
      '._4rR01T',
      '.s1Q9rs',
      '._2WkVRV',
      '.IRpwTa',
      '._2B099V a'
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
      '._30jeq3',
      '._1_WHN1',
      '._25b18c'
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
      '._3I9_wc',
      '._2Tpdn3'
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
      '._3LWZlK',
      '.gUuXy-',
      '._2d4LTz'
    ];
    
    for (const selector of ratingSelectors) {
      try {
        const ratingElement = await element.$(selector);
        if (ratingElement) {
          const ratingText = await ratingElement.textContent();
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
      '._2_R_DZ span',
      '.gUuXy- span',
      '._2d4LTz + span'
    ];
    
    for (const selector of reviewSelectors) {
      try {
        const reviewElement = await element.$(selector);
        if (reviewElement) {
          const reviewText = await reviewElement.textContent();
          if (reviewText && (reviewText.includes('(') || reviewText.includes('ratings'))) {
            const match = reviewText.match(/\(?([0-9,]+)\)?/);
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
      '._396cs4',
      '.DByuf4',
      '._2r_T1I img',
      'img'
    ];
    
    for (const selector of imageSelectors) {
      try {
        const imgElement = await element.$(selector);
        if (imgElement) {
          const src = await imgElement.getAttribute('src') || 
                     await imgElement.getAttribute('data-src');
          if (src && !src.includes('transparent') && !src.includes('placeholder')) {
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
      '._1fQZEK',
      '._2rpwqI',
      '.s1Q9rs',
      'a[href*="/p/"]',
      'a'
    ];
    
    for (const selector of linkSelectors) {
      try {
        const linkElement = await element.$(selector);
        if (linkElement) {
          const href = await linkElement.getAttribute('href');
          if (href && href.includes('/p/')) {
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
        // Bonus for exact matches at the beginning
        if (titleLower.indexOf(word) === 0) {
          score += 15;
        } else {
          score += 8;
        }
      }
    });
    
    // Bonus for matching multiple words
    if (matchedWords > 1) {
      score += matchedWords * 3;
    }
    
    return Math.min(score, 100);
  }

  extractMatchedKeywords(title, query) {
    if (!title || !query) return [];
    
    const titleLower = title.toLowerCase();
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    return queryWords.filter(word => titleLower.includes(word));
  }

  async extractProductData(browserSession, productUrl) {
    const { context } = browserSession;
    const page = await this.browserPool.createPage(browserSession);
    
    try {
      this.logger.info(`Extracting Flipkart product: ${productUrl}`);
      
      await page.goto(productUrl, { 
        waitUntil: 'networkidle',
        timeout: this.timeout 
      });
      
      await this.handleLocationPopup(page);
      
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
      this.logger.error('Flipkart product extraction failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async extractProductPrice(page) {
    const priceSelectors = [
      '._30jeq3',
      '._1_WHN1',
      '._25b18c'
    ];
    
    return await this.getTextWithFallback(page, priceSelectors);
  }

  async extractProductOriginalPrice(page) {
    const originalPriceSelectors = [
      '._3I9_wc',
      '._2Tpdn3'
    ];
    
    return await this.getTextWithFallback(page, originalPriceSelectors);
  }

  async extractProductDescription(page) {
    const descriptionSelectors = [
      '._1mXcCf',
      '._3WHvuP',
      '._1AN87F'
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
      const imageElements = await page.$$('._396cs4, ._2r_T1I img, .q6DClP img');
      
      for (const img of imageElements.slice(0, 10)) {
        const src = await img.getAttribute('src') || await img.getAttribute('data-src');
        if (src && !src.includes('transparent') && !src.includes('placeholder') && !images.includes(src)) {
          images.push(src.startsWith('//') ? `https:${src}` : src);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to extract Flipkart product images:', error.message);
    }
    
    return images;
  }

  async extractProductRating(page) {
    const ratingSelectors = [
      '._3LWZlK',
      '.gUuXy-',
      '._2d4LTz'
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
      '._2_R_DZ span',
      '.gUuXy- span'
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
      '._16FRp0',
      '._3xgqrA',
      '._16FRp0 span'
    ];
    
    return await this.getTextWithFallback(page, availabilitySelectors, 'unknown');
  }

  async extractProductBrand(page) {
    const brandSelectors = [
      '.G6XhBa',
      '._2B099V',
      '._2WkVRV span'
    ];
    
    return await this.getTextWithFallback(page, brandSelectors);
  }

  async extractProductSpecifications(page) {
    const specifications = {};
    
    try {
      const specElements = await page.$$('._1s_Smc tr, ._3dtsli');
      
      for (const spec of specElements) {
        const key = await this.safeGetText(spec, 'td:first-child, ._1hKmbr');
        const value = await this.safeGetText(spec, 'td:last-child, ._21lJbe');
        
        if (key && value) {
          specifications[key.replace(':', '')] = value;
        }
      }
    } catch (error) {
      this.logger.warn('Failed to extract Flipkart specifications:', error.message);
    }
    
    return specifications;
  }
}

module.exports = FlipkartScraper;
