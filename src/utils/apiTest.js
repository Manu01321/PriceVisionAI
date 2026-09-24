import { initializeServices, searchProducts, getServiceStats } from '../services/index.js';

/**
 * Test all API endpoints and services
 */
export async function runApiTests() {
  console.log('🧪 Running API Tests for Price Vision...\n');
  
  const results = {
    initialization: false,
    health: false,
    sites: false,
    search: false,
    stats: false,
    errors: []
  };

  try {
    // Test 1: Service Initialization
    console.log('1️⃣ Testing service initialization...');
    const initResult = await initializeServices();
    
    if (initResult.success) {
      console.log('   ✅ Services initialized successfully');
      console.log(`   🌐 Backend: ${initResult.backend.status}`);
      console.log(`   🛍️ Supported sites: ${initResult.supportedSites.length}`);
      results.initialization = true;
      results.health = true;
      results.sites = true;
    } else {
      console.log('   ❌ Service initialization failed:', initResult.error);
      results.errors.push(`Initialization: ${initResult.error}`);
    }

  } catch (error) {
    console.log('   ❌ Initialization error:', error.message);
    results.errors.push(`Initialization: ${error.message}`);
  }

  // Test 2: Product Search
  if (results.initialization) {
    try {
      console.log('\n2️⃣ Testing product search...');
      const searchResult = await searchProducts('iPhone', { limit: 3 });
      
      if (searchResult.success && searchResult.results.length > 0) {
        console.log(`   ✅ Search successful: ${searchResult.count} results found`);
        console.log(`   📱 Sample result: ${searchResult.results[0].title}`);
        results.search = true;
      } else {
        console.log('   ❌ Search returned no results');
        results.errors.push('Search: No results returned');
      }

    } catch (error) {
      console.log('   ❌ Search error:', error.message);
      results.errors.push(`Search: ${error.message}`);
    }
  }

  // Test 3: Service Statistics
  try {
    console.log('\n3️⃣ Testing service statistics...');
    const stats = await getServiceStats();
    
    if (stats.api && stats.api.healthy) {
      console.log('   ✅ Statistics retrieved successfully');
      console.log(`   📊 API Status: ${stats.api.status}`);
      results.stats = true;
    } else {
      console.log('   ❌ Statistics unavailable');
      results.errors.push('Statistics: API unhealthy');
    }

  } catch (error) {
    console.log('   ❌ Stats error:', error.message);
    results.errors.push(`Statistics: ${error.message}`);
  }

  // Test Summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  const passedTests = Object.values(results).filter(r => r === true).length;
  const totalTests = Object.keys(results).filter(k => k !== 'errors').length;
  
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(error => console.log(`   • ${error}`));
  } else {
    console.log('\n🎉 All tests passed! API is ready for use.');
  }

  return {
    success: results.errors.length === 0,
    passedTests,
    totalTests,
    results,
    errors: results.errors
  };
}

/**
 * Test specific API endpoint
 * @param {string} endpoint - API endpoint to test
 * @param {Object} data - Request data
 */
