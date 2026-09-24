import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import cartService from '../../../services/cartService';
import { getMultiStorePrices, formatINR, getStoreBuyUrl } from '../../../utils/productUtils';

const ProductCard = ({ product, onRemove, onAdjustAlert, onViewDetails, className = '' }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);

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
    inStock = true,
    priceHistory = []
  } = product;

  // Resolve multi-store prices cleanly in aligned table format
  const multiStorePrices = getMultiStorePrices(product);
  const bestStore = multiStorePrices[0] || {
    store: store || 'Amazon India',
    url: getStoreBuyUrl(store || 'Amazon India', name),
    formattedPrice: formatINR(currentPrice)
  };

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

  // Generate sparkline data
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

  // 1. Compare Button Handler - Opens product comparison view directly
  const handleCompareClick = (e) => {
    e?.stopPropagation();
    navigate('/product-comparison', {
      state: {
        products: [product],
        product: product,
        fromWatchlist: true
      }
    });
  };

  // 2. Buy Button Handler - Opens purchase link in new web page
  const handleBuyNow = (e, targetUrl) => {
    e?.stopPropagation();
    const url = targetUrl || bestStore.url;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 3. Add to Cart Handler
  const handleAddToCart = (e) => {
    e?.stopPropagation();
    cartService.addToCart(product, 1, bestStore.store);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Product description shown by default
  const productDescription =
    product?.description ||
    product?.aiInsight ||
    (Array.isArray(product?.features) && product?.features.length > 0
      ? product.features.slice(0, 3).join(' • ')
      : `Monitored ${category || 'retail'} product tracked with live multi-store comparison and price drop alerts.`);

  const displayedStores = showAllStores ? multiStorePrices : multiStorePrices.slice(0, 3);

  return (
    <div
      className={`bg-surface border border-border rounded-xl p-4 hover:shadow-soft transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header Badges & Context Menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(dealUrgency)}`}
            >
              {getUrgencyLabel(dealUrgency)} ({dealUrgency})
            </div>
            {!inStock && (
              <div className="px-2 py-0.5 bg-error/10 text-error rounded-full text-xs font-medium">
                Out of Stock
              </div>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatTimestamp(lastChecked)}
            </span>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-7 w-7"
            >
              <Icon name="MoreVertical" size={15} />
            </Button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-lg shadow-elevated z-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      if (onViewDetails) onViewDetails(product);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted"
                  >
                    <Icon name="Eye" size={13} />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onAdjustAlert) onAdjustAlert(product);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted"
                  >
                    <Icon name="Bell" size={13} />
                    <span>Adjust Alert</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onRemove) onRemove(product?.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-error hover:bg-error/5"
                  >
                    <Icon name="Trash2" size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Media & Title */}
        <div className="flex space-x-3 mb-3">
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
            <Image src={image} alt={imageAlt || name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              onClick={() => onViewDetails && onViewDetails(product)}
              className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary cursor-pointer transition-colors leading-snug"
            >
              {name}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{store || 'Online Retail'}</span>
              <span>•</span>
              <span className="capitalize">{category}</span>
            </div>
          </div>
        </div>

        {/* Product Description - Shown by default */}
        <div className="p-2.5 bg-muted/30 border border-border/60 rounded-lg text-xs text-foreground/80 mb-3">
          <div className="font-medium text-foreground text-[11px] flex items-center space-x-1 mb-1 text-primary">
            <Icon name="FileText" size={12} />
            <span>Product Description:</span>
          </div>
          <p className="line-clamp-2 leading-relaxed">{productDescription}</p>
        </div>

        {/* Price Info Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-foreground">
              {formatINR(currentPrice)}
            </span>
            {originalPrice && originalPrice !== currentPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(originalPrice)}
              </span>
            )}
          </div>

          {priceChange !== 0 && (
            <div
              className={`flex items-center space-x-0.5 text-xs font-semibold ${getPriceChangeColor(priceChange)}`}
            >
              <Icon name={priceChange < 0 ? 'TrendingDown' : 'TrendingUp'} size={13} />
              <span>
                {priceChange < 0 ? '-' : '+'}₹{Math.abs(priceChange)} ({priceChangePercent}%)
              </span>
            </div>
          )}
        </div>

        {/* 30-Day Trend Sparkline */}
        {priceHistory?.length > 0 && (
          <div className="flex items-center space-x-2 mb-3 text-xs text-muted-foreground">
            <svg width="60" height="18" className="text-primary">
              <polyline
                points={generateSparklinePoints()}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-[11px]">30-day price trend</span>
          </div>
        )}

        {/* Multi-Store Price Comparison Table - Cleanly Formatted & Aligned */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Icon name="Store" size={12} />
              <span>Multi-Store Live Prices</span>
            </span>
            <span className="text-[11px] text-accent">Exact Rates</span>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/60 text-muted-foreground border-b border-border">
                  <th className="py-1 px-2 font-medium">Store</th>
                  <th className="py-1 px-2 font-medium">Price</th>
                  <th className="py-1 px-2 text-right font-medium">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {displayedStores.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/30 transition-colors ${item.isBestDeal ? 'bg-success/5 font-medium' : ''}`}
                  >
                    <td className="py-1 px-2 text-foreground truncate max-w-[85px]">
                      {item.store}
                    </td>
                    <td className="py-1 px-2 font-bold text-foreground">
                      {item.formattedPrice}
                    </td>
                    <td className="py-1 px-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(e, item.url)}
                        className="inline-flex items-center space-x-0.5 text-xs text-primary hover:underline font-semibold"
                        title={`Buy on ${item.store}`}
                      >
                        <span>Buy</span>
                        <Icon name="ExternalLink" size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {multiStorePrices.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllStores(!showAllStores)}
                className="w-full py-1 text-[10px] text-center text-primary bg-muted/20 hover:bg-muted/50 border-t border-border transition-colors font-medium"
              >
                {showAllStores ? 'Show fewer stores' : `+ ${multiStorePrices.length - 3} more stores`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aligned Functional Buttons: 2-Row Layout to Prevent Squeezing */}
      <div className="pt-2 border-t border-border/80 space-y-1.5">
        <div className="grid grid-cols-2 gap-2">
          {/* 1. Compare Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompareClick}
            className="w-full text-xs flex items-center justify-center space-x-1.5 py-1.5 border-border hover:bg-muted"
            title="Open product comparison view directly"
          >
            <Icon name="Scale" size={13} />
            <span>Compare</span>
          </Button>

          {/* 2. Add to Cart Option */}
          <Button
            variant={addedToCart ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleAddToCart}
            className={`w-full text-xs flex items-center justify-center space-x-1.5 py-1.5 transition-all ${
              addedToCart
                ? 'bg-success/15 text-success border-success/30 font-semibold'
                : 'border-border hover:bg-muted'
            }`}
            title="Save product in cart for checkout"
          >
            <Icon name={addedToCart ? 'Check' : 'ShoppingCart'} size={13} />
            <span>{addedToCart ? 'Added ✓' : 'Add to Cart'}</span>
          </Button>
        </div>

        {/* 3. Buy Button */}
        <Button
          variant="default"
          size="sm"
          onClick={(e) => handleBuyNow(e, bestStore.url)}
          className="w-full text-xs flex items-center justify-center space-x-1.5 py-1.5 font-semibold shadow-sm"
          title={`Buy now on ${bestStore.store}`}
        >
          <Icon name="ExternalLink" size={13} />
          <span>Buy on {bestStore.store}</span>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
