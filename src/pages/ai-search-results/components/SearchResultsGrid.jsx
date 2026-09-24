import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import SearchResultCard from './SearchResultCard';

const SearchResultsGrid = ({ 
  products = [], 
  loading = false, 
  onLoadMore, 
  hasMore = true,
  onProductAction 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer?.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer?.unobserve(sentinel);
      }
    };
  }, [hasMore, loading, isLoadingMore]);

  const handleLoadMore = async () => {
    if (onLoadMore && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev?.includes(productId) 
        ? prev?.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = (action) => {
    if (onProductAction) {
      onProductAction(action, selectedProducts);
    }
    setSelectedProducts([]);
  };

  const renderLoadingSkeleton = () => (
    <div className={`grid gap-6 ${
      viewMode === 'grid' ?'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :'grid-cols-1'
    }`}>
      {Array.from({ length: 8 })?.map((_, index) => (
        <div key={index} className="bg-surface border border-border rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-muted"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="flex justify-between">
              <div className="h-6 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-muted rounded flex-1"></div>
              <div className="h-8 bg-muted rounded flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && products?.length === 0) {
    return renderLoadingSkeleton();
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {products?.length?.toLocaleString()} Products Found
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-powered results with confidence scoring
            </p>
          </div>
          
          {selectedProducts?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedProducts?.length} selected
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleBulkAction('compare')}
                  className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Compare
                </button>
                <button
                  onClick={() => handleBulkAction('watchlist')}
                  className="px-3 py-1 text-xs bg-success text-success-foreground rounded-md hover:bg-success/90 transition-colors"
                >
                  Add to Watchlist
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ?'bg-surface text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Grid3X3" size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ?'bg-surface text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="List" size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Results Grid */}
      {products?.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' ?'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :'grid-cols-1 lg:grid-cols-2'
        }`}>
          {products?.map((product) => (
            <div key={product?.id} className="relative">
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts?.includes(product?.id)}
                  onChange={() => handleProductSelect(product?.id)}
                  className="w-4 h-4 text-primary bg-white border-2 border-white rounded focus:ring-primary focus:ring-2 shadow-sm"
                />
              </div>
              
              <SearchResultCard
                product={product}
                onAddToWatchlist={(id, isAdded) => {
                  if (onProductAction) {
                    onProductAction('watchlist', [id], isAdded);
                  }
                }}
                onCompare={(product) => {
                  if (onProductAction) {
                    onProductAction('compare', [product?.id]);
                  }
                }}
                onViewDetails={(product) => {
                  if (onProductAction) {
                    onProductAction('view_details', [product?.id]);
                  }
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <div className="flex justify-center space-x-2">
            <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Clear Filters
            </button>
            <button className="px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
              New Search
            </button>
          </div>
        </div>
      )}
      {/* Load More Trigger */}
      {hasMore && (
        <div id="scroll-sentinel" className="flex justify-center py-8">
          {isLoadingMore ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading more products...</span>
            </div>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Load More Products
            </button>
          )}
        </div>
      )}
      {/* Results Summary */}
      {products?.length > 0 && (
        <div className="text-center py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {products?.length} of {products?.length + (hasMore ? '+' : '')} products
            {!hasMore && ' • All results loaded'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsGrid;