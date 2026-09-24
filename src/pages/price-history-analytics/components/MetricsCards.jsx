import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCards = ({ productData, priceHistory }) => {
  // Mock metrics data
  const metrics = [
    {
      id: 'current_price',
      title: 'Current Best Price',
      value: '₹60,567',
      change: '-₹14,124',
      changePercent: '-18.9%',
      trend: 'down',
      retailer: 'Amazon',
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 'lowest_price',
      title: 'All-Time Low',
      value: '₹53,900',
      date: 'Nov 25, 2023',
      savings: '₹6,650 below current',
      icon: 'TrendingDown',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'average_price',
      title: '90-Day Average',
      value: '₹67,228',
      change: '+₹6,650',
      changePercent: '+10.9%',
      trend: 'up',
      icon: 'BarChart3',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 'savings_potential',
      title: 'Savings Potential',
      value: '23%',
      prediction: 'Black Friday',
      confidence: '92%',
      icon: 'Target',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'price_volatility',
      title: 'Price Volatility',
      value: 'Medium',
      range: '₹53,900 - ₹78,027',
      stability: '71%',
      icon: 'Activity',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'deal_frequency',
      title: 'Deal Frequency',
      value: '2.3/month',
      lastDeal: '5 days ago',
      nextPredicted: '18 days',
      icon: 'Zap',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return 'TrendingUp';
      case 'down':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-error';
      case 'down':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics?.map((metric) => (
        <div key={metric?.id} className="bg-surface border border-border rounded-lg p-6 hover:shadow-soft transition-smooth">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg ${metric?.bgColor} flex items-center justify-center`}>
              <Icon name={metric?.icon} size={20} className={metric?.color} />
            </div>
            
            {metric?.trend && (
              <div className={`flex items-center space-x-1 ${getTrendColor(metric?.trend)}`}>
                <Icon name={getTrendIcon(metric?.trend)} size={16} />
                <span className="text-sm font-medium">{metric?.changePercent}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {metric?.title}
            </h3>
            
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold text-foreground">
                {metric?.value}
              </span>
              {metric?.change && (
                <span className={`text-sm font-medium ${getTrendColor(metric?.trend)}`}>
                  {metric?.change}
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-1">
              {metric?.retailer && (
                <div className="flex items-center space-x-2">
                  <Icon name="Store" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">at {metric?.retailer}</span>
                </div>
              )}
              
              {metric?.date && (
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{metric?.date}</span>
                </div>
              )}
              
              {metric?.savings && (
                <div className="flex items-center space-x-2">
                  <Icon name="Coins" size={12} className="text-success" />
                  <span className="text-xs text-success">{metric?.savings}</span>
                </div>
              )}
              
              {metric?.prediction && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Brain" size={12} className="text-accent" />
                    <span className="text-xs text-muted-foreground">{metric?.prediction}</span>
                  </div>
                  {metric?.confidence && (
                    <span className="text-xs font-medium text-accent">{metric?.confidence}</span>
                  )}
                </div>
              )}
              
              {metric?.range && (
                <div className="flex items-center space-x-2">
                  <Icon name="BarChart2" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Range: {metric?.range}</span>
                </div>
              )}
              
              {metric?.stability && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Stability</span>
                  <span className="text-xs font-medium text-foreground">{metric?.stability}</span>
                </div>
              )}
              
              {metric?.lastDeal && (
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Last deal: {metric?.lastDeal}</span>
                </div>
              )}
              
              {metric?.nextPredicted && (
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={12} className="text-primary" />
                  <span className="text-xs text-primary">Next in ~{metric?.nextPredicted}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar for certain metrics */}
          {(metric?.id === 'savings_potential' || metric?.id === 'price_volatility') && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Confidence</span>
                <span>{metric?.confidence || metric?.stability}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metric?.id === 'savings_potential' ? 'bg-accent' : 'bg-secondary'
                  }`}
                  style={{ 
                    width: `${metric?.confidence ? parseInt(metric?.confidence) : parseInt(metric?.stability)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;