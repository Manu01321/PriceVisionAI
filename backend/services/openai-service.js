const OpenAI = require('openai').default || require('openai');

/**
 * OpenAI Service with automatic key rotation and fallback
 * Manages multiple API keys and automatically switches when one fails
 */
class OpenAIService {
  constructor() {
    // Array of API keys with their status - Updated with new key
    this.apiKeys = [
      {
        key: process.env.OPENAI_API_KEY || '',
        active: Boolean(process.env.OPENAI_API_KEY),
        failCount: 0,
        lastUsed: null
      }
    ];

    this.currentKeyIndex = 0;
    this.maxRetries = 4; // Try all keys before giving up
    this.client = null;
    this.initializeClient();
  }

  /**
   * Initialize OpenAI client with current key
   */
  initializeClient() {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (currentKey && currentKey.active) {
      this.client = new OpenAI({
        apiKey: currentKey.key
      });
      currentKey.lastUsed = new Date();
      console.log(`[OpenAI Service] Initialized with key ${this.currentKeyIndex + 1}`);
    }
  }

  /**
   * Switch to next available API key
   */
  switchToNextKey() {
    const startIndex = this.currentKeyIndex;
    
    // Try to find next active key
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      
      // If we've cycled through all keys, return false
      if (this.currentKeyIndex === startIndex) {
        console.error('[OpenAI Service] All API keys have been exhausted');
        return false;
      }
    } while (!this.apiKeys[this.currentKeyIndex].active);

    console.log(`[OpenAI Service] Switched to key ${this.currentKeyIndex + 1}`);
    this.initializeClient();
    return true;
  }

  /**
   * Mark current key as failed and switch to next
   */
  handleKeyFailure(error) {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    currentKey.failCount++;
    
    console.warn(`[OpenAI Service] Key ${this.currentKeyIndex + 1} failed (${currentKey.failCount} failures): ${error.message}`);

    // Deactivate key if it has too many failures or specific error types
    if (
      currentKey.failCount >= 3 ||
      error.status === 401 || // Invalid authentication
      error.status === 403 || // Forbidden
      error.message?.includes('invalid') ||
      error.message?.includes('revoked')
    ) {
      currentKey.active = false;
      console.warn(`[OpenAI Service] Key ${this.currentKeyIndex + 1} deactivated`);
    }

    return this.switchToNextKey();
  }

  /**
   * Execute API call with automatic retry and key switching
   */
  async executeWithRetry(apiCall) {
    let lastError;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        const result = await apiCall(this.client);
        
        // Reset fail count on success
        this.apiKeys[this.currentKeyIndex].failCount = 0;
        
        return result;
      } catch (error) {
        lastError = error;
        attempts++;

        console.error(`[OpenAI Service] API call failed (attempt ${attempts}/${this.maxRetries}):`, error.message);

        // If it's a rate limit error, try next key immediately
        if (error.status === 429 || error.message?.includes('rate limit')) {
          console.log('[OpenAI Service] Rate limit hit, switching to next key');
          if (!this.switchToNextKey()) {
            break;
          }
          continue;
        }

        // For other errors, handle key failure
        if (!this.handleKeyFailure(error)) {
          break;
        }
      }
    }

    throw new Error(`All OpenAI API keys exhausted. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Generate chat completion
   */
  async createChatCompletion(messages, options = {}) {
    return this.executeWithRetry(async (client) => {
      return await client.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        ...options
      });
    });
  }

  /**
   * Generate embeddings
   */
  async createEmbedding(input, model = 'text-embedding-3-small') {
    return this.executeWithRetry(async (client) => {
      return await client.embeddings.create({
        model,
        input
      });
    });
  }

  /**
   * Analyze image with vision model
   */
  async analyzeImage(imageUrl, prompt = 'Describe this product in detail') {
    return this.executeWithRetry(async (client) => {
      return await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 500
      });
    });
  }

  /**
   * Search product using natural language
   */
  async searchProduct(query, context = {}) {
    const systemPrompt = `You are a product search assistant. Help users find products based on their natural language queries. 
    Provide structured search terms and filters that can be used to search e-commerce platforms.`;

    const userPrompt = `Find products matching this query: "${query}"
    ${context.priceRange ? `Price range: ${context.priceRange}` : ''}
    ${context.category ? `Category: ${context.category}` : ''}
    
    Provide:
    1. Optimized search keywords
    2. Suggested filters (category, price range, features)
    3. Alternative search terms
    
    Format as JSON.`;

    const response = await this.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Generate product recommendations
   */
  async getRecommendations(userPreferences, recentSearches = []) {
    const systemPrompt = `You are a product recommendation assistant. Analyze user preferences and search history to suggest relevant products.`;

    const userPrompt = `User preferences: ${JSON.stringify(userPreferences)}
    Recent searches: ${JSON.stringify(recentSearches)}
    
    Suggest 5 product categories or specific products the user might be interested in.
    Format as JSON with: {recommendations: [{name, reason, category, estimatedPrice}]}`;

    const response = await this.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      response_format: { type: 'json_object' },
      model: 'gpt-4o-mini'
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze price history and provide insights
   */
  async analyzePriceTrend(priceHistory, productName) {
    const systemPrompt = `You are a price analysis expert. Analyze price trends and provide actionable insights.`;

    const userPrompt = `Product: ${productName}
    Price history (last 30 days): ${JSON.stringify(priceHistory)}
    
    Provide:
    1. Trend analysis (rising, falling, stable)
    2. Best time to buy recommendation
    3. Price prediction for next 7 days
    4. Deal quality assessment
    
    Format as JSON.`;

    const response = await this.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      response_format: { type: 'json_object' },
      model: 'gpt-4o-mini'
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      currentKey: this.currentKeyIndex + 1,
      totalKeys: this.apiKeys.length,
      activeKeys: this.apiKeys.filter(k => k.active).length,
      keys: this.apiKeys.map((k, i) => ({
        index: i + 1,
        active: k.active,
        failCount: k.failCount,
        lastUsed: k.lastUsed
      }))
    };
  }

  /**
   * Reset all keys (useful for testing or manual recovery)
   */
  resetKeys() {
    this.apiKeys.forEach(key => {
      key.active = true;
      key.failCount = 0;
    });
    this.currentKeyIndex = 0;
    this.initializeClient();
    console.log('[OpenAI Service] All keys reset');
  }
}

// Export singleton instance
module.exports = new OpenAIService();
