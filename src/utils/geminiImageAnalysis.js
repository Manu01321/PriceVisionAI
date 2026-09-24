import genAI from './geminiClient';

/**
 * Handles common Gemini API errors with user-friendly messages.
 * @param {Error} error - The error object from the API.
 * @returns {string} User-friendly error message.
 */
export function handleGeminiError(error) {
  console.error('Gemini API Error:', error);

  // Handle specific error types
  if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
    return 'Request was cancelled by user.';
  }

  if (error?.message?.includes('429') || error?.status === 429) {
    return 'Rate limit exceeded. Please wait a moment before trying again.';
  }

  if (error?.message?.includes('SAFETY') || error?.message?.includes('safety')) {
    return 'Content was blocked by safety filters. Please try uploading a different image.';
  }

  if (error?.message?.includes('timeout') || error?.name === 'TimeoutError') {
    return 'Request timed out. Please check your internet connection and try again.';
  }

  if (error?.message?.includes('API key') || error?.message?.includes('authentication') || error?.status === 401) {
    return 'API key is invalid or missing. Please check your Gemini API configuration.';
  }

  if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
    return 'API quota exceeded. Please try again later or check your Gemini account limits.';
  }

  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (error?.status === 500 || error?.message?.includes('500')) {
    return 'Server error. Please try again in a few minutes.';
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again with a different image or check your connection.';
}

/**
 * Comprehensive safety settings for content filtering.
 * @returns {Array} Safety settings configuration.
 */
export function getSafetySettings() {
  return [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  }];

}

/**
 * Converts image files to base64 format for API consumption.
 * @param {File[]} imageFiles - Array of image files.
 * @returns {Promise<Object[]>} Array of base64 image objects.
 */
export async function convertFilesToBase64(imageFiles) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
  const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    // Validate file
    if (!SUPPORTED_TYPES.includes(file?.type)) {
      reject(new Error(`Unsupported file type: ${file?.type}. Please use JPG, PNG, WebP, or GIF.`));
      return;
    }

    if (file?.size > MAX_FILE_SIZE) {
      reject(new Error(`File too large: ${(file?.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      try {
        const base64Data = reader?.result?.split(',')?.[1];
        if (!base64Data) {
          reject(new Error('Failed to convert image to base64'));
          return;
        }
        resolve(base64Data);
      } catch (err) {
        reject(new Error('Error processing image data'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
  });

  try {
    const imagePromises = imageFiles?.map(async (file) => {
      const base64Data = await toBase64(file);
      return {
        inlineData: {
          data: base64Data,
          mimeType: file?.type
        }
      };
    });

    return await Promise.all(imagePromises);
  } catch (error) {
    throw new Error(`Image processing failed: ${error?.message}`);
  }
}

/**
 * Parses multimodal response with enhanced error handling.
 * @param {Object} response - The API response object.
 * @returns {Promise<Object>} Parsed response with products data.
 */
export async function parseImageAnalysisResponse(response) {
  try {
    if (!response) {
      throw new Error('No response received from Gemini AI');
    }

    if (response?.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${response?.promptFeedback?.blockReason}. Please try a different image.`);
    }

    if (!response?.candidates || response?.candidates?.length === 0) {
      throw new Error('No analysis candidates returned. The image might be unclear or unsupported.');
    }

    const candidate = response?.candidates?.[0];

    if (candidate?.finishReason === 'SAFETY') {
      throw new Error('Content blocked by safety filters. Please upload a different product image.');
    }

    if (candidate?.finishReason === 'RECITATION') {
      throw new Error('Content blocked due to recitation concerns. Please try a different image.');
    }

    if (!candidate?.content?.parts || candidate?.content?.parts?.length === 0) {
      throw new Error('No content parts in response. Please try uploading a clearer image.');
    }

    const parts = candidate?.content?.parts;

    // Look for text response (image analysis)
    for (const part of parts) {
      if (part?.text && part?.text?.trim()) {
        const analysisText = part?.text?.trim();

        if (analysisText?.length < 50) {
          throw new Error('Analysis result too short. Please try uploading a clearer product image.');
        }

        // Parse the response to extract product information
        return parseProductAnalysis(analysisText);
      }
    }

    throw new Error('No valid text analysis found in response. Please try again with a different image.');

  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw error;
  }
}

