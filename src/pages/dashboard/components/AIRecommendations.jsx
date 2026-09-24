import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import cartService from '../../../services/cartService';
import { getStoreBuyUrl, formatINR } from '../../../utils/productUtils';

const AIRecommendations = ({ recommendations = [], onViewProduct, onDismiss }) => {
  const [addedItems, setAddedItems] = useState({});

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-error';
  };

  const getReasonIcon = (reason) => {
    switch (reason) {
      case 'price_drop':
        return 'TrendingDown';
      case 'similar_purchase':
        return 'Users';
      case 'seasonal_trend':
        return 'Calendar';
      case 'ai_analysis':
        return 'Brain';
      default:
        return 'Sparkles';
    }
  };

  const handleBuyNow = (rec) => {
    const url = getStoreBuyUrl('Amazon India', rec?.title || rec?.name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = (rec) => {
    cartService.addToCart(rec, 1, 'Amazon India');
    setAddedItems((prev) => ({ ...prev, [rec.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [rec.id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Sparkles" size={20} className="text-accent" />
          <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          Refresh
          <Icon name="RefreshCw" size={14} className="ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {recommendations?.map((rec) => (
          <div
            key={rec?.id}
            className="bg-surface border border-accent/20 rounded-xl p-4 hover:shadow-soft transition-smooth"
          >
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
                <Image
                  src={rec?.image}
                  alt={rec?.imageAlt || rec?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Recommendation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-2">{rec?.title}</h4>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 ${getConfidenceColor(rec?.confidence)}`}>
                    {rec?.confidence}% match
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Icon name={getReasonIcon(rec?.reason)} size={14} className="text-accent" />
                  <span className="text-xs text-muted-foreground">{rec?.reasonText}</span>
                </div>

                {/* Product Description - Shown by default */}
                {rec?.aiInsight && (
                  <div className="mb-3 p-2.5 bg-muted/30 border border-border/70 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Icon name="FileText" size={13} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground/80 leading-relaxed">{rec?.aiInsight}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/70">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-bold text-foreground">
                      {formatINR(rec?.price)}
                    </span>
                    {rec?.originalPrice && rec?.originalPrice > rec?.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatINR(rec?.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Dismiss Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss && onDismiss(rec?.id)}
                      className="h-8 w-8 p-0"
                      title="Dismiss"
                    >
                      <Icon name="X" size={14} />
                    </Button>

                    {/* Compare Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProduct && onViewProduct(rec)}
                      className="text-xs px-2.5 h-8 flex items-center space-x-1"
                      title="Compare product"
                    >
                      <Icon name="Scale" size={12} />
                      <span>Compare</span>
                    </Button>

                    {/* Add to Cart */}
                    <Button
                      variant={addedItems[rec.id] ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleAddToCart(rec)}
                      className={`text-xs px-2.5 h-8 flex items-center space-x-1 ${
                        addedItems[rec.id]
                          ? 'bg-success/15 text-success border-success/30 font-semibold'
                          : ''
                      }`}
                      title="Add to Cart"
                    >
                      <Icon name={addedItems[rec.id] ? 'Check' : 'ShoppingCart'} size={12} />
                      <span>{addedItems[rec.id] ? 'Added' : 'Cart'}</span>
                    </Button>

                    {/* Buy Now Button */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleBuyNow(rec)}
                      className="text-xs px-2.5 h-8 flex items-center space-x-1 font-semibold"
                      title="Buy now"
                    >
                      <Icon name="ExternalLink" size={12} />
                      <span>Buy</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
