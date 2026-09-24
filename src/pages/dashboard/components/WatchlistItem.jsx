import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const WatchlistItem = ({ 
  product, 
  onViewDetails, 
  onRemove, 
  onSetAlert 
}) => {
  const getUrgencyColor = (score) => {
    if (score >= 80) return 'bg-success text-success-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    return 'bg-error text-error-foreground';
  };

  const getPriceChangeColor = (change) => {
    if (change > 0) return 'text-error';
    if (change < 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const getPriceChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-soft transition-smooth">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <Image
            src={product?.image}
            alt={product?.imageAlt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground line-clamp-2">
              {product?.name}
            </h4>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(product?.urgencyScore)}`}>
              {product?.urgencyScore}
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <div className="text-lg font-bold text-foreground">
                ₹{product?.currentPrice}
              </div>
              {product?.priceChange !== 0 && (
                <div className={`flex items-center space-x-1 text-sm ${getPriceChangeColor(product?.priceChange)}`}>
                  <Icon name={getPriceChangeIcon(product?.priceChange)} size={14} />
                  <span>₹{Math.abs(product?.priceChange)?.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Target</div>
              <div className="text-sm font-medium text-foreground">
                ₹{product?.targetPrice}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(product)}
              className="flex-1"
            >
              <Icon name="Eye" size={14} className="mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetAlert(product)}
            >
              <Icon name="Bell" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(product)}
              className="text-error hover:text-error"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistItem;