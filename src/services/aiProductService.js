/**
 * AI Product Service - Uses OpenAI/Gemini for real product search results
 * This service directly calls AI APIs to generate product recommendations based on queries or images
 */

const OPENAI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) ||
  (typeof process !== 'undefined' ? process.env?.VITE_OPENAI_API_KEY : undefined);
const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : undefined);

function safeParseJSON(text, fallback = null) {
  if (!text || typeof text !== 'string') return fallback;

  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err2) {
        let candidate = match[0].replace(/,\s*([\]}])/g, '$1');
        try {
          return JSON.parse(candidate);
        } catch (err3) {
          let openBraces =
            (candidate.match(/\{/g) || []).length - (candidate.match(/\}/g) || []).length;
          let openBrackets =
            (candidate.match(/\[/g) || []).length - (candidate.match(/\]/g) || []).length;
          while (openBrackets > 0) {
            candidate += ']';
            openBrackets--;
          }
          while (openBraces > 0) {
            candidate += '}';
            openBraces--;
          }
          try {
            return JSON.parse(candidate);
          } catch (err4) {
            console.warn('safeParseJSON could not recover JSON:', err1.message);
          }
        }
      }
    }
    return fallback;
  }
}

class AIProductService {
  constructor() {
    this.openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.geminiEndpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Search products using AI based on text query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} AI-generated product results
   */
  async searchProducts(query, options = {}) {
    if (!query?.trim()) {
      return this.getFeaturedProducts();
    }

    // Check cache first
    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    if (this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('Returning cached AI search results');
        return cached.data;
      }
      this.searchCache.delete(cacheKey);
    }

    try {
      // Prefer Gemini for direct browser calls (no CORS issues)
      // Fall back to OpenAI if Gemini is unavailable
      let results;
      if (GEMINI_API_KEY) {
        results = await this.searchWithGemini(query, options);
      } else if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here') {
        results = await this.searchWithOpenAI(query, options);
      } else {
        throw new Error('No AI API key configured');
      }

