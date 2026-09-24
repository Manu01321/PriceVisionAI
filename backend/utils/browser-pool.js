const { chromium } = require('playwright');
const path = require('path');

class BrowserPool {
  constructor(options = {}) {
    this.maxBrowsers = options.maxBrowsers || 3;
    this.timeout = options.timeout || 30000;
    this.proxyList = (process.env.PROXY_LIST || '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    this.rotateProxy = String(process.env.PROXY_ROTATION || '').toLowerCase() === 'true';
    this.defaultProxy =
      process.env.USE_PROXY && process.env.USE_PROXY !== 'false' ? process.env.PROXY_URL || '' : '';
    this.browsers = [];
    this.activeSessions = new Map();
    this.isInitialized = false;

    // Anti-detection configurations
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    this.viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 }
    ];
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log(`🔧 Initializing browser pool with ${this.maxBrowsers} browsers...`);

    try {
      for (let i = 0; i < this.maxBrowsers; i++) {
        const browser = await this.createBrowser();
        this.browsers.push({
          id: `browser-${i}`,
          instance: browser,
          inUse: false,
          createdAt: Date.now(),
          requestCount: 0
        });
      }

      this.isInitialized = true;
      console.log(`✅ Browser pool initialized successfully`);
    } catch (error) {
      console.error('❌ Failed to initialize browser pool:', error);
      throw error;
    }
  }

  async createBrowser() {
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    const randomViewport = this.viewports[Math.floor(Math.random() * this.viewports.length)];
    const proxy = this.getProxy();

    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-blink-features=AutomationControlled',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic',
        '--use-mock-keychain',
        '--export-tagged-pdf'
      ],
      proxy: proxy ? { server: proxy } : undefined
    });

    // Set up stealth measures
    const context = await browser.newContext({
      userAgent: randomUserAgent,
      viewport: randomViewport,
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
      permissions: [],
      extraHTTPHeaders: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    // Add stealth scripts
    await context.addInitScript(`
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Remove traces of headless
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override the navigator.languages property
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-IN', 'en', 'hi'],
      });

      // Override the navigator.platform property  
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
      });

      // Remove headless flag
      window.chrome = {
        runtime: {},
      };

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    `);

    return { browser, context };
  }

  async getBrowser(sessionId = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Find available browser
    const availableBrowser = this.browsers.find((b) => !b.inUse);

    if (!availableBrowser) {
      // Wait for a browser to become available
      await this.waitForAvailableBrowser();
      return this.getBrowser(sessionId);
    }

    availableBrowser.inUse = true;
    availableBrowser.requestCount++;

    if (sessionId) {
      this.activeSessions.set(sessionId, availableBrowser.id);
    }

    console.log(
      `🌐 Browser ${availableBrowser.id} allocated (Request #${availableBrowser.requestCount})`
    );

    return {
      browserId: availableBrowser.id,
      browser: availableBrowser.instance.browser,
      context: availableBrowser.instance.context,
      release: () => this.releaseBrowser(availableBrowser.id, sessionId)
    };
  }

  async waitForAvailableBrowser(maxWait = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const availableBrowser = this.browsers.find((b) => !b.inUse);
      if (availableBrowser) return;

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error('No browsers available within timeout period');
  }

  releaseBrowser(browserId, sessionId = null) {
    const browser = this.browsers.find((b) => b.id === browserId);

    if (browser) {
      browser.inUse = false;
      console.log(`🔓 Browser ${browserId} released`);

      if (sessionId && this.activeSessions.has(sessionId)) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  async createPage(browser) {
    const page = await browser.context.newPage();

    // Set additional anti-detection measures
    await page.setExtraHTTPHeaders({
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    });

    // Block unnecessary resources for speed
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();

      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        // Block images, CSS, fonts for faster loading
        route.abort();
      } else {
        route.continue();
      }
    });

    // Set timeout
    page.setDefaultTimeout(this.timeout);

    // Add random delays to mimic human behavior
    await page.evaluateOnNewDocument(() => {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (type === 'mousedown' || type === 'mouseup') {
          const delay = Math.random() * 50 + 10;
          setTimeout(() => originalAddEventListener.call(this, type, listener, options), delay);
        } else {
          originalAddEventListener.call(this, type, listener, options);
        }
      };
    });

    return page;
  }

  async cleanup() {
    console.log('🧹 Cleaning up browser pool...');

    try {
      await Promise.all(
        this.browsers.map(async (browserObj) => {
          try {
            await browserObj.instance.context.close();
            await browserObj.instance.browser.close();
          } catch (error) {
            console.error(`Error closing browser ${browserObj.id}:`, error);
          }
        })
      );

      this.browsers = [];
      this.activeSessions.clear();
      this.isInitialized = false;

      console.log('✅ Browser pool cleaned up successfully');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  getStats() {
    return {
      totalBrowsers: this.browsers.length,
      activeBrowsers: this.browsers.filter((b) => b.inUse).length,
      availableBrowsers: this.browsers.filter((b) => !b.inUse).length,
      activeSessions: this.activeSessions.size,
      totalRequests: this.browsers.reduce((sum, b) => sum + b.requestCount, 0),
      isInitialized: this.isInitialized
    };
  }

  // Utility method for random delays
  static async randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Human-like mouse movement
  static async humanMouseMove(page, selector) {
    const element = await page.$(selector);
    if (element) {
      const box = await element.boundingBox();
      if (box) {
        const x = box.x + box.width / 2 + (Math.random() - 0.5) * 10;
        const y = box.y + box.height / 2 + (Math.random() - 0.5) * 10;

        await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) + 5 });
        await this.randomDelay(50, 200);
      }
    }
  }

  getProxy() {
    if (this.rotateProxy && this.proxyList.length > 0) {
      return this.proxyList[Math.floor(Math.random() * this.proxyList.length)];
    }
    return this.defaultProxy || null;
  }
}

module.exports = BrowserPool;
