import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const AlertsHistory = ({ productId }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock alerts history data
  const alertsHistory = [
  {
    id: 1,
    type: 'price_drop',
    title: 'Price Drop Alert',
    message: 'iPhone 15 Pro dropped to ₹60,567 (-₹2,490)',
    product: {
      name: 'iPhone 15 Pro 128GB',
      image: "https://images.unsplash.com/photo-1642227140191-b9913243c341",
      imageAlt: 'Silver iPhone 15 Pro showing home screen with app icons on white background'
    },
    retailer: 'Amazon',
    oldPrice: 759,
    newPrice: 729,
    savings: 30,
    savingsPercent: 4,
    timestamp: new Date('2024-10-26T14:30:00'),
    status: 'triggered',
    action: 'viewed',
    confidence: 95
  },
  {
    id: 2,
    type: 'deal_alert',
    title: 'Great Deal Found',
    message: 'Target price reached: ₹62,225',
    product: {
      name: 'iPhone 15 Pro 128GB',
      image: "https://images.unsplash.com/photo-1642227140191-b9913243c341",
      imageAlt: 'Silver iPhone 15 Pro showing home screen with app icons on white background'
    },
    retailer: 'Walmart',
    targetPrice: 749,
    actualPrice: 749,
    timestamp: new Date('2024-10-25T09:15:00'),
    status: 'triggered',
    action: 'purchased',
    confidence: 88
  },
  {
    id: 3,
    type: 'prediction_alert',
    title: 'AI Prediction Update',
    message: 'Price likely to drop 15% in next 7 days',
    product: {
      name: 'iPhone 15 Pro 128GB',
      image: "https://images.unsplash.com/photo-1642227140191-b9913243c341",
      imageAlt: 'Silver iPhone 15 Pro showing home screen with app icons on white background'
    },
    predictedDrop: 15,
    currentPrice: 729,
    predictedPrice: 620,
    timeframe: '7 days',
    timestamp: new Date('2024-10-24T16:45:00'),
    status: 'active',
    action: 'waiting',
    confidence: 78
  },
  {
    id: 4,
    type: 'stock_alert',
    title: 'Back in Stock',
    message: 'iPhone 15 Pro available at Best Buy',
    product: {
      name: 'iPhone 15 Pro 128GB',
      image: "https://images.unsplash.com/photo-1642227140191-b9913243c341",
      imageAlt: 'Silver iPhone 15 Pro showing home screen with app icons on white background'
    },
    retailer: 'Best Buy',
    price: 759,
    timestamp: new Date('2024-10-23T11:20:00'),
    status: 'triggered',
    action: 'ignored',
    confidence: 100
  },
  {
    id: 5,
    type: 'seasonal_alert',
    title: 'Seasonal Trend Alert',
    message: 'Black Friday deals starting early',
    product: {
      name: 'iPhone 15 Pro 128GB',
      image: "https://images.unsplash.com/photo-1642227140191-b9913243c341",
      imageAlt: 'Silver iPhone 15 Pro showing home screen with app icons on white background'
    },
    expectedDiscount: 25,
    startDate: new Date('2024-11-20T00:00:00'),
    timestamp: new Date('2024-10-22T08:00:00'),
    status: 'scheduled',
    action: 'pending',
    confidence: 92
  },
  {
    id: 6,
    type: 'price_drop',
    title: 'Missed Opportunity',
    message: 'Price dropped to ₹58,077 but alert was missed',
    product: {
      name: 'iPhone 15 Pro 128GB',
      image: "https://images.unsplash.com/photo-1642227140191-b9913243c341",
      imageAlt: 'Silver iPhone 15 Pro showing home screen with app icons on white background'
    },
    retailer: 'Amazon',
    missedPrice: 699,
    currentPrice: 729,
    missedSavings: 60,
    timestamp: new Date('2024-10-21T03:30:00'),
    status: 'missed',
    action: 'missed',
    confidence: 85
  }];


  const filterOptions = [
  { value: 'all', label: 'All Alerts', count: alertsHistory?.length },
  { value: 'triggered', label: 'Triggered', count: alertsHistory?.filter((a) => a?.status === 'triggered')?.length },
  { value: 'active', label: 'Active', count: alertsHistory?.filter((a) => a?.status === 'active')?.length },
  { value: 'missed', label: 'Missed', count: alertsHistory?.filter((a) => a?.status === 'missed')?.length }];


  const getAlertIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return 'TrendingDown';
      case 'deal_alert':
        return 'Tag';
      case 'prediction_alert':
        return 'Brain';
      case 'stock_alert':
        return 'Package';
      case 'seasonal_alert':
        return 'Calendar';
      default:
        return 'Bell';
    }
  };

  const getAlertColor = (type, status) => {
    if (status === 'missed') return 'text-error';

    switch (type) {
      case 'price_drop':
        return 'text-success';
      case 'deal_alert':
        return 'text-primary';
      case 'prediction_alert':
        return 'text-accent';
      case 'stock_alert':
        return 'text-secondary';
      case 'seasonal_alert':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      triggered: { bg: 'bg-success/10', text: 'text-success', label: 'Triggered' },
      active: { bg: 'bg-primary/10', text: 'text-primary', label: 'Active' },
      scheduled: { bg: 'bg-warning/10', text: 'text-warning', label: 'Scheduled' },
      missed: { bg: 'bg-error/10', text: 'text-error', label: 'Missed' }
    };

    const badge = badges?.[status] || badges?.active;
    return (
      <div className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </div>);

  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'purchased':
        return 'ShoppingCart';
      case 'viewed':
        return 'Eye';
      case 'ignored':
        return 'EyeOff';
      case 'waiting':
        return 'Clock';
      case 'missed':
        return 'AlertTriangle';
      default:
        return 'Clock';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredAlerts = alertsHistory?.filter((alert) => {
    if (filter === 'all') return true;
    return alert?.status === filter;
  });

  const sortedAlerts = [...filteredAlerts]?.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b?.timestamp - a?.timestamp;
      case 'savings':
        return (b?.savings || 0) - (a?.savings || 0);
      case 'confidence':
        return b?.confidence - a?.confidence;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Alerts History</h3>
          <p className="text-sm text-muted-foreground">
            Track your price alerts and deal notifications
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">

            <option value="date">Sort by Date</option>
            <option value="savings">Sort by Savings</option>
            <option value="confidence">Sort by Confidence</option>
          </select>
        </div>
      </div>
      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
        {filterOptions?.map((option) =>
        <button
          key={option?.value}
          onClick={() => setFilter(option?.value)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
          filter === option?.value ?
          'bg-surface text-foreground shadow-soft' :
          'text-muted-foreground hover:text-foreground'}`
          }>

            <span>{option?.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
          filter === option?.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`
          }>
              {option?.count}
            </span>
          </button>
        )}
      </div>
      {/* Alerts List */}
      <div className="space-y-4">
        {sortedAlerts?.length > 0 ?
        sortedAlerts?.map((alert) =>
        <div key={alert?.id} className="bg-surface border border-border rounded-lg p-6 hover:shadow-soft transition-smooth">
              <div className="flex items-start space-x-4">
                {/* Alert Icon */}
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${getAlertColor(alert?.type, alert?.status)}`}>
                  <Icon name={getAlertIcon(alert?.type)} size={20} />
                </div>

                {/* Product Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                src={alert?.product?.image}
                alt={alert?.product?.imageAlt}
                className="w-full h-full object-cover" />

                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-md font-medium text-foreground">{alert?.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert?.product?.name}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(alert?.status)}
                      <div className="text-xs text-muted-foreground">
                        {alert?.confidence}% confidence
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground mb-3">{alert?.message}</p>

                  {/* Alert Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {alert?.retailer &&
                <div className="flex items-center space-x-2">
                        <Icon name="Store" size={14} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{alert?.retailer}</span>
                      </div>
                }
                    
                    {alert?.savings &&
                <div className="flex items-center space-x-2">
                        <Icon name="DollarSign" size={14} className="text-success" />
                        <span className="text-sm text-success">
                          Saved ₹{alert?.savings} ({alert?.savingsPercent}%)
                        </span>
                      </div>
                }
                    
                    {alert?.predictedDrop &&
                <div className="flex items-center space-x-2">
                        <Icon name="TrendingDown" size={14} className="text-accent" />
                        <span className="text-sm text-foreground">
                          {alert?.predictedDrop}% drop predicted
                        </span>
                      </div>
                }
                    
                    {alert?.timeframe &&
                <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={14} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          Within {alert?.timeframe}
                        </span>
                      </div>
                }
                  </div>

                  {/* Price Information */}
                  {alert?.oldPrice && alert?.newPrice &&
              <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Was:</span>
                        <span className="text-sm text-muted-foreground line-through">₹{alert?.oldPrice}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Now:</span>
                        <span className="text-lg font-semibold text-success">₹{alert?.newPrice}</span>
                      </div>
                    </div>
              }

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={12} />
                        <span>{formatTimestamp(alert?.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name={getActionIcon(alert?.action)} size={12} />
                        <span className="capitalize">{alert?.action}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {alert?.status === 'active' &&
                  <Button variant="outline" size="sm">
                          Modify Alert
                        </Button>
                  }
                      {alert?.status === 'triggered' && alert?.action === 'viewed' &&
                  <Button variant="default" size="sm" iconName="ExternalLink">
                          Buy Now
                        </Button>
                  }
                      {alert?.status === 'missed' &&
                  <Button variant="outline" size="sm" iconName="RefreshCw">
                          Create New Alert
                        </Button>
                  }
                    </div>
                  </div>
                </div>
              </div>
            </div>
        ) :

        <div className="text-center py-12">
            <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No alerts found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'all' ? "You haven't set up any price alerts yet." :
            `No ${filter} alerts to display.`
            }
            </p>
            <Button variant="default" iconName="Plus">
              Create Price Alert
            </Button>
          </div>
        }
      </div>
      {/* Summary Stats */}
      {sortedAlerts?.length > 0 &&
      <div className="bg-gradient-to-r from-success/5 to-primary/5 border border-border rounded-lg p-6">
          <h4 className="text-md font-medium text-foreground mb-4">Alert Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                ₹{alertsHistory?.filter((a) => a?.savings)?.reduce((sum, a) => sum + (a?.savings || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {alertsHistory?.filter((a) => a?.status === 'triggered')?.length}
              </div>
              <div className="text-sm text-muted-foreground">Alerts Triggered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {Math.round(alertsHistory?.reduce((sum, a) => sum + a?.confidence, 0) / alertsHistory?.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-error">
                {alertsHistory?.filter((a) => a?.status === 'missed')?.length}
              </div>
              <div className="text-sm text-muted-foreground">Missed Opportunities</div>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default AlertsHistory;