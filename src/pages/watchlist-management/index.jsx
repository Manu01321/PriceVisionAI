import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import AIAssistantPanel from '../../components/ui/AIAssistantPanel';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import WatchlistSummary from './components/WatchlistSummary';
import CategoryTabs from './components/CategoryTabs';
import WatchlistFilters from './components/WatchlistFilters';
import ProductCard from './components/ProductCard';
import BulkActions from './components/BulkActions';
import NotificationSettings from './components/NotificationSettings';
import ProductQuickViewModal from '../../components/ui/ProductQuickViewModal';

const WatchlistManagement = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('date_added');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Mock data for watchlist items
  const mockWatchlistItems = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB Natural Titanium',
      image: 'https://images.unsplash.com/photo-1697292866700-148d1078b17a',
      imageAlt: 'Silver iPhone 15 Pro Max showing the titanium finish and camera system',
      currentPrice: 949.99,
      originalPrice: 1199.99,
      priceChange: -250.0,
      priceChangePercent: -20.8,
      dealUrgency: 85,
      lastChecked: new Date(Date.now() - 15 * 60 * 1000),
      category: 'electronics',
      store: 'Best Buy',
      inStock: true,
      priceHistory: [1199.99, 1150.0, 1100.0, 1050.0, 999.99, 949.99],
      dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      image: 'https://images.unsplash.com/photo-1621208587196-0b2a7d2aeb03',
      imageAlt: 'Black Sony WH-1000XM5 headphones with sleek modern design and cushioned ear cups',
      currentPrice: 329.99,
      originalPrice: 399.99,
      priceChange: -70.0,
      priceChangePercent: -17.5,
      dealUrgency: 72,
      lastChecked: new Date(Date.now() - 30 * 60 * 1000),
      category: 'electronics',
      store: 'Amazon',
      inStock: true,
      priceHistory: [399.99, 389.99, 369.99, 349.99, 339.99, 329.99],
      dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      name: 'Nike Air Max 270 React Running Shoes',
      image: 'https://images.unsplash.com/photo-1617812865970-f0a6d8ce4049',
      imageAlt: 'White and blue Nike Air Max 270 React running shoes with visible air cushioning',
      currentPrice: 89.99,
      originalPrice: 150.0,
      priceChange: -60.01,
      priceChangePercent: -40.0,
      dealUrgency: 95,
      lastChecked: new Date(Date.now() - 45 * 60 * 1000),
      category: 'fashion',
      store: 'Nike',
      inStock: false,
      priceHistory: [150.0, 140.0, 120.0, 110.0, 99.99, 89.99],
      dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker 6 Quart',
      image: 'https://images.unsplash.com/photo-1705305295467-dca3764ff5e4',
      imageAlt:
        'Stainless steel Instant Pot pressure cooker with digital display and control panel',
      currentPrice: 79.99,
      originalPrice: 99.99,
      priceChange: -20.0,
      priceChangePercent: -20.0,
      dealUrgency: 45,
      lastChecked: new Date(Date.now() - 60 * 60 * 1000),
      category: 'home',
      store: 'Target',
      inStock: true,
      priceHistory: [99.99, 95.0, 89.99, 85.0, 82.99, 79.99],
      dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: 5,
      name: 'MacBook Air M2 13-inch 256GB Space Gray',
      image: 'https://images.unsplash.com/photo-1632249354567-7ad412e51f2a',
      imageAlt: 'Space Gray MacBook Air M2 laptop open showing the sleek design and keyboard',
      currentPrice: 999.99,
      originalPrice: 1199.0,
      priceChange: -199.01,
      priceChangePercent: -16.6,
      dealUrgency: 78,
      lastChecked: new Date(Date.now() - 20 * 60 * 1000),
      category: 'electronics',
      store: 'Apple Store',
      inStock: true,
      priceHistory: [1199.0, 1150.0, 1099.0, 1050.0, 1025.0, 999.99],
      dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 6,
      name: "Levi\'s 501 Original Fit Jeans",
      image: 'https://images.unsplash.com/photo-1694725369452-6cfadad90af3',
      imageAlt:
        "Classic blue Levi\'s 501 jeans showing the traditional straight leg fit and button fly",
      currentPrice: 49.99,
      originalPrice: 69.99,
      priceChange: -20.0,
      priceChangePercent: -28.6,
      dealUrgency: 65,
      lastChecked: new Date(Date.now() - 90 * 60 * 1000),
      category: 'fashion',
      store: "Levi\'s",
      inStock: true,
      priceHistory: [69.99, 65.0, 59.99, 55.0, 52.99, 49.99],
      dateAdded: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    }
  ];

  const mockCategories = [
    { id: 'all', name: 'All Items', count: 24, icon: 'Grid3X3' },
    { id: 'electronics', name: 'Electronics', count: 12, icon: 'Smartphone' },
    { id: 'fashion', name: 'Fashion', count: 8, icon: 'Shirt' },
    { id: 'home', name: 'Home & Garden', count: 4, icon: 'Home' }
  ];

  const mockAchievements = [
    { name: 'Deal Hunter', icon: 'Target' },
    { name: 'Price Tracker Pro', icon: 'TrendingDown' },
    { name: 'Smart Saver', icon: 'DollarSign' }
  ];

  // Filter and sort items
  const getFilteredItems = () => {
    let filtered = mockWatchlistItems;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered?.filter((item) => item?.category === activeCategory);
    }

    // Apply other filters
    if (filters?.priceRange?.min) {
      filtered = filtered?.filter(
        (item) => item?.currentPrice >= parseFloat(filters?.priceRange?.min)
      );
    }
    if (filters?.priceRange?.max) {
      filtered = filtered?.filter(
        (item) => item?.currentPrice <= parseFloat(filters?.priceRange?.max)
      );
    }
    if (filters?.dealUrgency !== 'all') {
      const urgencyMap = { high: 80, medium: 50, low: 0 };
      filtered = filtered?.filter(
        (item) => item?.dealUrgency >= urgencyMap?.[filters?.dealUrgency]
      );
    }

    // Sort items
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a?.currentPrice - b?.currentPrice;
        case 'price_high':
          return b?.currentPrice - a?.currentPrice;
        case 'urgency':
          return b?.dealUrgency - a?.dealUrgency;
        case 'savings':
          return Math.abs(b?.priceChange) - Math.abs(a?.priceChange);
        default:
          return b?.dateAdded - a?.dateAdded;
      }
    });

    return filtered;
  };

  const filteredItems = getFilteredItems();
  const totalPotentialSavings = mockWatchlistItems?.reduce(
    (sum, item) => sum + Math.abs(item?.priceChange),
    0
  );
  const activeAlerts = mockWatchlistItems?.filter((item) => item?.dealUrgency >= 50)?.length;

  // Event handlers
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setSelectedItems([]);
  };

  const handleSelectAll = () => {
    setSelectedItems(filteredItems?.map((item) => item?.id));
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  const handleItemSelect = (itemId, selected) => {
    if (selected) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev?.filter((id) => id !== itemId));
    }
  };

  const handleRemoveItem = (itemId) => {
    console.log('Removing item:', itemId);
    // Remove from selection if selected
    setSelectedItems((prev) => prev?.filter((id) => id !== itemId));
  };

  const handleBulkRemove = (itemIds) => {
    console.log('Bulk removing items:', itemIds);
    setSelectedItems([]);
  };

  const handleAdjustAlert = (product) => {
    console.log('Adjusting alert for:', product?.name);
  };

  const handleViewDetails = (product) => {
    setSelectedProductForModal(product);
    setIsQuickViewOpen(true);
  };

  const handleVoiceSearch = () => {
    navigate('/voice-and-camera-search');
  };

  const handleCameraSearch = () => {
    navigate('/voice-and-camera-search');
  };

  const handleQuickAdd = () => {
    console.log('Quick add to watchlist');
  };

  const handlePriceAlert = () => {
    navigate('/deal-alerts-and-notifications');
  };

  const handleExport = (items, format) => {
    console.log('Exporting items:', items, 'in format:', format);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Watchlist Management</h1>
            <p className="text-muted-foreground mt-1">
              Track prices and manage your saved products with AI-powered insights
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              iconName="Plus"
              iconPosition="left"
              onClick={() => navigate('/ai-search-results')}
            >
              Add Products
            </Button>

            <Button
              variant="default"
              iconName="Bot"
              iconPosition="left"
              onClick={() => setIsAIAssistantOpen(true)}
            >
              AI Assistant
            </Button>
          </div>
        </div>

        {/* Summary Dashboard */}
        <WatchlistSummary
          totalItems={mockWatchlistItems?.length}
          activeAlerts={activeAlerts}
          potentialSavings={totalPotentialSavings}
          achievementBadges={mockAchievements}
        />

        {/* Category Navigation */}
        <CategoryTabs
          categories={mockCategories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onAddCategory={() => console.log('Add category')}
          onEditCategory={() => console.log('Edit categories')}
        />

        {/* Filters and Bulk Actions */}
        <div className="space-y-4 mb-6">
          <WatchlistFilters
            onFilterChange={setFilters}
            onSortChange={setSortBy}
            activeFilters={filters}
          />

          <BulkActions
            selectedItems={selectedItems}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkRemove={handleBulkRemove}
            onBulkCategoryChange={(items, category) =>
              console.log('Bulk category change:', items, category)
            }
            onBulkAlertChange={(items, threshold) =>
              console.log('Bulk alert change:', items, threshold)
            }
            onExport={handleExport}
            totalItems={filteredItems?.length}
          />
        </div>

        {/* Product Grid */}
        <div className="mb-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)]?.map((_, index) => (
                <div
                  key={index}
                  className="bg-surface border border-border rounded-lg p-4 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded mb-3"></div>
                  <div className="flex space-x-3 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems?.map((product) => (
                <div key={product?.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems?.includes(product?.id)}
                      onChange={(e) => handleItemSelect(product?.id, e?.target?.checked)}
                      className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
                    />
                  </div>
                  <ProductCard
                    product={product}
                    onRemove={handleRemoveItem}
                    onAdjustAlert={handleAdjustAlert}
                    onViewDetails={handleViewDetails}
                    className="pt-8"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="Heart" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No items in this category
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeCategory === 'all'
                  ? 'Start building your watchlist by adding products you want to track'
                  : `No items found in the ${activeCategory} category`}
              </p>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => navigate('/ai-search-results')}
              >
                Add Products
              </Button>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <NotificationSettings
          onSettingsChange={(settings) => console.log('Settings updated:', settings)}
          onSave={(settings) => console.log('Notification settings saved:', settings)}
        />
      </div>
      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        onClose={() => setIsAIAssistantOpen(false)}
        contextData={{ pageName: 'Watchlist Management' }}
        className="lg:fixed lg:right-4 lg:top-20 lg:bottom-4"
      />

      {/* Quick Action Menu */}
      <QuickActionMenu
        onVoiceSearch={handleVoiceSearch}
        onCameraSearch={handleCameraSearch}
        onQuickAdd={handleQuickAdd}
        onPriceAlert={handlePriceAlert}
      />

      {/* Product Quick View / Details Modal */}
      <ProductQuickViewModal
        product={selectedProductForModal}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
};

export default WatchlistManagement;
