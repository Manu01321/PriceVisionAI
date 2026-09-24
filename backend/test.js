const axios = require('axios');

async function testBackend() {
  try {
    console.log('🧪 Testing Price Vision Backend...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test sites endpoint
    const sitesResponse = await axios.get('http://localhost:5000/api/sites');
    console.log('✅ Sites endpoint working:', sitesResponse.data.sites.length, 'sites available');
    
    // Test search endpoint
    const searchResponse = await axios.post('http://localhost:5000/api/search/text', {
      query: 'iphone',
      limit: 5
    });
    console.log('✅ Search endpoint working:', searchResponse.data.count, 'results found');
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running: node server.js');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = { testBackend };
