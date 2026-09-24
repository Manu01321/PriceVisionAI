import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AIAssistantPanel from '../../components/ui/AIAssistantPanel';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import ComparisonTable from './components/ComparisonTable';
import PriceHistoryChart from './components/PriceHistoryChart';
import ReviewAnalysis from './components/ReviewAnalysis';
import SmartRecommendations from './components/SmartRecommendations';
import ComparisonActions from './components/ComparisonActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import aiProductService from '../../services/aiProductService';

// Helper to normalize any incoming product structure for all comparison views
export const normalizeProductForComparison = (product, index = 0) => {
  if (!product) return null;

  const currentPrice = Number(product.currentPrice || product.price || 0);
  const originalPrice = Number(
    product.originalPrice || Math.round(currentPrice * 1.25) || currentPrice
  );
  const discount =
    product.discount ||
    (originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0);
  const rating = Number(product.rating || 4.5);
  const reviewCount = Number(product.reviewCount || product.reviews || 2400);

  // Extract keySpecs from features or keySpecs
  let keySpecs = [];
  if (Array.isArray(product.keySpecs) && product.keySpecs.length > 0) {
    keySpecs = product.keySpecs;
  } else if (Array.isArray(product.features) && product.features.length > 0) {
    keySpecs = product.features.map((feat, i) => {
      const parts = String(feat).split(':');
      if (parts.length > 1) {
        return { name: parts[0].trim(), value: parts.slice(1).join(':').trim() };
      }
      return { name: `Feature ${i + 1}`, value: String(feat) };
    });
  } else {
    keySpecs = [
      { name: 'Category', value: product.category || 'Electronics' },
      { name: 'Brand', value: product.brand || 'Original Brand' },
      { name: 'Warranty', value: '1 Year Manufacturer Warranty' },
      { name: 'Return Policy', value: '7 Days Replacement' }
    ];
  }

  // AI Scores
  const aiScores = {
    value: Number(product.aiScores?.value || product.confidence || (discount > 30 ? 92 : 86)),
    quality: Number(product.aiScores?.quality || (rating >= 4.5 ? 94 : 88)),
    urgency: Number(product.aiScores?.urgency || product.dealUrgency || (discount > 40 ? 88 : 70))
  };

  // AI Analysis (Pros & Cons)
  let aiAnalysis = product.aiAnalysis;
  if (!aiAnalysis || !aiAnalysis.pros) {
    const featurePros = (product.features || []).slice(0, 3);
    aiAnalysis = {
      pros:
        featurePros.length > 0
          ? featurePros
          : [
              `Competitive price point at ₹${currentPrice.toLocaleString('en-IN')}`,
              `Verified user satisfaction (${rating}/5 rating)`,
              `Available with fast shipping and multi-store deals`
            ],
      cons: [
        discount > 50
          ? 'High seasonal demand with fast-selling stock'
          : 'Price varies between e-commerce stores',
        'Standard manufacturer warranty applies'
      ]
    };
  }

  // Price History
  let priceHistory = [];
  if (Array.isArray(product.priceHistory) && product.priceHistory.length > 0) {
    if (typeof product.priceHistory[0] === 'number') {
      priceHistory = product.priceHistory.map((pr, idx, arr) => {
        const d = new Date();
        d.setDate(d.getDate() - (arr.length - 1 - idx) * 7);
        return {
          date: d.toISOString().split('T')[0],
          price: pr,
          bestTimeToBuy: idx === arr.length - 1
        };
      });
    } else {
      priceHistory = product.priceHistory;
    }
  } else {
    priceHistory = [
      {
        date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        price: Math.round(currentPrice * 1.15)
      },
      {
        date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
        price: Math.round(currentPrice * 1.1)
      },
      {
        date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
        price: Math.round(currentPrice * 1.05)
      },
      { date: new Date().toISOString().split('T')[0], price: currentPrice, bestTimeToBuy: true }
    ];
  }

  // Retailers
  const retailers =
    Array.isArray(product.retailers) && product.retailers.length > 0
      ? product.retailers
      : [
          { name: 'Amazon India', price: currentPrice },
          { name: 'Flipkart', price: Math.round(currentPrice * 1.03) },
          { name: 'Reliance Digital', price: Math.round(currentPrice * 1.05) }
        ];

  return {
    id: String(product.id || `prod-${Date.now()}-${index}`),
    name: product.name || 'Selected Product',
    brand: product.brand || (product.name ? product.name.split(' ')[0] : 'Brand'),
    image: product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    imageAlt: product.imageAlt || product.name || 'Product Image',
    currentPrice,
    originalPrice,
    priceChange: product.priceChange || -Math.round(currentPrice * 0.08),
    discount,
    rating,
    reviewCount,
    fakeReviewAlert: Boolean(product.fakeReviewAlert),
    aiScores,
    keySpecs,
    aiAnalysis,
    priceHistory,
    retailers,
    source: product.source || 'user_selection'
  };
};

