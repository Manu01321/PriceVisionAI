import apiClient, { ApiError } from './apiClient.js';
import aiProductService from './aiProductService.js';

class ImageSearchService {
  constructor() {
    this.maxImageSize = 10 * 1024 * 1024; // 10MB
    this.supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.searchCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    this.useDirectAI = true; // Use direct AI calls instead of backend
  }

  /**
   * Search products using image upload
   * @param {File|string} image - Image file or base64 string
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results with AI analysis
   */
  async searchByImage(image, options = {}) {
    try {
      // Validate and process image
      const imageData = await this.processImage(image);
      
      // Check cache
      const cacheKey = this.generateImageCacheKey(imageData.hash);
      if (this.searchCache.has(cacheKey)) {
        const cached = this.searchCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('Returning cached image search results');
          return cached.data;
        }
        this.searchCache.delete(cacheKey);
      }

      console.log('Performing image search with AI analysis...');

      let processedResults;

      // Use direct AI service for real product results
      if (this.useDirectAI && aiProductService.isAvailable()) {
        console.log('Using direct AI (OpenAI/Gemini) for image analysis...');
        try {
          const aiResults = await aiProductService.searchByImage(imageData.base64, options);
          
          processedResults = {
            success: true,
            aiAnalysis: aiResults.extractedInfo || {},
            searchConfidence: aiResults.confidence || 0.85,
            results: aiResults.products || [],
            resultsCount: aiResults.products?.length || 0,
            searchMethod: aiResults.searchMethod || 'ai_vision',
            imageInfo: {
              ...imageData,
              processingTime: Date.now()
            },
            suggestions: this.generateSearchSuggestions(aiResults.extractedInfo),
            timestamp: new Date().toISOString()
          };
        } catch (aiError) {
          console.warn('Direct AI analysis failed, falling back to backend:', aiError.message);
          // Fall back to backend API
          processedResults = await this.searchViaBackend(imageData, options);
        }
      } else {
        // Use backend API
        processedResults = await this.searchViaBackend(imageData, options);
      }

      // Cache the results
      this.searchCache.set(cacheKey, {
        data: processedResults,
        timestamp: Date.now()
      });

      return processedResults;

    } catch (error) {
      console.error('Image search failed:', error);
      
      if (error instanceof ApiError) {
        if (error.isNetworkError) {
          throw new Error('Unable to connect to image search service. Please check your internet connection.');
        } else if (error.isTimeout) {
          throw new Error('Image search timed out. Please try with a smaller image.');
        } else if (error.status === 400) {
          throw new Error('Invalid image format. Please use JPEG, PNG, or WebP.');
        } else if (error.isServerError) {
          throw new Error('Image search service is temporarily unavailable.');
        }
      }
      
      throw new Error(`Image search failed: ${error.message}`);
    }
  }

  /**
   * Search via backend API (fallback)
   */
  async searchViaBackend(imageData, options = {}) {
    const searchParams = {
      imageBase64: imageData.base64,
      confidence: options.confidence || 0.7,
      limit: options.limit || 15,
      sites: options.sites || ['amazon', 'flipkart']
    };

    const response = await apiClient.post('/api/search/image', searchParams);
    return this.processImageSearchResults(response, imageData);
  }

  /**
   * Search products using image URL
   * @param {string} imageUrl - URL to the image
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchByImageUrl(imageUrl, options = {}) {
    try {
      if (!this.isValidImageUrl(imageUrl)) {
        throw new Error('Invalid image URL provided');
      }

      const searchParams = {
        imageUrl,
        confidence: options.confidence || 0.7,
        limit: options.limit || 15,
        sites: options.sites || ['amazon', 'flipkart']
      };

      console.log('Performing image search from URL...');

      const response = await apiClient.post('/api/search/image', searchParams);
      
      return this.processImageSearchResults(response, { source: 'url', url: imageUrl });

    } catch (error) {
      console.error('Image URL search failed:', error);
      throw new Error(`Image URL search failed: ${error.message}`);
    }
  }

  /**
   * Upload image and get analysis without search
   * @param {File} image - Image file
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeImage(image) {
    try {
      const imageData = await this.processImage(image);
      
      const response = await apiClient.post('/api/analyze/image', {
        imageBase64: imageData.base64,
        analysisOnly: true
      });

      return {
        success: true,
        analysis: response.extractedInfo,
        confidence: response.confidence,
        imageInfo: {
          size: imageData.size,
          format: imageData.format,
          dimensions: imageData.dimensions
        }
      };

    } catch (error) {
      console.error('Image analysis failed:', error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  /**
   * Get similar products from image analysis
   * @param {Object} analysisResult - Previous analysis result
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Similar products
   */
  async findSimilarProducts(analysisResult, options = {}) {
    try {
      const searchTerms = this.extractSearchTermsFromAnalysis(analysisResult);
      
      // Use text search with extracted terms
      const ProductSearchService = await import('./productSearchService.js');
      const productSearchService = ProductSearchService.default;
      
      const searchPromises = searchTerms.slice(0, 3).map(term =>
        productSearchService.searchProducts(term, {
          limit: Math.ceil(options.limit || 20 / searchTerms.length),
          ...options
        })
      );

      const results = await Promise.all(searchPromises);
      
      // Combine and deduplicate results
      const combinedResults = results.flatMap(result => result.results || []);
      const uniqueResults = this.deduplicateResults(combinedResults);

      return {
        success: true,
        results: uniqueResults.slice(0, options.limit || 20),
        searchTermsUsed: searchTerms,
        totalSources: results.length
      };

    } catch (error) {
      console.error('Similar products search failed:', error);
      throw new Error(`Similar products search failed: ${error.message}`);
    }
  }

  /**
   * Process image for search
   * @param {File|string} image - Image file or base64
   * @returns {Promise<Object>} Processed image data
   */
  async processImage(image) {
    if (typeof image === 'string') {
      // Handle base64 string
      return {
        base64: image,
        hash: this.generateHash(image),
        size: Math.round((image.length * 3) / 4), // Approximate size
        format: 'base64'
      };
    }

    if (!(image instanceof File)) {
      throw new Error('Invalid image input. Expected File or base64 string.');
    }

    // Validate file
    this.validateImageFile(image);

    // Convert to base64
    const base64 = await this.fileToBase64(image);
    
    // Get image dimensions (if possible)
    const dimensions = await this.getImageDimensions(image);

    return {
      base64,
      hash: this.generateHash(base64),
      size: image.size,
      format: image.type,
      dimensions,
      name: image.name
    };
  }

  /**
   * Validate image file
   * @param {File} file - Image file
   */
  validateImageFile(file) {
    // Check file size
    if (file.size > this.maxImageSize) {
      throw new Error(`Image file is too large. Maximum size is ${this.maxImageSize / (1024 * 1024)}MB.`);
    }

    // Check file type
    if (!this.supportedFormats.includes(file.type)) {
      throw new Error(`Unsupported image format. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file is not an image.');
    }
  }

  /**
   * Convert file to base64
   * @param {File} file - Image file
   * @returns {Promise<string>} Base64 string
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        // Remove data URL prefix to get just the base64 data
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get image dimensions
   * @param {File} file - Image file
   * @returns {Promise<Object>} Image dimensions
   */
  async getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      
      img.src = url;
    });
  }

  /**
   * Process image search results
   * @param {Object} response - API response
   * @param {Object} imageData - Original image data
   * @returns {Object} Processed results
   */
  processImageSearchResults(response, imageData) {
    const results = response.results || [];
    
    return {
      success: true,
      aiAnalysis: response.extractedInfo || {},
      searchConfidence: response.confidence || 0,
      results: results.map(product => this.enhanceImageSearchResult(product, response.extractedInfo)),
      resultsCount: results.length,
      searchMethod: response.searchMethod || 'ai_image_analysis',
      imageInfo: {
        ...imageData,
        processingTime: response.processingTime
      },
      suggestions: this.generateSearchSuggestions(response.extractedInfo),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enhance individual image search result
   * @param {Object} product - Product result
   * @param {Object} aiAnalysis - AI analysis data
   * @returns {Object} Enhanced product
   */
  enhanceImageSearchResult(product, aiAnalysis) {
    return {
      ...product,
      
      // Image match scoring
      imageMatchScore: product.imageMatchScore || 0,
      visualSimilarity: this.calculateVisualSimilarity(product, aiAnalysis),
      
      // AI-derived insights
      aiInsights: {
        extractedBrand: aiAnalysis?.brand || '',
        extractedCategory: aiAnalysis?.category || '',
        extractedFeatures: aiAnalysis?.features || [],
        confidenceLevel: aiAnalysis?.confidence || 0
      },
      
      // Match indicators
      brandMatch: this.checkBrandMatch(product, aiAnalysis),
      categoryMatch: this.checkCategoryMatch(product, aiAnalysis),
      featureMatches: this.findFeatureMatches(product, aiAnalysis),
      
      // Search metadata
      searchSource: 'ai_image_analysis',
      matchQuality: this.assessMatchQuality(product, aiAnalysis)
    };
  }

  /**
   * Calculate visual similarity score
   * @param {Object} product - Product data
   * @param {Object} aiAnalysis - AI analysis
   * @returns {number} Similarity score
   */
  calculateVisualSimilarity(product, aiAnalysis) {
    let score = 0;
    
    // Brand similarity
    if (product.brand && aiAnalysis?.brand) {
      if (product.brand.toLowerCase() === aiAnalysis.brand.toLowerCase()) {
        score += 30;
      } else if (product.brand.toLowerCase().includes(aiAnalysis.brand.toLowerCase())) {
        score += 15;
      }
    }
    
    // Category similarity
    if (product.source?.category && aiAnalysis?.category) {
      if (product.source.category.toLowerCase() === aiAnalysis.category.toLowerCase()) {
        score += 20;
      }
    }
    
    // Feature matches
    if (aiAnalysis?.features && aiAnalysis.features.length > 0) {
      const titleLower = product.title?.toLowerCase() || '';
      const descLower = product.description?.toLowerCase() || '';
      
      const featureMatches = aiAnalysis.features.filter(feature =>
        titleLower.includes(feature.toLowerCase()) || 
        descLower.includes(feature.toLowerCase())
      );
      
      score += (featureMatches.length / aiAnalysis.features.length) * 30;
    }
    
    // Color match
    if (aiAnalysis?.color && aiAnalysis.color !== 'unknown') {
      const titleLower = product.title?.toLowerCase() || '';
      if (titleLower.includes(aiAnalysis.color.toLowerCase())) {
        score += 20;
      }
    }
    
    return Math.min(score, 100);
  }

  /**
   * Check brand match
   * @param {Object} product - Product data
   * @param {Object} aiAnalysis - AI analysis
   * @returns {Object} Brand match info
   */
  checkBrandMatch(product, aiAnalysis) {
    const productBrand = product.brand?.toLowerCase() || '';
    const extractedBrand = aiAnalysis?.brand?.toLowerCase() || '';
    
    if (!productBrand || !extractedBrand) {
      return { match: false, confidence: 0 };
    }
    
    if (productBrand === extractedBrand) {
      return { match: true, confidence: 100, type: 'exact' };
    }
    
    if (productBrand.includes(extractedBrand) || extractedBrand.includes(productBrand)) {
      return { match: true, confidence: 75, type: 'partial' };
    }
    
    return { match: false, confidence: 0 };
  }

  /**
   * Check category match
   * @param {Object} product - Product data
   * @param {Object} aiAnalysis - AI analysis
   * @returns {Object} Category match info
   */
  checkCategoryMatch(product, aiAnalysis) {
    const productCategory = product.source?.category?.toLowerCase() || '';
    const extractedCategory = aiAnalysis?.category?.toLowerCase() || '';
    
    if (!productCategory || !extractedCategory) {
      return { match: false, confidence: 0 };
    }
    
    if (productCategory === extractedCategory) {
      return { match: true, confidence: 100, type: 'exact' };
    }
    
    // Check for related categories
    const categoryRelations = {
      'smartphone': ['mobile', 'phone', 'cell phone'],
      'laptop': ['computer', 'notebook', 'pc'],
      'headphones': ['earphones', 'audio', 'headset'],
      'shoes': ['footwear', 'sneakers', 'boots']
    };
    
    for (const [category, related] of Object.entries(categoryRelations)) {
      if ((productCategory.includes(category) && related.includes(extractedCategory)) ||
          (extractedCategory.includes(category) && related.includes(productCategory))) {
        return { match: true, confidence: 60, type: 'related' };
      }
    }
    
    return { match: false, confidence: 0 };
  }

  /**
   * Find feature matches
   * @param {Object} product - Product data
   * @param {Object} aiAnalysis - AI analysis
   * @returns {Array} Matched features
   */
  findFeatureMatches(product, aiAnalysis) {
    const features = aiAnalysis?.features || [];
    if (features.length === 0) return [];
    
    const titleLower = product.title?.toLowerCase() || '';
    const descLower = product.description?.toLowerCase() || '';
    const searchText = `${titleLower} ${descLower}`;
    
    return features.filter(feature =>
      searchText.includes(feature.toLowerCase())
    ).map(feature => ({
      feature,
      found: true,
      context: 'product_description'
    }));
  }

  /**
   * Assess overall match quality
   * @param {Object} product - Product data
   * @param {Object} aiAnalysis - AI analysis
   * @returns {string} Match quality rating
   */
  assessMatchQuality(product, aiAnalysis) {
    const visualSimilarity = this.calculateVisualSimilarity(product, aiAnalysis);
    
    if (visualSimilarity >= 80) return 'excellent';
    if (visualSimilarity >= 60) return 'good';
    if (visualSimilarity >= 40) return 'fair';
    if (visualSimilarity >= 20) return 'poor';
    return 'very_poor';
  }

  /**
   * Extract search terms from AI analysis
   * @param {Object} analysis - AI analysis result
   * @returns {Array} Search terms
   */
  extractSearchTermsFromAnalysis(analysis) {
    const terms = [];
    
    if (analysis.productName) terms.push(analysis.productName);
    if (analysis.brand) terms.push(analysis.brand);
    if (analysis.brand && analysis.category) {
      terms.push(`${analysis.brand} ${analysis.category}`);
    }
    
    analysis.searchTerms?.forEach(term => {
      if (!terms.includes(term)) terms.push(term);
    });
    
    return terms.filter(term => term && term.length > 2);
  }

  /**
   * Generate search suggestions based on AI analysis
   * @param {Object} analysis - AI analysis
   * @returns {Array} Search suggestions
   */
  generateSearchSuggestions(analysis) {
    const suggestions = [];
    
    if (analysis?.brand && analysis?.productName) {
      suggestions.push(`${analysis.brand} ${analysis.productName}`);
    }
    
    if (analysis?.category && analysis?.features) {
      analysis.features.forEach(feature => {
        suggestions.push(`${analysis.category} ${feature}`);
      });
    }
    
    if (analysis?.searchTerms) {
      suggestions.push(...analysis.searchTerms.slice(0, 3));
    }
    
    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * Deduplicate search results
   * @param {Array} results - Search results
   * @returns {Array} Deduplicated results
   */
  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(product => {
      const key = `${product.title}_${product.price}_${product.source?.site}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Validate image URL
   * @param {string} url - Image URL
   * @returns {boolean} Is valid
   */
  isValidImageUrl(url) {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Generate cache key for image
   * @param {string} imageHash - Image hash
   * @returns {string} Cache key
   */
  generateImageCacheKey(imageHash) {
    return `img_${imageHash}`;
  }

  /**
   * Generate simple hash for caching
   * @param {string} data - Data to hash
   * @returns {string} Hash
   */
  generateHash(data) {
    let hash = 0;
    for (let i = 0; i < Math.min(data.length, 1000); i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.searchCache.clear();
  }

  /**
   * Get service statistics
   * @returns {Object} Service stats
   */
  getStats() {
    return {
      cacheSize: this.searchCache.size,
      maxImageSize: `${this.maxImageSize / (1024 * 1024)}MB`,
      supportedFormats: this.supportedFormats,
      cacheTimeout: `${this.cacheTimeout / (1000 * 60)} minutes`
    };
  }
}

// Create singleton instance
const imageSearchService = new ImageSearchService();

export default imageSearchService;
