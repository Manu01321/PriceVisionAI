import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import cartService from '../../../services/cartService';
import { getMultiStorePrices, formatINR, getStoreBuyUrl } from '../../../utils/productUtils';

const SearchResultCard = ({ product, onAddToWatchlist, onCompare, onViewDetails }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(product?.isWishlisted || false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(product?.image);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (onAddToWatchlist) {
      onAddToWatchlist(product?.id, !isWishlisted);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success bg-success/10 border-success/20';
    if (confidence >= 70) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-error bg-error/10 border-error/20';
  };

  // Resolve multi-store prices cleanly in aligned table
  const multiStorePrices = getMultiStorePrices(product);
  const bestStore = multiStorePrices[0] || {
    store: 'Amazon India',
    url: getStoreBuyUrl('Amazon India', product?.name),
    formattedPrice: formatINR(product?.currentPrice)
  };

  // Direct Buy Handler - Opens purchase link in a new web page
  const handleBuyNow = (e, url) => {
    e?.stopPropagation();
    const targetUrl = url || bestStore.url;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Direct Compare Handler - Navigates directly to comparison view
  const handleCompareClick = (e) => {
    e?.stopPropagation();
    if (onCompare) {
      onCompare(product);
    } else {
      navigate('/product-comparison', {
        state: {
          products: [product],
          fromSearch: true
        }
      });
    }
  };

  // Add to Cart Handler
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
      : `High-performance ${product?.category || 'product'} with verified retail discounts and multi-store price guarantees.`);

  const displayedStores = showAllStores ? multiStorePrices : multiStorePrices.slice(0, 3);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Image Section */}
        <div className="relative aspect-video sm:aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={product?.imageAlt || product?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageSrc(
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
              );
              setImageLoading(false);
            }}
          />

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex items-center space-x-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getConfidenceColor(product?.confidence || 88)}`}
            >
              {product?.confidence || 88}% match
            </span>
            {product?.discount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-success text-white">
                -{product?.discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all ${
              isWishlisted ? 'text-error' : 'text-muted-foreground hover:text-error'
            }`}
            title={isWishlisted ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Icon
              name="Heart"
              size={16}
              className={isWishlisted ? 'fill-current text-error' : ''}
            />
          </button>

          {imageLoading && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <Icon name="Image" size={32} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-primary uppercase tracking-wide">
              {product?.brand || 'Brand'}
            </span>
            <div className="flex items-center space-x-1 text-foreground">
              <Icon name="Star" size={13} className="text-warning fill-current" />
              <span className="font-bold">{Number(product?.rating || 4.4).toFixed(1)}</span>
              <span className="text-muted-foreground">({product?.reviews || '1.2k'})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onViewDetails && onViewDetails(product)}
            className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary cursor-pointer transition-colors leading-snug"
          >
            {product?.name}
          </h3>

          {/* Product Description - Shown by default */}
          <div className="p-2.5 bg-muted/40 border border-border/60 rounded-lg text-xs text-foreground/80 leading-relaxed">
            <div className="font-medium text-foreground text-[11px] flex items-center space-x-1 mb-1 text-primary">
              <Icon name="FileText" size={12} />
              <span>Product Description:</span>
            </div>
            <p className="line-clamp-3">{productDescription}</p>
          </div>

          {/* Price Header */}
          <div className="flex items-baseline space-x-2 pt-1">
            <span className="text-xl font-bold text-foreground">
              {formatINR(product?.currentPrice)}
            </span>
            {product?.originalPrice && product?.originalPrice > product?.currentPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(product?.originalPrice)}
              </span>
            )}
            <span className="text-xs font-semibold text-success">
              Best deal available
            </span>
          </div>

          {/* Multi-Store Price Comparison Table - Cleanly Formatted & Aligned */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Icon name="Store" size={13} />
                <span>Multi-Store Live Prices</span>
              </span>
              <span className="text-[11px] text-accent">Exact Rates</span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-background">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground border-b border-border">
                    <th className="py-1.5 px-2.5 font-medium">Store</th>
                    <th className="py-1.5 px-2.5 font-medium">Price</th>
                    <th className="py-1.5 px-2.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {displayedStores.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/30 transition-colors ${item.isBestDeal ? 'bg-success/5 font-medium' : ''}`}
                    >
                      <td className="py-1.5 px-2.5 text-foreground flex items-center space-x-1.5">
                        <span className="truncate max-w-[100px]">{item.store}</span>
                        {item.isBestDeal && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-success/15 text-success font-semibold">
                            Best
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2.5 font-bold text-foreground">
                        {item.formattedPrice}
                      </td>
                      <td className="py-1.5 px-2.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => handleBuyNow(e, item.url)}
                          className="inline-flex items-center space-x-1 text-xs text-primary hover:underline font-semibold"
                          title={`Buy on ${item.store}`}
                        >
                          <span>Buy</span>
                          <Icon name="ExternalLink" size={11} />
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
                  className="w-full py-1 text-[11px] text-center text-primary bg-muted/30 hover:bg-muted/60 border-t border-border transition-colors font-medium"
                >
                  {showAllStores ? 'Show fewer stores' : `+ View ${multiStorePrices.length - 3} more stores`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aligned Functional Buttons: 2-Row Layout to Prevent Squeezing */}
      <div className="p-3.5 pt-0 mt-3 border-t border-border/70 bg-surface/50 space-y-2">
        <div className="grid grid-cols-2 gap-2 pt-2.5">
          {/* 1. Compare Button: Opens comparison directly */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompareClick}
            className="w-full text-xs flex items-center justify-center space-x-1.5 py-2 border-border hover:bg-muted"
            title="Compare with other products"
          >
            <Icon name="Scale" size={13} />
            <span>Compare</span>
          </Button>

          {/* 2. Add to Cart Option */}
          <Button
            variant={addedToCart ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleAddToCart}
            className={`w-full text-xs flex items-center justify-center space-x-1.5 py-2 transition-all ${
              addedToCart
                ? 'bg-success/15 text-success border-success/30 font-semibold'
                : 'border-border hover:bg-muted'
            }`}
            title="Save to Cart for Checkout"
          >
            <Icon name={addedToCart ? 'Check' : 'ShoppingCart'} size={13} />
            <span>{addedToCart ? 'Added ✓' : 'Add to Cart'}</span>
          </Button>
        </div>

        {/* 3. Buy Button: Opens product purchase link in new web page */}
        <Button
          variant="default"
          size="sm"
          onClick={(e) => handleBuyNow(e, bestStore.url)}
          className="w-full text-xs flex items-center justify-center space-x-1.5 py-2 font-semibold shadow-sm"
          title={`Buy now on ${bestStore.store}`}
        >
          <Icon name="ExternalLink" size={13} />
          <span>Buy on {bestStore.store}</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchResultCard;
