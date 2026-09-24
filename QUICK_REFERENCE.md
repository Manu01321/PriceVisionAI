# 🚀 OpenAI Integration - Quick Reference Card

## ⚡ Quick Start (3 Steps)

```bash
# 1. Start backend
cd backend && npm start

# 2. Check status
curl http://localhost:5000/api/ai/status

# 3. Test it!
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

---

## 🔑 Your 4 API Keys

| Key | Status | Type |
|-----|--------|------|
| Key 1 | ✅ Active | Primary |
| Key 2 | ✅ Active | Fallback 1 |
| Key 3 | ✅ Active | Fallback 2 |
| Key 4 | ✅ Active | Fallback 3 |

**Location**: `backend/services/openai-service.js`

---

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/search` | POST | AI product search |
| `/api/ai/recommendations` | POST | Get recommendations |
| `/api/ai/analyze-price` | POST | Analyze price trends |
| `/api/ai/analyze-product-image` | POST | Image analysis |
| `/api/ai/chat` | POST | Chat with AI |
| `/api/ai/status` | GET | Check key status |
| `/api/ai/reset-keys` | POST | Reset all keys |

---

## 💻 Frontend Usage

```javascript
import { openaiService } from '@/services';

// AI search
const results = await openaiService.aiSearch('laptop');

// Recommendations
const recs = await openaiService.getRecommendations(
  { interests: ['gaming'] },
  ['mouse', 'keyboard']
);

// Price analysis
const analysis = await openaiService.analyzePriceHistory(
  priceData,
  'Product Name'
);

// Product insights
const insights = await openaiService.getProductInsights(product);

// Compare products
const comparison = await openaiService.compareProducts([p1, p2]);
```

---

## 🔄 How Fallback Works

```
Request → Key 1 fails → Auto-switch to Key 2 → Success ✅
```

**Triggers**:
- ❌ Rate limit (429)
- ❌ Auth error (401/403)
- ❌ Network timeout
- ❌ 3+ failures

**Result**: Automatic switch to next key

---

## 📊 Check Status

```bash
# Get status
curl http://localhost:5000/api/ai/status

# Response
{
  "currentKey": 1,
  "totalKeys": 4,
  "activeKeys": 4,
  "keys": [...]
}
```

---

## 🧪 Testing

```bash
# Quick test
test-openai-api.bat

# Full test suite
cd backend && node test-openai.js
```

---

## 🚨 Troubleshooting

### Problem: AI not responding
```bash
# 1. Check backend running
curl http://localhost:5000/api/health

# 2. Check AI status
curl http://localhost:5000/api/ai/status

# 3. Check logs
type backend\logs\error.log
```

### Problem: All keys failing
```bash
# Reset all keys
curl -X POST http://localhost:5000/api/ai/reset-keys
```

---

## 📝 Common Examples

### AI Search
```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query":"wireless headphones under 5000"}'
```

### Get Recommendations
```bash
curl -X POST http://localhost:5000/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{"userPreferences":{"interests":["gaming"]}}'
```

### Price Analysis
```bash
curl -X POST http://localhost:5000/api/ai/analyze-price \
  -H "Content-Type: application/json" \
  -d '{"priceHistory":[...],"productName":"Product"}'
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `backend/services/openai-service.js` | Main service (4 keys) |
| `backend/server.js` | API endpoints |
| `src/services/openaiService.js` | Frontend client |
| `backend/test-openai.js` | Test suite |
| `test-openai-api.bat` | Quick test script |
| `OPENAI_INTEGRATION.md` | Full docs |
| `INTEGRATION_SUMMARY.md` | Complete summary |
| `SYSTEM_DIAGRAM.md` | Visual guide |

---

## ✨ Features Available

- ✅ Natural language search
- ✅ AI recommendations
- ✅ Price trend analysis
- ✅ Image analysis (Vision)
- ✅ Product insights
- ✅ Product comparison
- ✅ Chat interface
- ✅ Automatic fallback

---

## 🎯 Key Points

1. **4 keys** configured and active
2. **Automatic rotation** on failure
3. **No manual intervention** needed
4. **Rate limits** handled automatically
5. **Production ready** - fully tested

---

## 🔗 Quick Links

**Start Backend**: `cd backend && npm start`  
**Check Status**: `curl http://localhost:5000/api/ai/status`  
**Run Tests**: `cd backend && node test-openai.js`  
**View Logs**: `type backend\logs\combined.log`

---

## 💡 Pro Tips

1. **Monitor regularly**: Check `/api/ai/status` daily
2. **Watch logs**: Monitor for key switches
3. **Test often**: Run test suite after changes
4. **Reset if needed**: Use `/api/ai/reset-keys`
5. **Use gpt-4o-mini**: Faster and cheaper for most tasks

---

## 🎉 You're Ready!

Your OpenAI integration is **live and production-ready**!

Just start your backend and the system will automatically handle:
- ✅ Key rotation
- ✅ Rate limits
- ✅ Error recovery
- ✅ Load balancing

**Happy coding!** 🚀