      // Cache the results
      this.searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('AI product search failed:', error);
      // Try OpenAI as fallback
      try {
        if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here') {
          return await this.searchWithOpenAI(query, options);
        }
      } catch (fallbackError) {
        console.error('Fallback AI search also failed:', fallbackError);
      }
      throw error;
    }
  }

  /**
   * Search products using OpenAI
   */
  async searchWithOpenAI(query, options = {}) {
    const systemPrompt = `You are an e-commerce product search assistant. When given a search query, you must return ONLY valid JSON with real, actual products that exist in the market.

IMPORTANT: Return products with realistic current market prices, real brand names, actual product specifications, and genuine retailer information.

Return JSON in this exact format:
{
  "products": [
    {
      "id": <unique number>,
      "name": "<full product name with brand and model>",
      "image": "https://images.unsplash.com/… or a real product image URL. NEVER leave empty.",
      "currentPrice": <current price in INR as number>,
      "originalPrice": <original/MRP price in INR as number>,
      "discount": <discount percentage as number>,
      "confidence": <match confidence 70-99>,
      "dealUrgency": <deal urgency score 40-95>,
      "aiInsight": "<1-2 sentence product insight>",
      "priceHistory": [<5 recent prices showing trend>],
      "retailers": [{"name": "<retailer>", "price": <price in INR>}],
      "brand": "<brand name>",
      "category": "<category>",
      "features": ["<feature1>", "<feature2>", ...],
      "rating": <rating 3.5-5.0>,
      "reviews": <review count>,
      "isWishlisted": false
    }
  ],
  "searchMeta": {
    "query": "${query}",
    "totalResults": <number>,
    "avgConfidence": <average confidence>,
    "hotDeals": <count of products with dealUrgency > 80>
  }
}

Return 6-12 real products matching the query. Use accurate INR prices for the Indian market. Ensure every product has a valid image URL.`;

    const response = await fetch(this.openaiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Search for products in India: "${query}"${options.category ? ` in category: ${options.category}` : ''}${options.priceRange ? ` with price range: ₹${options.priceRange.min}-₹${options.priceRange.max}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    return this.enhanceProducts(parsed.products || [], parsed.searchMeta);
  }

  /**
   * Execute request to Google Gemini API with automatic model fallback
   * @param {Object} body - Gemini request body
   * @returns {Promise<string>} Text content generated by Gemini
   */
  async callGemini(body) {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const candidateModels = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-flash-latest'];
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error('No content returned in Gemini response');
          }
          return text;
        }

        const error = await response.json().catch(() => ({}));
        const errMsg = error.error?.message || response.statusText;
        lastError = new Error(`Gemini API error (${model}): ${errMsg}`);

        // If model not found, high demand, or rate/quota limit reached, attempt next fallback model
        if (response.status === 404 || response.status === 503 || response.status === 429) {
          console.warn(`Gemini model ${model} returned ${response.status}. Trying fallback...`);
          continue;
        }

        throw lastError;
      } catch (err) {
        lastError = err;
        if (err.message && (err.message.includes('API key') || err.message.includes('401'))) {
          throw err;
        }
      }
    }

    throw lastError || new Error('All Gemini model endpoints failed');
  }

  /**
   * Search products using Gemini
   */
  async searchWithGemini(query, options = {}) {
    const prompt = `You are an e-commerce product search assistant focused on the Indian market. Search for products matching: "${query}"
${options.category ? `Category: ${options.category}` : ''}
${options.priceRange ? `Price range: ₹${options.priceRange.min}-₹${options.priceRange.max}` : ''}

Return ONLY valid JSON with 6-12 real, actual products from the market with accurate current prices.

JSON format:
{
  "products": [
    {
      "id": <unique number>,
      "name": "<full product name with brand and model>",
      "image": "https://images.unsplash.com/photo-random-product-image OR a real product image URL. NEVER leave empty.",
      "currentPrice": <current INR price>,
      "originalPrice": <original INR price>,
      "discount": <discount %>,
      "confidence": <70-99>,
      "dealUrgency": <40-95>,
      "aiInsight": "<product insight>",
      "priceHistory": [<5 recent prices>],
      "retailers": [{"name": "<retailer>", "price": <price in INR>}],
      "brand": "<brand>",
      "category": "<category>",
      "features": ["<features>"],
      "rating": <3.5-5.0>,
      "reviews": <count>,
      "isWishlisted": false
    }
  ]
}

Return ONLY the JSON, no other text.`;

    const content = await this.callGemini({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 5000,
        responseMimeType: 'application/json'
      }
    });

    const parsed = safeParseJSON(content, null);
    if (!parsed) {
      throw new Error('Could not parse JSON from Gemini response');
    }

    return this.enhanceProducts(parsed.products || []);
  }

  /**
   * Analyze image and search for matching products
   * @param {string} imageBase64 - Base64 encoded image
   * @param {Object} options - Search options
   */
  async searchByImage(imageBase64, options = {}) {
    console.log('Analyzing image with AI...');

    try {
      // Prefer Gemini Vision for direct browser calls
      let results;
      if (GEMINI_API_KEY) {
        results = await this.analyzeImageWithGemini(imageBase64, options);
      } else if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here') {
        results = await this.analyzeImageWithOpenAI(imageBase64, options);
      } else {
        throw new Error('No AI API key configured');
      }

      return results;
    } catch (error) {
      console.error('Image analysis failed:', error);
      // Try OpenAI as fallback
      if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here') {
        try {
          return await this.analyzeImageWithOpenAI(imageBase64, options);
        } catch (fallbackError) {
          console.error('Fallback image analysis also failed:', fallbackError);
        }
      }
      throw error;
    }
  }

  /**
   * Analyze image with OpenAI Vision
   */
  async analyzeImageWithOpenAI(imageBase64, options = {}) {
    const systemPrompt = `You are a product identification and e-commerce assistant. Analyze the image to:
1. Identify the product shown
2. Find similar/matching products available in the market

Return ONLY valid JSON with this structure:
{
  "extractedInfo": {
    "productName": "<identified product name>",
    "brand": "<brand if identifiable>",
    "category": "<product category>",
    "features": ["<visible features>"],
    "color": "<color>",
    "modelNumber": "<if visible>",
    "confidence": <0.0-1.0>
  },
  "products": [
    {
      "id": <unique number>,
      "name": "<product name with brand>",
      "image": "https://images.unsplash.com/photo-product",
      "currentPrice": <INR price>,
      "originalPrice": <original INR price>,
      "discount": <discount %>,
      "confidence": <match confidence 70-99>,
      "dealUrgency": <40-95>,
      "aiInsight": "<why this matches the image>",
      "priceHistory": [<5 prices>],
      "retailers": [{"name": "<retailer>", "price": <INR price>}],
      "brand": "<brand>",
      "category": "<category>",
      "features": ["<features>"],
      "rating": <3.5-5.0>,
      "reviews": <count>,
      "isWishlisted": false
    }
  ]
}

Return 5-10 real products that match or are similar to the item in the image. Prices must be in INR and every product must include a non-empty image URL.`;

    // Ensure proper base64 format
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await fetch(this.openaiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify this product and find matching products in the market.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.5,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI Vision error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI Vision response');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from OpenAI Vision response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      extractedInfo: parsed.extractedInfo || {},
      products: this.enhanceProducts(parsed.products || []),
      confidence: parsed.extractedInfo?.confidence || 0.8,
      searchMethod: 'openai_vision'
    };
  }

  /**
   * Analyze image with Gemini Vision
   */
  async analyzeImageWithGemini(imageBase64, options = {}) {
    let mimeType = 'image/jpeg';
    if (imageBase64.includes('data:')) {
      const match = imageBase64.match(/data:([^;]+);base64,/);
      if (match) mimeType = match[1];
    }
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const prompt = `Analyze this product image and find matching products in the market.

Return ONLY valid JSON with:
{
  "extractedInfo": {
    "productName": "<product name>",
    "brand": "<brand>",
    "category": "<category>",
    "features": ["<features>"],
    "color": "<color>",
    "confidence": <0.0-1.0>
  },
  "products": [
    {
      "id": <number>,
      "name": "<product name with brand>",
      "image": "https://images.unsplash.com/photo-product",
      "currentPrice": <INR price>,
      "originalPrice": <original INR price>,
      "discount": <discount %>,
      "confidence": <70-99>,
      "dealUrgency": <40-95>,
      "aiInsight": "<match insight>",
      "priceHistory": [<5 prices>],
      "retailers": [{"name": "<retailer>", "price": <INR price>}],
      "brand": "<brand>",
      "category": "<category>",
      "features": ["<features>"],
      "rating": <3.5-5.0>,
      "reviews": <count>,
      "isWishlisted": false
    }
  ]
}

Return 5-10 real products matching the image. ONLY return JSON. Prices must be in INR and every product must include a non-empty image URL.`;

    const content = await this.callGemini({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 5000,
        responseMimeType: 'application/json'
      }
    });

    const parsed = safeParseJSON(content, null);
    if (!parsed) {
      throw new Error('Could not parse JSON from Gemini Vision response');
    }

    return {
      success: true,
      extractedInfo: parsed.extractedInfo || {},
      products: this.enhanceProducts(parsed.products || []),
      confidence: parsed.extractedInfo?.confidence || 0.75,
      searchMethod: 'gemini_vision'
    };
  }

  /**
   * Enhance product data with additional fields
   */
  enhanceProducts(products, searchMeta = {}) {
    const enhancedProducts = products
      .map((product, index) => this.normalizeProduct(product, index))
      .filter(Boolean)
      .filter(this.dedupeBySignature());

    return enhancedProducts;
  }

  /**
   * Normalize and validate a single product result
   */
  normalizeProduct(product, index) {
    const baseParams = '?auto=format&fit=crop&w=800&q=80';
    if (!product?.name || product?.name.trim().length < 4) return null;
    if (!product?.brand || product?.brand.trim().length < 2) return null;

    const parsedCurrent = Math.round(parseFloat(product.currentPrice) || 0);
    if (!parsedCurrent || parsedCurrent < 500 || parsedCurrent > 300000) {
      return null;
    }

    const parsedOriginal = Math.round(parseFloat(product.originalPrice) || parsedCurrent * 1.1);

    const discount = (() => {
      const computed = Math.round((1 - parsedCurrent / parsedOriginal) * 100);
      if (product.discount) return Math.min(Math.max(parseInt(product.discount), 0), 70);
      return Math.min(Math.max(computed, 0), 70);
    })();

    const image =
      product.image && product.image.startsWith('http')
        ? product.image
        : this.getProductImage(product.category) + baseParams;

    return {
      ...product,
      id: product.id || index + 1,
      image,
      imageAlt: product.name,
      currentPrice: parsedCurrent,
      originalPrice: parsedOriginal,
      discount,
      confidence: parseInt(product.confidence) || 85,
      dealUrgency: Math.min(Math.max(parseInt(product.dealUrgency) || 70, 40), 95),
      priceHistory: product.priceHistory || this.generatePriceHistory(parsedCurrent),
      retailers: this.normalizeRetailers(product.retailers, parsedCurrent),
      rating: parseFloat(product.rating) || 4.2,
      reviews: parseInt(product.reviews) || Math.floor(Math.random() * 900) + 100,
      isWishlisted: false,
      source: 'ai_generated'
    };
  }

  normalizeRetailers(retailers = [], currentPrice) {
    if (Array.isArray(retailers) && retailers.length > 0) {
      return retailers
        .filter((r) => r?.name && r?.price)
        .map((r) => ({
          name: r.name,
          price: Math.round(parseFloat(r.price) || currentPrice)
        }))
        .slice(0, 3);
    }
    return [
      { name: 'Amazon India', price: Math.round(currentPrice) },
      { name: 'Flipkart', price: Math.round(currentPrice * 1.02) },
      { name: 'Croma', price: Math.round(currentPrice * 1.04) }
    ];
  }

  /**
   * Deduplicate products by normalized signature (name+brand+price band)
   */
  dedupeBySignature() {
    const seen = new Set();
    return (product) => {
      const name = (product.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const brand = (product.brand || '').toLowerCase().trim();
      const priceBand = Math.round((product.currentPrice || 0) / 500); // bucket by 500 INR
      const signature = `${name}|${brand}|${priceBand}`;

      if (seen.has(signature)) {
        return false;
      }
      seen.add(signature);
      return true;
    };
  }

  /**
   * Get a relevant product image based on category
   */
  getProductImage(category) {
    const baseParams = '?auto=format&fit=crop&w=800&q=80';
    const categoryImages = {
      smartphone: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9${baseParams}`,
      phone: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9${baseParams}`,
      laptop: `https://images.unsplash.com/photo-1496181133206-80ce9b88a853${baseParams}`,
      headphones: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e${baseParams}`,
      audio: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e${baseParams}`,
      tablet: `https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0${baseParams}`,
      watch: `https://images.unsplash.com/photo-1523275335684-37898b6baf30${baseParams}`,
      camera: `https://images.unsplash.com/photo-1516035069371-29a1b244cc32${baseParams}`,
      gaming: `https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf${baseParams}`,
      tv: `https://images.unsplash.com/photo-1593784991095-a205069470b6${baseParams}`,
      speaker: `https://images.unsplash.com/photo-1545454675-3531b543be5d${baseParams}`,
      default: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e${baseParams}`
    };

    const lowerCategory = (category || '').toLowerCase();
    for (const [key, url] of Object.entries(categoryImages)) {
      if (lowerCategory.includes(key)) {
        return url;
      }
    }
    return categoryImages.default;
  }

  /**
   * Generate a realistic price history
   */
  generatePriceHistory(currentPrice) {
    const price = parseFloat(currentPrice) || 100;
    const history = [];
    let p = price * 1.15; // Start higher
    for (let i = 0; i < 5; i++) {
      history.push(parseFloat(p.toFixed(2)));
      p = p * (0.95 + Math.random() * 0.08); // Gradual decrease with some variation
    }
    return history;
  }

  /**
   * Get featured/trending products
   */
  async getFeaturedProducts() {
    try {
      return await this.searchProducts('trending electronics deals 2024');
    } catch (error) {
      console.error('Failed to get featured products:', error);
      return [];
    }
  }

  /**
   * Clear the search cache
   */
  clearCache() {
    this.searchCache.clear();
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return (OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here') || !!GEMINI_API_KEY;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      openaiConfigured: OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here',
      geminiConfigured: !!GEMINI_API_KEY,
      cacheSize: this.searchCache.size,
      isAvailable: this.isAvailable()
    };
  }
}

// Create singleton instance
const aiProductService = new AIProductService();

export default aiProductService;
