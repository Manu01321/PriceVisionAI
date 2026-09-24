import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import AISearchBar from '../../components/ui/AISearchBar';
import AIAssistantPanel from '../../components/ui/AIAssistantPanel';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import SearchResultsGrid from './components/SearchResultsGrid';
import SearchFilters from './components/SearchFilters';
import AIRefinementPanel from './components/AIRefinementPanel';
import aiProductService from '../../services/aiProductService';

const AISearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchStats, setSearchStats] = useState({});
  const [aiSource, setAiSource] = useState('');

  // Initialize search from URL params or location state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams?.get('q') || location?.state?.searchQuery || location?.state?.query || '';

    // Check if we have results passed from image/voice search
    if (location?.state?.results && location?.state?.results?.length > 0) {
      const passedResults = location.state.results;
      setProducts(passedResults);
      setSearchQuery(location?.state?.searchQuery || 'Uploaded product');
      setAiSource(location?.state?.searchType === 'upload' || location?.state?.searchType === 'camera' ? 'AI Vision' : 'AI Search');
      const stats = {
        totalResults: passedResults?.length,
        avgConfidence: passedResults?.length > 0
          ? Math.round(passedResults?.reduce((sum, p) => sum + (p?.confidence || 85), 0) / passedResults?.length)
          : 0,
        hotDeals: passedResults?.filter((p) => (p?.dealUrgency || 0) >= 80)?.length,
        searchTime: 0.38
      };
      setSearchStats(stats);
      setLoading(false);
    } else if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      performSearch('', {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const performSearch = async (query, newFilters = {}) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      console.log('Performing AI-powered search for:', query || 'featured products');
      
      let searchResults = [];
      
      // Use AI Product Service for real AI-powered results
      if (aiProductService.isAvailable()) {
        try {
          searchResults = await aiProductService.searchProducts(query || 'trending electronics deals', {
            ...newFilters,
            limit: 12
          });
          setAiSource('OpenAI/Gemini');
        } catch (aiError) {
          console.error('AI search failed:', aiError);
          // Set empty results on failure
          searchResults = [];
        }
      } else {
        console.warn('AI service not available - no API keys configured');
        searchResults = [];
      }

      // Apply local filters if needed
      if (newFilters && Object.keys(newFilters).length > 0) {
        searchResults = applyFilters(searchResults, newFilters);
      }
      
      // Calculate search statistics
      const searchTime = (Date.now() - startTime) / 1000;
      const stats = {
        totalResults: searchResults?.length,
        avgConfidence: searchResults?.length > 0 
          ? Math.round(searchResults?.reduce((sum, p) => sum + (p?.confidence || 85), 0) / searchResults?.length)
          : 0,
        hotDeals: searchResults?.filter((p) => (p?.dealUrgency || 0) >= 80)?.length,
        searchTime: searchTime
      };

      setProducts(searchResults);
      setSearchStats(stats);
      setHasMore(false);

    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
      setSearchStats({
        totalResults: 0,
        avgConfidence: 0,
        hotDeals: 0,
        searchTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to products
  const applyFilters = (products, filters) => {
    let filtered = [...products];

    if (filters?.priceRange?.min) {
      filtered = filtered?.filter((p) => p?.currentPrice >= parseFloat(filters?.priceRange?.min));
    }
    if (filters?.priceRange?.max) {
      filtered = filtered?.filter((p) => p?.currentPrice <= parseFloat(filters?.priceRange?.max));
    }
    if (filters?.brand?.length > 0) {
      filtered = filtered?.filter((p) => filters?.brand?.includes(p?.brand));
    }
    if (filters?.category?.length > 0) {
      filtered = filtered?.filter((p) => filters?.category?.includes(p?.category));
    }
    if (filters?.confidenceThreshold) {
      filtered = filtered?.filter((p) => p?.confidence >= filters?.confidenceThreshold);
    }
    if (filters?.dealQuality && filters?.dealQuality !== 'all') {
      const thresholds = { hot: 80, good: 60, fair: 40 };
      filtered = filtered?.filter((p) => p?.dealUrgency >= thresholds?.[filters?.dealQuality]);
    }

    // Sort products
    if (filters?.sortBy) {
      switch (filters?.sortBy) {
        case 'price_low':
          filtered?.sort((a, b) => a?.currentPrice - b?.currentPrice);
          break;
        case 'price_high':
          filtered?.sort((a, b) => b?.currentPrice - a?.currentPrice);
          break;
        case 'confidence':
          filtered?.sort((a, b) => b?.confidence - a?.confidence);
          break;
        case 'deal_quality':
          filtered?.sort((a, b) => b?.dealUrgency - a?.dealUrgency);
          break;
        case 'rating':
          filtered?.sort((a, b) => b?.rating - a?.rating);
          break;
        default:
          break;
      }
    }

    return filtered;
  };

  const handleNewSearch = (query) => {
    if (!query?.trim()) {
      // If empty query, show featured products
      setSearchQuery('');
      performSearch('', filters);
      const newUrl = '/ai-search-results';
      window.history?.pushState(null, '', newUrl);
      return;
    }

    setSearchQuery(query);
    performSearch(query, filters);

    // Update URL
    const newUrl = `/ai-search-results?q=${encodeURIComponent(query)}`;
    window.history?.pushState(null, '', newUrl);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    performSearch(searchQuery, newFilters);
  };

  const handleProductAction = (action, productIds, data = null) => {
    switch (action) {
      case 'watchlist':
        // Toggle watchlist status for products
        setProducts(prevProducts => 
          prevProducts?.map(product => 
            productIds?.includes(product?.id) 
              ? { ...product, isWishlisted: !product?.isWishlisted }
              : product
          )
        );
        console.log('Toggle watchlist for products:', productIds);
        break;
      case 'compare': navigate('/product-comparison', {
          state: { productIds, fromSearch: true }
        });
        break;
      case 'view_details': console.log('View details for product:', productIds?.[0]);
        // Could navigate to a product detail page
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleRefinementSelect = (refinedQuery) => {
    handleNewSearch(refinedQuery);
  };

  const handleAlternativeSelect = (alternative) => {
    console.log('Selected alternative:', alternative);
    handleNewSearch(alternative);
  };

  const handleVoiceSearch = () => {
    navigate('/voice-and-camera-search', { state: { mode: 'voice' } });
  };

  const handleCameraSearch = () => {
    navigate('/voice-and-camera-search', { state: { mode: 'camera' } });
  };

  // Generate search suggestions based on current query
  const getSearchSuggestions = () => {
    if (!searchQuery) return [];
    
    const suggestions = [
      `${searchQuery} deals`,
      `${searchQuery} review`,
      `${searchQuery} comparison`,
      `best ${searchQuery}`,
      `cheap ${searchQuery}`
    ];
    
    return suggestions;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="flex-shrink-0"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div className="flex-1">
              <AISearchBar
                onSearch={handleNewSearch}
                onVoiceSearch={handleVoiceSearch}
                onCameraSearch={handleCameraSearch}
                placeholder="Search for products, brands, or categories..."
                isProcessing={loading}
                initialValue={searchQuery}
              />
            </div>
          </div>

          {/* Search Stats */}
          {searchStats?.totalResults !== undefined && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-border">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Icon name="Search" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {searchQuery ? `"${searchQuery}"` : 'All Products'}
                  </span>
                  {aiSource && (
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
                      Powered by {aiSource}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{searchStats?.totalResults} results</span>
                  {searchStats?.totalResults > 0 && (
                    <>
                      <span>•</span>
                      <span>{searchStats?.avgConfidence}% avg confidence</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{searchStats?.hotDeals} hot deals</span>
                  <span>•</span>
                  <span>{searchStats?.searchTime?.toFixed(2)}s</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIAssistant(true)}
                className="text-primary"
              >
                <Icon name="MessageCircle" size={16} className="mr-2" />
                Ask AI
              </Button>
            </div>
          )}

          {/* No Results Message */}
          {!loading && searchQuery && products?.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-64 h-32 mb-6 bg-muted/30 rounded-lg flex items-center justify-center">
                <Icon name="Search" size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products found for "{searchQuery}"
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or browse our categories
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {getSearchSuggestions()?.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleNewSearch(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              <Button onClick={() => handleNewSearch('')}>
                Browse All Products
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              <SearchFilters
                onFiltersChange={handleFiltersChange}
                activeFilters={filters}
                resultCount={products?.length}
              />
              
              <AIRefinementPanel
                searchQuery={searchQuery}
                onRefinementSelect={handleRefinementSelect}
                onAlternativeSelect={handleAlternativeSelect}
                resultCount={products?.length}
              />
            </div>
          </div>

          {/* Main Results */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Icon name="Filter" size={16} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {Object.keys(filters)?.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                    {Object.keys(filters)?.length}
                  </span>
                )}
              </Button>
            </div>

            <SearchResultsGrid
              products={products}
              loading={loading}
              hasMore={hasMore}
              onProductAction={handleProductAction}
              onLoadMore={() => {
                // Future implementation for pagination
                setHasMore(false);
              }}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAIAssistant}
        onToggle={() => setShowAIAssistant(!showAIAssistant)}
        onClose={() => setShowAIAssistant(false)}
        contextData={{
          searchQuery,
          resultCount: products?.length,
          avgConfidence: searchStats?.avgConfidence,
          hotDeals: searchStats?.hotDeals
        }}
        className="fixed right-4 top-20 bottom-4 z-50 lg:w-80"
      />

      {/* Quick Action Menu */}
      <QuickActionMenu
        onVoiceSearch={handleVoiceSearch}
        onCameraSearch={handleCameraSearch}
        onQuickAdd={() => console.log('Quick add to watchlist')}
        onPriceAlert={() => navigate('/deal-alerts-and-notifications')}
      />
    </div>
  );
};

export default AISearchResults;