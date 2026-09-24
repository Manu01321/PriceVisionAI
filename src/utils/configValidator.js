// Configuration validator to ensure frontend-backend connectivity

const env =
  (typeof import.meta !== 'undefined' && import.meta.env) ||
  (typeof process !== 'undefined' && process.env) ||
  {};

export class ConfigValidator {
  constructor() {
    this.config = {
      apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:5001',
      apiTimeout: parseInt(env.VITE_API_TIMEOUT) || 30000,
      enableRealTimeSearch: env.VITE_ENABLE_REAL_TIME_SEARCH === 'true',
      enablePriceTracking: env.VITE_ENABLE_PRICE_TRACKING === 'true',
      enableImageSearch: env.VITE_ENABLE_IMAGE_SEARCH === 'true',
      maxSearchResults: parseInt(env.VITE_MAX_SEARCH_RESULTS) || 20,
      cacheEnabled: env.VITE_CACHE_ENABLED === 'true',
      notificationsEnabled: env.VITE_NOTIFICATIONS_ENABLED === 'true',
      searchDebounceMs: parseInt(env.VITE_SEARCH_DEBOUNCE_MS) || 500,
      parallelSearch: env.VITE_PARALLEL_SEARCH === 'true',
      maxImageSizeMB: parseInt(env.VITE_MAX_IMAGE_SIZE_MB) || 10
    };

    this.supportedSites = {
      amazon: env.VITE_ENABLE_AMAZON === 'true',
      flipkart: env.VITE_ENABLE_FLIPKART === 'true',
      myntra: env.VITE_ENABLE_MYNTRA === 'true',
      snapdeal: env.VITE_ENABLE_SNAPDEAL === 'true'
    };
  }

  /**
   * Validate all configuration settings
   * @returns {Object} Validation results
   */
  validateConfig() {
    const results = {
      valid: true,
      warnings: [],
      errors: [],
      config: this.config
    };

    // Check API base URL
    if (!this.config.apiBaseUrl || !this.isValidUrl(this.config.apiBaseUrl)) {
      results.errors.push('Invalid API base URL. Please check VITE_API_BASE_URL in .env file.');
      results.valid = false;
    }

    // Check timeout values
    if (this.config.apiTimeout < 5000) {
      results.warnings.push(
        'API timeout is very low (< 5 seconds). Consider increasing VITE_API_TIMEOUT.'
      );
    }

    if (this.config.apiTimeout > 60000) {
      results.warnings.push(
        'API timeout is very high (> 60 seconds). Consider reducing VITE_API_TIMEOUT.'
      );
    }

    // Check search settings
    if (this.config.maxSearchResults > 50) {
      results.warnings.push('Max search results is high (> 50). This might impact performance.');
    }

    if (this.config.searchDebounceMs < 200) {
      results.warnings.push(
        'Search debounce is very low (< 200ms). This might cause too many API requests.'
      );
    }

    // Check image settings
    if (this.config.maxImageSizeMB > 20) {
      results.warnings.push(
        'Max image size is very high (> 20MB). This might impact upload speed.'
      );
    }

    // Check at least one site is enabled
    const enabledSites = Object.values(this.supportedSites).filter(Boolean);
    if (enabledSites.length === 0) {
      results.errors.push(
        'No e-commerce sites are enabled. Enable at least one site in .env file.'
      );
      results.valid = false;
    }

    // Check core features
    if (!this.config.enableRealTimeSearch && !this.config.enableImageSearch) {
      results.warnings.push(
        'Both real-time search and image search are disabled. Enable at least one search method.'
      );
    }

    return results;
  }

