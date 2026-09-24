import apiClient, { ApiError } from './apiClient.js';
import aiProductService from './aiProductService.js';

class ProductSearchService {
  constructor() {
    this.searchHistory = [];
    this.recentSearches = this.loadRecentSearches();
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Search products across multiple e-commerce sites
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(query, options = {}) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const searchKey = this.generateSearchKey(query, options);
    
    // Check cache first
    if (this.searchCache.has(searchKey)) {
      const cached = this.searchCache.get(searchKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Returning cached search results');
        return cached.data;
      }
      this.searchCache.delete(searchKey);
    }

    try {
      const searchParams = {
        query: query.trim(),
        limit: options.limit || 20,
        sites: options.sites || ['amazon', 'flipkart'],
        filters: {
          minPrice: options.minPrice,
          maxPrice: options.maxPrice,
          category: options.category,
          brand: options.brand,
          rating: options.minRating,
          ...options.filters
        }
      };

      console.log('Searching products:', searchParams);

      let response;
      try {
        response = await apiClient.post('/api/search/text', searchParams);
      } catch (backendError) {
        // Backend unavailable — fall back to direct AI
        if (aiProductService.isAvailable()) {
          const aiResults = await aiProductService.searchProducts(query, options);
          return {
            success: true,
            query,
            results: Array.isArray(aiResults) ? aiResults : (aiResults.products || []),
            count: Array.isArray(aiResults) ? aiResults.length : (aiResults.products?.length || 0),
            searchTime: 'AI',
            sites: {},
            filters: {},
            suggestions: [],
            timestamp: new Date().toISOString()
          };
        }
        throw backendError;
      }

      // Process and enhance results
      const processedResults = this.processSearchResults(response, query);

      // Cache the results
      this.searchCache.set(searchKey, {
        data: processedResults,
        timestamp: Date.now()
      });

      // Add to search history
      this.addToSearchHistory(query, processedResults.count);

      return processedResults;

    } catch (error) {
      console.error('Product search failed:', error);
      
      if (error instanceof ApiError) {
        // Handle specific API errors
        if (error.isNetworkError) {
          throw new Error('Unable to connect to search service. Please check your internet connection.');
        } else if (error.isTimeout) {
          throw new Error('Search request timed out. Please try again.');
        } else if (error.isServerError) {
          throw new Error('Search service is temporarily unavailable. Please try again later.');
        }
      }
      
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get search suggestions based on query
   * @param {string} query - Partial query
   * @returns {Array} Search suggestions
   */
  getSearchSuggestions(query) {
    if (!query || query.length < 2) return [];

    const suggestions = new Set();
    
    // Add from recent searches
    this.recentSearches
      .filter(search => search.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .forEach(search => suggestions.add(search));

    // Add common product categories and brands
    const commonSuggestions = [
      'iPhone', 'Samsung Galaxy', 'MacBook', 'Dell Laptop', 'Sony Headphones',
      'Nike Shoes', 'Adidas', 'Levi\'s Jeans', 'iPhone 15', 'iPad',
      'AirPods', 'Samsung TV', 'LG TV', 'Canon Camera', 'PlayStation',
      'Xbox', 'Nintendo Switch', 'Books', 'Kindle', 'Fitbit'
    ];

    commonSuggestions
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .forEach(item => suggestions.add(item));

    return Array.from(suggestions).slice(0, 8);
  }

  /**
   * Get trending products (mock implementation)
   * @returns {Array} Trending product queries
   */
  getTrendingProducts() {
    return [
      { query: 'iPhone 15 Pro Max', trend: '+15%' },
      { query: 'Samsung Galaxy S24', trend: '+12%' },
      { query: 'MacBook Air M3', trend: '+8%' },
      { query: 'Nike Air Jordan', trend: '+20%' },
      { query: 'Sony WH-1000XM5', trend: '+6%' },
      { query: 'iPad Pro', trend: '+10%' },
      { query: 'AirPods Pro', trend: '+5%' },
      { query: 'Dell XPS 13', trend: '+7%' }
    ];
  }

  /**
   * Compare prices across specific sites
   * @param {string} productName - Product name
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Price comparison results
   */
  async compareProductPrices(productName, options = {}) {
    try {
      const response = await apiClient.post('/api/compare/prices', {
        productName,
        productUrl: options.productUrl,
        sites: options.sites || ['amazon', 'flipkart']
      });

      return this.processPriceComparison(response);

    } catch (error) {
      console.error('Price comparison failed:', error);
      throw new Error(`Price comparison failed: ${error.message}`);
    }
  }

  /**
   * Get product details from URL
   * @param {string} productUrl - Product URL
   * @returns {Promise<Object>} Product details
   */
  async getProductDetails(productUrl) {
    try {
      const response = await apiClient.post('/api/product/details', {
        productUrl
      });

      return response.product;

    } catch (error) {
      console.error('Product details fetch failed:', error);
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  // Private methods
  generateSearchKey(query, options) {
    const optionsString = JSON.stringify(options);
    return `${query.toLowerCase()}_${btoa(optionsString)}`;
  }

  processSearchResults(response, originalQuery) {
    const results = response.results || [];
    
    return {
      success: true,
      query: originalQuery,
      results: results.map(this.enhanceProductResult),
      count: results.length,
      searchTime: response.searchTime || 'Unknown',
      sites: this.groupResultsBySite(results),
      filters: this.extractAvailableFilters(results),
      suggestions: response.suggestions || [],
      timestamp: new Date().toISOString()
    };
  }

  enhanceProductResult(product) {
    return {
      ...product,
      
      // Price formatting
      formattedPrice: product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Price not available',
      formattedOriginalPrice: product.originalPrice ? `₹${product.originalPrice.toLocaleString('en-IN')}` : null,
      
      // Savings calculation
      savings: product.originalPrice && product.price ? product.originalPrice - product.price : 0,
      savingsPercentage: product.originalPrice && product.price 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0,
      
      // Rating display
      ratingStars: this.generateStarRating(product.rating),
      formattedReviewCount: product.reviewCount ? `${product.reviewCount.toLocaleString()} reviews` : '',
      
      // Enhanced metadata
      searchScore: product.overallScore || product.relevanceScore || 0,
      trustScore: this.calculateTrustScore(product),
      dealQuality: this.assessDealQuality(product),
      
      // Availability status
      availabilityStatus: this.normalizeAvailability(product.availability),
      stockLevel: this.estimateStockLevel(product),
      
      // Enhanced source info
      sourceInfo: {
        ...product.source,
        logo: this.getSourceLogo(product.source?.site),
        trustRating: this.getSourceTrustRating(product.source?.site)
      }
    };
  }

  generateStarRating(rating) {
    if (!rating) return '';
    
    const stars = Math.round(rating * 2) / 2; // Round to nearest 0.5
    let result = '';
    
    for (let i = 1; i <= 5; i++) {
      if (i <= stars) {
        result += '★';
      } else if (i - 0.5 <= stars) {
        result += '☆';
      } else {
        result += '☆';
      }
    }
    
    return result;
  }

  calculateTrustScore(product) {
    let score = 50; // Base score
    
    // Rating bonus
    if (product.rating >= 4.5) score += 25;
    else if (product.rating >= 4.0) score += 15;
    else if (product.rating >= 3.5) score += 5;
    
    // Review count bonus
    if (product.reviewCount > 1000) score += 15;
    else if (product.reviewCount > 100) score += 10;
    else if (product.reviewCount > 10) score += 5;
    
    // Source credibility
    const siteScores = {
      amazon: 20,
      flipkart: 18,
      myntra: 15,
      snapdeal: 12
    };
    score += siteScores[product.source?.site] || 10;
    
    return Math.min(score, 100);
  }

  assessDealQuality(product) {
    if (!product.price) return 'unknown';
    
    const discountPercentage = product.savingsPercentage || 0;
    const trustScore = this.calculateTrustScore(product);
    
    if (discountPercentage > 30 && trustScore > 80) return 'excellent';
    if (discountPercentage > 20 && trustScore > 70) return 'very good';
    if (discountPercentage > 10 && trustScore > 60) return 'good';
    if (discountPercentage > 5) return 'fair';
    
    return 'regular';
  }

  normalizeAvailability(availability) {
    if (!availability) return 'unknown';
    
    const status = availability.toLowerCase();
    
    if (status.includes('in stock') || status.includes('available')) return 'in_stock';
    if (status.includes('out of stock') || status.includes('unavailable')) return 'out_of_stock';
    if (status.includes('limited')) return 'limited_stock';
    
    return 'unknown';
  }

  estimateStockLevel(product) {
    // This is a mock implementation - in a real app, you'd have actual stock data
    const availability = product.availability?.toLowerCase() || '';
    
    if (availability.includes('only') && availability.includes('left')) {
      return 'low';
    } else if (availability.includes('limited')) {
      return 'medium';
    } else if (availability.includes('in stock')) {
      return 'high';
    }
    
    return 'unknown';
  }

  getSourceLogo(siteName) {
    const logos = {
      amazon: '/logos/amazon.png',
      flipkart: '/logos/flipkart.png',
      myntra: '/logos/myntra.png',
      snapdeal: '/logos/snapdeal.png'
    };
    
    return logos[siteName] || '/logos/default.png';
  }

  getSourceTrustRating(siteName) {
    const ratings = {
      amazon: 4.8,
      flipkart: 4.6,
      myntra: 4.4,
      snapdeal: 4.2
    };
    
    return ratings[siteName] || 4.0;
  }

  groupResultsBySite(results) {
    const siteGroups = {};
    
    results.forEach(product => {
      const siteName = product.source?.site || 'unknown';
      if (!siteGroups[siteName]) {
        siteGroups[siteName] = {
          name: siteName,
          count: 0,
          products: [],
          averagePrice: 0,
          priceRange: { min: Infinity, max: 0 }
        };
      }
      
      siteGroups[siteName].count++;
      siteGroups[siteName].products.push(product);
      
      if (product.price) {
        siteGroups[siteName].priceRange.min = Math.min(siteGroups[siteName].priceRange.min, product.price);
        siteGroups[siteName].priceRange.max = Math.max(siteGroups[siteName].priceRange.max, product.price);
      }
    });
    
    // Calculate average prices
    Object.values(siteGroups).forEach(group => {
      const prices = group.products.filter(p => p.price).map(p => p.price);
      group.averagePrice = prices.length > 0 
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
        : 0;
      
      if (group.priceRange.min === Infinity) {
        group.priceRange.min = 0;
      }
    });
    
    return siteGroups;
  }

  extractAvailableFilters(results) {
    const brands = new Set();
    const categories = new Set();
    const priceRanges = [];
    
    results.forEach(product => {
      if (product.brand) brands.add(product.brand);
      if (product.source?.category) categories.add(product.source.category);
      if (product.price) priceRanges.push(product.price);
    });
    
    // Calculate price ranges
    priceRanges.sort((a, b) => a - b);
    const minPrice = priceRanges[0] || 0;
    const maxPrice = priceRanges[priceRanges.length - 1] || 0;
    
    return {
      brands: Array.from(brands).slice(0, 10),
      categories: Array.from(categories),
      priceRange: { min: minPrice, max: maxPrice },
      availableRatings: [4.5, 4.0, 3.5, 3.0]
    };
  }

  processPriceComparison(response) {
    return {
      ...response,
      bestDeal: response.recommendation || null,
      sitesCompared: Object.keys(response.sites || {}),
      totalSavings: response.potentialSavings || 0,
      priceVariation: response.priceDifference || 0
    };
  }

  // Search history management
  addToSearchHistory(query, resultCount) {
    const historyItem = {
      query,
      resultCount,
      timestamp: new Date().toISOString()
    };
    
    this.searchHistory.unshift(historyItem);
    this.searchHistory = this.searchHistory.slice(0, 100); // Keep last 100 searches
    
    // Add to recent searches for suggestions
    this.recentSearches.unshift(query);
    this.recentSearches = [...new Set(this.recentSearches)].slice(0, 20);
    this.saveRecentSearches();
  }

  getSearchHistory() {
    return this.searchHistory;
  }

  loadRecentSearches() {
    try {
      const saved = localStorage.getItem('priceVision_recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
      return [];
    }
  }

  saveRecentSearches() {
    try {
      localStorage.setItem('priceVision_recentSearches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.warn('Failed to save recent searches:', error);
    }
  }

  clearSearchHistory() {
    this.searchHistory = [];
    this.recentSearches = [];
    this.searchCache.clear();
    localStorage.removeItem('priceVision_recentSearches');
  }

  // Cache management
  clearCache() {
    this.searchCache.clear();
  }

  getCacheStats() {
    return {
      size: this.searchCache.size,
      timeout: this.cacheTimeout
    };
  }
}

// Create singleton instance
const productSearchService = new ProductSearchService();

export default productSearchService;
