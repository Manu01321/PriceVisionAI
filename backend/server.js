const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Import services
const BrowserPool = require('./utils/browser-pool');
const ProductSearchService = require('./services/product-search');
const PriceTracker = require('./services/price-tracker');
const ImageSearchService = require('./services/image-search');
const OpenAIService = require('./services/openai-service');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'price-vision-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// No external datastores required; defaults to file/SQLite persistence
let redisClient = null;

// Handle preflight requests FIRST before any other middleware
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// CORS middleware - must come before helmet
app.use(
  cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

// Explicit CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  next();
});

// Helmet with relaxed settings for development
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use('/api/', limiter);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize services
let browserPool;
let productSearchService;
let priceTracker;
let imageSearchService;

async function initializeServices() {
  logger.info('Initializing backend services...');

  // Initialize browser pool (optional - scraping features only)
  try {
    browserPool = new BrowserPool({
      maxBrowsers: parseInt(process.env.MAX_CONCURRENT_BROWSERS) || 3,
      timeout: parseInt(process.env.SCRAPING_TIMEOUT) || 30000
    });
    await browserPool.initialize();
    logger.info('Browser pool initialized successfully');
  } catch (error) {
    logger.warn(
      'Browser pool unavailable (run: npx playwright install). Scraping features disabled.'
    );
    browserPool = null;
  }

  // Initialize services (work with or without browser pool)
  try {
    productSearchService = new ProductSearchService(browserPool, logger, {
      cacheClient: redisClient
    });
    priceTracker = new PriceTracker(browserPool, logger);
    imageSearchService = new ImageSearchService(browserPool, logger, { cacheClient: redisClient });
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.warn('Some services failed to initialize:', error.message);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      browserPool: browserPool ? 'active' : 'inactive',
      productSearch: productSearchService ? 'active' : 'inactive',
      priceTracker: priceTracker ? 'active' : 'inactive',
      imageSearch: imageSearchService ? 'active' : 'inactive',
      openai: OpenAIService ? 'active' : 'inactive'
    }
  });
});

// Product search endpoints
app.post('/api/search/text', async (req, res) => {
  try {
    const { query, filters = {}, limit = 20 } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long'
      });
    }

    logger.info(`Text search request: "${query}"`);

    const results = await productSearchService.searchByText(query, {
      ...filters,
      limit: Math.min(limit, 50) // Cap at 50 results
    });

    res.json({
      success: true,
      query,
      results: results.results || results,
      count: results.count || results.length,
      sites: results.sites || {},
      filters: results.filters || {},
      searchTime: results.searchTime || 'N/A',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Text search error:', error);
    res.status(500).json({
      error: 'Failed to perform text search',
      message: error.message
    });
  }
});

app.post('/api/search/image', upload.single('image'), async (req, res) => {
  try {
    let imageBase64 = req.body.imageBase64;
    const imageUrl = req.body.imageUrl;
    const confidence = parseFloat(req.body.confidence) || 0.7;
    const limit = parseInt(req.body.limit) || 20;

    // Handle multipart file upload
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({
        error: 'Either imageUrl or imageBase64 is required'
      });
    }

    logger.info('Image search request received');

    const results = await imageSearchService.searchByImage({
      imageUrl,
      imageBase64,
      confidence: Math.min(Math.max(confidence, 0.1), 1.0),
      limit: Math.min(limit, 30)
    });

    const extractedInfo = results.extractedInfo || results.aiAnalysis || {};
    res.json({
      success: true,
      results: results.results || results,
      count: results.resultsCount || results.length,
      extractedInfo,
      aiAnalysis: extractedInfo,
      confidence: results.searchConfidence || results.confidence || 0.7,
      searchMethod: results.searchMethod || 'ai_image_analysis',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Image search error:', error);
    res.status(500).json({
      error: 'Failed to perform image search',
      message: error.message
    });
  }
});

// Analyze image without search (AI analysis only)
app.post('/api/analyze/image', upload.single('image'), async (req, res) => {
  try {
    let imageBase64 = req.body.imageBase64;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }

    if (!imageBase64) {
      return res.status(400).json({
        error: 'imageBase64 is required for analysis'
      });
    }

    logger.info('Image analysis request received');

    // Extract just the AI analysis part
    const analysis = await imageSearchService.searchByImage({
      imageBase64,
      confidence: 0.8,
      limit: 1
    });

    const extractedInfo = analysis.extractedInfo || analysis.aiAnalysis || {};
    res.json({
      success: true,
      extractedInfo,
      confidence: analysis.searchConfidence || analysis.confidence || 0.6,
      imageInfo: analysis.imageInfo || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Image analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze image',
      message: error.message
    });
  }
});

