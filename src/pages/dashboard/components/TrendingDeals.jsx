import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import cartService from '../../../services/cartService';
import { getStoreBuyUrl, formatINR } from '../../../utils/productUtils';

const TrendingDeals = ({ deals = [], onViewDeal, onAddToWatchlist }) => {
  const [addedItems, setAddedItems] = useState({});

  const getUrgencyColor = (score) => {
    if (score >= 80) return 'bg-success text-success-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    return 'bg-error text-error-foreground';
  };

  const getDiscountBadge = (discount) => {
    if (discount >= 50) return 'bg-error text-error-foreground';
    if (discount >= 30) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const handleBuyNow = (deal) => {
    const url = getStoreBuyUrl(deal?.store || 'Amazon India', deal?.title || deal?.name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = (deal) => {
    cartService.addToCart(deal, 1, deal?.store || 'Amazon India');
    setAddedItems((prev) => ({ ...prev, [deal.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [deal.id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Trending Deals</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <Icon name="ArrowRight" size={14} className="ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {deals?.map((deal) => (
          <div
            key={deal?.id}
            className="bg-surface border border-border rounded-xl p-4 hover:shadow-soft transition-smooth"
          >
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
                <Image
                  src={deal?.image}
                  alt={deal?.imageAlt || deal?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Deal Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-2">
                    {deal?.title}
                  </h4>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <div
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getDiscountBadge(deal?.discount)}`}
                    >
                      -{deal?.discount}%
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getUrgencyColor(deal?.urgencyScore)}`}
                    >
                      {deal?.urgencyScore}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-bold text-foreground">
                    {formatINR(deal?.currentPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatINR(deal?.originalPrice)}
                  </span>
                  <span className="text-xs text-success font-semibold">
                    Save {formatINR(deal?.originalPrice - deal?.currentPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/70">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Store" size={14} />
                    <span className="font-medium text-foreground">{deal?.store}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={13} className="text-warning fill-current" />
                      <span>{deal?.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Add to Watchlist */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddToWatchlist && onAddToWatchlist(deal)}
                      className="h-8 w-8 p-0"
                      title="Watchlist"
                    >
                      <Icon name="Heart" size={15} />
                    </Button>

                    {/* Compare Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDeal && onViewDeal(deal)}
                      className="text-xs px-2.5 h-8 flex items-center space-x-1"
                      title="Open product comparison view directly"
                    >
                      <Icon name="Scale" size={12} />
                      <span>Compare</span>
                    </Button>

                    {/* Add to Cart */}
                    <Button
                      variant={addedItems[deal.id] ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleAddToCart(deal)}
                      className={`text-xs px-2.5 h-8 flex items-center space-x-1 ${
                        addedItems[deal.id]
                          ? 'bg-success/15 text-success border-success/30 font-semibold'
                          : ''
                      }`}
                      title="Save product in cart"
                    >
                      <Icon name={addedItems[deal.id] ? 'Check' : 'ShoppingCart'} size={12} />
                      <span>{addedItems[deal.id] ? 'Added' : 'Cart'}</span>
                    </Button>

                    {/* Buy Now Button */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleBuyNow(deal)}
                      className="text-xs px-2.5 h-8 flex items-center space-x-1 font-semibold"
                      title="Open purchase link in a new web page"
                    >
                      <Icon name="ExternalLink" size={12} />
                      <span>Buy</span>
                    </Button>
                  </div>
                </div>

                {deal?.timeLeft && (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-error">
                    <Icon name="Clock" size={12} />
                    <span>Ends in {deal?.timeLeft}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingDeals;
