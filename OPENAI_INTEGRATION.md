# OpenAI Integration - Multi-Key Fallback System

## 🎯 Overview

This integration provides robust OpenAI API access with automatic key rotation and fallback. The system manages **4 API keys** and automatically switches between them when one fails or hits rate limits.

## 🔑 API Keys Configured

The system has 4 OpenAI API keys configured with automatic fallback:

1. **Key 1**: `sk-proj-your-api-key-1-here...`
2. **Key 2**: `sk-svcacct-your-api-key-2-here...`
3. **Key 3**: `sk-proj-your-api-key-3-here...`
4. **Key 4**: `sk-proj-your-api-key-4-here...`


## ✨ Features

### Automatic Fallback System
- ✅ **Intelligent Key Rotation**: Automatically switches to next key on failure
- ✅ **Rate Limit Handling**: Detects rate limits (429 errors) and switches immediately
- ✅ **Error Recovery**: Tracks failures and deactivates problematic keys
- ✅ **Health Monitoring**: Monitors each key's status and usage
- ✅ **Self-Healing**: Resets fail counters on successful requests

### Key Management
- **4 Active Keys**: All keys start active and available
- **Automatic Deactivation**: Keys with repeated failures are deactivated
- **Failure Tracking**: Each key tracks its failure count
- **Last Used Timestamp**: Tracks when each key was last used
- **Manual Reset**: Admin can reset all keys via API

### Failure Scenarios Handled
1. **Rate Limits (429)**: Instant switch to next key
2. **Invalid Authentication (401)**: Key deactivated, switch to next
3. **Forbidden Access (403)**: Key deactivated, switch to next
4. **Network Errors**: Retry with next key
5. **Timeout Errors**: Retry with next key
6. **General API Errors**: Track failures, switch after threshold

## 🚀 Installation

### 1. Install Dependencies

```bash
cd backend
npm install openai
```

### 2. Start the Backend

```bash
npm start
```

The OpenAI service will initialize automatically with all 4 keys.

## 📡 API Endpoints

### AI Search
```bash
POST /api/ai/search
Content-Type: application/json

{
  "query": "best wireless headphones under 5000",
  "context": {
    "priceRange": "3000-5000",
    "category": "Electronics"
  }
}
```

### AI Recommendations
```bash
POST /api/ai/recommendations
Content-Type: application/json

{
  "userPreferences": {
    "interests": ["technology", "gaming"],
    "budget": "10000-20000"
  },
  "recentSearches": ["wireless mouse", "keyboard"]
}
```

### Price Trend Analysis
```bash
POST /api/ai/analyze-price
Content-Type: application/json

{
  "priceHistory": [
    {"date": "2025-11-01", "price": 12999},
    {"date": "2025-11-15", "price": 11499}
  ],
  "productName": "Sony WH-1000XM5"
}
```

### Image Analysis (Vision)
```bash
POST /api/ai/analyze-product-image
Content-Type: application/json

{
  "imageUrl": "https://example.com/product.jpg",
  "prompt": "Analyze this product"
}
```

### AI Chat
```bash
POST /api/ai/chat
Content-Type: application/json

{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello!"}
  ],
  "options": {
    "model": "gpt-4o-mini",
    "temperature": 0.7
  }
}
```

### Service Status
```bash
GET /api/ai/status

Response:
{
  "success": true,
  "openai": {
    "currentKey": 1,
    "totalKeys": 4,
    "activeKeys": 4,
    "keys": [
      {
        "index": 1,
        "active": true,
        "failCount": 0,
        "lastUsed": "2025-11-25T10:30:00.000Z"
      },
      ...
    ]
  }
}
```

### Reset Keys (Admin)
```bash
POST /api/ai/reset-keys

Response:
{
  "success": true,
  "message": "All OpenAI API keys have been reset",
  "status": {...}
}
```

## 🧪 Testing

### Run Full Test Suite
```bash
cd backend
node test-openai.js
```

### Test Individual Features
```javascript
const OpenAIService = require('./services/openai-service');

// Test chat completion
const response = await OpenAIService.createChatCompletion([
  { role: 'user', content: 'Hello!' }
]);

// Test product search
const search = await OpenAIService.searchProduct('laptop under 50000');

// Check service status
const status = OpenAIService.getStatus();
console.log(status);
```

## 🎨 Frontend Integration

### Basic Usage
```javascript
import { openaiService } from '@/services';

// AI-powered search
const results = await openaiService.aiSearch('gaming laptop under 80000', {
  priceRange: '60000-80000'
});

// Get recommendations
const recommendations = await openaiService.getRecommendations(
  { interests: ['gaming', 'productivity'] },
  ['laptop', 'monitor', 'keyboard']
);

// Analyze price history
const analysis = await openaiService.analyzePriceHistory(
  priceData,
  'Dell XPS 15'
);
```

### Enhanced Search (AI + Traditional)
```javascript
// Combines AI analysis with traditional search
const results = await openaiService.enhancedSearch('lightweight laptop for students');
// Returns: { results, aiInsights, count, filters }
```

### Product Insights
```javascript
const insights = await openaiService.getProductInsights({
  name: 'MacBook Air M2',
  price: 99990,
  rating: 4.5,
  reviews: 1250
});
// Returns AI analysis of value, features, concerns, recommendation
```