// Get product details by URL
app.post('/api/product/details', async (req, res) => {
  try {
    const { productUrl } = req.body;

    if (!productUrl) {
      return res.status(400).json({
        error: 'Product URL is required'
      });
    }

    logger.info(`Product details request: ${productUrl}`);

    // Determine which scraper to use based on URL
    let scraper;
    if (productUrl.includes('amazon.in')) {
      const AmazonScraper = require('./scrapers/amazon-scraper');
      scraper = new AmazonScraper(browserPool, logger);
    } else if (productUrl.includes('flipkart.com')) {
      const FlipkartScraper = require('./scrapers/flipkart-scraper');
      scraper = new FlipkartScraper(browserPool, logger);
    } else {
      return res.status(400).json({
        error: 'Unsupported product URL. Currently supports Amazon India and Flipkart.'
      });
    }

    const productData = await scraper.extractProductData(
      {
        release: () => {} // Mock release function
      },
      productUrl
    );

    res.json({
      success: true,
      product: productData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Product details error:', error);
    res.status(500).json({
      error: 'Failed to get product details',
      message: error.message
    });
  }
});

// Price comparison endpoints
app.post('/api/compare/prices', async (req, res) => {
  try {
    const { productName, productUrl, sites = [] } = req.body;

    if (!productName || productName.trim().length < 2) {
      return res.status(400).json({
        error: 'Product name is required'
      });
    }

    logger.info(`Price comparison request: "${productName}"`);

    const comparison = await priceTracker.compareAcrossSites({
      productName: productName.trim(),
      productUrl,
      targetSites: sites.length > 0 ? sites : ['amazon', 'flipkart', 'myntra', 'snapdeal']
    });

    res.json({
      success: true,
      productName,
      comparison,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Price comparison error:', error);
    res.status(500).json({
      error: 'Failed to compare prices',
      message: error.message
    });
  }
});

// Price tracking endpoints
app.post('/api/track/product', async (req, res) => {
  try {
    const { productUrl, targetPrice, notificationMethod } = req.body;

    if (!productUrl) {
      return res.status(400).json({
        error: 'Product URL is required'
      });
    }

    logger.info(`Price tracking request: ${productUrl}`);

    const trackingId = await priceTracker.addToTracking({
      productUrl,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      notificationMethod: notificationMethod || 'api'
    });

    res.json({
      success: true,
      trackingId,
      message: 'Product added to price tracking',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Price tracking error:', error);
    res.status(500).json({
      error: 'Failed to add product to tracking',
      message: error.message
    });
  }
});

// Remove product from tracking
app.delete('/api/track/product/:id', async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Remove tracking request: ${id}`);

    await priceTracker.removeFromTracking(id);

    res.json({
      success: true,
      message: 'Product removed from tracking',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Remove tracking error:', error);
    res.status(500).json({
      error: 'Failed to remove product from tracking',
      message: error.message
    });
  }
});

// Update tracking settings
app.put('/api/track/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    logger.info(`Update tracking settings: ${id}`);

    const updatedTracking = await priceTracker.updateTrackingSettings(id, updates);

    res.json({
      success: true,
      trackingData: updatedTracking,
      message: 'Tracking settings updated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Update tracking error:', error);
    res.status(500).json({
      error: 'Failed to update tracking settings',
      message: error.message
    });
  }
});

// Sync tracking data
app.post('/api/track/sync', async (req, res) => {
  try {
    const { trackingIds = [] } = req.body;

    logger.info(`Sync tracking data for ${trackingIds.length} products`);

    // Get current tracking data for requested IDs
    const updates = [];
    for (const trackingId of trackingIds) {
      try {
        // This would normally fetch fresh data from the tracker
        // For now, return minimal sync data
        updates.push({
          trackingId,
          currentPrice: null,
          lastChecked: new Date().toISOString(),
          status: 'active'
        });
      } catch (error) {
        logger.warn(`Failed to sync tracking ${trackingId}:`, error.message);
      }
    }

    res.json({
      success: true,
      updates,
      syncedCount: updates.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Sync tracking error:', error);
    res.status(500).json({
      error: 'Failed to sync tracking data',
      message: error.message
    });
  }
});

// Get supported sites
app.get('/api/sites', (req, res) => {
  res.json({
    success: true,
    sites: [
      {
        name: 'Amazon India',
        code: 'amazon',
        domain: 'amazon.in',
        features: ['search', 'price', 'reviews', 'image_search'],
        accuracy: 95
      },
      {
        name: 'Flipkart',
        code: 'flipkart',
        domain: 'flipkart.com',
        features: ['search', 'price', 'reviews', 'image_search'],
        accuracy: 92
      },
      {
        name: 'Myntra',
        code: 'myntra',
        domain: 'myntra.com',
        features: ['search', 'price', 'image_search'],
        accuracy: 88
      },
      {
        name: 'Snapdeal',
        code: 'snapdeal',
        domain: 'snapdeal.com',
        features: ['search', 'price'],
        accuracy: 85
      },
      {
        name: 'Ajio',
        code: 'ajio',
        domain: 'ajio.com',
        features: ['search', 'price', 'image_search'],
        accuracy: 87
      }
    ]
  });
});

// Configuration info endpoint
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV || 'development',
    server: {
      port: process.env.PORT || 5000,
      timeout: parseInt(process.env.SCRAPING_TIMEOUT) || 30000,
      maxBrowsers: parseInt(process.env.MAX_CONCURRENT_BROWSERS) || 3
    },
    features: {
      geminiAI: !!process.env.GEMINI_API_KEY,
      openAI: true, // Multiple keys configured
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      email: !!process.env.EMAIL_SERVICE_KEY
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    timestamp: new Date().toISOString()
  });
});

// OpenAI AI Assistant endpoints
app.post('/api/ai/search', async (req, res) => {
  try {
    const { query, context = {} } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long'
      });
    }

    logger.info(`AI-powered search request: "${query}"`);

    const aiSearchResult = await OpenAIService.searchProduct(query, context);

    res.json({
      success: true,
      query,
      aiAnalysis: aiSearchResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI search error:', error);
    res.status(500).json({
      error: 'Failed to perform AI search',
      message: error.message
    });
  }
});

app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { userPreferences = {}, recentSearches = [] } = req.body;

    logger.info('AI recommendations request');

    const recommendations = await OpenAIService.getRecommendations(userPreferences, recentSearches);

    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get AI recommendations',
      message: error.message
    });
  }
});

app.post('/api/ai/analyze-price', async (req, res) => {
  try {
    const { priceHistory, productName } = req.body;

    if (!priceHistory || !Array.isArray(priceHistory) || priceHistory.length === 0) {
      return res.status(400).json({
        error: 'Price history array is required'
      });
    }

    logger.info(`AI price analysis request for: "${productName}"`);

    const analysis = await OpenAIService.analyzePriceTrend(priceHistory, productName);

    res.json({
      success: true,
      productName,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI price analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze price trend',
      message: error.message
    });
  }
});

app.post('/api/ai/analyze-product-image', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: 'Image URL is required'
      });
    }

    logger.info('AI image analysis request (OpenAI Vision)');

    const analysis = await OpenAIService.analyzeImage(imageUrl, prompt);

    res.json({
      success: true,
      analysis: analysis.choices[0].message.content,
      model: analysis.model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI image analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze product image',
      message: error.message
    });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Messages array is required'
      });
    }

    logger.info('AI chat request');

    const response = await OpenAIService.createChatCompletion(messages, options);

    res.json({
      success: true,
      response: response.choices[0].message,
      usage: response.usage,
      model: response.model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      message: error.message
    });
  }
});

app.get('/api/ai/status', (req, res) => {
  try {
    const status = OpenAIService.getStatus();

    res.json({
      success: true,
      openai: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI status error:', error);
    res.status(500).json({
      error: 'Failed to get AI status',
      message: error.message
    });
  }
});

app.post('/api/ai/reset-keys', (req, res) => {
  try {
    OpenAIService.resetKeys();

    res.json({
      success: true,
      message: 'All OpenAI API keys have been reset',
      status: OpenAIService.getStatus(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI reset keys error:', error);
    res.status(500).json({
      error: 'Failed to reset AI keys',
      message: error.message
    });
  }
});

// API test endpoint for quick verification
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Price Vision API is working correctly',
    endpoints: {
      health: 'GET /api/health',
      sites: 'GET /api/sites',
      textSearch: 'POST /api/search/text',
      imageSearch: 'POST /api/search/image',
      imageAnalysis: 'POST /api/analyze/image',
      productDetails: 'POST /api/product/details',
      priceComparison: 'POST /api/compare/prices',
      trackProduct: 'POST /api/track/product',
      updateTracking: 'PUT /api/track/product/:id',
      removeTracking: 'DELETE /api/track/product/:id',
      syncTracking: 'POST /api/track/sync',
      aiSearch: 'POST /api/ai/search',
      aiRecommendations: 'POST /api/ai/recommendations',
      aiPriceAnalysis: 'POST /api/ai/analyze-price',
      aiImageAnalysis: 'POST /api/ai/analyze-product-image',
      aiChat: 'POST /api/ai/chat',
      aiStatus: 'GET /api/ai/status',
      aiResetKeys: 'POST /api/ai/reset-keys'
    },
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');

  if (browserPool) {
    await browserPool.cleanup();
  }

  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');

  if (browserPool) {
    await browserPool.cleanup();
  }

  process.exit(0);
});

// Start server
async function startServer() {
  await initializeServices();

  app.listen(PORT, () => {
    logger.info(`🚀 Price Vision Backend running on port ${PORT}`);
    logger.info(`🌐 API endpoints available at http://localhost:${PORT}/api`);
    logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
    logger.info(
      `⚠️  Scraping: ${browserPool ? 'enabled' : 'disabled (run: npx playwright install)'}`
    );
  });
}

startServer();