export async function testEndpoint(endpoint, data = {}) {
  try {
    const { default: apiClient } = await import('../services/apiClient.js');
    
    console.log(`🔍 Testing ${endpoint}...`);
    
    let response;
    if (data && Object.keys(data).length > 0) {
      response = await apiClient.post(endpoint, data);
    } else {
      response = await apiClient.get(endpoint);
    }
    
    console.log(`✅ ${endpoint} successful:`, response);
    return { success: true, response };
    
  } catch (error) {
    console.log(`❌ ${endpoint} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Performance test for search functionality
 * @param {Array} queries - Search queries to test
 */
export async function performanceTest(queries = ['iPhone', 'Samsung', 'Laptop']) {
  console.log('🏃‍♂️ Running Performance Tests...\n');
  
  const results = [];
  
  for (const query of queries) {
    try {
      const startTime = Date.now();
      const result = await searchProducts(query, { limit: 5 });
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      results.push({
        query,
        duration,
        resultCount: result.count || 0,
        success: result.success
      });
      
      console.log(`   📱 "${query}": ${duration}ms (${result.count || 0} results)`);
      
    } catch (error) {
      results.push({
        query,
        duration: null,
        resultCount: 0,
        success: false,
        error: error.message
      });
      
      console.log(`   ❌ "${query}": Failed - ${error.message}`);
    }
  }
  
  const avgDuration = results
    .filter(r => r.duration !== null)
    .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration !== null).length;
  
  console.log(`\n📊 Average Response Time: ${Math.round(avgDuration)}ms`);
  
  return {
    results,
    averageDuration: avgDuration,
    successRate: (results.filter(r => r.success).length / results.length) * 100
  };
}

/**
 * Test image search functionality
 * @param {string} base64Image - Base64 encoded test image
 */
export async function testImageSearch(base64Image) {
  try {
    console.log('🖼️ Testing image search...');
    
    const { default: imageSearchService } = await import('../services/imageSearchService.js');
    
    const result = await imageSearchService.searchByImage(base64Image, { limit: 3 });
    
    if (result.success) {
      console.log(`✅ Image search successful: ${result.resultsCount} results`);
      console.log(`🤖 AI Analysis: ${result.aiAnalysis.productName || 'Product detected'}`);
      return { success: true, result };
    } else {
      console.log('❌ Image search failed: No results');
      return { success: false, error: 'No results' };
    }
    
  } catch (error) {
    console.log('❌ Image search error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test price tracking functionality
 * @param {Object} mockProduct - Mock product for testing
 */
export async function testPriceTracking(mockProduct) {
  try {
    console.log('📈 Testing price tracking...');
    
    const { default: priceTrackingService } = await import('../services/priceTrackingService.js');
    
    const trackingId = await priceTrackingService.addToTracking(mockProduct, {
      targetPrice: mockProduct.price * 0.9 // Set alert for 10% discount
    });
    
    console.log(`✅ Price tracking setup successful: ${trackingId}`);
    
    // Get tracking stats
    const stats = priceTrackingService.getTrackingStats();
    console.log(`📊 Tracking ${stats.totalProducts} products`);
    
    return { success: true, trackingId, stats };
    
  } catch (error) {
    console.log('❌ Price tracking error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests sequentially
 */
export async function runAllTests() {
  console.log('🚀 Running Complete API Test Suite\n');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  // Main API tests
  const apiResults = await runApiTests();
  
  // Performance tests
  console.log('\n' + '='.repeat(50));
  const perfResults = await performanceTest();
  
  // Price tracking test
  console.log('\n' + '='.repeat(50));
  const trackingResults = await testPriceTracking({
    title: 'Test Product - iPhone 15',
    price: 75000,
    productUrl: 'https://amazon.in/test-product',
    source: { site: 'amazon' }
  });
  
  const totalTime = Date.now() - startTime;
  
  // Final Summary
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Final Test Summary');
  console.log('='.repeat(50));
  console.log(`⏱️  Total Test Time: ${totalTime}ms`);
  console.log(`✅ API Tests: ${apiResults.passedTests}/${apiResults.totalTests}`);
  console.log(`🏃‍♂️ Performance: ${Math.round(perfResults.averageDuration)}ms avg`);
  console.log(`📈 Price Tracking: ${trackingResults.success ? 'Working' : 'Failed'}`);
  
  if (apiResults.success && trackingResults.success) {
    console.log('\n🎉 ALL SYSTEMS GO! Your Price Vision API is ready!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Start your React frontend: npm run dev');
    console.log('  2. Open http://localhost:5173 in your browser');
    console.log('  3. Begin searching for products!');
  } else {
    console.log('\n⚠️  Some issues detected. Check the errors above.');
  }
  
  return {
    success: apiResults.success && trackingResults.success,
    apiResults,
    perfResults,
    trackingResults,
    totalTime
  };
}

// Auto-run tests if this module is imported
if (typeof window !== 'undefined') {
  // Browser environment - add to window for easy access
  window.priceVisionTests = {
    runApiTests,
    testEndpoint,
    performanceTest,
    testImageSearch,
    testPriceTracking,
    runAllTests
  };
}

export default {
  runApiTests,
  testEndpoint,
  performanceTest,
  testImageSearch,
  testPriceTracking,
  runAllTests
};
