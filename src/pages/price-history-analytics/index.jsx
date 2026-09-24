import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import AISearchBar from '../../components/ui/AISearchBar';
import NotificationBadge from '../../components/ui/NotificationBadge';
import AIAssistantPanel from '../../components/ui/AIAssistantPanel';
import QuickActionMenu from '../../components/ui/QuickActionMenu';

// Import page components
import PriceChart from './components/PriceChart';
import MetricsCards from './components/MetricsCards';
import SeasonalAnalysis from './components/SeasonalAnalysis';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import FilterPanel from './components/FilterPanel';
import AlertsHistory from './components/AlertsHistory';

const PriceHistoryAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: '90d',
    retailers: ['amazon', 'bestbuy', 'walmart', 'target'],
    priceRange: { min: '', max: '' },
    showPredictions: true,
    showDeals: true,
    dealThreshold: 15,
    currency: 'USD'
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock product data
  const mockProduct = {
    id: 'iphone-15-pro-128gb',
    name: 'iPhone 15 Pro 128GB',
    brand: 'Apple',
    model: 'A3108',
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1642227140191-b9913243c341',
    imageAlt: 'Silver iPhone 15 Pro showing home screen with app icons on white background',
    currentPrice: 729,
    originalPrice: 999,
    discount: 27,
    rating: 4.6,
    reviews: 15847,
    availability: 'In Stock'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'seasonal', label: 'Seasonal Analysis', icon: 'Calendar' },
    { id: 'competitors', label: 'Competitor Analysis', icon: 'Users' },
    { id: 'alerts', label: 'Alerts History', icon: 'Bell' }
  ];

  useEffect(() => {
    // Get product from location state or use mock data
    const productFromState = location?.state?.product;
    setSelectedProduct(productFromState || mockProduct);
  }, [location?.state]);

  const handleSearch = (query) => {
    navigate('/ai-search-results', {
      state: {
        query,
        source: 'price-analytics'
      }
    });
  };

  const handleVoiceSearch = () => {
    navigate('/voice-and-camera-search', {
      state: { mode: 'voice', source: 'price-analytics' }
    });
  };

  const handleCameraSearch = () => {
    navigate('/voice-and-camera-search', {
      state: { mode: 'camera', source: 'price-analytics' }
    });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Apply filters to data
  };

  const handleExportData = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      // Export logic would go here
    }, 2000);
  };

  const handleSetPriceAlert = () => {
    navigate('/deal-alerts-and-notifications', {
      state: {
        product: selectedProduct,
        action: 'create-alert'
      }
    });
  };

  const handleCompareProducts = () => {
    navigate('/product-comparison', {
      state: {
        products: [selectedProduct],
        source: 'price-analytics'
      }
    });
  };

  const handleAddToWatchlist = () => {
    navigate('/watchlist-management', {
      state: {
        product: selectedProduct,
        action: 'add'
      }
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <MetricsCards productData={selectedProduct} priceHistory={[]} />

            <PriceChart
              productData={selectedProduct}
              selectedRetailers={filters?.retailers}
              dateRange={filters?.dateRange}
              onDataPointClick={(data) => console.log('Data point clicked:', data)}
            />
          </div>
        );

      case 'seasonal':
        return <SeasonalAnalysis productCategory={selectedProduct?.category} />;

      case 'competitors':
        return <CompetitorAnalysis productId={selectedProduct?.id} />;

      case 'alerts':
        return <AlertsHistory productId={selectedProduct?.id} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-primary transition-smooth"
            >
              Dashboard
            </button>
            <Icon name="ChevronRight" size={14} />
            <span>Price History Analytics</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Price History Analytics</h1>
              <p className="text-lg text-muted-foreground mt-1">
                Comprehensive price tracking insights with ML-powered predictions
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleExportData}
                loading={isLoading}
                iconName="Download"
                iconPosition="left"
              >
                Export Data
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAIAssistantOpen(true)}
                iconName="Bot"
                iconPosition="left"
              >
                AI Assistant
              </Button>
              <NotificationBadge
                onNotificationClick={() => navigate('/notifications')}
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <AISearchBar
            onSearch={handleSearch}
            onVoiceSearch={handleVoiceSearch}
            onCameraSearch={handleCameraSearch}
            placeholder="Search for products to analyze price history..."
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Product Info Card */}
        {selectedProduct && (
          <div className="bg-surface border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedProduct?.image}
                    alt={selectedProduct?.imageAlt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{selectedProduct?.name}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-muted-foreground">{selectedProduct?.brand}</span>
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-warning fill-current" />
                      <span className="text-sm text-muted-foreground">
                        {selectedProduct?.rating} ({selectedProduct?.reviews?.toLocaleString()})
                      </span>
                    </div>
                    <span className="text-sm text-success">{selectedProduct?.availability}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-foreground">
                      ₹{selectedProduct?.currentPrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{selectedProduct?.originalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-success">{selectedProduct?.discount}% off</div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSetPriceAlert}
                    iconName="Bell"
                    iconPosition="left"
                  >
                    Set Alert
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToWatchlist}
                    iconName="Heart"
                    iconPosition="left"
                  >
                    Watchlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                  activeTab === tab?.id
                    ? 'bg-surface text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <FilterPanel
            onFiltersChange={handleFiltersChange}
            isOpen={isFilterPanelOpen}
            onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Content Area */}
          <div className={`${isFilterPanelOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {renderTabContent()}
          </div>

          {/* Filter Panel */}
          {isFilterPanelOpen && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <FilterPanel
                  onFiltersChange={handleFiltersChange}
                  isOpen={true}
                  onToggle={() => setIsFilterPanelOpen(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-accent/5 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleCompareProducts}
              iconName="BarChart3"
              iconPosition="left"
              className="justify-start"
            >
              Compare with Similar Products
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/deal-alerts-and-notifications')}
              iconName="Bell"
              iconPosition="left"
              className="justify-start"
            >
              Manage All Alerts
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/watchlist-management')}
              iconName="Heart"
              iconPosition="left"
              className="justify-start"
            >
              View Watchlist
            </Button>
          </div>
        </div>
      </div>
      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        onClose={() => setIsAIAssistantOpen(false)}
        contextData={{
          productName: selectedProduct?.name,
          pageName: 'Price History Analytics'
        }}
      />

      {/* Quick Action Menu */}
      <QuickActionMenu
        onVoiceSearch={handleVoiceSearch}
        onCameraSearch={handleCameraSearch}
        onQuickAdd={handleAddToWatchlist}
        onPriceAlert={handleSetPriceAlert}
      />
    </div>
  );
};

export default PriceHistoryAnalytics;
