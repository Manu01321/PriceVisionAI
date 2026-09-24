import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AISearchBar from '../../components/ui/AISearchBar';

import AIAssistantPanel from '../../components/ui/AIAssistantPanel';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import InsightCard from './components/InsightCard';
import WatchlistItem from './components/WatchlistItem';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import TrendingDeals from './components/TrendingDeals';
import AIRecommendations from './components/AIRecommendations';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for dashboard insights
  const insightCards = [
    {
      id: 1,
      title: 'Total Savings',
      value: '₹2,36,301',
      change: '+₹10,541',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'success',
      description: 'Saved this month through AI recommendations',
      actionLabel: 'View breakdown',
      trend: [1, 1, -1, 1, 1, 1, 1]
    },
    {
      id: 2,
      title: 'Active Tracks',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: 'Eye',
      color: 'primary',
      description: 'Products being monitored for price changes',
      actionLabel: 'Manage watchlist'
    },
    {
      id: 3,
      title: 'Deal Success Rate',
      value: '87%',
      change: '+5%',
      changeType: 'positive',
      icon: 'Target',
      color: 'warning',
      description: 'AI accuracy in finding the best deals',
      actionLabel: 'View analytics'
    },
    {
      id: 4,
      title: 'Price Alerts',
      value: '12',
      change: 'New',
      changeType: 'neutral',
      icon: 'Bell',
      color: 'error',
      description: 'Active price drop notifications',
      actionLabel: 'View alerts'
    }
  ];

  // Mock watchlist data
  const watchlistItems = [
    {
      id: 1,
      name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      image: 'https://images.unsplash.com/photo-1697292866700-148d1078b17a',
      imageAlt: 'Apple iPhone 15 Pro Max in Natural Titanium color showing front and back view',
      currentPrice: 1199,
      targetPrice: 1099,
      priceChange: -50,
      urgencyScore: 85,
      lastUpdated: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 2,
      name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      image: 'https://images.unsplash.com/photo-1593427265234-9c1170ab01d4',
      imageAlt: 'Sony WH-1000XM5 black wireless headphones with noise canceling technology',
      currentPrice: 349,
      targetPrice: 299,
      priceChange: 0,
      urgencyScore: 65,
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 3,
      name: 'MacBook Air M2 13-inch 512GB Space Gray',
      image: 'https://images.unsplash.com/photo-1650750018363-ff7ffe460f4b',
      imageAlt: 'MacBook Air M2 in Space Gray color showing open laptop with Apple logo',
      currentPrice: 1399,
      targetPrice: 1299,
      priceChange: 25,
      urgencyScore: 45,
      lastUpdated: new Date(Date.now() - 45 * 60 * 1000)
    }
  ];

  // Mock activity feed data
  const recentActivities = [
    {
      id: 1,
      type: 'price_drop',
      title: 'Price Drop Alert',
      description: 'iPhone 15 Pro dropped by ₹4,150 - now at your target price!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      relevanceScore: 95,
      product: {
        name: 'iPhone 15 Pro',
        image: 'https://images.unsplash.com/photo-1697437201341-017cd0dc3485',
        imageAlt: 'iPhone 15 Pro in Natural Titanium showing sleek design'
      },
      priceChange: {
        oldPrice: 1249,
        newPrice: 1199
      }
    },
    {
      id: 2,
      type: 'ai_insight',
      title: 'AI Recommendation',
      description:
        'Based on your search history, we found a better alternative for Samsung Galaxy S24',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      relevanceScore: 88
    },
    {
      id: 3,
      type: 'deal_found',
      title: 'Great Deal Found',
      description: 'MacBook Air M2 - 15% off at Best Buy, limited time offer',
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      relevanceScore: 82,
      product: {
        name: 'MacBook Air M2',
        image: 'https://images.unsplash.com/photo-1608810832512-55200d57b14e',
        imageAlt: 'MacBook Air M2 laptop in silver color showing thin profile'
      }
    },
    {
      id: 4,
      type: 'watchlist_add',
      title: 'Product Added to Watchlist',
      description: 'Sony WH-1000XM5 headphones added to your electronics watchlist',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      relevanceScore: 75
    }
  ];

  // Mock trending deals data
  const trendingDeals = [
    {
      id: 1,
      title: 'Samsung 65" QLED 4K Smart TV QN65Q80C',
      image: 'https://images.unsplash.com/photo-1724526382377-ad1b87aac149',
      imageAlt: 'Samsung 65-inch QLED 4K Smart TV displaying vibrant colors on wall mount',
      currentPrice: 1299,
      originalPrice: 1799,
      discount: 28,
      urgencyScore: 92,
      store: 'Best Buy',
      rating: 4.6,
      timeLeft: '2 days'
    },
    {
      id: 2,
      title: 'Apple AirPods Pro (2nd Generation) with MagSafe Case',
      image: 'https://images.unsplash.com/photo-1653827722464-857d43ecac3e',
      imageAlt: 'Apple AirPods Pro 2nd generation with white MagSafe charging case',
      currentPrice: 199,
      originalPrice: 249,
      discount: 20,
      urgencyScore: 78,
      store: 'Amazon',
      rating: 4.8,
      timeLeft: '6 hours'
    },
    {
      id: 3,
      title: 'Nintendo Switch OLED Model with Neon Blue and Red Joy-Con',
      image: 'https://images.unsplash.com/photo-1591182136289-67ff16828fd4',
      imageAlt: 'Nintendo Switch OLED gaming console with colorful neon blue and red controllers',
      currentPrice: 299,
      originalPrice: 349,
      discount: 14,
      urgencyScore: 65,
      store: 'GameStop',
      rating: 4.7,
      timeLeft: '1 day'
    }
  ];

  // Mock AI recommendations data
  const aiRecommendations = [
    {
      id: 1,
      title: 'Google Pixel 8 Pro 128GB Obsidian',
      image: 'https://images.unsplash.com/photo-1697514261129-5524c0a04f91',
      imageAlt: 'Google Pixel 8 Pro smartphone in Obsidian black color showing camera system',
      price: 899,
      originalPrice: 999,
      confidence: 94,
      reason: 'ai_analysis',
      reasonText: 'Better camera specs than your searched iPhone alternatives',
      aiInsight:
        'AI analysis shows 23% better low-light photography performance and ₹24,900 savings compared to similar flagship phones.'
    },
    {
      id: 2,
      title: 'Bose QuietComfort 45 Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1595439960878-4713c482a827',
      imageAlt: 'Bose QuietComfort 45 wireless headphones in black with premium cushioned design',
      price: 279,
      originalPrice: 329,
      confidence: 87,
      reason: 'price_drop',
      reasonText: 'Similar to your Sony headphones search with better price',
      aiInsight:
        'Price dropped 15% this week. Historical data suggests this is the lowest price in 6 months.'
    }
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      navigate('/ai-search-results', { state: { searchQuery: query } });
    }, 1500);
  };

  const handleVoiceSearch = () => {
    navigate('/voice-and-camera-search');
  };

  const handleCameraSearch = () => {
    navigate('/voice-and-camera-search');
  };

  const handleInsightCardClick = (card) => {
    switch (card?.title) {
      case 'Active Tracks':
        navigate('/watchlist-management');
        break;
      case 'Deal Success Rate':
        navigate('/price-history-analytics');
        break;
      case 'Price Alerts':
        navigate('/deal-alerts-and-notifications');
        break;
      default:
        navigate('/user-profile-and-settings');
    }
  };

  const handleWatchlistItemAction = (action, item) => {
    switch (action) {
      case 'view':
        navigate('/product-comparison', { state: { productId: item?.id } });
        break;
      case 'remove':
        console.log('Remove item:', item?.id);
        break;
      case 'alert':
        navigate('/deal-alerts-and-notifications');
        break;
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'voice':
        navigate('/voice-and-camera-search');
        break;
      case 'camera':
        navigate('/voice-and-camera-search');
        break;
      case 'watchlist':
        navigate('/watchlist-management');
        break;
      case 'analytics':
        navigate('/price-history-analytics');
        break;
      case 'deals':
        navigate('/deal-alerts-and-notifications');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section with AI Search */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back to Price Vision AI Pro
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the best deals with AI-powered search. Use voice, camera, or text to find
              products and get intelligent price insights.
            </p>
          </div>

          {/* AI Search Bar */}
          <div className="max-w-2xl mx-auto">
            <AISearchBar
              onSearch={handleSearch}
              onVoiceSearch={handleVoiceSearch}
              onCameraSearch={handleCameraSearch}
              placeholder="Search for products with AI assistance..."
              isProcessing={isSearching}
              showConfidence={true}
            />
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insightCards?.map((card) => (
            <InsightCard
              key={card?.id}
              title={card?.title}
              value={card?.value}
              change={card?.change}
              changeType={card?.changeType}
              icon={card?.icon}
              color={card?.color}
              description={card?.description}
              actionLabel={card?.actionLabel}
              trend={card?.trend}
              onClick={() => handleInsightCardClick(card)}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Recommendations */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <AIRecommendations
                recommendations={aiRecommendations}
                onViewProduct={(product) => navigate('/product-comparison', { state: { product } })}
                onDismiss={(id) => console.log('Dismiss recommendation:', id)}
              />
            </div>

            {/* Trending Deals */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <TrendingDeals
                deals={trendingDeals}
                onViewDeal={(deal) => navigate('/product-comparison', { state: { deal } })}
                onAddToWatchlist={(deal) => console.log('Add to watchlist:', deal)}
              />
            </div>

            {/* Activity Feed */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <ActivityFeed activities={recentActivities} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <QuickActions
                onVoiceSearch={() => handleQuickAction('voice')}
                onCameraSearch={() => handleQuickAction('camera')}
                onViewWatchlist={() => handleQuickAction('watchlist')}
                onViewAnalytics={() => handleQuickAction('analytics')}
                onViewDeals={() => handleQuickAction('deals')}
              />
            </div>

            {/* Watchlist Preview */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">My Watchlist</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/watchlist-management')}
                    className="text-primary"
                  >
                    View All
                    <Icon name="ArrowRight" size={14} className="ml-1" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {watchlistItems?.slice(0, 3)?.map((item) => (
                    <WatchlistItem
                      key={item?.id}
                      product={item}
                      onViewDetails={(product) => handleWatchlistItemAction('view', product)}
                      onRemove={(product) => handleWatchlistItemAction('remove', product)}
                      onSetAlert={(product) => handleWatchlistItemAction('alert', product)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Floating Action Menu */}
      <QuickActionMenu
        onVoiceSearch={handleVoiceSearch}
        onCameraSearch={handleCameraSearch}
        onQuickAdd={() => navigate('/watchlist-management')}
        onPriceAlert={() => navigate('/deal-alerts-and-notifications')}
      />

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        onClose={() => setIsAIAssistantOpen(false)}
        contextData={{ pageName: 'Dashboard' }}
      />
    </div>
  );
};

export default Dashboard;
