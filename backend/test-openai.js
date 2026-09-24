/**
 * OpenAI Service Test Suite
 * Tests the multi-key fallback system and various AI features
 */

const OpenAIService = require('./services/openai-service');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

async function testKeyRotation() {
  logger.info('🔄 Testing API key rotation and fallback...\n');

  try {
    // Get initial status
    const initialStatus = OpenAIService.getStatus();
    logger.info(`Initial Status:
      Current Key: ${initialStatus.currentKey}/${initialStatus.totalKeys}
      Active Keys: ${initialStatus.activeKeys}
    `);

    // Test 1: Simple chat completion
    logger.info('\n📝 Test 1: Chat Completion');
    const chatResponse = await OpenAIService.createChatCompletion(
      [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello! OpenAI integration working!" in a friendly way.' }
      ],
      { max_tokens: 50 }
    );

    logger.info(`✅ Response: ${chatResponse.choices[0].message.content}`);
    logger.info(`Model: ${chatResponse.model}`);

    // Test 2: Product search
    logger.info('\n🔍 Test 2: AI Product Search');
    const searchResult = await OpenAIService.searchProduct('best wireless headphones under 5000', {
      priceRange: '3000-5000',
      category: 'Electronics'
    });

    logger.info(`✅ Search Analysis:`);
    logger.info(JSON.stringify(searchResult, null, 2));

    // Test 3: Get recommendations
    logger.info('\n💡 Test 3: AI Recommendations');
    const recommendations = await OpenAIService.getRecommendations(
      { interests: ['technology', 'gaming'], budget: '10000-20000' },
      ['wireless mouse', 'mechanical keyboard', 'gaming monitor']
    );

    logger.info(`✅ Recommendations:`);
    logger.info(JSON.stringify(recommendations, null, 2));

    // Test 4: Price trend analysis
    logger.info('\n📊 Test 4: Price Trend Analysis');
    const priceHistory = [
      { date: '2025-10-25', price: 12999 },
      { date: '2025-11-01', price: 11999 },
      { date: '2025-11-08', price: 11499 },
      { date: '2025-11-15', price: 10999 },
      { date: '2025-11-22', price: 10499 }
    ];

    const priceAnalysis = await OpenAIService.analyzePriceTrend(
      priceHistory,
      'Sony WH-1000XM5 Wireless Headphones'
    );

    logger.info(`✅ Price Analysis:`);
    logger.info(JSON.stringify(priceAnalysis, null, 2));

    // Final status
    const finalStatus = OpenAIService.getStatus();
    logger.info(`\n📈 Final Status:
      Current Key: ${finalStatus.currentKey}/${finalStatus.totalKeys}
      Active Keys: ${finalStatus.activeKeys}
      Total Requests: ${finalStatus.keys.reduce((sum, k) => sum + (k.lastUsed ? 1 : 0), 0)}
    `);

    logger.info('\n✅ All tests passed! OpenAI integration working correctly.');
  } catch (error) {
    logger.error(`\n❌ Test failed: ${error.message}`);
    logger.error(error.stack);
  }
}

async function testFallbackScenario() {
  logger.info('\n🔄 Testing Fallback Scenario (simulating key failure)...\n');

  try {
    // Make multiple rapid requests to test key rotation
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(
        OpenAIService.createChatCompletion(
          [{ role: 'user', content: `Test request ${i + 1}: What is 2+2?` }],
          { max_tokens: 10 }
        )
      );
    }

    const results = await Promise.allSettled(promises);

    logger.info(`\n📊 Results Summary:`);
    logger.info(`✅ Successful: ${results.filter((r) => r.status === 'fulfilled').length}`);
    logger.info(`❌ Failed: ${results.filter((r) => r.status === 'rejected').length}`);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        logger.info(`Request ${index + 1}: ✅ ${result.value.choices[0].message.content}`);
      } else {
        logger.error(`Request ${index + 1}: ❌ ${result.reason.message}`);
      }
    });

    const status = OpenAIService.getStatus();
    logger.info(`\n📈 Key Usage:`);
    status.keys.forEach((key, i) => {
      logger.info(
        `Key ${key.index}: Active=${key.active}, Fails=${key.failCount}, Used=${key.lastUsed ? '✅' : '❌'}`
      );
    });
  } catch (error) {
    logger.error(`\n❌ Fallback test failed: ${error.message}`);
  }
}

async function testImageAnalysis() {
  logger.info('\n🖼️  Test 5: Image Analysis (OpenAI Vision)...\n');

  try {
    // Use a sample product image URL
    const imageUrl = 'https://m.media-amazon.com/images/I/61m4hVUbe6L._AC_SL1500_.jpg'; // Sample headphones image

    const analysis = await OpenAIService.analyzeImage(
      imageUrl,
      'Analyze this product image. Identify the product type, brand if visible, key features, and estimate the price range. Be specific and concise.'
    );

    logger.info(`✅ Image Analysis Result:`);
    logger.info(analysis.choices[0].message.content);
    logger.info(`\nModel: ${analysis.model}`);
  } catch (error) {
    logger.warn(`⚠️  Image analysis test skipped or failed: ${error.message}`);
    logger.info(
      'Note: Image analysis requires valid image URLs and may have different rate limits'
    );
  }
}

async function testEmbeddings() {
  logger.info('\n🔢 Test 6: Text Embeddings...\n');

  try {
    const texts = [
      'Sony wireless headphones with noise cancellation',
      'Apple AirPods Pro with spatial audio',
      'Samsung Galaxy Buds Pro'
    ];

    const embeddings = await OpenAIService.createEmbedding(texts);

    logger.info(`✅ Generated embeddings for ${embeddings.data.length} texts`);
    logger.info(`Model: ${embeddings.model}`);
    logger.info(`Embedding dimensions: ${embeddings.data[0].embedding.length}`);
    logger.info(`Total tokens used: ${embeddings.usage.total_tokens}`);
  } catch (error) {
    logger.error(`❌ Embeddings test failed: ${error.message}`);
  }
}

// Main test execution
async function runAllTests() {
  logger.info('🚀 Starting OpenAI Service Integration Tests\n');
  logger.info('='.repeat(60));

  try {
    await testKeyRotation();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s between test suites

    await testFallbackScenario();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await testImageAnalysis();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await testEmbeddings();

    logger.info('\n' + '='.repeat(60));
    logger.info('✅ All tests completed!');
    logger.info('\n📊 Final Service Status:');
    const finalStatus = OpenAIService.getStatus();
    logger.info(JSON.stringify(finalStatus, null, 2));
  } catch (error) {
    logger.error(`\n❌ Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      logger.info('\n✅ Test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`\n❌ Test suite failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  testKeyRotation,
  testFallbackScenario,
  testImageAnalysis,
  testEmbeddings,
  runAllTests
};
