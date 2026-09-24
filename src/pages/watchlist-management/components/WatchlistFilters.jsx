import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WatchlistFilters = ({ onFilterChange, onSortChange, activeFilters = {}, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    dealUrgency: 'all',
    timeAdded: 'all',
    priceChange: 'all',
    ...activeFilters
  });

  const dealUrgencyOptions = [
    { value: 'all', label: 'All Urgency Levels' },
    { value: 'high', label: 'High Urgency (80-100)' },
    { value: 'medium', label: 'Medium Urgency (50-79)' },
    { value: 'low', label: 'Low Urgency (0-49)' }
  ];

  const timeAddedOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Added Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const priceChangeOptions = [
    { value: 'all', label: 'All Changes' },
    { value: 'decreased', label: 'Price Decreased' },
    { value: 'increased', label: 'Price Increased' },
    { value: 'no_change', label: 'No Change' }
  ];

  const sortOptions = [
    { value: 'date_added', label: 'Date Added' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'urgency', label: 'Deal Urgency' },
    { value: 'savings', label: 'Potential Savings' }
  ];

  const handleFilterUpdate = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const handlePriceRangeUpdate = (type, value) => {
    const updatedPriceRange = { ...filters?.priceRange, [type]: value };
    handleFilterUpdate('priceRange', updatedPriceRange);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: { min: '', max: '' },
      dealUrgency: 'all',
      timeAdded: 'all',
      priceChange: 'all'
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.priceRange?.min || filters?.priceRange?.max) count++;
    if (filters?.dealUrgency !== 'all') count++;
    if (filters?.timeAdded !== 'all') count++;
    if (filters?.priceChange !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-surface border border-border rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="left"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            Filters
          </Button>
          {activeFilterCount > 0 && (
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {activeFilterCount} active
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Select
            options={sortOptions}
            value={filters?.sort || 'date_added'}
            onChange={(value) => {
              handleFilterUpdate('sort', value);
              if (onSortChange) onSortChange(value);
            }}
            placeholder="Sort by"
            className="w-48"
          />

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" iconName="X" onClick={clearAllFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price Range</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters?.priceRange?.min}
                  onChange={(e) => handlePriceRangeUpdate('min', e?.target?.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters?.priceRange?.max}
                  onChange={(e) => handlePriceRangeUpdate('max', e?.target?.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Deal Urgency */}
            <div className="space-y-2">
              <Select
                label="Deal Urgency"
                options={dealUrgencyOptions}
                value={filters?.dealUrgency}
                onChange={(value) => handleFilterUpdate('dealUrgency', value)}
              />
            </div>

            {/* Time Added */}
            <div className="space-y-2">
              <Select
                label="Time Added"
                options={timeAddedOptions}
                value={filters?.timeAdded}
                onChange={(value) => handleFilterUpdate('timeAdded', value)}
              />
            </div>

            {/* Price Change */}
            <div className="space-y-2">
              <Select
                label="Price Change"
                options={priceChangeOptions}
                value={filters?.priceChange}
                onChange={(value) => handleFilterUpdate('priceChange', value)}
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground mr-2">Quick filters:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterUpdate('dealUrgency', 'high')}
            >
              High Urgency
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterUpdate('priceChange', 'decreased')}
            >
              Price Drops
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterUpdate('timeAdded', 'today')}
            >
              Added Today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistFilters;
