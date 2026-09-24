import apiClient, { ApiError } from './apiClient.js';

class PriceTrackingService {
  constructor() {
    this.trackedProducts = new Map();
    this.priceHistory = new Map();
    this.notifications = [];
    this.loadTrackedProducts();
    
    // Notification callbacks
    this.notificationCallbacks = [];
    
    // Auto-sync with backend every 5 minutes
    this.startAutoSync();
  }

  /**
   * Add product to price tracking
   * @param {Object} productData - Product information
   * @param {Object} options - Tracking options
   * @returns {Promise<string>} Tracking ID
   */
  async addToTracking(productData, options = {}) {
    try {
      if (!productData.productUrl) {
        throw new Error('Product URL is required for tracking');
      }

      const trackingParams = {
        productUrl: productData.productUrl,
        targetPrice: options.targetPrice || null,
        notificationMethod: options.notificationMethod || 'browser',
        checkInterval: options.checkInterval || 15, // minutes
        productName: productData.title || productData.productName
      };

      console.log('Adding product to tracking:', trackingParams.productName);

      const response = await apiClient.post('/api/track/product', trackingParams);
      
      if (response.success && response.trackingId) {
        // Store locally for immediate UI feedback
        const trackingData = {
          id: response.trackingId,
          ...trackingParams,
          productData,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          currentPrice: productData.price,
          lowestPrice: productData.price,
          highestPrice: productData.price,
          priceChanges: 0,
          notifications: []
        };
        
        this.trackedProducts.set(response.trackingId, trackingData);
        this.saveTrackedProducts();
        
        // Initialize price history
        this.addPricePoint(response.trackingId, productData.price, {
          source: productData.source?.site,
          timestamp: new Date().toISOString()
        });
        
        return response.trackingId;
      }
      
      throw new Error(response.message || 'Failed to add product to tracking');

    } catch (error) {
      console.error('Failed to add product to tracking:', error);
      
      if (error instanceof ApiError) {
        if (error.isNetworkError) {
          throw new Error('Unable to connect to tracking service. Product saved locally.');
        } else if (error.status === 400) {
          throw new Error('Invalid product data. Please check the product URL.');
        }
      }
      
      throw new Error(`Tracking failed: ${error.message}`);
    }
  }

  /**
   * Remove product from tracking
   * @param {string} trackingId - Tracking ID
   * @returns {Promise<boolean>} Success status
   */
  async removeFromTracking(trackingId) {
    try {
      await apiClient.delete(`/api/track/product/${trackingId}`);
      
      // Remove from local storage
      this.trackedProducts.delete(trackingId);
      this.priceHistory.delete(trackingId);
      this.saveTrackedProducts();
      
      console.log('Product removed from tracking:', trackingId);
      return true;

    } catch (error) {
      console.error('Failed to remove from tracking:', error);
      
      // Remove locally even if backend call fails
      this.trackedProducts.delete(trackingId);
      this.priceHistory.delete(trackingId);
      this.saveTrackedProducts();
      
      throw new Error(`Failed to remove tracking: ${error.message}`);
    }
  }

  /**
   * Update tracking settings
   * @param {string} trackingId - Tracking ID
   * @param {Object} updates - Updated settings
   * @returns {Promise<Object>} Updated tracking data
   */
  async updateTrackingSettings(trackingId, updates) {
    try {
      const response = await apiClient.put(`/api/track/product/${trackingId}`, updates);
      
      // Update local data
      if (this.trackedProducts.has(trackingId)) {
        const trackingData = this.trackedProducts.get(trackingId);
        const updatedData = { ...trackingData, ...updates, updatedAt: new Date().toISOString() };
        this.trackedProducts.set(trackingId, updatedData);
        this.saveTrackedProducts();
      }
      
      return response.trackingData;

    } catch (error) {
      console.error('Failed to update tracking settings:', error);
      throw new Error(`Settings update failed: ${error.message}`);
    }
  }

  /**
   * Get all tracked products
   * @returns {Array} Tracked products
   */
  getTrackedProducts() {
    return Array.from(this.trackedProducts.values()).map(product => ({
      ...product,
      priceHistory: this.priceHistory.get(product.id) || [],
      recentPriceChange: this.calculateRecentPriceChange(product.id),
      dealQuality: this.assessDealQuality(product),
      savings: this.calculateTotalSavings(product),
      priceAlert: this.checkPriceAlert(product)
    }));
  }

