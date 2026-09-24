# Price Vision AI Pro 🛍️

A powerful AI-driven price comparison and product search platform with advanced features including multi-site scraping, intelligent price tracking, and natural language search powered by OpenAI.

## 🚀 Features

### Core Features
- **React 18** - Modern React with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications

### AI-Powered Features
- **OpenAI Integration** - 4 API keys with automatic fallback system
- **Natural Language Search** - Search products using conversational queries
- **AI Recommendations** - Personalized product suggestions based on preferences
- **Price Intelligence** - AI-powered price trend analysis and predictions
- **Vision Analysis** - Product identification from images using GPT-4o Vision
- **Smart Comparison** - AI-driven product comparison and recommendations

### Price Tracking
- **Multi-Site Support** - Amazon, Flipkart, Myntra, Snapdeal, Ajio
- **Real-Time Price Tracking** - Automated price monitoring across sites
- **Price History Analytics** - Historical price data and trend analysis
- **Smart Alerts** - Automated notifications when prices drop
- **Watchlist Management** - Track multiple products simultaneously

### Advanced Search
- **Text Search** - Traditional keyword-based product search
- **Image Search** - Find products using images
- **Voice Search** - Voice-activated product search
- **Camera Search** - Snap and search products
- **AI-Enhanced Search** - Optimized search terms using AI

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📁 Project Structure

```
price_vision_ai_pro/
├── backend/                    # Backend API server
│   ├── services/              # Service layer
│   │   ├── openai-service.js  # OpenAI multi-key service ⭐
│   │   ├── product-search.js  # Product search service
│   │   ├── price-tracker.js   # Price tracking service
│   │   └── image-search.js    # Image search service
│   ├── scrapers/              # Web scraping modules
│   │   ├── amazon-scraper.js
│   │   ├── flipkart-scraper.js
│   │   └── base-scraper.js
│   ├── utils/                 # Utility functions
│   ├── server.js              # Express server
│   ├── test-openai.js         # OpenAI test suite ⭐
│   └── package.json
├── src/                       # Frontend React app
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page components
│   │   ├── dashboard/
│   │   ├── ai-search-results/
│   │   ├── voice-and-camera-search/
│   │   ├── price-history-analytics/
│   │   ├── product-comparison/
│   │   ├── watchlist-management/
│   │   └── deal-alerts-and-notifications/
│   ├── services/              # Frontend services
│   │   ├── openaiService.js   # OpenAI client ⭐
│   │   ├── productSearchService.js
│   │   ├── priceTrackingService.js
│   │   └── imageSearchService.js
│   ├── hooks/                 # Custom React hooks
│   ├── styles/                # Global styles
│   ├── App.jsx
│   ├── Routes.jsx
│   └── index.jsx
├── public/                    # Static assets
├── OPENAI_INTEGRATION.md      # OpenAI full documentation ⭐
├── INTEGRATION_SUMMARY.md     # Complete summary ⭐
├── SYSTEM_DIAGRAM.md          # Visual guide ⭐
├── QUICK_REFERENCE.md         # Quick reference card ⭐
├── test-openai-api.bat        # Quick test script ⭐
├── package.json
├── vite.config.mjs
└── tailwind.config.js

⭐ = New OpenAI Integration files
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 🤖 OpenAI Integration

This project includes a **production-ready OpenAI integration** with automatic key rotation and fallback.

### Features
- ✅ **4 API Keys** configured with automatic fallback
- ✅ **Intelligent Key Rotation** - switches on rate limits or failures
- ✅ **Self-Healing** - automatically recovers from errors
- ✅ **Rate Limit Handling** - transparent to users
- ✅ **7 AI Endpoints** - search, recommendations, analysis, vision, chat
- ✅ **Full Test Suite** - comprehensive testing included

### Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Check OpenAI Status**:
   ```bash
   curl http://localhost:5000/api/ai/status
   ```

3. **Run Tests**:
   ```bash
   cd backend
   node test-openai.js
   ```

### AI Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/ai/search` | Natural language product search |
| `POST /api/ai/recommendations` | Personalized suggestions |
| `POST /api/ai/analyze-price` | Price trend analysis |
| `POST /api/ai/analyze-product-image` | Vision analysis |
| `POST /api/ai/chat` | Chat with AI |
| `GET /api/ai/status` | Check key status |
| `POST /api/ai/reset-keys` | Reset all keys |

### Frontend Usage

```javascript
import { openaiService } from '@/services';

// AI search
const results = await openaiService.aiSearch('gaming laptop');

// Recommendations
const recs = await openaiService.getRecommendations(
  { interests: ['gaming'] },
  ['mouse', 'keyboard']
);

// Price analysis
const analysis = await openaiService.analyzePriceHistory(priceData, 'Product');
```

### Documentation

- 📘 **Full Docs**: `OPENAI_INTEGRATION.md`
- 📊 **Visual Guide**: `SYSTEM_DIAGRAM.md`
- 📝 **Quick Reference**: `QUICK_REFERENCE.md`
- 📋 **Summary**: `INTEGRATION_SUMMARY.md`

### How Fallback Works

```
Request → Key 1 fails → Auto-switch to Key 2 → Success ✅
```

The system automatically handles:
- Rate limits (429)
- Auth errors (401/403)
- Network timeouts
- Key failures

**No manual intervention needed!**

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.

## 🔧 Backend Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start Server**:
   ```bash
   npm start
   ```

3. **Server runs on**: `http://localhost:5000`

### Backend Features
- Multi-site web scraping (Playwright)
- Real-time price tracking
- SQLite database for persistence
- Rate limiting and security (Helmet, CORS)
- Comprehensive logging (Winston)

## 🚀 Full System Startup

### Option 1: Start Everything
```bash
# Use the batch file (Windows)
start-full-system.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health
- **OpenAI Status**: http://localhost:5000/api/ai/status

## 📦 Deployment

Build the application for production:

```bash
npm run build
```

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### OpenAI Integration Tests
```bash
cd backend
node test-openai.js
```

### Quick API Test
```bash
test-openai-api.bat
```

## 🙏 Acknowledgments

- **OpenAI API** - GPT-4o, GPT-4o-mini, Vision models
- **React & Vite** - Modern frontend stack
- **Playwright** - Web scraping automation
- **TailwindCSS** - Utility-first styling
- **Express** - Backend API framework

Built with ❤️ for intelligent price comparison and product discovery
