import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const SearchFilters = ({ onFiltersChange, activeFilters = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    retailers: [],
    dealQuality: 'all',
    confidenceThreshold: 70,
    category: 'all',
    sortBy: 'relevance',
    ...activeFilters
  });

  const retailerOptions = [
    { value: 'amazon', label: 'Amazon' },
    { value: 'bestbuy', label: 'Best Buy' },
    { value: 'walmart', label: 'Walmart' },
    { value: 'target', label: 'Target' },
    { value: 'ebay', label: 'eBay' },
    { value: 'newegg', label: 'Newegg' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books & Media' },
    { value: 'health', label: 'Health & Beauty' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Best Match' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'deal_quality', label: 'Best Deals' },
    { value: 'confidence', label: 'Highest Confidence' },
    { value: 'newest', label: 'Newest First' }
  ];

  const dealQualityOptions = [
    { value: 'all', label: 'All Deals' },
    { value: 'hot', label: 'Hot Deals (80%+)' },
    { value: 'good', label: 'Good Deals (60%+)' },
    { value: 'fair', label: 'Fair Deals (40%+)' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handlePriceRangeChange = (type, value) => {
    const newPriceRange = { ...filters?.priceRange, [type]: value };
    handleFilterChange('priceRange', newPriceRange);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      priceRange: { min: '', max: '' },
      retailers: [],
      dealQuality: 'all',
      confidenceThreshold: 70,
      category: 'all',
      sortBy: 'relevance'
    };
    setFilters(defaultFilters);
    if (onFiltersChange) {
      onFiltersChange(defaultFilters);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.priceRange?.min || filters?.priceRange?.max) count++;
    if (filters?.retailers?.length > 0) count++;
    if (filters?.dealQuality !== 'all') count++;
    if (filters?.confidenceThreshold !== 70) count++;
    if (filters?.category !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {getActiveFilterCount()} active
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </Button>
        </div>
      </div>
      {/* Sort - Always Visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Sort by"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />

        <Select
          label="Category"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        {/* Mobile: Show in expanded state, Desktop: Always show */}
        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
          <Select
            label="Deal Quality"
            options={dealQualityOptions}
            value={filters?.dealQuality}
            onChange={(value) => handleFilterChange('dealQuality', value)}
          />
        </div>

        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
          <Select
            label="Retailers"
            options={retailerOptions}
            value={filters?.retailers}
            onChange={(value) => handleFilterChange('retailers', value)}
            multiple
            searchable
            placeholder="Select stores..."
          />
        </div>
      </div>
      {/* Expanded Filters */}
      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden'} lg:block`}>
        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Price Range</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min price"
              value={filters?.priceRange?.min}
              onChange={(e) => handlePriceRangeChange('min', e?.target?.value)}
            />
            <Input
              type="number"
              placeholder="Max price"
              value={filters?.priceRange?.max}
              onChange={(e) => handlePriceRangeChange('max', e?.target?.value)}
            />
          </div>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">AI Confidence</label>
            <span className="text-sm text-muted-foreground">{filters?.confidenceThreshold}%+</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters?.confidenceThreshold}
            onChange={(e) => handleFilterChange('confidenceThreshold', parseInt(e?.target?.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'free_shipping', label: 'Free Shipping', icon: 'Truck' },
              { key: 'prime_eligible', label: 'Prime Eligible', icon: 'Zap' },
              { key: 'on_sale', label: 'On Sale', icon: 'Tag' },
              { key: 'highly_rated', label: '4+ Stars', icon: 'Star' },
              { key: 'new_arrivals', label: 'New Arrivals', icon: 'Clock' }
            ]?.map((tag) => (
              <Button
                key={tag?.key}
                variant={filters?.[tag?.key] ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(tag?.key, !filters?.[tag?.key])}
                className="text-xs"
              >
                <Icon name={tag?.icon} size={12} className="mr-1" />
                {tag?.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SearchFilters;
