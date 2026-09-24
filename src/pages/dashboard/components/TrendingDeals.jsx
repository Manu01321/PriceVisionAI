import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const TrendingDeals = ({ deals = [], onViewDeal, onAddToWatchlist }) => {
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
            className="bg-surface border border-border rounded-lg p-4 hover:shadow-soft transition-smooth"
          >
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <Image
                  src={deal?.image}
                  alt={deal?.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Deal Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2">
                    {deal?.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDiscountBadge(deal?.discount)}`}
                    >
                      -{deal?.discount}%
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(deal?.urgencyScore)}`}
                    >
                      {deal?.urgencyScore}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-bold text-foreground">₹{deal?.currentPrice}</span>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{deal?.originalPrice}
                  </span>
                  <span className="text-sm text-success font-medium">
                    Save ₹{(deal?.originalPrice - deal?.currentPrice)?.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Icon name="Store" size={14} />
                    <span>{deal?.store}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-warning fill-current" />
                      <span>{deal?.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onAddToWatchlist(deal)}>
                      <Icon name="Heart" size={14} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onViewDeal(deal)}>
                      View Deal
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
