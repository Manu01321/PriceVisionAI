const AmazonScraper = require('../scrapers/amazon-scraper');
const FlipkartScraper = require('../scrapers/flipkart-scraper');
const OpenAIService = require('./openai-service');

class ProductSearchService {
  constructor(browserPool, logger, options = {}) {
    this.browserPool = browserPool;
    this.logger = logger;
    this.cacheClient = options.cacheClient || null;
    this.cacheTTL = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 300;
    
    // Initialize scrapers
    this.scrapers = {
      amazon: new AmazonScraper(browserPool, logger),
      flipkart: new FlipkartScraper(browserPool, logger)
    };
    
    // Search performance tracking
    this.searchStats = {
      totalSearches: 0,
      successfulSearches: 0,
      averageResponseTime: 0,
      scraperStats: {}
    };
  }

  async searchByText(query, options = {}) {
    const startTime = Date.now();
    this.searchStats.totalSearches++;
    const cacheKey = this.buildCacheKey(query, options);
    
    try {
      this.logger.info(`Starting product search for: "${query}"`);

      // Attempt cache hit
      if (this.cacheClient && this.cacheClient.isReady) {
        const cached = await this.cacheClient.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          this.logger.info(`Cache hit for query "${query}"`);
          return parsed;
        }
      }
      
      const {
        sites = ['amazon', 'flipkart'],
        limit = 20,
        timeout = 30000,
        parallel = true
      } = options;
      
      let allResults = [];
      
      if (parallel) {
        // Run scrapers in parallel for faster results
        allResults = await this.searchInParallel(query, sites, options);
      } else {
        // Run scrapers sequentially for reliability
        allResults = await this.searchSequentially(query, sites, options);
      }
      
      // If scrapers returned nothing, fall back to OpenAI
      if (allResults.length === 0) {
        this.logger.info(`Scrapers returned 0 results for "${query}", using OpenAI fallback`);
        allResults = await this.searchWithOpenAI(query, options);
      }

      // Process and rank results
      const processedResults = await this.processSearchResults(allResults, query, options);

      // Persist to cache
      if (this.cacheClient && this.cacheClient.isReady) {
        this.cacheClient.set(cacheKey, JSON.stringify(processedResults), {
          EX: this.cacheTTL
        }).catch(err => {
          this.logger.warn('Failed to cache search result:', err.message);
        });
      }
      
      // Update performance stats
      const responseTime = Date.now() - startTime;
      this.updateSearchStats(responseTime, true);
      
      this.logger.info(`Search completed in ${responseTime}ms with ${processedResults.length} results`);
      
      return processedResults;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateSearchStats(responseTime, false);
      
      this.logger.error('Product search failed:', error);
      throw error;
    }
  }

  async searchWithOpenAI(query, options = {}) {
    try {
      const limit = options.limit || 20;
      const result = await OpenAIService.searchProduct(query, {});
      const keywords = result.keywords || result.searchKeywords || [query];
      const searchTerm = Array.isArray(keywords) ? keywords[0] : query;

      // Generate mock product results from OpenAI analysis
      const prompt = `Generate ${Math.min(limit, 10)} realistic Indian e-commerce product listings for: "${searchTerm}". Return JSON array: [{title, price, originalPrice, brand, rating, reviewCount, availability, source, imageUrl, productUrl}]. Prices in INR numbers only. source must be amazon or flipkart.`;

      const response = await OpenAIService.createChatCompletion([
        { role: 'system', content: 'You are an e-commerce product data generator. Return only valid JSON array, no markdown.' },
        { role: 'user', content: prompt }
      ], { model: 'gpt-4o-mini', max_tokens: 2000, response_format: { type: 'json_object' } });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      const products = parsed.products || parsed.results || (Array.isArray(parsed) ? parsed : []);

      return products.map((p, i) => ({
        id: `ai_${Date.now()}_${i}`,
        title: p.title || p.name || 'Product',
        price: parseFloat(p.price) || 0,
        originalPrice: parseFloat(p.originalPrice || p.mrp) || parseFloat(p.price) || 0,
        brand: p.brand || '',
        rating: parseFloat(p.rating) || 4.0,
        reviewCount: parseInt(p.reviewCount || p.reviews) || 0,
        availability: p.availability || 'in_stock',
        source: { site: p.source || 'amazon', name: p.source === 'flipkart' ? 'Flipkart' : 'Amazon India' },
        imageUrl: p.imageUrl || '',
        productUrl: p.productUrl || '#',
        searchMethod: 'ai_fallback'
      }));
    } catch (err) {
      this.logger.error('OpenAI product search fallback failed:', err.message);
      return [];
    }
  }

  async searchInParallel(query, sites, options) {
    const searchPromises = sites.map(async (siteName) => {
      const scraper = this.scrapers[siteName];
      if (!scraper) {
        this.logger.warn(`Scraper not available for site: ${siteName}`);
        return [];
      }
      
      try {
        const siteStartTime = Date.now();
        const results = await scraper.searchProducts(query, options);
        const siteResponseTime = Date.now() - siteStartTime;
        
        this.updateScraperStats(siteName, siteResponseTime, true, results.length);
        
        this.logger.info(`${siteName} returned ${results.length} results in ${siteResponseTime}ms`);
        return results;
        
      } catch (error) {
        this.logger.error(`${siteName} search failed:`, error.message);
        this.updateScraperStats(siteName, 0, false, 0);
        return [];
      }
    });
    
    const resultsArrays = await Promise.allSettled(searchPromises);
    
    return resultsArrays
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
  }

  async searchSequentially(query, sites, options) {
    let allResults = [];
    
    for (const siteName of sites) {
      const scraper = this.scrapers[siteName];
      if (!scraper) {
        this.logger.warn(`Scraper not available for site: ${siteName}`);
        continue;
      }
      
      try {
        const siteStartTime = Date.now();
        const results = await scraper.searchProducts(query, options);
        const siteResponseTime = Date.now() - siteStartTime;
        
        this.updateScraperStats(siteName, siteResponseTime, true, results.length);
        
        this.logger.info(`${siteName} returned ${results.length} results in ${siteResponseTime}ms`);
        allResults = allResults.concat(results);
        
      } catch (error) {
        this.logger.error(`${siteName} search failed:`, error.message);
        this.updateScraperStats(siteName, 0, false, 0);
        continue;
      }
    }
    
    return allResults;
  }

  async processSearchResults(allResults, query, options) {
    if (!allResults || allResults.length === 0) {
      return [];
    }
    
    // Remove duplicates based on normalized title and price
    const uniqueResults = this.removeDuplicates(allResults);
    
    // Calculate enhanced relevance scores
    const scoredResults = uniqueResults.map(product => ({
      ...product,
      relevanceScore: this.calculateEnhancedRelevanceScore(product, query),
      priceScore: this.calculatePriceScore(product, uniqueResults),
      ratingScore: this.calculateRatingScore(product),
      overallScore: 0 // Will be calculated below
    }));
    
    // Calculate overall score combining multiple factors
    scoredResults.forEach(product => {
      product.overallScore = this.calculateOverallScore(product);
    });
    
    // Sort by overall score
    const sortedResults = scoredResults.sort((a, b) => b.overallScore - a.overallScore);
    
    // Apply limit
    const limitedResults = sortedResults.slice(0, options.limit || 20);
    
    // Add search metadata
    limitedResults.forEach((product, index) => {
      product.searchRank = index + 1;
      product.searchQuery = query;
      product.searchTimestamp = new Date().toISOString();
    });
    
    return limitedResults;
  }

  removeDuplicates(results) {
    const seen = new Set();
    const unique = [];
    
    for (const product of results) {
      // Create a key based on normalized title and price
      const normalizedTitle = product.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const key = `${normalizedTitle}_${product.price || 'no-price'}_${product.brand || 'no-brand'}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(product);
      }
    }
    
    return unique;
  }

  calculateEnhancedRelevanceScore(product, query) {
    if (!product.title || !query) return 0;
    
    const title = product.title.toLowerCase();
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    let score = 0;
    let matchedWords = 0;
    
    queryWords.forEach(word => {
      const wordIndex = title.indexOf(word);
      
      if (wordIndex !== -1) {
        matchedWords++;
        
        // Position bonus (earlier matches get higher scores)
        const positionBonus = Math.max(0, 20 - (wordIndex / title.length * 20));
        
        // Exact word match bonus
        const exactMatch = title.includes(` ${word} `) || title.startsWith(`${word} `) || title.endsWith(` ${word}`);
        const exactBonus = exactMatch ? 15 : 5;
        
        score += positionBonus + exactBonus;
      }
    });
    
    // Multi-word match bonus
    if (matchedWords > 1) {
      score += matchedWords * 5;
    }
    
    // Brand match bonus
    if (product.brand && query.toLowerCase().includes(product.brand.toLowerCase())) {
      score += 25;
    }
    
    // Complete phrase match bonus
    if (title.includes(query.toLowerCase())) {
      score += 30;
    }
    
    return Math.min(score, 100);
  }

  calculatePriceScore(product, allResults) {
    if (!product.price || product.price <= 0) return 0;
    
    const prices = allResults
      .filter(p => p.price && p.price > 0)
      .map(p => p.price)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) return 50;
    
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    
    if (minPrice === maxPrice) return 50;
    
    // Lower prices get higher scores
    const priceRange = maxPrice - minPrice;
    const pricePosition = (product.price - minPrice) / priceRange;
    
    return Math.round((1 - pricePosition) * 100);
  }

  calculateRatingScore(product) {
    if (!product.rating || product.rating <= 0) return 0;
    
    // Convert rating to 0-100 scale
    const normalizedRating = (product.rating / 5) * 100;
    
    // Bonus for high review count
    const reviewBonus = product.reviewCount > 100 ? 10 : 
                       product.reviewCount > 10 ? 5 : 0;
    
    return Math.min(normalizedRating + reviewBonus, 100);
  }

  calculateOverallScore(product) {
    const weights = {
      relevance: 0.4,  // 40% - most important
      rating: 0.3,     // 30% - quality indicator
      price: 0.2,      // 20% - value consideration
      availability: 0.1 // 10% - stock status
    };
    
    const relevanceScore = product.relevanceScore || 0;
    const ratingScore = product.ratingScore || 0;
    const priceScore = product.priceScore || 0;
    const availabilityScore = product.availability === 'in_stock' ? 100 : 0;
    
    return Math.round(
      (relevanceScore * weights.relevance) +
      (ratingScore * weights.rating) +
      (priceScore * weights.price) +
      (availabilityScore * weights.availability)
    );
  }

  updateSearchStats(responseTime, success) {
    if (success) {
      this.searchStats.successfulSearches++;
    }
    
    // Update average response time
    const currentAvg = this.searchStats.averageResponseTime;
    const totalSearches = this.searchStats.totalSearches;
    
    this.searchStats.averageResponseTime = Math.round(
      ((currentAvg * (totalSearches - 1)) + responseTime) / totalSearches
    );
  }

  updateScraperStats(siteName, responseTime, success, resultCount) {
    if (!this.searchStats.scraperStats[siteName]) {
      this.searchStats.scraperStats[siteName] = {
        totalRequests: 0,
        successfulRequests: 0,
        averageResponseTime: 0,
        totalResults: 0,
        averageResultsPerRequest: 0
      };
    }
    
    const stats = this.searchStats.scraperStats[siteName];
    stats.totalRequests++;
    
    if (success) {
      stats.successfulRequests++;
      stats.totalResults += resultCount;
      
      // Update average response time for successful requests
      const successfulRequests = stats.successfulRequests;
      stats.averageResponseTime = Math.round(
        ((stats.averageResponseTime * (successfulRequests - 1)) + responseTime) / successfulRequests
      );
      
      // Update average results per request
      stats.averageResultsPerRequest = Math.round(stats.totalResults / successfulRequests);
    }
  }

  // Get search performance statistics
  getSearchStats() {
    const stats = { ...this.searchStats };
    
    // Calculate success rate
    stats.successRate = this.searchStats.totalSearches > 0 
      ? Math.round((this.searchStats.successfulSearches / this.searchStats.totalSearches) * 100)
      : 0;
    
    // Calculate scraper performance
    Object.keys(stats.scraperStats).forEach(siteName => {
      const scraperStats = stats.scraperStats[siteName];
      scraperStats.successRate = scraperStats.totalRequests > 0
        ? Math.round((scraperStats.successfulRequests / scraperStats.totalRequests) * 100)
        : 0;
    });
    
    return stats;
  }

  // Reset search statistics
  resetSearchStats() {
    this.searchStats = {
      totalSearches: 0,
      successfulSearches: 0,
      averageResponseTime: 0,
      scraperStats: {}
    };
  }

  // Get available scrapers
  getAvailableScrapers() {
    return Object.keys(this.scrapers).map(siteName => ({
      name: siteName,
      displayName: this.getScraperDisplayName(siteName),
      status: 'active',
      features: this.getScraperFeatures(siteName)
    }));
  }

  getScraperDisplayName(siteName) {
    const displayNames = {
      amazon: 'Amazon India',
      flipkart: 'Flipkart',
      myntra: 'Myntra',
      snapdeal: 'Snapdeal',
      ajio: 'Ajio'
    };
    
    return displayNames[siteName] || siteName.charAt(0).toUpperCase() + siteName.slice(1);
  }

  getScraperFeatures(siteName) {
    const features = {
      amazon: ['search', 'price', 'reviews', 'images', 'specifications'],
      flipkart: ['search', 'price', 'reviews', 'images', 'specifications'],
      myntra: ['search', 'price', 'images', 'brand'],
      snapdeal: ['search', 'price', 'reviews'],
      ajio: ['search', 'price', 'images', 'brand']
    };
    
    return features[siteName] || ['search', 'price'];
  }

  buildCacheKey(query, options) {
    const keyPayload = {
      query,
      sites: options.sites || ['amazon', 'flipkart'],
      filters: options.filters || {},
      limit: options.limit || 20
    };
    return `search:${Buffer.from(JSON.stringify(keyPayload)).toString('base64')}`;
  }
}

module.exports = ProductSearchService;