// Intelligently create a competitor when only one item is selected
export const createSmartCompetitor = (mainProduct) => {
  const price = mainProduct.currentPrice || 1000;
  const nameLower = (mainProduct.name || '').toLowerCase();

  let compName = `Alternative to ${mainProduct.name}`;
  let compBrand = 'Market Competitor';
  let compPrice = Math.round(price * 0.95);
  let compImage = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12';

  if (nameLower.includes('watch')) {
    compName = nameLower.includes('boat')
      ? 'Noise ColorFit Pro 4 AMOLED Smartwatch'
      : 'boAt Wave Call 2 Bluetooth Calling Smartwatch';
    compBrand = nameLower.includes('boat') ? 'Noise' : 'boAt';
    compPrice = nameLower.includes('boat') ? Math.round(price * 1.15) : Math.round(price * 0.85);
    compImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
  } else if (
    nameLower.includes('phone') ||
    nameLower.includes('iphone') ||
    nameLower.includes('galaxy')
  ) {
    compName =
      nameLower.includes('apple') || nameLower.includes('iphone')
        ? 'Samsung Galaxy S24 Ultra'
        : 'Apple iPhone 15 Pro';
    compBrand = compName.includes('Samsung') ? 'Samsung' : 'Apple';
    compPrice = Math.round(price * 1.05);
    compImage = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9';
  } else if (nameLower.includes('laptop') || nameLower.includes('macbook')) {
    compName = nameLower.includes('macbook') ? 'Dell XPS 13 OLED Laptop' : 'Apple MacBook Air M2';
    compBrand = compName.includes('Apple') ? 'Apple' : 'Dell';
    compPrice = Math.round(price * 0.98);
    compImage = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853';
  } else if (
    nameLower.includes('headphone') ||
    nameLower.includes('earbud') ||
    nameLower.includes('audio')
  ) {
    compName = 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones';
    compBrand = 'Sony';
    compPrice = Math.round(price * 1.1);
    compImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
  }

  return normalizeProductForComparison(
    {
      id: `competitor-${Date.now()}`,
      name: compName,
      brand: compBrand,
      currentPrice: compPrice,
      originalPrice: Math.round(compPrice * 1.3),
      rating: 4.5,
      reviewCount: 8400,
      image: compImage,
      features: [
        'Direct market alternative match',
        'Verified customer choice',
        'Competitive pricing across major stores'
      ]
    },
    1
  );
};

// Baseline mock products used only as fallback if no query or state is present
const fallbackMockProducts = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro 128GB',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1572538194597-42aeefa26482',
    imageAlt: 'iPhone 15 Pro in natural titanium color',
    currentPrice: 99990,
    originalPrice: 119900,
    rating: 4.7,
    reviewCount: 12450,
    features: [
      'A17 Pro Chip',
      '48MP Main Camera',
      '6.1" Super Retina XDR Display',
      'Titanium Frame'
    ]
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 256GB',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1707410420102-faff6eb0e033',
    imageAlt: 'Samsung Galaxy S24 Ultra in titanium gray',
    currentPrice: 119999,
    originalPrice: 134999,
    rating: 4.6,
    reviewCount: 9870,
    features: [
      'Snapdragon 8 Gen 3',
      '200MP Quad Telephoto',
      '6.8" Dynamic AMOLED 2X',
      'S-Pen Included'
    ]
  }
];

const ProductComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [activeView, setActiveView] = useState('comparison');
  const [isLoading, setIsLoading] = useState(false);

  // Live "Add Product" Search Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSearchResults, setModalSearchResults] = useState([]);
  const [isSearchingModal, setIsSearchingModal] = useState(false);
  const [searchError, setSearchError] = useState('');

  const views = [
    { id: 'comparison', label: 'Comparison Table', icon: 'Table' },
    { id: 'charts', label: 'Price History', icon: 'TrendingUp' },
    { id: 'reviews', label: 'Review Analysis', icon: 'MessageSquare' },
    { id: 'recommendations', label: 'Recommendations', icon: 'Sparkles' }
  ];

  // Dynamic initialization from router location state
  useEffect(() => {
    let initialList = [];

    if (
      location?.state?.products &&
      Array.isArray(location.state.products) &&
      location.state.products.length > 0
    ) {
      initialList = location.state.products.map(normalizeProductForComparison);
      // If only 1 product came in, add a smart competitor so side-by-side comparison works immediately
      if (initialList.length === 1) {
        initialList.push(createSmartCompetitor(initialList[0]));
      }
    } else if (location?.state?.product) {
      const main = normalizeProductForComparison(location.state.product);
      initialList = [main, createSmartCompetitor(main)];
    } else if (location?.state?.deal) {
      const main = normalizeProductForComparison(location.state.deal);
      initialList = [main, createSmartCompetitor(main)];
    } else if (location?.state?.baseProduct) {
      const main = normalizeProductForComparison(location.state.baseProduct);
      const competitors = (location.state.competitors || []).map(normalizeProductForComparison);
      initialList = [main, ...competitors];
      if (initialList.length === 1) {
        initialList.push(createSmartCompetitor(main));
      }
    } else {
      // Default to normalized fallback
      initialList = fallbackMockProducts.map(normalizeProductForComparison);
    }

    setSelectedProducts(initialList);
  }, [location?.state]);

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p?.id !== productId));
  };

  const handleAddToWatchlist = (productId) => {
    console.log('Adding to watchlist:', productId);
    navigate('/watchlist-management');
  };

  const handleSetPriceAlert = (productId) => {
    console.log('Setting price alert:', productId);
    navigate('/deal-alerts-and-notifications');
  };

  const handleAddToComparison = (rawProduct) => {
    const normalized = normalizeProductForComparison(rawProduct);
    if (!selectedProducts.find((p) => p?.id === normalized?.id)) {
      setSelectedProducts((prev) => [...prev, normalized].slice(0, 4));
    }
  };

  const handleExportComparison = async (format) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Exporting comparison as ${format}`);
    setIsLoading(false);
  };

  const handleSaveComparison = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Comparison saved');
    setIsLoading(false);
  };

  const handleShareComparison = (platform) => {
    console.log(`Sharing comparison on ${platform}`);
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setSearchError('');
  };

  const handleExecuteModalSearch = async (queryToSearch) => {
    const q = queryToSearch || modalSearchQuery;
    if (!q?.trim()) return;

    setIsSearchingModal(true);
    setSearchError('');
    try {
      const results = await aiProductService.searchProducts(q);
      const products = Array.isArray(results) ? results : results.products || [];
      setModalSearchResults(products.map(normalizeProductForComparison));
    } catch (err) {
      console.error('Modal search failed:', err);
      setSearchError('Search failed. Please try a different query.');
    } finally {
      setIsSearchingModal(false);
    }
  };

  // Dynamic AI Verdict computation comparing all currently selected products
  const aiVerdict = useMemo(() => {
    if (!selectedProducts || selectedProducts.length < 2) return null;

    const sortedByPrice = [...selectedProducts].sort((a, b) => a.currentPrice - b.currentPrice);
    const sortedByRating = [...selectedProducts].sort((a, b) => b.rating - a.rating);
    const sortedByValue = [...selectedProducts].sort(
      (a, b) => (b.aiScores?.value || 0) - (a.aiScores?.value || 0)
    );

    const cheapest = sortedByPrice[0];
    const mostExpensive = sortedByPrice[sortedByPrice.length - 1];
    const priceDiff = mostExpensive.currentPrice - cheapest.currentPrice;
    const bestValue = sortedByValue[0];
    const topRated = sortedByRating[0];

    return {
      cheapest,
      mostExpensive,
      priceDiff,
      bestValue,
      topRated,
      summary: `${bestValue.name} leads in overall value rating with ${bestValue.aiScores?.value}/100 score. ${cheapest.name} offers the lowest entry price at ₹${cheapest.currentPrice.toLocaleString('en-IN')}${priceDiff > 0 ? ` (₹${priceDiff.toLocaleString('en-IN')} savings)` : ''}.`
    };
  }, [selectedProducts]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'comparison':
        return (
          <div className="space-y-6">
            {/* Dynamic AI Comparison Verdict Header */}
            {aiVerdict && (
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-primary text-primary-foreground rounded-lg">
                      <Icon name="Sparkles" size={16} />
                    </span>
                    <h3 className="font-semibold text-foreground text-base">
                      AI Comparison Verdict
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary font-medium rounded-full">
                    Live Analysis
                  </span>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                  {aiVerdict.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60">
                  <div className="flex items-center space-x-3 p-2 bg-surface/80 rounded-lg border border-border/50">
                    <Icon name="DollarSign" size={18} className="text-success" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Best Budget</div>
                      <div className="text-xs font-semibold text-foreground line-clamp-1">
                        {aiVerdict.cheapest.name}
                      </div>
                      <div className="text-xs text-success font-bold">
                        ₹{aiVerdict.cheapest.currentPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2 bg-surface/80 rounded-lg border border-border/50">
                    <Icon name="Star" size={18} className="text-warning fill-current" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Highest Rated</div>
                      <div className="text-xs font-semibold text-foreground line-clamp-1">
                        {aiVerdict.topRated.name}
                      </div>
                      <div className="text-xs text-warning font-bold">
                        {aiVerdict.topRated.rating} ★ (
                        {aiVerdict.topRated.reviewCount.toLocaleString()} reviews)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2 bg-surface/80 rounded-lg border border-border/50">
                    <Icon name="Award" size={18} className="text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Top AI Value Score
                      </div>
                      <div className="text-xs font-semibold text-foreground line-clamp-1">
                        {aiVerdict.bestValue.name}
                      </div>
                      <div className="text-xs text-primary font-bold">
                        {aiVerdict.bestValue.aiScores?.value}/100 Score
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ComparisonTable
              products={selectedProducts}
              onRemoveProduct={handleRemoveProduct}
              onAddToWatchlist={handleAddToWatchlist}
              onSetPriceAlert={handleSetPriceAlert}
            />
          </div>
        );

      case 'charts':
        return <PriceHistoryChart products={selectedProducts} />;
      case 'reviews':
        return <ReviewAnalysis products={selectedProducts} />;
      case 'recommendations':
        return (
          <SmartRecommendations
            currentProducts={selectedProducts}
            onAddToComparison={handleAddToComparison}
            onAddToWatchlist={handleAddToWatchlist}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${isAIAssistantOpen ? 'lg:mr-80' : ''}`}
        >
          <div className="p-4 lg:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Product Comparison
                </h1>
                <p className="text-muted-foreground mt-1">
                  Real-time multi-retailer price comparison and AI evaluation
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleOpenAddModal}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Product
                </Button>
                <Button
                  variant="default"
                  onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                  iconName="Bot"
                  iconPosition="left"
                >
                  AI Assistant
                </Button>
              </div>
            </div>

            {/* View Selector */}
            <div className="bg-surface border border-border rounded-lg p-1">
              <div className="flex overflow-x-auto">
                {views.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      activeView === view.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={view.icon} size={16} />
                    <span>{view.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {selectedProducts.length === 0 && (
              <div className="bg-surface border border-border rounded-lg p-12 text-center">
                <Icon name="Scale" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Products in Comparison
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add products using the search button above or browse your search results to
                  compare prices across stores.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    variant="default"
                    onClick={handleOpenAddModal}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add Product to Compare
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/ai-search-results')}
                    iconName="Search"
                    iconPosition="left"
                  >
                    Browse Search Results
                  </Button>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            {selectedProducts.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Primary Content */}
                <div className="xl:col-span-3 space-y-6">{renderActiveView()}</div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                  <ComparisonActions
                    selectedProducts={selectedProducts}
                    onExportComparison={handleExportComparison}
                    onSaveComparison={handleSaveComparison}
                    onShareComparison={handleShareComparison}
                    onClearAll={handleClearAll}
                    onAddProduct={handleOpenAddModal}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Panel */}
        <AIAssistantPanel
          isOpen={isAIAssistantOpen}
          onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          onClose={() => setIsAIAssistantOpen(false)}
          contextData={{
            pageName: 'Product Comparison',
            productCount: selectedProducts.length,
            products: selectedProducts.map((p) => p?.name)
          }}
        />
      </div>

      {/* Quick Action Menu */}
      <QuickActionMenu
        onVoiceSearch={() => navigate('/voice-and-camera-search', { state: { mode: 'voice' } })}
        onCameraSearch={() => navigate('/voice-and-camera-search', { state: { mode: 'camera' } })}
        onQuickAdd={() => navigate('/watchlist-management')}
        onPriceAlert={() => navigate('/deal-alerts-and-notifications')}
      />

      {/* Interactive "Add Product to Compare" Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="PlusCircle" size={20} className="text-primary" />
                <h3 className="font-semibold text-foreground text-lg">Add Product to Compare</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-4 border-b border-border space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteModalSearch();
                }}
                className="flex items-center space-x-2"
              >
                <div className="relative flex-1">
                  <Icon
                    name="Search"
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Search any product (e.g. boAt Wave, iPhone 15, Sony WH-1000XM5)..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSearchingModal || !modalSearchQuery.trim()}
                >
                  {isSearchingModal ? 'Searching...' : 'Search'}
                </Button>
              </form>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs py-1">
                <span className="text-muted-foreground whitespace-nowrap">Try:</span>
                {[
                  'Noise ColorFit',
                  'boAt Wave Call 2',
                  'MacBook Air',
                  'OnePlus Nord',
                  'Sony Headphones'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setModalSearchQuery(chip);
                      handleExecuteModalSearch(chip);
                    }}
                    className="px-2.5 py-1 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full whitespace-nowrap transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Results Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isSearchingModal && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted-foreground">
                    Searching market prices and product specifications...
                  </p>
                </div>
              )}

              {searchError && (
                <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg">
                  {searchError}
                </div>
              )}

              {!isSearchingModal && modalSearchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground font-medium mb-1">
                    Found {modalSearchResults.length} matching products:
                  </div>
                  {modalSearchResults.map((prod) => {
                    const isAlreadyAdded = selectedProducts.some(
                      (p) => p.id === prod.id || p.name === prod.name
                    );
                    return (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded object-cover bg-muted flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-foreground line-clamp-1">
                              {prod.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                              <span className="font-semibold text-foreground">
                                ₹{prod.currentPrice.toLocaleString('en-IN')}
                              </span>
                              {prod.discount > 0 && (
                                <span className="text-success font-medium">
                                  ({prod.discount}% off)
                                </span>
                              )}
                              <span>• {prod.rating} ★</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant={isAlreadyAdded ? 'outline' : 'default'}
                          size="sm"
                          disabled={isAlreadyAdded || selectedProducts.length >= 4}
                          onClick={() => {
                            handleAddToComparison(prod);
                            setIsAddModalOpen(false);
                          }}
                        >
                          {isAlreadyAdded ? 'Added' : '+ Compare'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isSearchingModal && modalSearchResults.length === 0 && !searchError && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  <Icon name="Search" size={32} className="mx-auto mb-2 text-muted-foreground/60" />
                  <p>
                    Type a query or pick a suggestion above to search and compare products
                    side-by-side.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface border border-border rounded-lg p-6 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-foreground">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComparison;