### Product Comparison
```javascript
const comparison = await openaiService.compareProducts([
  { name: 'Product A', price: 15000, rating: 4.2, site: 'Amazon' },
  { name: 'Product B', price: 14500, rating: 4.5, site: 'Flipkart' }
]);
// Returns AI comparison summary with recommendations
```

## 🔍 How Fallback Works

### Normal Operation
```
Request → Key 1 → Success ✅
```

### Rate Limit Hit
```
Request → Key 1 → Rate Limit (429) → Switch to Key 2 → Success ✅
```

### Key Failure
```
Request → Key 1 → Auth Error (401) → Deactivate Key 1 → Switch to Key 2 → Success ✅
```

### All Keys Exhausted
```
Request → Key 1 → Fail → Key 2 → Fail → Key 3 → Fail → Key 4 → Fail → Error ❌
```

## 📊 Monitoring

### Check Current Status
```bash
curl http://localhost:5000/api/ai/status
```

### Monitor Logs
```bash
# Backend logs show key switching
[OpenAI Service] Initialized with key 1
[OpenAI Service] Rate limit hit, switching to next key
[OpenAI Service] Switched to key 2
```

### Health Check
```bash
curl http://localhost:5000/api/health
# Returns service status including OpenAI key info
```

## ⚙️ Configuration

### Backend Service (`backend/services/openai-service.js`)

```javascript
// Keys are hardcoded in the service
this.apiKeys = [
  { key: 'sk-proj-...', active: true, failCount: 0 },
  // ... 3 more keys
];

// Configuration
this.maxRetries = 4; // Try all keys before giving up
```

### Customization Options

```javascript
// Change default model
await OpenAIService.createChatCompletion(messages, {
  model: 'gpt-4o',  // or 'gpt-4o-mini'
  temperature: 0.7,
  max_tokens: 1000
});

// Change embedding model
await OpenAIService.createEmbedding(text, 'text-embedding-3-large');
```

## 🛡️ Error Handling

### Graceful Degradation
```javascript
try {
  const result = await openaiService.aiSearch(query);
} catch (error) {
  // Falls back to traditional search
  console.error('AI search failed, using traditional search');
  const result = await productSearchService.search(query);
}
```

### User-Friendly Messages
```javascript
if (!result.success) {
  showNotification('AI features temporarily unavailable', 'warning');
  // Continue with basic features
}
```

## 📈 Performance

- **Average Response Time**: 1-3 seconds
- **Rate Limits**: Automatically handled
- **Concurrent Requests**: Supported with intelligent queuing
- **Caching**: Responses cached on frontend for 5 minutes
- **Retry Logic**: Automatic with exponential backoff

## 🔒 Security

- ✅ Keys stored server-side only (never exposed to frontend)
- ✅ Rate limiting on API endpoints
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Error messages don't expose key details

## 📚 Available Models

### Chat Models
- `gpt-4o` - Most capable, latest model
- `gpt-4o-mini` - Fast and cost-effective (recommended)
- `gpt-4-turbo` - High performance
- `gpt-3.5-turbo` - Budget option

### Vision Model
- `gpt-4o` - Can analyze images

### Embedding Models
- `text-embedding-3-small` - Cost-effective (recommended)
- `text-embedding-3-large` - Higher quality

## 🎯 Use Cases

### 1. Smart Search
Natural language queries automatically converted to optimized search terms
```
"I want a laptop for video editing under 1 lakh"
→ Extracts: budget=100000, category=laptop, purpose=video-editing
```

### 2. Personalized Recommendations
Based on user preferences and search history
```
User interests: gaming, programming
Recent searches: mechanical keyboard, gaming mouse
→ Recommends: gaming laptops, monitors, chairs
```

### 3. Price Intelligence
Analyzes historical data to predict best buying time
```
Price history: ₹15000 → ₹14000 → ₹13500
→ "Falling trend, wait 1-2 weeks for better deal"
```

### 4. Visual Search
Identify products from images
```
Upload: [photo of headphones]
→ "Sony WH-1000XM5, estimated price ₹25,000-30,000"
```

### 5. Product Comparison
AI-powered comparison of multiple products
```
Compare: 3 laptops
→ "Best value: X, Best performance: Y, Best for budget: Z"
```

## 🔧 Troubleshooting

### Keys Not Working
```bash
# Reset all keys
curl -X POST http://localhost:5000/api/ai/reset-keys
```

### Check Key Status
```bash
# View detailed status
curl http://localhost:5000/api/ai/status | json_pp
```

### Enable Debug Logging
```javascript
// In server.js
const logger = winston.createLogger({
  level: 'debug',  // Change from 'info' to 'debug'
  // ...
});
```

## 📞 Support

For issues or questions:
1. Check logs: `backend/logs/combined.log`
2. Check key status: `GET /api/ai/status`
3. Try resetting keys: `POST /api/ai/reset-keys`
4. Run test suite: `node test-openai.js`

## 🎉 Success!

Your OpenAI integration is now live with:
- ✅ 4 API keys configured
- ✅ Automatic fallback system
- ✅ Rate limit handling
- ✅ Multiple AI features (search, recommendations, analysis)
- ✅ Frontend integration ready
- ✅ Comprehensive error handling

**Next Steps:**
1. Start backend: `cd backend && npm start`
2. Test API: `curl http://localhost:5000/api/ai/status`
3. Run tests: `node test-openai.js`
4. Start frontend: `npm run dev` (from root)
5. Try AI features in the app!

Happy coding! 🚀