/**
 * Parses AI analysis text to extract structured product information.
 * @param {string} analysisText - Raw analysis text from Gemini.
 * @returns {Object} Structured product analysis data.
 */
function parseProductAnalysis(analysisText) {
  try {
    // Enhanced product detection patterns with more flexibility
    const patterns = {
      productName: /(?:product|item|device|gadget|name):\s*([^\n.]+)/i,
      brand: /(?:brand|manufacturer|company|make):\s*([^\n.]+)/i,
      model: /(?:model|version|variant|type):\s*([^\n.]+)/i,
      category: /(?:category|type|classification|kind):\s*([^\n.]+)/i,
      features: /(?:features?|specifications?|specs?|details?):\s*([^\n.]+)/i,
      condition: /(?:condition|state|quality):\s*([^\n.]+)/i,
      color: /(?:color|colour|shade):\s*([^\n.]+)/i,
      price: /(?:\$|USD|price|cost)[\s:]*(\d+(?:\.\d{2})?)/i
    };

    const extractedData = {};

    // Extract structured information
    Object.entries(patterns)?.forEach(([key, pattern]) => {
      const match = analysisText?.match(pattern);
      if (match?.[1]) {
        extractedData[key] = match?.[1]?.trim();
      }
    });

    // Enhanced fallback product identification
    if (!extractedData?.productName) {
      // Look for product words anywhere in the text
      const productWords = ['phone', 'smartphone', 'laptop', 'tablet', 'camera', 'watch', 'headphones', 'speaker', 'tv', 'monitor', 'keyboard', 'mouse', 'computer', 'device', 'gadget'];

      for (const word of productWords) {
        const regex = new RegExp(`([^.]*${word}[^.]*)`, 'i');
        const match = analysisText?.match(regex);
        if (match?.[1]) {
          extractedData.productName = match?.[1]?.trim();
          break;
        }
      }

      // Final fallback - use first meaningful sentence
      if (!extractedData?.productName) {
        const sentences = analysisText?.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence?.trim()?.length > 15 && sentence?.trim()?.length < 100) {
            extractedData.productName = sentence?.trim();
            break;
          }
        }
      }

      // Ultimate fallback
      if (!extractedData?.productName) {
        extractedData.productName = 'Product from uploaded image';
      }
    }

    // Generate confidence score based on extracted data
    const confidence = calculateAnalysisConfidence(extractedData, analysisText);

    // Generate mock products based on analysis
    const products = generateProductsFromAnalysis(extractedData, analysisText);

    return {
      analysis: analysisText,
      extractedData,
      confidence,
      products,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error in parseProductAnalysis:', error);

    // Return minimal fallback data
    return {
      analysis: analysisText || 'Basic analysis completed',
      extractedData: {
        productName: 'Product from uploaded image',
        category: 'General'
      },
      confidence: 0.5,
      products: generateFallbackProducts(),
      timestamp: new Date()
    };
  }
}

/**
 * Calculates confidence score based on extracted data quality.
 * @param {Object} extractedData - Extracted product data.
 * @param {string} analysisText - Original analysis text.
 * @returns {number} Confidence score between 0 and 1.
 */
function calculateAnalysisConfidence(extractedData, analysisText) {
  let score = 0.4; // Base score

  // Increase score for specific data extraction
  if (extractedData?.brand) score += 0.15;
  if (extractedData?.model) score += 0.15;
  if (extractedData?.category) score += 0.1;
  if (extractedData?.features) score += 0.05;
  if (extractedData?.color) score += 0.05;
  if (extractedData?.price) score += 0.05;

  // Text quality indicators
  if (analysisText?.length > 100) score += 0.05;
  if (analysisText?.length > 200) score += 0.05;
  if (analysisText?.includes('specific') || analysisText?.includes('detailed')) score += 0.05;
  if (analysisText?.match(/\d+/)) score += 0.05; // Contains numbers (specs, prices, etc.)

  return Math.min(Math.max(score, 0.3), 0.95); // Clamp between 0.3 and 0.95
}

/**
 * Generates fallback products when analysis fails.
 * @returns {Array} Array of basic product objects.
 */
