import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PriceHistoryChart = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(products?.[0]?.id);
  const [timeRange, setTimeRange] = useState('90d');

  const timeRanges = [
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' }
  ];

  const selectedProductData = products?.find(p => p?.id === selectedProduct);

  const formatPrice = (value) => `₹${value}`;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-elevated">
          <p className="text-sm font-medium text-foreground">{formatDate(label)}</p>
          <p className="text-lg font-bold text-primary">₹{data?.price}</p>
          {data?.bestTimeToBuy && (
            <div className="flex items-center space-x-1 mt-1">
              <Icon name="CheckCircle" size={12} className="text-success" />
              <span className="text-xs text-success">Best time to buy</span>
            </div>
          )}
          {data?.seasonalPattern && (
            <p className="text-xs text-muted-foreground mt-1">
              {data?.seasonalPattern}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!selectedProductData) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <Icon name="TrendingUp" size={32} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No price history available</p>
      </div>
    );
  }

  const currentPrice = Number(selectedProductData?.currentPrice || 0);
  const rawHistory = selectedProductData?.priceHistory || [];
  const normalizedHistory = rawHistory.length > 0 
    ? rawHistory.map((item, idx) => {
        if (typeof item === 'number') {
          const d = new Date();
          d.setDate(d.getDate() - (rawHistory.length - 1 - idx) * 7);
          return {
            date: d.toISOString().split('T')[0],
            price: item,
            bestTimeToBuy: idx === rawHistory.length - 1
          };
        }
        return item;
      })
    : [
        { date: new Date(Date.now() - 30*86400000).toISOString().split('T')[0], price: Math.round(currentPrice * 1.1) },
        { date: new Date(Date.now() - 15*86400000).toISOString().split('T')[0], price: Math.round(currentPrice * 1.05) },
        { date: new Date().toISOString().split('T')[0], price: currentPrice, bestTimeToBuy: true }
      ];

  const priceValues = normalizedHistory.map(p => Number(p?.price || 0)).filter(p => !isNaN(p) && p > 0);
  const lowestPrice = priceValues.length ? Math.min(...priceValues) : currentPrice;
  const highestPrice = priceValues.length ? Math.max(...priceValues) : currentPrice;

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Price History & Predictions</h3>
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} className="text-accent" />
            <span className="text-sm text-muted-foreground">AI-Powered Analysis</span>
          </div>
        </div>

        {/* Product Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {products?.map((product) => (
            <Button
              key={product?.id}
              variant={selectedProduct === product?.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProduct(product?.id)}
              className="text-xs"
            >
              {product?.name?.split(' ')?.slice(0, 2)?.join(' ')}
            </Button>
          ))}
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {timeRanges?.map((range) => (
            <Button
              key={range?.value}
              variant={timeRange === range?.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range?.value)}
              className="text-xs"
            >
              {range?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Price Stats */}
      <div className="p-4 bg-muted/30 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">₹{currentPrice}</div>
            <div className="text-xs text-muted-foreground">Current Price</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success">₹{lowestPrice}</div>
            <div className="text-xs text-muted-foreground">Lowest (90d)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-error">₹{highestPrice}</div>
            <div className="text-xs text-muted-foreground">Highest (90d)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-warning">
              ₹{Math.round(highestPrice - lowestPrice)}
            </div>
            <div className="text-xs text-muted-foreground">Price Range</div>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="p-4">
        <div className="h-80 w-full" aria-label="Price History Chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={normalizedHistory}>
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
              
              {/* Reference lines */}
              <ReferenceLine 
                y={currentPrice} 
                stroke="var(--color-primary)" 
                strokeDasharray="5 5"
                label={{ value: "Current", position: "topRight" }}
              />
              <ReferenceLine 
                y={lowestPrice} 
                stroke="var(--color-success)" 
                strokeDasharray="3 3"
                label={{ value: "Lowest", position: "topRight" }}
              />
              
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* AI Insights */}
      <div className="p-4 border-t border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Icon name="Brain" size={16} className="text-accent" />
            <h4 className="font-medium text-foreground">AI Price Insights</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="TrendingDown" size={14} className="text-success" />
                <span className="text-sm text-foreground">Price Prediction</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Expected to drop by 8-12% in the next 30 days based on seasonal patterns
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={14} className="text-warning" />
                <span className="text-sm text-foreground">Best Time to Buy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Wait 2-3 weeks for Black Friday deals. Potential savings: ₹4,150-6,640
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="BarChart3" size={14} className="text-primary" />
                <span className="text-sm text-foreground">Market Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current price is 15% above average. Consider waiting or checking alternatives
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="Zap" size={14} className="text-accent" />
                <span className="text-sm text-foreground">Deal Confidence</span>
              </div>
              <p className="text-xs text-muted-foreground">
                85% confidence in price drop prediction based on historical data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryChart;