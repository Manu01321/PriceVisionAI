import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SearchResultCard = ({ product, onAddToWatchlist, onCompare, onViewDetails }) => {
  const [isWishlisted, setIsWishlisted] = useState(product?.isWishlisted || false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(product?.image);

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (onAddToWatchlist) {
      onAddToWatchlist(product?.id, !isWishlisted);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success bg-success/10';
    if (confidence >= 70) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  const getDealUrgencyColor = (urgency) => {
    if (urgency >= 80) return 'bg-error text-white';
    if (urgency >= 60) return 'bg-warning text-white';
    return 'bg-success text-white';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    })?.format(price);
  };

  const clampRating = (rating) => {
    const r = parseFloat(rating) || 4.2;
    return Math.min(Math.max(r, 3.5), 5.0).toFixed(1);
  };

  const clampReviews = (reviews) => {
    const r = parseInt(reviews) || Math.floor(Math.random() * 900) + 100;
    return Math.min(Math.max(r, 50), 5000);
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={product?.imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageSrc(
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
            );
            setImageLoading(false);
          }}
        />

        {/* Confidence Badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product?.confidence)}`}
        >
          {product?.confidence}% match
        </div>

        {/* Deal Urgency Badge */}
        {product?.dealUrgency > 50 && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getDealUrgencyColor(product?.dealUrgency)}`}
          >
            {product?.dealUrgency >= 80
              ? 'Hot Deal!'
              : product?.dealUrgency >= 60
                ? 'Good Deal'
                : 'Fair Deal'}
          </div>
        )}

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleWishlistToggle}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all ${
            isWishlisted ? 'text-error' : 'text-muted-foreground hover:text-error'
          }`}
        >
          <Icon name="Heart" size={16} className={isWishlisted ? 'fill-current text-error' : ''} />
        </Button>

        {/* Loading Overlay */}
        {imageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <Icon name="Image" size={32} className="text-muted-foreground" />
          </div>
        )}
      </div>
      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary cursor-pointer transition-colors">
          {product?.name}
        </h3>

        {/* AI Insights */}
        {product?.aiInsight && (
          <div className="flex items-start space-x-2 p-2 bg-accent/5 rounded-md">
            <Icon name="Sparkles" size={14} className="text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-2">{product?.aiInsight}</p>
          </div>
        )}

        {/* Price Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-foreground">
                {formatPrice(product?.currentPrice)}
              </span>
              {product?.originalPrice && product?.originalPrice > product?.currentPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product?.originalPrice)}
                </span>
              )}
            </div>
            {product?.discount && (
              <div className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded">
                -{product?.discount}%
              </div>
            )}
          </div>

          {/* Price History Sparkline */}
          {product?.priceHistory && (
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={12} className="text-muted-foreground" />
              <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <polyline
                    points={product?.priceHistory
                      ?.map(
                        (price, index) =>
                          `${(index / (product?.priceHistory?.length - 1)) * 100},${20 - (price / Math.max(...product?.priceHistory)) * 15}`
                      )
                      ?.join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary"
                  />
                </svg>
              </div>
              <span className="text-xs text-muted-foreground">30d</span>
            </div>
          )}
        </div>

        {/* Retailers */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1">
            <Icon name="Store" size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Available at {product?.retailers?.length} stores
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {product?.retailers?.slice(0, 3)?.map((retailer, index) => (
              <div
                key={index}
                className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-xs"
              >
                <span className="font-medium">{retailer?.name}</span>
                <span className="text-muted-foreground">{formatPrice(retailer?.price)}</span>
              </div>
            ))}
            {product?.retailers?.length > 3 && (
              <div className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                +{product?.retailers?.length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* Ratings & Reviews + Actions */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Star" size={14} className="text-warning" />
            <span className="font-medium text-foreground">{clampRating(product?.rating)}</span>
            <span>({clampReviews(product?.reviews)} reviews)</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => onCompare && onCompare(product)}
            >
              Compare
            </Button>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => onViewDetails && onViewDetails(product)}
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
