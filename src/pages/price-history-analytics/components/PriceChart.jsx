import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PriceChart = ({ productData, selectedRetailers, dateRange, onDataPointClick }) => {
  const [chartType, setChartType] = useState('line');
  const [showPrediction, setShowPrediction] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Mock historical price data with predictions
  const mockPriceData = [
    {
      date: '2024-07-26',
      amazon: 899,
      bestbuy: 929,
      walmart: 919,
      target: 939,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-08-02',
      amazon: 879,
      bestbuy: 909,
      walmart: 899,
      target: 929,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-08-09',
      amazon: 859,
      bestbuy: 889,
      walmart: 879,
      target: 909,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-08-16',
      amazon: 849,
      bestbuy: 879,
      walmart: 869,
      target: 899,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-08-23',
      amazon: 829,
      bestbuy: 859,
      walmart: 849,
      target: 879,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-08-30',
      amazon: 819,
      bestbuy: 849,
      walmart: 839,
      target: 869,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-09-06',
      amazon: 799,
      bestbuy: 829,
      walmart: 819,
      target: 849,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-09-13',
      amazon: 789,
      bestbuy: 819,
      walmart: 809,
      target: 839,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-09-20',
      amazon: 779,
      bestbuy: 809,
      walmart: 799,
      target: 829,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-09-27',
      amazon: 769,
      bestbuy: 799,
      walmart: 789,
      target: 819,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-10-04',
      amazon: 759,
      bestbuy: 789,
      walmart: 779,
      target: 809,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-10-11',
      amazon: 749,
      bestbuy: 779,
      walmart: 769,
      target: 799,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-10-18',
      amazon: 739,
      bestbuy: 769,
      walmart: 759,
      target: 789,
      predicted: null,
      confidence: null
    },
    {
      date: '2024-10-26',
      amazon: 729,
      bestbuy: 759,
      walmart: 749,
      target: 779,
      predicted: null,
      confidence: null
    },
    // Predicted future data
    {
      date: '2024-11-02',
      amazon: null,
      bestbuy: null,
      walmart: null,
      target: null,
      predicted: 719,
      confidence: 85
    },
    {
      date: '2024-11-09',
      amazon: null,
      bestbuy: null,
      walmart: null,
      target: null,
      predicted: 709,
      confidence: 82
    },
    {
      date: '2024-11-16',
      amazon: null,
      bestbuy: null,
      walmart: null,
      target: null,
      predicted: 699,
      confidence: 78
    },
    {
      date: '2024-11-23',
      amazon: null,
      bestbuy: null,
      walmart: null,
      target: null,
      predicted: 649,
      confidence: 92
    },
    {
      date: '2024-11-30',
      amazon: null,
      bestbuy: null,
      walmart: null,
      target: null,
      predicted: 679,
      confidence: 75
    }
  ];

  const retailerColors = {
    amazon: '#FF9500',
    bestbuy: '#0046BE',
    walmart: '#004C91',
    target: '#CC0000',
    predicted: '#8B5CF6'
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (value) => {
    return `₹${value?.toFixed(0) || 0}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-elevated">
          <p className="text-sm font-medium text-foreground mb-2">
            {new Date(label)?.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          {payload?.map((entry) => (
            <div key={entry?.dataKey} className="flex items-center justify-between space-x-4 mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {entry?.dataKey === 'predicted' ? 'AI Prediction' : entry?.dataKey}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatPrice(entry?.value)}
                {entry?.dataKey === 'predicted' && entry?.payload?.confidence && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({entry?.payload?.confidence}%)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      // Export logic would go here
    }, 1500);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Price History & Predictions</h3>
          <p className="text-sm text-muted-foreground">
            90-day historical data with AI-powered price predictions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            iconName="TrendingUp"
            iconPosition="left"
          >
            Line
          </Button>
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
            iconName="BarChart3"
            iconPosition="left"
          >
            Area
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            loading={isLoading}
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPrediction"
              checked={showPrediction}
              onChange={(e) => setShowPrediction(e?.target?.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
            />
            <label htmlFor="showPrediction" className="text-sm text-foreground">
              Show AI Predictions
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {Object.entries(retailerColors)?.map(([retailer, color]) => {
            if (retailer === 'predicted' && !showPrediction) return null;
            return (
              <div key={retailer} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {retailer === 'predicted' ? 'AI Prediction' : retailer}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Chart Container */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={mockPriceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatPrice}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {selectedRetailers?.includes('amazon') && (
                <Area
                  type="monotone"
                  dataKey="amazon"
                  stackId="1"
                  stroke={retailerColors?.amazon}
                  fill={retailerColors?.amazon}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              )}
              {selectedRetailers?.includes('bestbuy') && (
                <Area
                  type="monotone"
                  dataKey="bestbuy"
                  stackId="2"
                  stroke={retailerColors?.bestbuy}
                  fill={retailerColors?.bestbuy}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              )}
              {selectedRetailers?.includes('walmart') && (
                <Area
                  type="monotone"
                  dataKey="walmart"
                  stackId="3"
                  stroke={retailerColors?.walmart}
                  fill={retailerColors?.walmart}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              )}
              {selectedRetailers?.includes('target') && (
                <Area
                  type="monotone"
                  dataKey="target"
                  stackId="4"
                  stroke={retailerColors?.target}
                  fill={retailerColors?.target}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              )}
              {showPrediction && (
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stackId="5"
                  stroke={retailerColors?.predicted}
                  fill={retailerColors?.predicted}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={mockPriceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatPrice}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {selectedRetailers?.includes('amazon') && (
                <Line
                  type="monotone"
                  dataKey="amazon"
                  stroke={retailerColors?.amazon}
                  strokeWidth={2}
                  dot={{ fill: retailerColors?.amazon, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: retailerColors?.amazon, strokeWidth: 2 }}
                />
              )}
              {selectedRetailers?.includes('bestbuy') && (
                <Line
                  type="monotone"
                  dataKey="bestbuy"
                  stroke={retailerColors?.bestbuy}
                  strokeWidth={2}
                  dot={{ fill: retailerColors?.bestbuy, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: retailerColors?.bestbuy, strokeWidth: 2 }}
                />
              )}
              {selectedRetailers?.includes('walmart') && (
                <Line
                  type="monotone"
                  dataKey="walmart"
                  stroke={retailerColors?.walmart}
                  strokeWidth={2}
                  dot={{ fill: retailerColors?.walmart, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: retailerColors?.walmart, strokeWidth: 2 }}
                />
              )}
              {selectedRetailers?.includes('target') && (
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke={retailerColors?.target}
                  strokeWidth={2}
                  dot={{ fill: retailerColors?.target, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: retailerColors?.target, strokeWidth: 2 }}
                />
              )}
              {showPrediction && (
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke={retailerColors?.predicted}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: retailerColors?.predicted, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: retailerColors?.predicted, strokeWidth: 2 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {/* Chart Insights */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Sparkles" size={16} className="text-accent mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">AI Insights</h4>
            <p className="text-sm text-muted-foreground">
              Price is trending downward with a predicted 23% drop during Black Friday week. 
              Best time to buy is November 23rd with 92% confidence. Current Amazon price is 
              the lowest among tracked retailers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;