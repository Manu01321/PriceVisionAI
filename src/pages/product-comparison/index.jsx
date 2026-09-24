import React, { useState, useEffect } from 'react';
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

const ProductComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [activeView, setActiveView] = useState('comparison');
  const [isLoading, setIsLoading] = useState(false);

  // Mock products data
  const mockProducts = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro 128GB',
    brand: 'Apple',
    image: "https://images.unsplash.com/photo-1572538194597-42aeefa26482",
    imageAlt: 'iPhone 15 Pro in natural titanium color showing front and back design with triple camera system',
    currentPrice: 999,
    originalPrice: 1099,
    priceChange: -25,
    rating: 4.7,
    reviewCount: 12450,
    fakeReviewAlert: false,
    aiScores: {
      value: 88,
      quality: 92,
      urgency: 65
    },
    keySpecs: [
    { name: 'Display', value: '6.1" Super Retina XDR' },
    { name: 'Processor', value: 'A17 Pro Chip' },
    { name: 'Camera', value: '48MP Main + 12MP Ultra Wide' },
    { name: 'Storage', value: '128GB' },
    { name: 'Battery', value: 'Up to 23 hours video' },
    { name: 'Material', value: 'Titanium' }],

    aiAnalysis: {
      pros: [
      'Exceptional camera quality with ProRAW support',
      'Premium titanium build quality',
      'Excellent performance with A17 Pro chip',
      'Long software support lifecycle'],

      cons: [
      'High price point compared to alternatives',
      'Limited storage in base model',
      'No significant design changes from previous generation']

    },
    priceHistory: [
    { date: '2025-08-01', price: 1099, bestTimeToBuy: false },
    { date: '2025-08-15', price: 1079, bestTimeToBuy: false },
    { date: '2025-09-01', price: 1059, bestTimeToBuy: false },
    { date: '2025-09-15', price: 1039, bestTimeToBuy: false },
    { date: '2025-10-01', price: 1019, bestTimeToBuy: true, seasonalPattern: 'Pre-holiday discount' },
    { date: '2025-10-15', price: 1009, bestTimeToBuy: true },
    { date: '2025-10-26', price: 999, bestTimeToBuy: true, seasonalPattern: 'Black Friday preview' }],

    reviewAnalysis: {
      positiveHighlights: [
      'Outstanding camera performance in all lighting conditions',
      'Premium build quality with titanium construction',
      'Smooth iOS experience with regular updates',
      'Excellent battery life for daily usage'],

      negativeHighlights: [
      'Expensive compared to Android alternatives',
      'Base storage insufficient for power users',
      'Charging speed slower than competitors',
      'Limited customization options'],

      aiSummary: `The iPhone 15 Pro receives consistently high ratings for its camera system and build quality. Users particularly praise the titanium construction and A17 Pro performance. Main criticisms focus on pricing and storage limitations in the base model.`,
      sentimentBreakdown: {
        positive: { percentage: 72, count: 8964 },
        neutral: { percentage: 18, count: 2241 },
        negative: { percentage: 10, count: 1245 }
      },
      sentimentTrends: [
      { period: 'Last 30 days', sentiment: 'positive', change: '+5%', description: 'Improved after iOS update' },
      { period: 'Last 7 days', sentiment: 'positive', change: '+2%', description: 'Price drop appreciation' }],

      topKeywords: [
      { word: 'camera', mentions: 3420 },
      { word: 'battery', mentions: 2890 },
      { word: 'performance', mentions: 2650 },
      { word: 'design', mentions: 2340 },
      { word: 'price', mentions: 2100 }],

      featureRatings: [
      { name: 'Camera Quality', rating: 4.8 },
      { name: 'Build Quality', rating: 4.7 },
      { name: 'Performance', rating: 4.6 },
      { name: 'Battery Life', rating: 4.2 },
      { name: 'Value for Money', rating: 3.8 }],

      authenticityScore: 87,
      suspiciousReviews: 156,
      botActivity: 8,
      qualityIndicators: [
      { metric: 'Review Length', value: 'Good', status: 'good', description: 'Average 85 words per review' },
      { metric: 'Verified Purchases', value: '78%', status: 'good', description: 'High verification rate' },
      { metric: 'Review Velocity', value: 'Normal', status: 'good', description: 'Steady review pattern' },
      { metric: 'Duplicate Content', value: '3%', status: 'warning', description: 'Slightly elevated duplicates' }]

    }
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 256GB',
    brand: 'Samsung',
    image: "https://images.unsplash.com/photo-1707410420102-faff6eb0e033",
    imageAlt: 'Samsung Galaxy S24 Ultra in titanium gray showing S Pen and large camera module design',
    currentPrice: 1199,
    originalPrice: 1299,
    priceChange: -35,
    rating: 4.6,
    reviewCount: 9870,
    fakeReviewAlert: true,
    aiScores: {
      value: 91,
      quality: 89,
      urgency: 78
    },
    keySpecs: [
    { name: 'Display', value: '6.8" Dynamic AMOLED 2X' },
    { name: 'Processor', value: 'Snapdragon 8 Gen 3' },
    { name: 'Camera', value: '200MP Main + 50MP Periscope' },
    { name: 'Storage', value: '256GB' },
    { name: 'Battery', value: '5000mAh with 45W charging' },
    { name: 'Special', value: 'S Pen Included' }],

    aiAnalysis: {
      pros: [
      'Incredible 200MP camera with excellent zoom capabilities',
      'Large, vibrant display perfect for productivity',
      'S Pen functionality adds versatility',
      'Generous storage and RAM configuration'],

      cons: [
      'Large size may not suit all users',
      'Battery life could be better given the size',
      'OneUI can feel overwhelming for some users']

    },
    priceHistory: [
    { date: '2025-08-01', price: 1299, bestTimeToBuy: false },
    { date: '2025-08-15', price: 1279, bestTimeToBuy: false },
    { date: '2025-09-01', price: 1259, bestTimeToBuy: false },
    { date: '2025-09-15', price: 1239, bestTimeToBuy: false },
    { date: '2025-10-01', price: 1219, bestTimeToBuy: true },
    { date: '2025-10-15', price: 1209, bestTimeToBuy: true },
    { date: '2025-10-26', price: 1199, bestTimeToBuy: true }],

    reviewAnalysis: {
      positiveHighlights: [
      'Exceptional camera zoom capabilities up to 100x',
      'S Pen functionality enhances productivity',
      'Beautiful large display with great brightness',
      'Solid build quality and premium materials'],

      negativeHighlights: [
      'Device size too large for one-handed use',
      'Battery drains quickly with heavy usage',
      'OneUI interface can be confusing',
      'Price premium over standard S24 models'],

      aiSummary: `The Galaxy S24 Ultra is praised for its camera system and S Pen functionality. Users love the productivity features but some find the device too large. Battery life receives mixed reviews depending on usage patterns.`,
      sentimentBreakdown: {
        positive: { percentage: 68, count: 6712 },
        neutral: { percentage: 22, count: 2171 },
        negative: { percentage: 10, count: 987 }
      },
      sentimentTrends: [
      { period: 'Last 30 days', sentiment: 'positive', change: '+3%', description: 'Camera updates well received' },
      { period: 'Last 7 days', sentiment: 'neutral', change: '0%', description: 'Stable sentiment' }],

      topKeywords: [
      { word: 'camera', mentions: 2890 },
      { word: 's-pen', mentions: 2340 },
      { word: 'display', mentions: 2100 },
      { word: 'size', mentions: 1980 },
      { word: 'battery', mentions: 1850 }],

      featureRatings: [
      { name: 'Camera Quality', rating: 4.9 },
      { name: 'Display Quality', rating: 4.8 },
      { name: 'S Pen Functionality', rating: 4.7 },
      { name: 'Performance', rating: 4.5 },
      { name: 'Battery Life', rating: 4.0 }],

      authenticityScore: 82,
      suspiciousReviews: 234,
      botActivity: 12,
      qualityIndicators: [
      { metric: 'Review Length', value: 'Good', status: 'good', description: 'Average 92 words per review' },
      { metric: 'Verified Purchases', value: '71%', status: 'warning', description: 'Moderate verification rate' },
      { metric: 'Review Velocity', value: 'High', status: 'warning', description: 'Rapid review influx detected' },
      { metric: 'Duplicate Content', value: '7%', status: 'error', description: 'Elevated duplicate content' }]

    }
  }];


  const views = [
  { id: 'comparison', label: 'Comparison Table', icon: 'Table' },
  { id: 'charts', label: 'Price History', icon: 'TrendingUp' },
  { id: 'reviews', label: 'Review Analysis', icon: 'MessageSquare' },
  { id: 'recommendations', label: 'Recommendations', icon: 'Sparkles' }];


  useEffect(() => {
    // Initialize with products from location state or mock data
    const productsFromState = location?.state?.products || mockProducts;
    setSelectedProducts(productsFromState);
  }, [location?.state]);

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev?.filter((p) => p?.id !== productId));
  };

  const handleAddToWatchlist = (productId) => {
    console.log('Adding to watchlist:', productId);
    // Navigate to watchlist management
    navigate('/watchlist-management');
  };

  const handleSetPriceAlert = (productId) => {
    console.log('Setting price alert:', productId);
    // Navigate to deal alerts
    navigate('/deal-alerts-and-notifications');
  };

  const handleAddToComparison = (product) => {
    if (!selectedProducts?.find((p) => p?.id === product?.id)) {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const handleExportComparison = async (format) => {
    setIsLoading(true);
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Exporting comparison as ${format}`);
    setIsLoading(false);
  };

  const handleSaveComparison = async () => {
    setIsLoading(true);
    // Simulate save process
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Comparison saved');
    setIsLoading(false);
  };

  const handleShareComparison = (platform) => {
    console.log(`Sharing comparison on ${platform}`);
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const handleAddProduct = () => {
    navigate('/ai-search-results');
  };

  const handleVoiceSearch = () => {
    navigate('/voice-and-camera-search');
  };

  const handleCameraSearch = () => {
    navigate('/voice-and-camera-search');
  };

  const handleQuickAdd = () => {
    navigate('/watchlist-management');
  };

  const handlePriceAlert = () => {
    navigate('/deal-alerts-and-notifications');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'comparison':
        return (
          <ComparisonTable
            products={selectedProducts}
            onRemoveProduct={handleRemoveProduct}
            onAddToWatchlist={handleAddToWatchlist}
            onSetPriceAlert={handleSetPriceAlert} />);


      case 'charts':
        return <PriceHistoryChart products={selectedProducts} />;
      case 'reviews':
        return <ReviewAnalysis products={selectedProducts} />;
      case 'recommendations':
        return (
          <SmartRecommendations
            currentProducts={selectedProducts}
            onAddToComparison={handleAddToComparison}
            onAddToWatchlist={handleAddToWatchlist} />);


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isAIAssistantOpen ? 'lg:mr-80' : ''}`}>
          <div className="p-4 lg:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Product Comparison</h1>
                <p className="text-muted-foreground mt-1">
                  AI-powered analysis and intelligent shopping guidance
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/ai-search-results')}
                  iconName="Search"
                  iconPosition="left">

                  Find Products
                </Button>
                <Button
                  variant="default"
                  onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                  iconName="Bot"
                  iconPosition="left">

                  AI Assistant
                </Button>
              </div>
            </div>

            {/* View Selector */}
            <div className="bg-surface border border-border rounded-lg p-1">
              <div className="flex overflow-x-auto">
                {views?.map((view) =>
                <button
                  key={view?.id}
                  onClick={() => setActiveView(view?.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeView === view?.id ?
                  'bg-primary text-primary-foreground' :
                  'text-muted-foreground hover:text-foreground hover:bg-muted'}`
                  }>

                    <Icon name={view?.icon} size={16} />
                    <span>{view?.label}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {selectedProducts?.length === 0 &&
            <div className="bg-surface border border-border rounded-lg p-12 text-center">
                <Icon name="Package" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Products to Compare</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start by searching for products or browse our recommendations to begin your comparison analysis.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <Button
                  variant="default"
                  onClick={() => navigate('/ai-search-results')}
                  iconName="Search"
                  iconPosition="left">

                    Search Products
                  </Button>
                  <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  iconName="Home"
                  iconPosition="left">

                    Go to Dashboard
                  </Button>
                </div>
              </div>
            }

            {/* Main Content Grid */}
            {selectedProducts?.length > 0 &&
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Primary Content */}
                <div className="xl:col-span-3 space-y-6">
                  {renderActiveView()}
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                  <ComparisonActions
                  selectedProducts={selectedProducts}
                  onExportComparison={handleExportComparison}
                  onSaveComparison={handleSaveComparison}
                  onShareComparison={handleShareComparison}
                  onClearAll={handleClearAll}
                  onAddProduct={handleAddProduct} />

                </div>
              </div>
            }

            {/* Mobile View Adjustments */}
            <div className="lg:hidden">
              {selectedProducts?.length > 0 && activeView === 'comparison' &&
              <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon name="Info" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Mobile Tip</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Swipe horizontally on the comparison table to view all product details.
                  </p>
                </div>
              }
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <AIAssistantPanel
          isOpen={isAIAssistantOpen}
          onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          onClose={() => setIsAIAssistantOpen(false)}
          contextData={{
            pageName: 'Product Comparison',
            productCount: selectedProducts?.length,
            products: selectedProducts?.map((p) => p?.name)
          }} />

      </div>
      {/* Quick Action Menu */}
      <QuickActionMenu
        onVoiceSearch={handleVoiceSearch}
        onCameraSearch={handleCameraSearch}
        onQuickAdd={handleQuickAdd}
        onPriceAlert={handlePriceAlert} />

      {/* Loading Overlay */}
      {isLoading &&
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-500 flex items-center justify-center">
          <div className="bg-surface border border-border rounded-lg p-6 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-foreground">Processing...</span>
          </div>
        </div>
      }
    </div>);

};

export default ProductComparison;