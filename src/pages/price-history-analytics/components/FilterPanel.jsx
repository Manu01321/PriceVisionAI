import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ onFiltersChange, isOpen, onToggle }) => {
  const [filters, setFilters] = useState({
    dateRange: '90d',
    retailers: ['amazon', 'bestbuy', 'walmart', 'target'],
    priceRange: { min: '', max: '' },
    showPredictions: true,
    showDeals: true,
    dealThreshold: 15,
    currency: 'USD'
  });

  const dateRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const retailerOptions = [
    { id: 'amazon', name: 'Amazon', color: '#FF9500' },
    { id: 'bestbuy', name: 'Best Buy', color: '#0046BE' },
    { id: 'walmart', name: 'Walmart', color: '#004C91' },
    { id: 'target', name: 'Target', color: '#CC0000' },
    { id: 'newegg', name: 'Newegg', color: '#FF6900' },
    { id: 'costco', name: 'Costco', color: '#E31837' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRetailerToggle = (retailerId) => {
    const newRetailers = filters?.retailers?.includes(retailerId)
      ? filters?.retailers?.filter(id => id !== retailerId)
      : [...filters?.retailers, retailerId];
    handleFilterChange('retailers', newRetailers);
  };

  const handlePriceRangeChange = (type, value) => {
    const newPriceRange = { ...filters?.priceRange, [type]: value };
    handleFilterChange('priceRange', newPriceRange);
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: '90d',
      retailers: ['amazon', 'bestbuy', 'walmart', 'target'],
      priceRange: { min: '', max: '' },
      showPredictions: true,
      showDeals: true,
      dealThreshold: 15,
      currency: 'USD'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.dateRange !== '90d') count++;
    if (filters?.retailers?.length !== 4) count++;
    if (filters?.priceRange?.min || filters?.priceRange?.max) count++;
    if (!filters?.showPredictions) count++;
    if (!filters?.showDeals) count++;
    if (filters?.dealThreshold !== 15) count++;
    return count;
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        iconName="Filter"
        iconPosition="left"
        className="relative"
      >
        Filters
        {getActiveFiltersCount() > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
            {getActiveFiltersCount()}
          </div>
        )}
      </Button>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {getActiveFiltersCount()} active
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </div>
      {/* Date Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Date Range</h4>
        <div className="grid grid-cols-2 gap-2">
          {dateRangeOptions?.map((option) => (
            <button
              key={option?.value}
              onClick={() => handleFilterChange('dateRange', option?.value)}
              className={`p-2 text-sm rounded-md border transition-smooth ${
                filters?.dateRange === option?.value
                  ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/50 text-foreground'
              }`}
            >
              {option?.label}
            </button>
          ))}
        </div>
        
        {filters?.dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Input
              type="date"
              label="From"
              className="text-sm"
            />
            <Input
              type="date"
              label="To"
              className="text-sm"
            />
          </div>
        )}
      </div>
      {/* Retailers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Retailers</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const allSelected = filters?.retailers?.length === retailerOptions?.length;
              handleFilterChange('retailers', allSelected ? [] : retailerOptions?.map(r => r?.id));
            }}
            className="text-xs"
          >
            {filters?.retailers?.length === retailerOptions?.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        
        <div className="space-y-2">
          {retailerOptions?.map((retailer) => (
            <div key={retailer?.id} className="flex items-center space-x-3">
              <Checkbox
                checked={filters?.retailers?.includes(retailer?.id)}
                onChange={() => handleRetailerToggle(retailer?.id)}
              />
              <div className="flex items-center space-x-2 flex-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: retailer?.color }}
                />
                <span className="text-sm text-foreground">{retailer?.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Price Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min price"
            value={filters?.priceRange?.min}
            onChange={(e) => handlePriceRangeChange('min', e?.target?.value)}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Max price"
            value={filters?.priceRange?.max}
            onChange={(e) => handlePriceRangeChange('max', e?.target?.value)}
            className="text-sm"
          />
        </div>
      </div>
      {/* Display Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Display Options</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={filters?.showPredictions}
              onChange={(e) => handleFilterChange('showPredictions', e?.target?.checked)}
            />
            <div className="flex-1">
              <span className="text-sm text-foreground">Show AI Predictions</span>
              <p className="text-xs text-muted-foreground">Display future price predictions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={filters?.showDeals}
              onChange={(e) => handleFilterChange('showDeals', e?.target?.checked)}
            />
            <div className="flex-1">
              <span className="text-sm text-foreground">Highlight Deals</span>
              <p className="text-xs text-muted-foreground">Mark significant price drops</p>
            </div>
          </div>
        </div>
      </div>
      {/* Deal Threshold */}
      {filters?.showDeals && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Deal Threshold</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minimum discount</span>
              <span className="text-foreground font-medium">{filters?.dealThreshold}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={filters?.dealThreshold}
              onChange={(e) => handleFilterChange('dealThreshold', parseInt(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      )}
      {/* Currency */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Currency</h4>
        <select
          value={filters?.currency}
          onChange={(e) => handleFilterChange('currency', e?.target?.value)}
          className="w-full p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="USD">INR (₹)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CAD">CAD (C$)</option>
        </select>
      </div>
      {/* Apply Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="default"
          fullWidth
          iconName="Check"
          iconPosition="left"
          onClick={onToggle}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;