  /**
   * Get tracked product by ID
   * @param {string} trackingId - Tracking ID
   * @returns {Object|null} Tracked product
   */
  getTrackedProduct(trackingId) {
    const product = this.trackedProducts.get(trackingId);
    if (!product) return null;
    
    return {
      ...product,
      priceHistory: this.priceHistory.get(trackingId) || [],
      priceAnalytics: this.generatePriceAnalytics(trackingId),
      recommendations: this.generateRecommendations(product)
    };
  }

  /**
   * Get price history for a product
   * @param {string} trackingId - Tracking ID
   * @param {number} days - Number of days to get history for
   * @returns {Array} Price history
   */
  getPriceHistory(trackingId, days = 30) {
    const history = this.priceHistory.get(trackingId) || [];
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    return history
      .filter(point => new Date(point.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Set price alert for a product
   * @param {string} trackingId - Tracking ID
   * @param {number} targetPrice - Target price for alert
   * @param {Object} options - Alert options
   * @returns {Promise<boolean>} Success status
   */
  async setPriceAlert(trackingId, targetPrice, options = {}) {
    try {
      const updates = {
        targetPrice,
        notificationMethod: options.notificationMethod || 'browser',
        alertEnabled: true
      };
      
      await this.updateTrackingSettings(trackingId, updates);
      
      console.log(`Price alert set for ${trackingId}: ₹${targetPrice}`);
      return true;

    } catch (error) {
      console.error('Failed to set price alert:', error);
      throw new Error(`Alert setup failed: ${error.message}`);
    }
  }

  /**
   * Compare product prices across sites
   * @param {string} productName - Product name to compare
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Price comparison
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
   * Get tracking statistics
   * @returns {Object} Tracking statistics
   */
  getTrackingStats() {
    const trackedProducts = Array.from(this.trackedProducts.values());
    
    return {
      totalProducts: trackedProducts.length,
      activeProducts: trackedProducts.filter(p => p.status === 'active').length,
      totalSavings: this.calculateTotalSavingsForAll(),
      averageSavings: this.calculateAverageSavings(),
      bestDeal: this.findBestDeal(),
      recentAlerts: this.getRecentNotifications(7), // Last 7 days
      priceDrops: this.countRecentPriceDrops(30), // Last 30 days
      topSavings: this.getTopSavingProducts(5),
      trackingPerformance: {
        successRate: this.calculateSuccessRate(),
        averageTrackingDuration: this.calculateAverageTrackingDuration()
      }
    };
  }

  /**
   * Sync with backend to get latest price updates
   * @returns {Promise<Object>} Sync results
   */
  async syncWithBackend() {
    try {
      console.log('Syncing price data with backend...');
      
      const trackingIds = Array.from(this.trackedProducts.keys());
      if (trackingIds.length === 0) return { synced: 0, updates: 0 };
      
      const response = await apiClient.post('/api/track/sync', { trackingIds });
      
      let updates = 0;
      
      // Process updates from backend
      response.updates?.forEach(update => {
        if (this.trackedProducts.has(update.trackingId)) {
          const product = this.trackedProducts.get(update.trackingId);
          
          // Check if price changed
          if (update.currentPrice !== product.currentPrice) {
            this.handlePriceUpdate(update.trackingId, update.currentPrice, update);
            updates++;
          }
          
          // Update tracking data
          this.trackedProducts.set(update.trackingId, {
            ...product,
            ...update,
            lastSynced: new Date().toISOString()
          });
        }
      });
      
      if (updates > 0) {
        this.saveTrackedProducts();
      }
      
      console.log(`Sync completed: ${updates} price updates received`);
      
      return {
        synced: response.updates?.length || 0,
        updates,
        lastSync: new Date().toISOString()
      };

    } catch (error) {
      console.error('Backend sync failed:', error);
      return { error: error.message };
    }
  }

  // Private methods

  /**
   * Handle price update
   * @param {string} trackingId - Tracking ID
   * @param {number} newPrice - New price
   * @param {Object} additionalData - Additional data
   */
  handlePriceUpdate(trackingId, newPrice, additionalData = {}) {
    const product = this.trackedProducts.get(trackingId);
    if (!product) return;
    
    const oldPrice = product.currentPrice;
    const priceChange = newPrice - oldPrice;
    
    // Update product data
    product.currentPrice = newPrice;
    product.lastChecked = new Date().toISOString();
    product.priceChanges = (product.priceChanges || 0) + 1;
    
    // Update price bounds
    if (!product.lowestPrice || newPrice < product.lowestPrice) {
      product.lowestPrice = newPrice;
    }
    if (!product.highestPrice || newPrice > product.highestPrice) {
      product.highestPrice = newPrice;
    }
    
    // Add price point to history
    this.addPricePoint(trackingId, newPrice, {
      ...additionalData,
      priceChange,
      oldPrice
    });
    
    // Check for alerts
    this.checkAndSendAlerts(trackingId, newPrice, oldPrice);
  }

  /**
   * Add price point to history
   * @param {string} trackingId - Tracking ID
   * @param {number} price - Price
   * @param {Object} metadata - Additional metadata
   */
  addPricePoint(trackingId, price, metadata = {}) {
    if (!this.priceHistory.has(trackingId)) {
      this.priceHistory.set(trackingId, []);
    }
    
    const history = this.priceHistory.get(trackingId);
    history.push({
      timestamp: new Date().toISOString(),
      price,
      ...metadata
    });
    
    // Keep only last 500 points to prevent memory issues
    if (history.length > 500) {
      history.splice(0, history.length - 500);
    }
    
    this.priceHistory.set(trackingId, history);
  }

  /**
   * Check and send alerts
   * @param {string} trackingId - Tracking ID
   * @param {number} newPrice - New price
   * @param {number} oldPrice - Old price
   */
  checkAndSendAlerts(trackingId, newPrice, oldPrice) {
    const product = this.trackedProducts.get(trackingId);
    if (!product) return;
    
    const priceChange = newPrice - oldPrice;
    
    // Price drop alert
    if (priceChange < 0) {
      this.sendNotification(trackingId, 'price_drop', {
        productName: product.productName,
        oldPrice,
        newPrice,
        savings: Math.abs(priceChange),
        savingsPercentage: Math.round((Math.abs(priceChange) / oldPrice) * 100)
      });
    }
    
    // Target price alert
    if (product.targetPrice && newPrice <= product.targetPrice) {
      this.sendNotification(trackingId, 'target_price_reached', {
        productName: product.productName,
        targetPrice: product.targetPrice,
        currentPrice: newPrice
      });
    }
    
    // Significant price increase alert
    if (priceChange > 0 && (priceChange / oldPrice) > 0.1) { // 10% increase
      this.sendNotification(trackingId, 'price_increase', {
        productName: product.productName,
        oldPrice,
        newPrice,
        increase: priceChange,
        increasePercentage: Math.round((priceChange / oldPrice) * 100)
      });
    }
  }

  /**
   * Send notification
   * @param {string} trackingId - Tracking ID
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   */
  sendNotification(trackingId, type, data) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trackingId,
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    // Call registered callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Notification callback failed:', error);
      }
    });
    