  /**
   * Test backend connectivity
   * @returns {Promise<Object>} Connection test results
   */
  async testBackendConnection() {
    const results = {
      connected: false,
      endpoints: {},
      backendConfig: null,
      errors: []
    };

    try {
      // Test basic connectivity
      const healthResponse = await fetch(`${this.config.apiBaseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        results.connected = true;
        results.endpoints.health = {
          status: 'ok',
          data: healthData
        };
      } else {
        results.errors.push(`Health check failed: HTTP ${healthResponse.status}`);
      }

      // Test configuration endpoint
      try {
        const configResponse = await fetch(`${this.config.apiBaseUrl}/api/config`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });

        if (configResponse.ok) {
          const configData = await configResponse.json();
          results.backendConfig = configData;
          results.endpoints.config = {
            status: 'ok',
            data: configData
          };
        }
      } catch (error) {
        results.endpoints.config = {
          status: 'failed',
          error: error.message
        };
      }

      // Test sites endpoint
      try {
        const sitesResponse = await fetch(`${this.config.apiBaseUrl}/api/sites`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });

        if (sitesResponse.ok) {
          const sitesData = await sitesResponse.json();
          results.endpoints.sites = {
            status: 'ok',
            data: sitesData
          };
        }
      } catch (error) {
        results.endpoints.sites = {
          status: 'failed',
          error: error.message
        };
      }

      // Test API test endpoint
      try {
        const testResponse = await fetch(`${this.config.apiBaseUrl}/api/test`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });

        if (testResponse.ok) {
          const testData = await testResponse.json();
          results.endpoints.test = {
            status: 'ok',
            data: testData
          };
        }
      } catch (error) {
        results.endpoints.test = {
          status: 'failed',
          error: error.message
        };
      }
    } catch (error) {
      results.errors.push(`Connection failed: ${error.message}`);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        results.errors.push(
          'Backend server might not be running. Try starting it with: cd backend && node server.js'
        );
      }
    }

    return results;
  }

  /**
   * Get frontend-backend configuration comparison
   * @param {Object} backendConfig - Backend configuration
   * @returns {Object} Configuration comparison
   */
  compareConfigurations(backendConfig) {
    if (!backendConfig) {
      return { compatible: false, message: 'No backend configuration available' };
    }

    const comparison = {
      compatible: true,
      mismatches: [],
      recommendations: []
    };

    // Check API timeout compatibility
    const backendTimeout = backendConfig.server?.timeout || 30000;
    if (this.config.apiTimeout > backendTimeout) {
      comparison.mismatches.push({
        setting: 'API Timeout',
        frontend: `${this.config.apiTimeout}ms`,
        backend: `${backendTimeout}ms`,
        issue: 'Frontend timeout is higher than backend timeout'
      });
      comparison.compatible = false;
    }

    // Check feature availability
    if (this.config.enableImageSearch && !backendConfig.features?.geminiAI) {
      comparison.recommendations.push({
        feature: 'Image Search',
        message: 'Image search is enabled but Gemini AI is not configured in backend'
      });
    }

    return comparison;
  }

  /**
   * Generate configuration report
   * @returns {Promise<Object>} Complete configuration report
   */
  async generateReport() {
    console.log('🔍 Validating Price Vision Configuration...');

    const configValidation = this.validateConfig();
    const connectionTest = await this.testBackendConnection();

    const report = {
      timestamp: new Date().toISOString(),
      frontend: {
        validation: configValidation,
        config: this.config,
        supportedSites: this.supportedSites
      },
      backend: {
        connectionTest,
        config: connectionTest.backendConfig
      },
      compatibility: null,
      overall: {
        status: 'unknown',
        readyForUse: false,
        criticalIssues: [],
        recommendations: []
      }
    };

    // Compare configurations if backend is available
    if (connectionTest.connected && connectionTest.backendConfig) {
      report.compatibility = this.compareConfigurations(connectionTest.backendConfig);
    }

    // Determine overall status
    const hasErrors = configValidation.errors.length > 0 || connectionTest.errors.length > 0;
    const hasConnection = connectionTest.connected;
    const hasCompatibilityIssues = report.compatibility && !report.compatibility.compatible;

    if (hasErrors || !hasConnection) {
      report.overall.status = 'error';
      report.overall.criticalIssues = [...configValidation.errors, ...connectionTest.errors];
    } else if (hasCompatibilityIssues) {
      report.overall.status = 'warning';
      report.overall.readyForUse = true;
    } else {
      report.overall.status = 'success';
      report.overall.readyForUse = true;
    }

    // Collect recommendations
    report.overall.recommendations = [
      ...configValidation.warnings,
      ...(report.compatibility?.recommendations?.map((r) => r.message) || [])
    ];

    return report;
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} Is valid URL
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return {
      ...this.config,
      supportedSites: this.supportedSites
    };
  }

  /**
   * Print configuration summary to console
   */
  printSummary() {
    console.log('\n📋 Price Vision Configuration Summary:');
    console.log('=====================================');
    console.log(`🌐 API Base URL: ${this.config.apiBaseUrl}`);
    console.log(`⏱️  API Timeout: ${this.config.apiTimeout}ms`);
    console.log(`🔍 Real-time Search: ${this.config.enableRealTimeSearch ? '✅' : '❌'}`);
    console.log(`🖼️  Image Search: ${this.config.enableImageSearch ? '✅' : '❌'}`);
    console.log(`📈 Price Tracking: ${this.config.enablePriceTracking ? '✅' : '❌'}`);
    console.log(
      `🛍️  Enabled Sites: ${Object.entries(this.supportedSites)
        .filter(([, enabled]) => enabled)
        .map(([site]) => site)
        .join(', ')}`
    );
    console.log('=====================================\n');
  }
}

// Create singleton instance
const configValidator = new ConfigValidator();

export default configValidator;
