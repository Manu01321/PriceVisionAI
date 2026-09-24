# 🔄 OpenAI Multi-Key Fallback System - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           openaiService.js (Frontend Client)             │  │
│  │  • aiSearch()           • analyzeProductImage()          │  │
│  │  • getRecommendations() • chat()                         │  │
│  │  • analyzePriceHistory()• getStatus()                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓ HTTP                              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Express Server (server.js)                  │  │
│  │                                                           │  │
│  │  POST /api/ai/search              GET /api/ai/status     │  │
│  │  POST /api/ai/recommendations     POST /api/ai/reset     │  │
│  │  POST /api/ai/analyze-price                              │  │
│  │  POST /api/ai/analyze-product-image                      │  │
│  │  POST /api/ai/chat                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         OpenAI Service (openai-service.js)               │  │
│  │                                                           │  │
│  │  Key Management:                                         │  │
│  │  • 4 API Keys with status tracking                       │  │
│  │  • Automatic rotation on failure                         │  │
│  │  • Health monitoring                                     │  │
│  │  • Self-healing on success                               │  │
│  │                                                           │  │
│  │  AI Capabilities:                                        │  │
│  │  • Chat completions  • Image analysis                    │  │
│  │  • Embeddings        • Product search                    │  │
│  │  • Price analysis    • Recommendations                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      KEY ROTATION LOGIC                         │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ Key 1   │  │ Key 2   │  │ Key 3   │  │ Key 4   │          │
│  │ PRIMARY │  │FALLBACK1│  │FALLBACK2│  │FALLBACK3│          │
│  │         │  │         │  │         │  │         │          │
│  │ Active  │  │ Active  │  │ Active  │  │ Active  │          │
│  │ Fails:0 │  │ Fails:0 │  │ Fails:0 │  │ Fails:0 │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│       ↓            ↓            ↓            ↓                 │
│       └────────────┴────────────┴────────────┘                 │
│                    ↓                                           │
│         Automatic Selection & Rotation                         │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       OPENAI API                                │
│                    api.openai.com                               │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow - Normal Operation

```
User Request
    ↓
Frontend Service
    ↓
Backend API Endpoint (/api/ai/*)
    ↓
OpenAI Service
    ↓
Try Key 1
    ↓
Success! ✅
    ↓
Return Response
```

## Request Flow - Rate Limit Hit

```
User Request
    ↓
Frontend Service
    ↓
Backend API Endpoint
    ↓
OpenAI Service
    ↓
Try Key 1 → Rate Limit (429) ❌
    ↓
Detect 429 Error
    ↓
Switch to Key 2 (automatic)
    ↓
Try Key 2 → Success! ✅
    ↓
Return Response
```

## Request Flow - Invalid Key

```
User Request
    ↓
Frontend Service
    ↓
Backend API Endpoint
    ↓
OpenAI Service
    ↓
Try Key 1 → Auth Error (401) ❌
    ↓
Detect Auth Error
    ↓
Deactivate Key 1
    ↓
Switch to Key 2 (automatic)
    ↓
Try Key 2 → Success! ✅
    ↓
Return Response
```

## Request Flow - All Keys Tried

```
User Request
    ↓
OpenAI Service
    ↓
Try Key 1 → Failed ❌
    ↓
Try Key 2 → Failed ❌
    ↓
Try Key 3 → Failed ❌
    ↓
Try Key 4 → Failed ❌
    ↓
All Keys Exhausted
    ↓
Return Error to User
```

## Key State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                     KEY LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────┘

    [ACTIVE]
       │
       ├─ Success → Reset fail count → [ACTIVE]
       │
       ├─ Rate Limit (429) → Switch to next → [ACTIVE]
       │
       ├─ Network Error → failCount++ → [ACTIVE]
       │
       ├─ Auth Error (401/403) → [DEACTIVATED]
       │
       └─ 3+ Failures → [DEACTIVATED]

    [DEACTIVATED]
       │
       └─ Manual Reset → [ACTIVE]
```

## Error Handling Flow

```
                    API Call Made
                         │
                         ↓
              ┌──────────┴──────────┐
              │                     │
           Success              Error
              │                     │
              ↓                     ↓
    Reset fail count    ┌───────────┴───────────┐
    Return result       │                       │
                   Rate Limit           Auth/Other Error
                        │                       │
                        ↓                       ↓
                Switch to next      ┌──────────┴──────────┐
                key immediately     │                     │
                        │      failCount < 3        failCount >= 3
                        │           │                     │
                        ↓           ↓                     ↓
                   Try again   Switch to      Deactivate key
                               next key       Switch to next
                                  │                 │
                                  └────────┬────────┘
                                           ↓
                                      Try again
