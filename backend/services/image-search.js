const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ProductSearchService = require('./product-search');
const OpenAIService = require('./openai-service');

class ImageSearchService {
  constructor(browserPool, logger, options = {}) {
    this.browserPool = browserPool;
    this.logger = logger;
    this.productSearchService = new ProductSearchService(browserPool, logger, {
      cacheClient: options.cacheClient
    });
    // Re-read key at construction time so it picks up .env values
    const geminiKey = process.env.GEMINI_API_KEY;
    this.geminiClient = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      this.logger.warn('Failed to create temp directory:', error.message);
    }
  }

  async searchByImage(options = {}) {
    const { imageUrl, imageBase64, confidence = 0.7, limit = 20 } = options;
    
    try {
      this.logger.info('Starting image-based product search');
      
      // Process the image
      const processedImage = await this.processImage(imageUrl, imageBase64);
      
      // Extract product information using AI
      const productInfo = await this.extractProductInfoFromImage(processedImage);
      
      if (!productInfo || !productInfo.searchTerms) {
        throw new Error('Unable to extract product information from image');
      }
      
      this.logger.info(`Extracted product info: ${JSON.stringify(productInfo)}`);
      
      // Search across e-commerce sites using extracted information
      const searchResults = await this.searchWithExtractedInfo(productInfo, {
        confidence,
        limit
      });
      
      // Clean up temporary files
      await this.cleanup(processedImage.tempPath);
      
      return {
        extractedInfo: productInfo,
        aiAnalysis: productInfo,
        results: searchResults,
        resultsCount: searchResults.length,
        searchConfidence: productInfo.confidence || confidence,
        searchMethod: 'ai_image_analysis'
      };
      
    } catch (error) {
      this.logger.error('Image search failed:', error);
      throw error;
    }
  }

  async processImage(imageUrl, imageBase64) {
    let imageBuffer;
    let tempPath;
    
    try {
      if (imageUrl) {
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          maxContentLength: 10 * 1024 * 1024
        });
        imageBuffer = Buffer.from(response.data);
      } else if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        throw new Error('No image provided');
      }
      
      if (imageBuffer.length === 0) throw new Error('Invalid image data');

      // Resize without sharp — use raw buffer directly
      tempPath = path.join(this.tempDir, `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`);
      await fs.writeFile(tempPath, imageBuffer);
      
      return {
        buffer: imageBuffer,
        base64: imageBuffer.toString('base64'),
        tempPath,
        size: imageBuffer.length,
        format: 'jpeg'
      };
    } catch (error) {
      this.logger.error('Image processing failed:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  async extractProductInfoFromImage(processedImage) {
    try {
      // Try Gemini first
      if (this.geminiClient) {
        const analysisResult = await this.analyzeImageWithGemini(processedImage);
        if (analysisResult) return this.parseAIAnalysis(analysisResult);
      }
      // Fall back to OpenAI Vision
      this.logger.info('Gemini unavailable, trying OpenAI Vision fallback');
      return await this.analyzeImageWithOpenAI(processedImage);
    } catch (error) {
      this.logger.error('AI image analysis failed:', error);
      return await this.analyzeImageWithOpenAI(processedImage).catch(() => this.basicImageAnalysis());
    }
  }

  async analyzeImageWithOpenAI(processedImage) {
    try {
      const base64 = processedImage.base64 || processedImage.buffer?.toString('base64');
      if (!base64) throw new Error('No image data for OpenAI Vision');

      const response = await OpenAIService.analyzeImage(
        `data:image/jpeg;base64,${base64}`,
        `Identify this retail product. Return JSON only: {"productName": "", "brand": "", "category": "", "features": [], "searchTerms": [], "confidence": 0.8, "color": "", "modelNumber": ""}`
      );
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in OpenAI Vision response');
      return this.parseAIAnalysis(jsonMatch[0]);
    } catch (err) {
      this.logger.error('OpenAI Vision fallback failed:', err.message);
      return this.basicImageAnalysis();
    }
  }

  async analyzeImageWithGemini(processedImage) {
    try {
      if (!this.geminiClient) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const base64Image = processedImage.buffer.toString('base64');
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

      const prompt = `
        You are identifying a retail product from an image. Extract and return strict JSON with:
        productName, brand, category, features (array), searchTerms (array of 3-5 strong queries), confidence (0-1), color, modelNumber.
        Only respond with JSON, no prose.
      `;

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512
        }
      });

      const candidate = result?.response?.candidates?.[0];
      if (!candidate?.content?.parts?.length) {
        throw new Error('No candidates returned from Gemini');
      }

      const text = candidate.content.parts.map(p => p.text || '').join('').trim();
      return text;
    } catch (error) {
      this.logger.error('Gemini analysis failed:', error);
      throw new Error(`Gemini analysis failed: ${error.message}`);
    }
  }

  parseAIAnalysis(analysisResult) {
    try {
      const parsed = JSON.parse(analysisResult);
      
      return {
        productName: parsed.productName || '',
        brand: parsed.brand || '',
        category: parsed.category || 'general',
        features: parsed.features || [],
        searchTerms: parsed.searchTerms || [parsed.productName || 'product'],
        confidence: parsed.confidence || 0.6,
        color: parsed.color || '',
        modelNumber: parsed.modelNumber || '',
        rawAnalysis: parsed
      };
      
    } catch (error) {
      this.logger.error('Failed to parse AI analysis:', error);
      return this.basicImageAnalysis();
    }
  }

  basicImageAnalysis(processedImage = null) {
    // Fallback analysis when AI fails
    return {
      productName: 'Product from image',
      brand: '',
      category: 'general',
      features: [],
      searchTerms: ['product', 'item'],
      confidence: 0.3,
      color: '',
      modelNumber: '',
      rawAnalysis: { method: 'basic_fallback' }
    };
  }

  async searchWithExtractedInfo(productInfo, options = {}) {
    const { confidence = 0.7, limit = 20 } = options;
    
    try {
      const searchResults = [];
      
      // Try different search strategies based on confidence
      if (productInfo.confidence >= confidence) {
        // High confidence - use specific search terms
        for (const searchTerm of productInfo.searchTerms.slice(0, 3)) {
          try {
            const results = await this.productSearchService.searchByText(searchTerm, {
              limit: Math.ceil(limit / 3),
              category: productInfo.category !== 'general' ? productInfo.category : undefined
            });
            
            // Add image search metadata
            results.forEach(result => {
              result.searchMethod = 'image_to_text';
              result.imageConfidence = productInfo.confidence;
              result.extractedTerm = searchTerm;
            });
            
            searchResults.push(...results);
          } catch (error) {
            this.logger.warn(`Search failed for term: ${searchTerm}`, error.message);
          }
        }
      } else {
        // Lower confidence - use broader search
        const broadSearchTerm = `${productInfo.brand} ${productInfo.productName}`.trim() || 
                               productInfo.searchTerms[0] || 
                               'product';
        
        const results = await this.productSearchService.searchByText(broadSearchTerm, {
          limit: limit
        });
        
        results.forEach(result => {
          result.searchMethod = 'image_to_text_broad';
          result.imageConfidence = productInfo.confidence;
          result.extractedTerm = broadSearchTerm;
        });
        
        searchResults.push(...results);
      }
      
      // Remove duplicates and sort by relevance
      const uniqueResults = this.removeDuplicateResults(searchResults);
      const enhancedResults = this.enhanceImageSearchResults(uniqueResults, productInfo);
      
      return enhancedResults.slice(0, limit);
      
    } catch (error) {
      this.logger.error('Search with extracted info failed:', error);
      throw error;
    }
  }

  removeDuplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.title}_${result.price}_${result.source}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  enhanceImageSearchResults(results, productInfo) {
    return results.map(result => {
      // Calculate image match score based on extracted info
      let imageMatchScore = 0;
      
      // Brand match
      if (productInfo.brand && result.brand && 
          result.brand.toLowerCase().includes(productInfo.brand.toLowerCase())) {
        imageMatchScore += 30;
      }
      
      // Title relevance
      if (productInfo.productName) {
        const productWords = productInfo.productName.toLowerCase().split(' ');
        const titleWords = result.title.toLowerCase().split(' ');
        
        const matchingWords = productWords.filter(word => 
          titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
        );
        
        imageMatchScore += (matchingWords.length / productWords.length) * 40;
      }
      
      // Feature matches
      if (productInfo.features && productInfo.features.length > 0) {
        const featureMatches = productInfo.features.filter(feature =>
          result.title.toLowerCase().includes(feature.toLowerCase()) ||
          (result.description && result.description.toLowerCase().includes(feature.toLowerCase()))
        );
        
        imageMatchScore += (featureMatches.length / productInfo.features.length) * 20;
      }
      
      // Color match
      if (productInfo.color && productInfo.color !== 'unknown') {
        if (result.title.toLowerCase().includes(productInfo.color.toLowerCase())) {
          imageMatchScore += 10;
        }
      }
      
      return {
        ...result,
        imageMatchScore: Math.min(imageMatchScore, 100),
        extractedProductInfo: {
          name: productInfo.productName,
          brand: productInfo.brand,
          category: productInfo.category,
          confidence: productInfo.confidence
        }
      };
    }).sort((a, b) => {
      // Sort by combined score of image match and original relevance
      const scoreA = (a.imageMatchScore * 0.6) + (a.relevanceScore * 0.4);
      const scoreB = (b.imageMatchScore * 0.6) + (b.relevanceScore * 0.4);
      return scoreB - scoreA;
    });
  }

  async cleanup(tempPath) {
    try {
      if (tempPath) {
        await fs.unlink(tempPath);
      }
    } catch (error) {
      this.logger.warn('Failed to clean up temp file:', error.message);
    }
  }

  // Batch image search for multiple images
  async batchImageSearch(imageRequests, options = {}) {
    const results = [];
    
    for (const request of imageRequests) {
      try {
        const result = await this.searchByImage({
          ...request,
          ...options
        });
        
        results.push({
          success: true,
          requestId: request.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          result
        });
        
      } catch (error) {
        results.push({
          success: false,
          requestId: request.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get image search statistics
  getImageSearchStats() {
    return {
      tempDirectoryPath: this.tempDir,
      supportedFormats: ['jpeg', 'jpg', 'png', 'webp'],
      maxImageSize: '10MB',
      aiProvider: 'Gemini AI (Mock)',
      features: [
        'product_identification',
        'brand_recognition',
        'feature_extraction',
        'cross_site_search'
      ]
    };
  }
}

module.exports = ImageSearchService;