function generateFallbackProducts() {
  return [
  {
    id: 1,
    name: 'Product from uploaded image',
    brand: 'Various',
    category: 'General',
    price: 99.99,
    originalPrice: 119.99,
    discount: 17,
    rating: 4.2,
    reviews: 150,
    image: "https://images.unsplash.com/photo-1735538501138-635296c82088",
    imageAlt: "General product item from uploaded image"
  }];

}

/**
 * Generates mock product data based on AI analysis.
 * @param {Object} extractedData - Extracted product information.
 * @param {string} analysisText - Original analysis text.
 * @returns {Array} Array of product objects.
 */
function generateProductsFromAnalysis(extractedData, analysisText) {
  try {
    const baseProduct = {
      id: 1,
      name: extractedData?.productName || 'Identified Product',
      brand: extractedData?.brand || 'Unknown Brand',
      category: extractedData?.category || 'Electronics',
      features: extractedData?.features || 'Advanced features',
      condition: extractedData?.condition || 'New',
      color: extractedData?.color || 'Standard',
      rating: 4.2 + Math.random() * 0.6, // 4.2-4.8
      reviews: Math.floor(Math.random() * 1000) + 100,
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
      imageAlt: `${extractedData?.productName || 'Product'} - high quality electronics device`
    };

    // Generate price based on extracted price or category
    let basePrice = 299.99;
    if (extractedData?.price) {
      basePrice = parseFloat(extractedData?.price) || 299.99;
    } else if (extractedData?.category) {
      const categoryPrices = {
        'phone': 699.99, 'smartphone': 699.99, 'mobile': 699.99,
        'laptop': 999.99, 'computer': 899.99, 'pc': 899.99,
        'tablet': 399.99, 'ipad': 599.99,
        'camera': 599.99, 'photography': 599.99,
        'headphones': 199.99, 'earphones': 149.99, 'audio': 199.99,
        'speaker': 149.99, 'bluetooth': 129.99,
        'tv': 799.99, 'television': 799.99,
        'monitor': 299.99, 'display': 399.99,
        'watch': 349.99, 'smartwatch': 399.99,
        'gaming': 499.99, 'console': 499.99
      };

      const categoryKey = Object.keys(categoryPrices)?.find((key) =>
      extractedData?.category?.toLowerCase()?.includes(key)
      );

      if (categoryKey) {
        basePrice = categoryPrices?.[categoryKey];
      }
    }

    baseProduct.price = Math.round(basePrice * 100) / 100;
    baseProduct.originalPrice = Math.round(basePrice * 1.15 * 100) / 100; // 15% markup
    baseProduct.discount = Math.round((baseProduct?.originalPrice - baseProduct?.price) / baseProduct?.originalPrice * 100);

    // Generate similar products
    const similarProducts = [];
    const variants = ['Pro', 'Lite', 'Max', 'Plus'];

    for (let i = 2; i <= 4; i++) {
      const priceVariation = (Math.random() - 0.5) * 200; // ±$100 variation
      const newPrice = Math.max(basePrice + priceVariation, 50); // Minimum $50

      const variation = {
        ...baseProduct,
        id: i,
        name: `${baseProduct?.name} - ${variants?.[i - 2] || 'Variant'} Model`,
        price: Math.round(newPrice * 100) / 100,
        rating: 4.0 + Math.random() * 0.8,
        reviews: Math.floor(Math.random() * 800) + 50,
        image: `https://images.unsplash.com/photo-${1526170375885 + i * 100}`,
        imageAlt: `${baseProduct?.name} ${variants?.[i - 2] || 'variant'} model - premium electronics`
      };

      variation.originalPrice = Math.round(variation?.price * 1.1 * 100) / 100;
      variation.discount = Math.round((variation?.originalPrice - variation?.price) / variation?.originalPrice * 100);

      similarProducts?.push(variation);
    }

    return [baseProduct, ...similarProducts];

  } catch (error) {
    console.error('Error generating products:', error);
    return generateFallbackProducts();
  }
}

/**
 * Analyzes uploaded images using Gemini multimodal AI with enhanced error handling.
 * @param {File[]} imageFiles - Array of image files to analyze.
 * @param {AbortSignal} signal - Optional abort signal for cancellation.
 * @returns {Promise<Object>} Analysis results with product data.
 */