```

## Key Status Monitoring

```
┌─────────────────────────────────────────────────────────────────┐
│  GET /api/ai/status                                             │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    "currentKey": 1,        ← Currently active key              │
│    "totalKeys": 4,         ← Total keys configured             │
│    "activeKeys": 4,        ← Keys available for use            │
│    "keys": [                                                    │
│      {                                                          │
│        "index": 1,         ← Key number                        │
│        "active": true,     ← Can be used?                      │
│        "failCount": 0,     ← Consecutive failures              │
│        "lastUsed": "..."   ← Last successful use               │
│      },                                                         │
│      ...                                                        │
│    ]                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Concurrent Request Handling

```
Request 1 ──┐
            ├──→ [Key 1] → Success ✅
Request 2 ──┘

Request 3 ──┐
            ├──→ [Key 1] → Rate Limit → [Key 2] → Success ✅
Request 4 ──┘

Request 5 ───→ [Key 2] → Success ✅
```

## Self-Healing Mechanism

```
Time: 10:00 AM
Key 1: Active, failCount: 2

Request 1 → Key 1 → Error
Key 1: Active, failCount: 3 → DEACTIVATED

Time: 10:05 AM
Admin calls: POST /api/ai/reset-keys

Key 1: Active, failCount: 0 → REACTIVATED

OR

Time: 10:10 AM
Request 2 → Key 2 → Success
Key 2: failCount: 0 (reset on success)
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYERS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend Layer                                                 │
│  • src/services/openaiService.js                                │
│  • React components using openaiService                         │
│                                                                 │
│  ↓ HTTP Requests                                                │
│                                                                 │
│  API Layer                                                      │
│  • POST /api/ai/search                                          │
│  • POST /api/ai/recommendations                                 │
│  • POST /api/ai/analyze-price                                   │
│  • POST /api/ai/analyze-product-image                           │
│  • POST /api/ai/chat                                            │
│  • GET  /api/ai/status                                          │
│  • POST /api/ai/reset-keys                                      │
│                                                                 │
│  ↓ Service Calls                                                │
│                                                                 │
│  Service Layer                                                  │
│  • backend/services/openai-service.js                           │
│  • Key rotation logic                                           │
│  • Error handling                                               │
│  • Request retry                                                │
│                                                                 │
│  ↓ API Calls                                                    │
│                                                                 │
│  External API                                                   │
│  • OpenAI API (api.openai.com)                                  │
│  • GPT models                                                   │
│  • Vision models                                                │
│  • Embedding models                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Test Coverage Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST SUITE (test-openai.js)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Chat Completion                                             │
│     → Basic AI chat functionality                               │
│                                                                 │
│  ✅ Product Search                                              │
│     → Query optimization with AI                                │
│                                                                 │
│  ✅ AI Recommendations                                          │
│     → Personalized suggestions                                  │
│                                                                 │
│  ✅ Price Trend Analysis                                        │
│     → Historical data analysis                                  │
│                                                                 │
│  ✅ Image Analysis (Vision)                                     │
│     → Product identification from images                        │
│                                                                 │
│  ✅ Text Embeddings                                             │
│     → Semantic similarity                                       │
│                                                                 │
│  ✅ Concurrent Requests                                         │
│     → Multiple simultaneous calls                               │
│                                                                 │
│  ✅ Key Rotation                                                │
│     → Automatic fallback on failure                             │
│                                                                 │
│  ✅ Error Handling                                              │
│     → Rate limits, auth errors, network errors                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Reference

### Start System
```bash
cd backend
npm start
```

### Check Status
```bash
curl http://localhost:5000/api/ai/status
```

### Test API
```bash
test-openai-api.bat
```

### Run Full Tests
```bash
cd backend
node test-openai.js
```

### Reset Keys
```bash
curl -X POST http://localhost:5000/api/ai/reset-keys
```

### Monitor Logs
```bash
Get-Content backend\logs\combined.log -Wait -Tail 50
```

---

## 🎯 Key Takeaways

1. **4 Keys Active** - All ready to use
2. **Automatic Rotation** - No manual intervention needed
3. **Transparent to User** - Seamless experience
4. **Self-Healing** - Recovers from errors automatically
5. **Production Ready** - Fully tested and documented

---

**System is ready to use!** Just start the backend and make API calls. The key rotation will happen automatically in the background. 🚀
