import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const AlertCard = ({ alert, onMarkAsRead, onArchive, onQuickAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'border-l-error bg-error/5';
      case 'medium':
        return 'border-l-warning bg-warning/5';
      case 'low':
        return 'border-l-success bg-success/5';
      default:
        return 'border-l-muted-foreground bg-muted/5';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return 'TrendingDown';
      case 'deal_found':
        return 'Tag';
      case 'back_in_stock':
        return 'Package';
      case 'price_target':
        return 'Target';
      case 'ai_recommendation':
        return 'Sparkles';
      default:
        return 'Bell';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleQuickAction = (action) => {
    if (onQuickAction) {
      onQuickAction(alert?.id, action);
    }
  };

  return (
    <div className={`bg-surface border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-soft ${getUrgencyColor(alert?.urgency)} border-l-4`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Alert Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            alert?.urgency === 'high' ? 'bg-error/10' :
            alert?.urgency === 'medium'? 'bg-warning/10' : 'bg-success/10'
          }`}>
            <Icon 
              name={getAlertIcon(alert?.type)} 
              size={20} 
              className={
                alert?.urgency === 'high' ? 'text-error' :
                alert?.urgency === 'medium'? 'text-warning' : 'text-success'
              }
            />
          </div>

          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-foreground text-sm">{alert?.title}</h3>
              {!alert?.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                alert?.urgency === 'high' ? 'bg-error/10 text-error' :
                alert?.urgency === 'medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
              }`}>
                {alert?.urgency?.toUpperCase()}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{alert?.message}</p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{formatTimestamp(alert?.timestamp)}</span>
              <span className="flex items-center space-x-1">
                <Icon name="Tag" size={12} />
                <span>{alert?.category}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMarkAsRead && onMarkAsRead(alert?.id)}
            className="h-8 w-8"
          >
            <Icon name="Check" size={16} />
          </Button>
        </div>
      </div>
      {/* Product Info */}
      {alert?.product && (
        <div className="flex items-center space-x-3 mb-3 p-3 bg-muted/30 rounded-lg">
          <Image
            src={alert?.product?.image}
            alt={alert?.product?.imageAlt}
            className="w-12 h-12 rounded-lg object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate">
              {alert?.product?.name}
            </h4>
            <p className="text-xs text-muted-foreground">{alert?.product?.brand}</p>
          </div>

          {/* Price Info */}
          {alert?.priceInfo && (
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground line-through">
                  ₹{alert?.priceInfo?.oldPrice}
                </span>
                <span className="font-semibold text-success">
                  ₹{alert?.priceInfo?.newPrice}
                </span>
              </div>
              <div className="text-xs text-success">
                Save {alert?.priceInfo?.savings}%
              </div>
            </div>
          )}
        </div>
      )}
      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 animate-slide-up">
          {/* AI Insights */}
          {alert?.aiInsights && (
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Brain" size={16} className="text-accent" />
                <span className="text-sm font-medium text-foreground">AI Insights</span>
              </div>
              <p className="text-sm text-muted-foreground">{alert?.aiInsights}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('view_product')}
              iconName="ExternalLink"
              iconPosition="right"
            >
              View Product
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('add_to_watchlist')}
              iconName="Heart"
              iconPosition="left"
            >
              Add to Watchlist
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('compare_prices')}
              iconName="BarChart3"
              iconPosition="left"
            >
              Compare Prices
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('set_alert')}
              iconName="Bell"
              iconPosition="left"
            >
              Set Alert
            </Button>
          </div>

          {/* Additional Details */}
          {alert?.details && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {alert?.details?.store && (
                <div>
                  <span className="text-muted-foreground">Store:</span>
                  <span className="ml-2 font-medium">{alert?.details?.store}</span>
                </div>
              )}
              {alert?.details?.availability && (
                <div>
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="ml-2 font-medium">{alert?.details?.availability}</span>
                </div>
              )}
              {alert?.details?.validUntil && (
                <div>
                  <span className="text-muted-foreground">Valid Until:</span>
                  <span className="ml-2 font-medium">{alert?.details?.validUntil}</span>
                </div>
              )}
              {alert?.details?.confidence && (
                <div>
                  <span className="text-muted-foreground">AI Confidence:</span>
                  <span className="ml-2 font-medium text-success">{alert?.details?.confidence}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertCard;