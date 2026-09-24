// API Services for Price Vision AI Pro
// Real-time cross-website product search and price tracking

// Core API client
export { default as apiClient, ApiError } from './apiClient.js';

// Service modules
export { default as productSearchService } from './productSearchService.js';
export { default as imageSearchService } from './imageSearchService.js';
export { default as priceTrackingService } from './priceTrackingService.js';
export { default as openaiService } from './openaiService.js';
export { default as aiProductService } from './aiProductService.js';

// Configuration and validation utilities
export { default as configValidator } from '../utils/configValidator.js';

/**
 * Initialize all services and check backend connectivity
 * @returns {Promise<Object>} Service status
 */
export async function initializeServices() {
  try {
    console.log('🔧 Initializing Price Vision services...');
    
    // Check API connectivity
    const { default: apiClient } = await import('./apiClient.js');
    const health = await apiClient.healthCheck();
    
    if (!health.healthy) {
      throw new Error(`Backend not available: ${health.error}`);
    }
    
    // Get supported sites
    const sites = await apiClient.getSupportedSites();
    
    console.log('✅ Services initialized successfully');
    console.log(`🌐 Backend status: ${health.status}`);
    console.log(`🛍️ Supported sites: ${sites.sites?.length || 0}`);
    
    return {
      success: true,
      backend: health,
      supportedSites: sites.sites || [],
      features: [
        'Multi-site product search',
        'AI-powered image search',
        'Real-time price tracking',
        'Price comparison across sites',
        'Automated price alerts'
      ]
    };
    
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    
    return {
      success: false,
      error: error.message,
      fallbackMode: true,
      message: 'Running in offline mode. Some features may be limited.'
    };
  }
}

/**
 * Request browser notification permission
 * @returns {Promise<boolean>} Permission granted
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Get overall service statistics
 * @returns {Promise<Object>} Service statistics
 */
export async function getServiceStats() {
  try {
    const [
      { default: productSearchService },
      { default: imageSearchService },
      { default: priceTrackingService },
      { default: apiClient }
    ] = await Promise.all([
      import('./productSearchService.js'),
      import('./imageSearchService.js'),
      import('./priceTrackingService.js'),
      import('./apiClient.js')
    ]);
    
    return {
      api: await apiClient.healthCheck(),
      productSearch: {
        searchHistory: productSearchService.getSearchHistory().length,
        cacheStats: productSearchService.getCacheStats(),
      },
      imageSearch: imageSearchService.getStats(),
      priceTracking: priceTrackingService.getTrackingStats(),
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Failed to get service stats:', error);
    return { error: error.message };
  }
}

/**
 * Search products across multiple channels
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Combined search results
 */
export async function searchProducts(query, options = {}) {
  const { default: productSearchService } = await import('./productSearchService.js');
  return productSearchService.searchProducts(query, options);
}

/**
 * Search products using image
 * @param {File|string} image - Image file or base64
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Image search results
 */
export async function searchByImage(image, options = {}) {
  const { default: imageSearchService } = await import('./imageSearchService.js');
  return imageSearchService.searchByImage(image, options);
}

/**
 * Track product price
 * @param {Object} product - Product to track
 * @param {Object} options - Tracking options
 * @returns {Promise<string>} Tracking ID
 */
export async function trackProductPrice(product, options = {}) {
  const { default: priceTrackingService } = await import('./priceTrackingService.js');
  return priceTrackingService.addToTracking(product, options);
}

/**
 * Compare prices across sites
 * @param {string} productName - Product name
 * @param {Object} options - Comparison options
 * @returns {Promise<Object>} Price comparison
 */
export async function compareProductPrices(productName, options = {}) {
  const { default: priceTrackingService } = await import('./priceTrackingService.js');
  return priceTrackingService.compareProductPrices(productName, options);
}

/**
 * Get all tracked products
 * @returns {Promise<Array>} Tracked products
 */
export async function getTrackedProducts() {
  const { default: priceTrackingService } = await import('./priceTrackingService.js');
  return priceTrackingService.getTrackedProducts();
}

/**
 * Clear all service caches
 * @returns {Promise<void>}
 */
export async function clearServiceCaches() {
  try {
    const [
      { default: productSearchService },
      { default: imageSearchService }
    ] = await Promise.all([
      import('./productSearchService.js'),
      import('./imageSearchService.js')
    ]);
    
    productSearchService.clearCache();
    imageSearchService.clearCache();
    
    console.log('✅ Service caches cleared');
    
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

/**
 * Service health check with retry
 * @param {number} retries - Number of retries
 * @returns {Promise<boolean>} Service healthy
 */
export async function checkServiceHealth(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { default: apiClient } = await import('./apiClient.js');
      const health = await apiClient.healthCheck();
      
      if (health.healthy) {
        return true;
      }
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
      
    } catch (error) {
      console.warn(`Health check attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  return false;
}

// Service configuration and constants
export const SERVICE_CONFIG = {
  API_TIMEOUT: 30000,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DEFAULT_SEARCH_LIMIT: 20,
  MAX_TRACKING_PRODUCTS: 100
};

export const SITE_CONFIGS = {
  amazon: {
    name: 'Amazon India',
    domain: 'amazon.in',
    logo: '/logos/amazon.png',
    features: ['search', 'price', 'reviews', 'images'],
    accuracy: 95
  },
  flipkart: {
    name: 'Flipkart',
    domain: 'flipkart.com',
    logo: '/logos/flipkart.png',
    features: ['search', 'price', 'reviews', 'images'],
    accuracy: 92
  },
  myntra: {
    name: 'Myntra',
    domain: 'myntra.com',
    logo: '/logos/myntra.png',
    features: ['search', 'price', 'images'],
    accuracy: 88
  },
  snapdeal: {
    name: 'Snapdeal',
    domain: 'snapdeal.com',
    logo: '/logos/snapdeal.png',
    features: ['search', 'price'],
    accuracy: 85
  }
};

// Export service instances for direct access
export const services = {
  get productSearch() {
    return import('./productSearchService.js').then(m => m.default);
  },
  get imageSearch() {
    return import('./imageSearchService.js').then(m => m.default);
  },
  get priceTracking() {
    return import('./priceTrackingService.js').then(m => m.default);
  },
  get apiClient() {
    return import('./apiClient.js').then(m => m.default);
  },
  get aiProduct() {
    return import('./aiProductService.js').then(m => m.default);
  }
};

/**
 * AI-powered product search (uses OpenAI/Gemini directly)
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} AI-generated product results
 */
export async function searchProductsWithAI(query, options = {}) {
  const { default: aiProductService } = await import('./aiProductService.js');
  return aiProductService.searchProducts(query, options);
}

/**
 * AI-powered image search (uses OpenAI Vision/Gemini directly)
 * @param {string} imageBase64 - Base64 encoded image
 * @param {Object} options - Search options
 * @returns {Promise<Object>} AI-generated product results from image
 */
export async function searchByImageWithAI(imageBase64, options = {}) {
  const { default: aiProductService } = await import('./aiProductService.js');
  return aiProductService.searchByImage(imageBase64, options);
}