    // Browser notification (if permission granted)
    this.sendBrowserNotification(notification);
    
    console.log('Price notification sent:', notification);
  }

  /**
   * Send browser notification
   * @param {Object} notification - Notification data
   */
  sendBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const { type, data } = notification;
      
      let title, body, icon;
      
      switch (type) {
        case 'price_drop':
          title = '💰 Price Drop Alert!';
          body = `${data.productName} is now ₹${data.newPrice} (${data.savingsPercentage}% off)`;
          icon = '/icons/price-drop.png';
          break;
          
        case 'target_price_reached':
          title = '🎯 Target Price Reached!';
          body = `${data.productName} is now available for ₹${data.currentPrice}`;
          icon = '/icons/target-reached.png';
          break;
          
        case 'price_increase':
          title = '📈 Price Increase Alert';
          body = `${data.productName} price increased to ₹${data.newPrice} (+${data.increasePercentage}%)`;
          icon = '/icons/price-increase.png';
          break;
          
        default:
          title = 'Price Vision Alert';
          body = 'Price update for your tracked product';
          icon = '/icons/default.png';
      }
      
      new Notification(title, { body, icon });
    }
  }

  /**
   * Calculate recent price change
   * @param {string} trackingId - Tracking ID
   * @returns {Object} Price change info
   */
  calculateRecentPriceChange(trackingId) {
    const history = this.priceHistory.get(trackingId) || [];
    if (history.length < 2) return { change: 0, percentage: 0 };
    
    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    
    const change = latest.price - previous.price;
    const percentage = (change / previous.price) * 100;
    
    return {
      change: Math.round(change * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    };
  }

  /**
   * Assess deal quality
   * @param {Object} product - Product data
   * @returns {string} Deal quality
   */
  assessDealQuality(product) {
    if (!product.currentPrice || !product.highestPrice) return 'unknown';
    
    const discount = ((product.highestPrice - product.currentPrice) / product.highestPrice) * 100;
    
    if (discount >= 30) return 'excellent';
    if (discount >= 20) return 'very_good';
    if (discount >= 10) return 'good';
    if (discount >= 5) return 'fair';
    return 'regular';
  }

  /**
   * Calculate total savings for a product
   * @param {Object} product - Product data
   * @returns {number} Total savings
   */
  calculateTotalSavings(product) {
    if (!product.highestPrice || !product.currentPrice) return 0;
    return Math.max(0, product.highestPrice - product.currentPrice);
  }

  /**
   * Check price alert status
   * @param {Object} product - Product data
   * @returns {Object} Alert status
   */
  checkPriceAlert(product) {
    if (!product.targetPrice) return { active: false };
    
    const isTargetReached = product.currentPrice <= product.targetPrice;
    
    return {
      active: true,
      targetPrice: product.targetPrice,
      currentPrice: product.currentPrice,
      targetReached: isTargetReached,
      difference: product.currentPrice - product.targetPrice
    };
  }

  /**
   * Generate price analytics
   * @param {string} trackingId - Tracking ID
   * @returns {Object} Price analytics
   */
  generatePriceAnalytics(trackingId) {
    const history = this.priceHistory.get(trackingId) || [];
    if (history.length === 0) return {};
    
    const prices = history.map(h => h.price);
    const currentPrice = prices[prices.length - 1];
    
    return {
      currentPrice,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      priceVolatility: this.calculateVolatility(prices),
      trend: this.calculateTrend(prices),
      bestTimePercentage: this.calculateBestTime(history)
    };
  }

  /**
   * Calculate price volatility
   * @param {Array} prices - Price array
   * @returns {number} Volatility score
   */
  calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;
    
    return Math.sqrt(variance) / mean * 100; // Coefficient of variation as percentage
  }

  /**
   * Calculate price trend
   * @param {Array} prices - Price array
   * @returns {string} Trend direction
   */
  calculateTrend(prices) {
    if (prices.length < 3) return 'stable';
    
    const recent = prices.slice(-5); // Last 5 data points
    const older = prices.slice(-10, -5); // Previous 5 data points
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg * 100;
    
    if (change > 5) return 'rising';
    if (change < -5) return 'falling';
    return 'stable';
  }

  /**
   * Calculate best time to buy percentage
   * @param {Array} history - Price history
   * @returns {number} Best time percentage
   */
  calculateBestTime(history) {
    if (history.length === 0) return 0;
    
    const currentPrice = history[history.length - 1].price;
    const allPrices = history.map(h => h.price);
    const lowestPrice = Math.min(...allPrices);
    const highestPrice = Math.max(...allPrices);
    
    if (highestPrice === lowestPrice) return 50;
    
    return Math.round(((highestPrice - currentPrice) / (highestPrice - lowestPrice)) * 100);
  }

  /**
   * Generate recommendations for a product
   * @param {Object} product - Product data
   * @returns {Array} Recommendations
   */
  generateRecommendations(product) {
    const recommendations = [];
    
    const savings = this.calculateTotalSavings(product);
    const savingsPercentage = product.highestPrice 
      ? (savings / product.highestPrice) * 100 
      : 0;
    
    if (savingsPercentage > 20) {
      recommendations.push({
        type: 'buy_now',
        message: `Great deal! You're saving ${savingsPercentage.toFixed(1)}% from the highest price.`,
        urgency: 'high'
      });
    } else if (savingsPercentage > 10) {
      recommendations.push({
        type: 'good_deal',
        message: `Good price! ${savingsPercentage.toFixed(1)}% below the highest price.`,
        urgency: 'medium'
      });
    }
    
    const analytics = this.generatePriceAnalytics(product.id);
    
    if (analytics.trend === 'rising') {
      recommendations.push({
        type: 'price_rising',
        message: 'Price is trending upward. Consider buying soon.',
        urgency: 'medium'
      });
    } else if (analytics.trend === 'falling') {
      recommendations.push({
        type: 'wait',
        message: 'Price is trending downward. You might want to wait.',
        urgency: 'low'
      });
    }
    
    return recommendations;
  }

  // Helper methods for statistics

  calculateTotalSavingsForAll() {
    return Array.from(this.trackedProducts.values())
      .reduce((total, product) => total + this.calculateTotalSavings(product), 0);
  }

  calculateAverageSavings() {
    const products = Array.from(this.trackedProducts.values());
    if (products.length === 0) return 0;
    
    const totalSavings = this.calculateTotalSavingsForAll();
    return totalSavings / products.length;
  }

  findBestDeal() {
    const products = Array.from(this.trackedProducts.values());
    if (products.length === 0) return null;
    
    return products.reduce((best, product) => {
      const savings = this.calculateTotalSavings(product);
      const bestSavings = best ? this.calculateTotalSavings(best) : 0;
      return savings > bestSavings ? product : best;
    }, null);
  }

  getRecentNotifications(days) {
    const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    return this.notifications.filter(notif => new Date(notif.timestamp) >= cutoff);
  }

  countRecentPriceDrops(days) {
    const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    return this.notifications.filter(notif => 
      notif.type === 'price_drop' && new Date(notif.timestamp) >= cutoff
    ).length;
  }

  getTopSavingProducts(limit = 5) {
    return Array.from(this.trackedProducts.values())
      .map(product => ({
        ...product,
        totalSavings: this.calculateTotalSavings(product)
      }))
      .sort((a, b) => b.totalSavings - a.totalSavings)
      .slice(0, limit);
  }

  calculateSuccessRate() {
    const products = Array.from(this.trackedProducts.values());
    if (products.length === 0) return 100;
    
    const activeProducts = products.filter(p => p.status === 'active').length;
    return Math.round((activeProducts / products.length) * 100);
  }

  calculateAverageTrackingDuration() {
    const products = Array.from(this.trackedProducts.values());
    if (products.length === 0) return 0;
    
    const now = new Date();
    const totalDays = products.reduce((sum, product) => {
      const createdDate = new Date(product.createdAt);
      const days = (now - createdDate) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / products.length);
  }

  processPriceComparison(response) {
    return {
      ...response,
      comparisonDate: new Date().toISOString(),
      sitesCompared: Object.keys(response.sites || {}),
      bestDeal: response.recommendation,
      savings: response.potentialSavings || 0
    };
  }

  // Storage methods

  loadTrackedProducts() {
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = localStorage.getItem('priceVision_trackedProducts');
      if (saved) {
        const data = JSON.parse(saved);
        this.trackedProducts = new Map(Object.entries(data.products || {}));
        this.priceHistory = new Map(Object.entries(data.priceHistory || {}));
        this.notifications = data.notifications || [];
      }
    } catch (error) {
      console.warn('Failed to load tracked products:', error);
    }
  }

  saveTrackedProducts() {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        products: Object.fromEntries(this.trackedProducts),
        priceHistory: Object.fromEntries(this.priceHistory),
        notifications: this.notifications.slice(0, 50), // Save only recent notifications
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('priceVision_trackedProducts', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save tracked products:', error);
    }
  }

  // Auto-sync setup

  startAutoSync() {
    // Sync every 5 minutes
    setInterval(() => {
      this.syncWithBackend().catch(error => {
        console.warn('Auto-sync failed:', error);
      });
    }, 5 * 60 * 1000);
  }

  // Public API for notifications

  onNotification(callback) {
    this.notificationCallbacks.push(callback);
  }

  offNotification(callback) {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  markNotificationRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  clearNotifications() {
    this.notifications = [];
  }
}

// Create singleton instance
const priceTrackingService = new PriceTrackingService();

export default priceTrackingService;
