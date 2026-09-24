const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const SQLiteClient = require('../utils/sqlite-client');

class PriceTracker {
  constructor(browserPool, logger) {
    this.browserPool = browserPool;
    this.logger = logger;
    this.sqlite = new SQLiteClient(undefined, logger);
    this.sqlite.init();
    this.persistenceMode = this.sqlite.ready ? 'sqlite' : 'file';
    this.logger.info(`Price tracker persistence: ${this.persistenceMode}`);
    
    // Initialize tracking data storage
    this.trackingDataFile = path.join(__dirname, '../data/price-tracking.json');
    this.trackedProducts = new Map();
    this.priceHistory = new Map();
    
    // Notification callbacks
    this.notificationCallbacks = new Map();
    
    // Initialize data storage
    this.initializeDataStorage();
    
    // Start background price monitoring
    this.startPriceMonitoring();
  }

  async initializeDataStorage() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.trackingDataFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Load existing tracking data
      await this.loadTrackingData();
      
      this.logger.info('Price tracking data initialized');
    } catch (error) {
      this.logger.error('Failed to initialize price tracking:', error);
    }
  }

  async loadTrackingData() {
    try {
      const data = await fs.readFile(this.trackingDataFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Restore tracked products
      if (parsed.trackedProducts) {
        this.trackedProducts = new Map(Object.entries(parsed.trackedProducts));
      }
      
      // Restore price history
      if (parsed.priceHistory) {
        this.priceHistory = new Map(Object.entries(parsed.priceHistory));
      }
      
      this.logger.info(`Loaded ${this.trackedProducts.size} tracked products`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.warn('Failed to load tracking data:', error.message);
      }
    }
  }

  async saveTrackingData() {
    try {
      const data = {
        trackedProducts: Object.fromEntries(this.trackedProducts),
        priceHistory: Object.fromEntries(this.priceHistory),
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(this.trackingDataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.error('Failed to save tracking data:', error);
    }
  }

  async addToTracking(options = {}) {
    const {
      productUrl,
      targetPrice = null,
      notificationMethod = 'api',
      checkInterval = 15, // minutes
      productName = null
    } = options;
    
    if (!productUrl) {
      throw new Error('Product URL is required');
    }
    
    const trackingId = this.generateTrackingId(productUrl);
    
    try {
      // Get initial product data
      const initialData = await this.scrapeProductData(productUrl);

      if (this.persistenceMode === 'sqlite' && this.sqlite.ready) {
        const trackingData = {
          id: trackingId,
          productUrl,
          productName: productName || initialData.title || 'Unknown Product',
          targetPrice,
          notificationMethod,
          checkInterval,
          createdAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          currentPrice: initialData.price,
          lowestPrice: initialData.price,
          highestPrice: initialData.price,
          priceDrops: 0,
          status: 'active',
          source: initialData.source || 'unknown',
          initialData
        };

        this.sqlite.upsertTrackedProduct(trackingData);
        await this.addPricePointToDb(trackingId, initialData.price, initialData);
        this.logger.info(`Added product to tracking (SQLite): ${trackingData.productName}`);
        return trackingId;
      }

      const trackingData = {
        id: trackingId,
        productUrl,
        productName: productName || initialData.title || 'Unknown Product',
        targetPrice,
        notificationMethod,
        checkInterval,
        createdAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        currentPrice: initialData.price,
        lowestPrice: initialData.price,
        highestPrice: initialData.price,
        priceDrops: 0,
        status: 'active',
        source: initialData.source || 'unknown',
        initialData
      };
      
      // Store tracking data
      this.trackedProducts.set(trackingId, trackingData);
      
      // Initialize price history
      if (!this.priceHistory.has(trackingId)) {
        this.priceHistory.set(trackingId, []);
      }
      
      // Add initial price point
      await this.addPricePoint(trackingId, initialData.price, initialData);
      
      // Save to persistent storage
      await this.saveTrackingData();
      
      this.logger.info(`Added product to tracking: ${trackingData.productName} (${trackingId})`);
      
      return trackingId;
      
    } catch (error) {
      this.logger.error('Failed to add product to tracking:', error);
      throw error;
    }
  }

  async scrapeProductData(productUrl) {
    const browserSession = await this.browserPool.getBrowser();
    
    try {
      // Determine which scraper to use based on URL
      const scraper = this.getScraper(productUrl);
      if (!scraper) {
        throw new Error(`No scraper available for URL: ${productUrl}`);
      }
      
      const productData = await scraper.getProductDetails(productUrl);
      return productData;
      
    } catch (error) {
      this.logger.error(`Failed to scrape product data: ${error.message}`);
      throw error;
    } finally {
      browserSession.release();
    }
  }

  getScraper(productUrl) {
    // Import scrapers dynamically to avoid circular dependencies
    const AmazonScraper = require('../scrapers/amazon-scraper');
    const FlipkartScraper = require('../scrapers/flipkart-scraper');
    
    if (productUrl.includes('amazon.in')) {
      return new AmazonScraper(this.browserPool, this.logger);
    } else if (productUrl.includes('flipkart.com')) {
      return new FlipkartScraper(this.browserPool, this.logger);
    }
    
    return null;
  }

  generateTrackingId(productUrl) {
    const hash = require('crypto').createHash('md5').update(productUrl).digest('hex');
    return `track_${Date.now()}_${hash.substring(0, 8)}`;
  }

  async addPricePoint(trackingId, price, additionalData = {}) {
    if (this.persistenceMode === 'sqlite') {
      return this.addPricePointToDb(trackingId, price, additionalData);
    }

    if (!this.priceHistory.has(trackingId)) {
      this.priceHistory.set(trackingId, []);
    }
    
    const history = this.priceHistory.get(trackingId);
    const pricePoint = {
      timestamp: new Date().toISOString(),
      price: price,
      availability: additionalData.availability || 'unknown',
      ...additionalData
    };
    
    history.push(pricePoint);
    
    // Keep only last 1000 price points to prevent memory issues
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    this.priceHistory.set(trackingId, history);
  }

  async addPricePointToDb(trackingId, price, additionalData = {}) {
    try {
      this.sqlite.addPricePoint(trackingId, price, additionalData);
    } catch (error) {
      this.logger.warn(`Failed to append price history for ${trackingId}: ${error.message}`);
    }
  }

  async compareAcrossSites(options = {}) {
    const { productName, productUrl, targetSites = ['amazon', 'flipkart'] } = options;
    
    if (!productName) {
      throw new Error('Product name is required for comparison');
    }
    
    try {
      this.logger.info(`Starting price comparison for: ${productName}`);
      
      const ProductSearchService = require('./product-search');
      const searchService = new ProductSearchService(this.browserPool, this.logger);
      
      // Search across specified sites
      const searchResults = await searchService.searchByText(productName, {
        sites: targetSites,
        limit: 10,
        parallel: true
      });
      
      // Group results by site
      const comparison = {
        productName,
        originalUrl: productUrl,
        timestamp: new Date().toISOString(),
        sites: {},
        bestPrice: null,
        worstPrice: null,
        averagePrice: 0,
        totalResults: searchResults.length
      };
      
      // Process results by site
      targetSites.forEach(siteName => {
        const siteResults = searchResults.filter(r => r.source.site === siteName);
        
        if (siteResults.length > 0) {
          const prices = siteResults.filter(r => r.price).map(r => r.price);
          
          comparison.sites[siteName] = {
            available: true,
            resultsCount: siteResults.length,
            lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
            highestPrice: prices.length > 0 ? Math.max(...prices) : null,
            averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
            bestMatch: siteResults[0], // Top result
            allResults: siteResults.slice(0, 5) // Top 5 results
          };
        } else {
          comparison.sites[siteName] = {
            available: false,
            resultsCount: 0,
            lowestPrice: null,
            highestPrice: null,
            averagePrice: null,
            bestMatch: null,
            allResults: []
          };
        }
      });
      
      // Calculate overall statistics
      const allPrices = searchResults.filter(r => r.price).map(r => r.price);
      
      if (allPrices.length > 0) {
        comparison.bestPrice = Math.min(...allPrices);
        comparison.worstPrice = Math.max(...allPrices);
        comparison.averagePrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
        comparison.priceDifference = comparison.worstPrice - comparison.bestPrice;
        comparison.potentialSavings = comparison.priceDifference;
      }
      
      // Find best deal
      const bestDeal = searchResults
        .filter(r => r.price)
        .sort((a, b) => a.price - b.price)[0];
      
      if (bestDeal) {
        comparison.recommendation = {
          site: bestDeal.source.site,
          product: bestDeal,
          reason: 'Lowest price found',
          savings: comparison.worstPrice ? comparison.worstPrice - bestDeal.price : 0
        };
      }
      
      this.logger.info(`Price comparison completed: ${comparison.totalResults} results across ${targetSites.length} sites`);
      
      return comparison;
      
    } catch (error) {
      this.logger.error('Price comparison failed:', error);
      throw error;
    }
  }

  startPriceMonitoring() {
    // Run price monitoring every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.monitorPrices();
    });
    
    this.logger.info('Price monitoring cron job started (every 15 minutes)');
  }

  async monitorPrices() {
    let items = [];

    if (this.persistenceMode === 'sqlite' && this.sqlite.ready) {
      items = this.sqlite.listTrackedProducts().filter(p => p.status === 'active');
    } else {
      if (this.trackedProducts.size === 0) {
        return;
      }
      items = Array.from(this.trackedProducts.entries()).map(([id, data]) => ({ id, ...data }));
    }

    this.logger.info(`Monitoring prices for ${items.length} products`);
    
    for (const item of items) {
      const trackingId = item._id ? item._id.toString() : item.id;
      const trackingData = item;
      
      try {
        if (trackingData.status !== 'active') continue;
        
        // Check if it's time to monitor this product
        const lastChecked = new Date(trackingData.lastChecked);
        const now = new Date();
        const minutesSinceLastCheck = (now - lastChecked) / (1000 * 60);
        
        if (minutesSinceLastCheck < trackingData.checkInterval) {
          continue;
        }
        
        await this.checkProductPrice(trackingId, trackingData);
        
        // Add delay between requests to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        this.logger.error(`Failed to monitor product ${trackingId}:`, error.message);
      }
    }
    
    // Save updated data if using file persistence
    if (this.persistenceMode !== 'mongo') {
      await this.saveTrackingData();
    }
  }

  async checkProductPrice(trackingId, trackingData = null) {
    const data = trackingData || this.trackedProducts.get(trackingId);
    if (!data) return;
    
    try {
      const currentData = await this.scrapeProductData(data.productUrl);
      const currentPrice = currentData.price;
      
      if (!currentPrice) {
        this.logger.warn(`No price found for tracked product: ${trackingId}`);
        return;
      }
      
      // Update tracking data
      const oldPrice = data.currentPrice;
      data.currentPrice = currentPrice;
      data.lastChecked = new Date().toISOString();
      
      // Update price bounds
      if (!data.lowestPrice || currentPrice < data.lowestPrice) {
        data.lowestPrice = currentPrice;
      }
      
      if (!data.highestPrice || currentPrice > data.highestPrice) {
        data.highestPrice = currentPrice;
      }
      
      // Add price point to history
      await this.addPricePoint(trackingId, currentPrice, {
        availability: currentData.availability,
        previousPrice: oldPrice
      });
      
      // Check for price changes
      const priceChange = oldPrice ? currentPrice - oldPrice : 0;
      
      if (priceChange < 0) {
        data.priceDrops++;
        this.logger.info(`Price drop detected for ${data.productName}: ${oldPrice} -> ${currentPrice}`);
        
        // Check if target price is reached
        if (data.targetPrice && currentPrice <= data.targetPrice) {
          await this.sendNotification(trackingId, 'target_price_reached', {
            currentPrice,
            targetPrice: data.targetPrice,
            priceChange
          });
        } else {
          await this.sendNotification(trackingId, 'price_drop', {
            currentPrice,
            oldPrice,
            priceChange
          });
        }
      } else if (priceChange > 0) {
        this.logger.info(`Price increase for ${data.productName}: ${oldPrice} -> ${currentPrice}`);
      }
      
      // Update stored data
      if (this.persistenceMode === 'sqlite' && this.sqlite.ready) {
        this.sqlite.upsertTrackedProduct(data);
      } else {
        this.trackedProducts.set(trackingId, data);
      }
      
    } catch (error) {
      this.logger.error(`Failed to check price for ${trackingId}:`, error.message);
    }
  }

  async sendNotification(trackingId, type, data) {
    let trackingData = this.trackedProducts.get(trackingId);
    if (!trackingData && this.persistenceMode === 'sqlite' && this.sqlite.ready) {
      trackingData = this.sqlite.listTrackedProducts().find(p => p.id === trackingId || p.productUrl === trackingId);
    }
    if (!trackingData) return;
    
    const notification = {
      trackingId,
      type,
      productName: trackingData.productName,
      productUrl: trackingData.productUrl,
      timestamp: new Date().toISOString(),
      data
    };
    
    this.logger.info(`Sending notification: ${type} for ${trackingData.productName}`);
    
    // Call registered notification callbacks
    if (this.notificationCallbacks.has(trackingData.notificationMethod)) {
      const callback = this.notificationCallbacks.get(trackingData.notificationMethod);
      try {
        await callback(notification);
      } catch (error) {
        this.logger.error('Notification callback failed:', error);
      }
    }
    
    // Default logging notification
    console.log('📢 PRICE ALERT:', notification);
  }

  // Register notification callback
  registerNotificationCallback(method, callback) {
    this.notificationCallbacks.set(method, callback);
  }

  // Get tracking statistics
  getTrackingStats() {
    const stats = {
      totalTrackedProducts: this.persistenceMode === 'sqlite' && this.sqlite.ready
        ? this.sqlite.listTrackedProducts().length
        : this.trackedProducts.size,
      activeProducts: 0,
      totalPriceChecks: 0,
      totalPriceDrops: 0,
      averageSavings: 0,
      topSavings: [],
      recentAlerts: []
    };
    
    for (const [trackingId, data] of this.trackedProducts.entries()) {
      if (data.status === 'active') {
        stats.activeProducts++;
      }
      
      stats.totalPriceDrops += data.priceDrops || 0;
      
      if (data.lowestPrice && data.highestPrice) {
        const savings = data.highestPrice - data.lowestPrice;
        if (savings > 0) {
          stats.topSavings.push({
            trackingId,
            productName: data.productName,
            savings,
            savingsPercentage: Math.round((savings / data.highestPrice) * 100)
          });
        }
      }
      
      const history = this.priceHistory.get(trackingId) || [];
      stats.totalPriceChecks += history.length;
    }
    
    // Sort top savings
    stats.topSavings.sort((a, b) => b.savings - a.savings);
    stats.topSavings = stats.topSavings.slice(0, 10);
    
    // Calculate average savings
    if (stats.topSavings.length > 0) {
      stats.averageSavings = stats.topSavings.reduce((sum, item) => sum + item.savings, 0) / stats.topSavings.length;
    }
    
    return stats;
  }

  // Get tracked products list
  async getTrackedProducts() {
    if (this.persistenceMode === 'sqlite' && this.sqlite.ready) {
      return this.sqlite.listTrackedProducts();
    }

    return Array.from(this.trackedProducts.entries()).map(([id, data]) => ({
      ...data,
      priceHistory: this.priceHistory.get(id) || []
    }));
  }

  // Remove product from tracking
  async removeFromTracking(trackingId) {
    if (this.persistenceMode === 'sqlite' && this.sqlite.ready) {
      this.sqlite.deleteTrackedProduct(trackingId);
      this.logger.info(`Removed product from tracking (SQLite): ${trackingId}`);
      return;
    }

    this.trackedProducts.delete(trackingId);
    this.priceHistory.delete(trackingId);
    await this.saveTrackingData();
    
    this.logger.info(`Removed product from tracking: ${trackingId}`);
  }

  // Update tracking settings
  async updateTrackingSettings(trackingId, updates) {
    if (this.persistenceMode === 'sqlite' && this.sqlite.ready) {
      const tracked = this.sqlite.listTrackedProducts().find(p => p.id === trackingId || p.productUrl === trackingId);
      if (!tracked) throw new Error('Tracking ID not found');

      const allowedFields = ['targetPrice', 'checkInterval', 'notificationMethod', 'status'];
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          tracked[field] = updates[field];
        }
      });
      tracked.lastChecked = new Date().toISOString();
      this.sqlite.upsertTrackedProduct(tracked);
      return tracked;
    }

    const trackingData = this.trackedProducts.get(trackingId);
    if (!trackingData) {
      throw new Error('Tracking ID not found');
    }
    
    // Update allowed fields
    const allowedFields = ['targetPrice', 'checkInterval', 'notificationMethod', 'status'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        trackingData[field] = updates[field];
      }
    });
    
    trackingData.updatedAt = new Date().toISOString();
    this.trackedProducts.set(trackingId, trackingData);
    
    await this.saveTrackingData();
    
    return trackingData;
  }
}

module.exports = PriceTracker;
