import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AlertFilters = ({ onFilterChange, alertCounts }) => {
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    urgency: 'all',
    type: 'all',
    status: 'all',
    timeRange: '7d'
  });

  const categoryOptions = [
    { value: 'all', label: `All Categories (${alertCounts?.total || 0})` },
    { value: 'electronics', label: `Electronics (${alertCounts?.electronics || 0})` },
    { value: 'fashion', label: `Fashion (${alertCounts?.fashion || 0})` },
    { value: 'home', label: `Home & Garden (${alertCounts?.home || 0})` },
    { value: 'sports', label: `Sports (${alertCounts?.sports || 0})` },
    { value: 'books', label: `Books (${alertCounts?.books || 0})` }
  ];

  const urgencyOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'price_drop', label: 'Price Drops' },
    { value: 'deal_found', label: 'Deal Discoveries' },
    { value: 'back_in_stock', label: 'Back in Stock' },
    { value: 'price_target', label: 'Price Targets' },
    { value: 'ai_recommendation', label: 'AI Recommendations' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Alerts' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'read', label: 'Read Only' },
    { value: 'archived', label: 'Archived' }
  ];

  const timeRangeOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters, [filterType]: value };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      category: 'all',
      urgency: 'all',
      type: 'all',
      status: 'all',
      timeRange: '7d'
    };
    setActiveFilters(defaultFilters);
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters)?.filter((value) => value !== 'all')?.length;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {getActiveFilterCount()} active
            </div>
          )}
        </div>

        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            iconName="X"
            iconPosition="left"
          >
            Clear All
          </Button>
        )}
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={activeFilters?.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        <Select
          label="Priority"
          options={urgencyOptions}
          value={activeFilters?.urgency}
          onChange={(value) => handleFilterChange('urgency', value)}
        />

        <Select
          label="Alert Type"
          options={typeOptions}
          value={activeFilters?.type}
          onChange={(value) => handleFilterChange('type', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={activeFilters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        <Select
          label="Time Range"
          options={timeRangeOptions}
          value={activeFilters?.timeRange}
          onChange={(value) => handleFilterChange('timeRange', value)}
        />
      </div>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant={activeFilters?.urgency === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            handleFilterChange('urgency', activeFilters?.urgency === 'high' ? 'all' : 'high')
          }
          iconName="AlertTriangle"
          iconPosition="left"
        >
          High Priority
        </Button>

        <Button
          variant={activeFilters?.type === 'price_drop' ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            handleFilterChange('type', activeFilters?.type === 'price_drop' ? 'all' : 'price_drop')
          }
          iconName="TrendingDown"
          iconPosition="left"
        >
          Price Drops
        </Button>

        <Button
          variant={activeFilters?.status === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            handleFilterChange('status', activeFilters?.status === 'unread' ? 'all' : 'unread')
          }
          iconName="Mail"
          iconPosition="left"
        >
          Unread
        </Button>

        <Button
          variant={activeFilters?.timeRange === '1d' ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            handleFilterChange('timeRange', activeFilters?.timeRange === '1d' ? '7d' : '1d')
          }
          iconName="Clock"
          iconPosition="left"
        >
          Today
        </Button>
      </div>
    </div>
  );
};

export default AlertFilters;
