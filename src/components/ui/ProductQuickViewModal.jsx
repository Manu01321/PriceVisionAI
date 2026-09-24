import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';
import Button from './Button';
import cartService from '../../services/cartService';
import { getMultiStorePrices, formatINR, getStoreBuyUrl } from '../../utils/productUtils';

const ProductQuickViewModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);

  if (!isOpen || !product) return null;

  const multiStorePrices = getMultiStorePrices(product);
  const bestStore = multiStorePrices[0] || {
    store: 'Amazon India',
    url: getStoreBuyUrl('Amazon India', product?.name),
    formattedPrice: formatINR(product?.currentPrice)
  };

  const handleBuyNow = (e, url) => {
    e?.stopPropagation();
    const targetUrl = url || bestStore.url;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCompare = (e) => {
    e?.stopPropagation();
    onClose();
    navigate('/product-comparison', {
      state: {
        products: [product],
        fromModal: true
      }
    });
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    cartService.addToCart(product, 1, bestStore.store);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const productDescription =
    product?.description ||
    product?.aiInsight ||
    (Array.isArray(product?.features) && product?.features.length > 0
      ? product.features.join(' • ')
      : `Premium ${product?.category || 'consumer'} device engineered for optimal performance, durability, and value. Backed by verified multi-store retailer guarantees and manufacturer warranty.`);

  return (
    <div className="fixed inset-0 z-500 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
              <Icon name="Eye" size={18} />
            </span>
            <span className="text-sm font-semibold text-foreground">Product Specification & Live Rates</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top section: image + product info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
              <Image
                src={product?.image}
                alt={product?.imageAlt || product?.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {product?.brand || product?.store || 'Electronics'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">
                  In Stock
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground leading-snug">
                {product?.name}
              </h2>

              <div className="flex items-center space-x-3 pt-1">
                <div className="flex items-center space-x-1 text-warning">
                  <Icon name="Star" size={14} className="fill-current" />
                  <span className="text-sm font-bold text-foreground">
                    {Number(product?.rating || 4.5).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">({product?.reviews || '2.4k'})</span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground capitalize">
                  Category: {product?.category || 'General'}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 pt-2">
                <span className="text-2xl font-black text-foreground">
                  {formatINR(product?.currentPrice)}
                </span>
                {product?.originalPrice && product?.originalPrice > product?.currentPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatINR(product?.originalPrice)}
                  </span>
                )}
                {product?.discount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-success text-white">
                    {product?.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Description - Shown by default */}
          <div className="p-4 bg-muted/40 border border-border/80 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Icon name="FileText" size={14} />
              <span>Product Description</span>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">
              {productDescription}
            </p>
          </div>

          {/* Multi-Store Price Comparison Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-foreground">
                <Icon name="Store" size={15} className="text-primary" />
                <span>Multi-Store Live Prices (Amazon, Flipkart, Myntra, etc.)</span>
              </div>
              <span className="text-xs text-success font-medium">Real-time Rates</span>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-background">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground border-b border-border">
                    <th className="py-2.5 px-3 font-semibold">Shopping App / Store</th>
                    <th className="py-2.5 px-3 font-semibold">Exact Price</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Purchase Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {multiStorePrices.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        item.isBestDeal ? 'bg-success/5 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-foreground flex items-center space-x-2">
                        <span className="font-medium">{item.store}</span>
                        {item.isBestDeal && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-success text-white font-bold rounded">
                            Lowest
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-foreground">
                        {item.formattedPrice}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                            item.isBestDeal
                              ? 'bg-success/15 text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => handleBuyNow(e, item.url)}
                          className="inline-flex items-center space-x-1 text-xs text-primary hover:underline font-bold"
                        >
                          <span>Buy on {item.store}</span>
                          <Icon name="ExternalLink" size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer - Aligned Action Buttons (Compare, Add to Cart, Buy) */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground"
          >
            Close
          </Button>

          <div className="flex items-center space-x-2.5 flex-1 justify-end max-w-md">
            {/* Compare Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              className="flex-1 text-xs flex items-center justify-center space-x-1.5"
              title="Open product comparison view directly"
            >
              <Icon name="Scale" size={14} />
              <span>Compare</span>
            </Button>

            {/* Add to Cart Button */}
            <Button
              variant={addedToCart ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleAddToCart}
              className={`flex-1 text-xs flex items-center justify-center space-x-1.5 transition-all ${
                addedToCart
                  ? 'bg-success/15 text-success border-success/30 font-semibold'
                  : ''
              }`}
            >
              <Icon name={addedToCart ? 'Check' : 'ShoppingCart'} size={14} />
              <span>{addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}</span>
            </Button>

            {/* Buy Button */}
            <Button
              variant="default"
              size="sm"
              onClick={(e) => handleBuyNow(e, bestStore.url)}
              className="flex-1 text-xs flex items-center justify-center space-x-1.5 font-bold shadow-sm"
              title="Open purchase link in new web page"
            >
              <Icon name="ExternalLink" size={14} />
              <span>Buy Now</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;