export async function analyzeProductImages(imageFiles, signal = null) {
  try {
    if (!imageFiles?.length) {
      throw new Error('Please provide at least one image file.');
    }

    // Validate API key
    if (!import.meta.env?.VITE_GEMINI_API_KEY || !genAI) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    // Check for abort signal early
    if (signal?.aborted) {
      throw new Error('Request was cancelled before starting.');
    }

    const model = genAI?.getGenerativeModel({
      model: 'gemini-flash-lite-latest' // Active Gemini Flash Lite model with available quota
    });

    // Convert image files to base64 with error handling
    const imageParts = await convertFilesToBase64(imageFiles);

    // Check for abort signal after image processing
    if (signal?.aborted) {
      throw new Error('Request was cancelled during image processing.');
    }

    // Create analysis prompt optimized for product identification
    const analysisPrompt = `Analyze the provided product image(s) and provide a detailed product analysis. Focus on identifying:

**Product Information:**
Product: [Specific product name with model if visible]
Brand: [Brand/manufacturer name]
Model: [Model number or version if identifiable]
Category: [Type of product - electronics, clothing, etc.]
Features: [Key features and specifications visible]
Condition: [New, used, refurbished based on appearance]
Color: [Primary color(s)]

**Analysis Requirements:**
- Be specific and detailed in your identification
- If text/labels are visible on the product, include them
- Identify any model numbers, serial numbers, or product codes
- Note any distinguishing features or characteristics
- Provide technical specifications if recognizable
- Estimate product category and typical use case

Please format your response with clear labels and be as specific as possible to help with product search and comparison.`;

    const contents = [{
      role: "user",
      parts: [
      ...imageParts, // Images first
      { text: analysisPrompt } // Then analysis instructions
      ]
    }];

    const generationConfig = {
      temperature: 0.2, // Lower for more factual analysis
      topP: 0.8,
      topK: 32,
      maxOutputTokens: 1500 // Increased for more detailed analysis
    };

    const requestConfig = {
      contents,
      generationConfig,
      safetySettings: getSafetySettings()
    };

    // Execute request with proper cancellation support
    let result;
    if (signal) {
      const geminiRequest = model?.generateContent(requestConfig);

      // Create race between request and abort signal
      const abortPromise = new Promise((_, reject) => {
        const abortHandler = () => {
          reject(new Error('Request was cancelled by user.'));
        };
        signal?.addEventListener('abort', abortHandler, { once: true });

        // Cleanup listener if request completes first
        geminiRequest?.finally?.(() => {
          signal?.removeEventListener('abort', abortHandler);
        });
      });

      result = await Promise.race([geminiRequest, abortPromise]);
    } else {
      result = await model?.generateContent(requestConfig);
    }

    if (!result) {
      throw new Error('No response received from Gemini AI. Please try again.');
    }

    const response = result?.response;
    if (!response) {
      throw new Error('Invalid response format from Gemini AI.');
    }

    return await parseImageAnalysisResponse(response);

  } catch (error) {
    console.error('Error in analyzeProductImages:', error);

    // Re-throw with proper error handling
    const friendlyMessage = handleGeminiError(error);
    throw new Error(friendlyMessage);
  }
}

/**
 * Generates product recommendations based on analysis.
 * @param {string} analysisText - Product analysis text.
 * @returns {Promise<Object>} Recommendation results.
 */
export async function generateProductRecommendations(analysisText) {
  try {
    if (!analysisText?.trim()) {
      throw new Error('No analysis text provided for recommendations.');
    }

    const model = genAI?.getGenerativeModel({
      model: 'gemini-flash-lite-latest'
    });

    const prompt = `Based on this product analysis: "${analysisText}"

Generate 3-5 specific product recommendations including:

**For each recommendation:**
1. Exact product name and model
2. Key features to look for
3. Typical price range
4. Alternative brands to consider
5. Where to find the best deals

**Shopping Tips:**
- Comparison shopping advice
- Best time to buy considerations
- Features to prioritize
- Common pitfalls to avoid

Focus on products similar to or complementary to the analyzed item.`;

    let result = await model?.generateContent(prompt);
    const response = result?.response;

    if (!response) {
      throw new Error('No recommendations generated.');
    }

    const recommendationText = response?.text?.();

    if (!recommendationText?.trim()) {
      throw new Error('Empty recommendations received.');
    }

    return {
      recommendations: recommendationText?.trim(),
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error(handleGeminiError(error));
  }
}