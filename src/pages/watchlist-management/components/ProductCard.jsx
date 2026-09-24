import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onRemove, onAdjustAlert, onViewDetails, className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    id,
    name,
    image,
    imageAlt,
    currentPrice,
    originalPrice,
    priceChange,
    priceChangePercent,
    dealUrgency,
    lastChecked,
    category,
    store,
    inStock,
    priceHistory = []
  } = product;

  const getUrgencyColor = (urgency) => {
    if (urgency >= 80) return 'bg-error text-error-foreground';
    if (urgency >= 50) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency >= 80) return 'High';
    if (urgency >= 50) return 'Medium';
    return 'Low';
  };

  const getPriceChangeColor = (change) => {
    if (change < 0) return 'text-success';
    if (change > 0) return 'text-error';
    return 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp)?.toLocaleDateString();
  };

  // Generate simple sparkline data
  const generateSparklinePoints = () => {
    if (priceHistory?.length === 0) return '';

    const width = 60;
    const height = 20;
    const max = Math.max(...priceHistory);
    const min = Math.min(...priceHistory);
    const range = max - min || 1;

    return priceHistory
      ?.map((price, index) => {
        const x = (index / (priceHistory?.length - 1)) * width;
        const y = height - ((price - min) / range) * height;
        return `${x},${y}`;
      })
      ?.join(' ');
  };

  return (
    <div
      className={`bg-surface border border-border rounded-lg p-4 hover:shadow-soft transition-all duration-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(dealUrgency)}`}
          >
            {getUrgencyLabel(dealUrgency)} ({dealUrgency})
          </div>
          {!inStock && (
            <div className="px-2 py-1 bg-error/10 text-error rounded-full text-xs font-medium">
              Out of Stock
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-8 w-8"
          >
            <Icon name="MoreVertical" size={16} />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-elevated z-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    onViewDetails(product);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Icon name="Eye" size={14} />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    onAdjustAlert(product);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Icon name="Bell" size={14} />
                  <span>Adjust Alert</span>
                </button>
                <button
                  onClick={() => {
                    onRemove(product?.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-error/5"
                >
                  <Icon name="Trash2" size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Product Info */}
      <div className="flex space-x-3 mb-4">
        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          <Image src={image} alt={imageAlt} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-2 mb-1">{name}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{store}</span>
            <span>•</span>
            <span>{category}</span>
          </div>
        </div>
      </div>
      {/* Price Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-foreground">₹{currentPrice}</span>
            {originalPrice && originalPrice !== currentPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
            )}
          </div>

          {priceChange !== 0 && (
            <div
              className={`flex items-center space-x-1 text-sm font-medium ${getPriceChangeColor(priceChange)}`}
            >
              <Icon name={priceChange < 0 ? 'TrendingDown' : 'TrendingUp'} size={14} />
              <span>
                {priceChange < 0 ? '-' : '+'}₹{Math.abs(priceChange)} ({priceChangePercent}%)
              </span>
            </div>
          )}
        </div>

        {/* Price History Sparkline */}
        {priceHistory?.length > 0 && (
          <div className="flex items-center space-x-2">
            <svg width="60" height="20" className="text-primary">
              <polyline
                points={generateSparklinePoints()}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-xs text-muted-foreground">30-day trend</span>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Updated {formatTimestamp(lastChecked)}
        </span>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="BarChart3"
            onClick={() => onViewDetails(product)}
          >
            Details
          </Button>
          <Button variant="default" size="sm" iconName="ExternalLink" disabled={!inStock}>
            {inStock ? 'Buy Now' : 'Notify Me'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
