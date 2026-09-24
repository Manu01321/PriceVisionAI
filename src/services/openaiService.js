import apiClient from './apiClient';

/**
 * OpenAI Service - Frontend integration
 * Handles all OpenAI-powered features including AI search, recommendations, and analysis
 */

class OpenAIServiceClient {
  /**
   * Perform AI-powered product search
   * @param {string} query - Natural language search query
   * @param {Object} context - Additional context (price range, category, etc.)
   * @returns {Promise<Object>} - AI analysis with search terms and filters
   */
  async aiSearch(query, context = {}) {
    try {
      const response = await apiClient.post('/ai/search', {
        query,
        context
      });
      return response.data;
    } catch (error) {
      console.error('AI search error:', error);
      throw new Error(error.response?.data?.message || 'Failed to perform AI search');
    }
  }

  /**
   * Get personalized product recommendations
   * @param {Object} userPreferences - User preferences and interests
   * @param {Array} recentSearches - Recent search history
   * @returns {Promise<Object>} - AI-generated recommendations
   */
  async getRecommendations(userPreferences = {}, recentSearches = []) {
    try {
      const response = await apiClient.post('/ai/recommendations', {
        userPreferences,
        recentSearches
      });
      return response.data;
    } catch (error) {
      console.error('AI recommendations error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
  }

  /**
   * Analyze price history and get insights
   * @param {Array} priceHistory - Array of price data points
   * @param {string} productName - Product name
   * @returns {Promise<Object>} - Price trend analysis and predictions
   */
  async analyzePriceHistory(priceHistory, productName) {
    try {
      const response = await apiClient.post('/ai/analyze-price', {
        priceHistory,
        productName
      });
      return response.data;
    } catch (error) {
      console.error('Price analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze price history');
    }
  }

  /**
   * Analyze product image using OpenAI Vision
   * @param {string} imageUrl - URL of the product image
   * @param {string} prompt - Optional custom prompt
   * @returns {Promise<Object>} - Image analysis results
   */
  async analyzeProductImage(imageUrl, prompt) {
    try {
      const response = await apiClient.post('/ai/analyze-product-image', {
        imageUrl,
        prompt
      });
      return response.data;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze image');
    }
  }

  /**
   * Chat with AI assistant
   * @param {Array} messages - Array of chat messages
   * @param {Object} options - Additional options (model, temperature, etc.)
   * @returns {Promise<Object>} - AI response
   */
  async chat(messages, options = {}) {
    try {
      const response = await apiClient.post('/ai/chat', {
        messages,
        options
      });
      return response.data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw new Error(error.response?.data?.message || 'Failed to chat with AI');
    }
  }

  /**
   * Get OpenAI service status including key rotation info
   * @returns {Promise<Object>} - Service status
   */
  async getStatus() {
    try {
      const response = await apiClient.get('/ai/status');
      return response.data;
    } catch (error) {
      console.error('AI status error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get AI status');
    }
  }

  /**
   * Reset all API keys (admin function)
   * @returns {Promise<Object>} - Reset confirmation
   */
  async resetKeys() {
    try {
      const response = await apiClient.post('/ai/reset-keys');
      return response.data;
    } catch (error) {
      console.error('Reset keys error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset keys');
    }
  }

  /**
   * Enhanced search combining AI and traditional search
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} - Combined search results
   */
  async enhancedSearch(query, filters = {}) {
    try {
      // First, get AI analysis of the query
      const aiAnalysis = await this.aiSearch(query, filters);
      
      // Then perform traditional search with optimized terms
      const searchResponse = await apiClient.post('/search/text', {
        query: aiAnalysis.aiAnalysis?.optimizedKeywords || query,
        filters: {
          ...filters,
          ...aiAnalysis.aiAnalysis?.suggestedFilters
        }
      });

      return {
        ...searchResponse.data,
        aiInsights: aiAnalysis.aiAnalysis
      };
    } catch (error) {
      console.error('Enhanced search error:', error);
      // Fallback to regular search if AI fails
      const searchResponse = await apiClient.post('/search/text', {
        query,
        filters
      });
      return searchResponse.data;
    }
  }

  /**
   * Get smart product insights
   * @param {Object} product - Product details
   * @returns {Promise<Object>} - AI-generated insights
   */
  async getProductInsights(product) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a product analysis expert. Provide brief, actionable insights about products.'
        },
        {
          role: 'user',
          content: `Analyze this product and provide key insights:
          Name: ${product.name}
          Price: ₹${product.price}
          Rating: ${product.rating || 'N/A'}
          Reviews: ${product.reviews || 'N/A'}
          
          Provide:
          1. Value assessment (is it worth the price?)
          2. Key features to consider
          3. Potential concerns
          4. Purchase recommendation
          
          Keep it concise (2-3 sentences per point).`
        }
      ];

      const response = await this.chat(messages, {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 400
      });

      return {
        success: true,
        insights: response.response.content,
        timestamp: response.timestamp
      };
    } catch (error) {
      console.error('Product insights error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate comparison summary for multiple products
   * @param {Array} products - Array of products to compare
   * @returns {Promise<Object>} - AI comparison summary
   */
  async compareProducts(products) {
    try {
      const productsText = products.map((p, i) => 
        `Product ${i + 1}: ${p.name} - ₹${p.price} - Rating: ${p.rating || 'N/A'} (${p.site})`
      ).join('\n');

      const messages = [
        {
          role: 'system',
          content: 'You are a product comparison expert. Analyze and compare products objectively.'
        },
        {
          role: 'user',
          content: `Compare these products:\n\n${productsText}\n\nProvide:
          1. Best overall value
          2. Best for budget
          3. Best quality/features
          4. Key differences
          5. Final recommendation\n\nBe concise and specific.`
        }
      ];

      const response = await this.chat(messages, {
        model: 'gpt-4o-mini',
        temperature: 0.6,
        max_tokens: 500
      });

      return {
        success: true,
        comparison: response.response.content,
        timestamp: response.timestamp
      };
    } catch (error) {
      console.error('Product comparison error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new OpenAIServiceClient();
