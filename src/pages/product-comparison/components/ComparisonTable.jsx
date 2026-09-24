import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ComparisonTable = ({ products, onRemoveProduct, onAddToWatchlist, onSetPriceAlert }) => {
  const [expandedSpecs, setExpandedSpecs] = useState({});

  const toggleSpecs = (productId) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [productId]: !prev?.[productId]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getUrgencyColor = (urgency) => {
    if (urgency >= 80) return 'bg-error text-white';
    if (urgency >= 60) return 'bg-warning text-white';
    return 'bg-success text-white';
  };

  if (!products || products?.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Products to Compare</h3>
        <p className="text-muted-foreground">Add products from search results to start comparing</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Product Comparison</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Zap" size={16} className="text-accent" />
            <span>AI-Powered Analysis</span>
          </div>
        </div>
      </div>
      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <td className="p-4 font-medium text-muted-foreground w-48">Product</td>
              {products?.map((product) => (
                <td key={product?.id} className="p-4 min-w-80">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveProduct(product?.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-surface border border-border hover:bg-error hover:text-white"
                    >
                      <Icon name="X" size={12} />
                    </Button>
                    
                    <div className="space-y-3">
                      <div className="aspect-square w-24 mx-auto bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={product?.image}
                          alt={product?.imageAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="text-center">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                          {product?.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product?.brand}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {/* Price Row */}
            <tr className="border-b border-border">
              <td className="p-4 font-medium text-foreground">Price</td>
              {products?.map((product) => (
                <td key={product?.id} className="p-4">
                  <div className="space-y-2">
                    <div className="text-xl font-bold text-foreground">
                      ₹{product?.currentPrice}
                    </div>
                    {product?.originalPrice && product?.originalPrice > product?.currentPrice && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product?.originalPrice}
                        </span>
                        <span className="text-sm text-success font-medium">
                          {Math.round(((product?.originalPrice - product?.currentPrice) / product?.originalPrice) * 100)}% off
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Icon name="TrendingDown" size={14} className="text-success" />
                      <span className="text-xs text-success">
                        ₹{product?.priceChange} in 30 days
                      </span>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* AI Scores Row */}
            <tr className="border-b border-border">
              <td className="p-4 font-medium text-foreground">AI Scores</td>
              {products?.map((product) => (
                <td key={product?.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Value</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreBg(product?.aiScores?.value)} ${getScoreColor(product?.aiScores?.value)}`}>
                        {product?.aiScores?.value}/100
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quality</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreBg(product?.aiScores?.quality)} ${getScoreColor(product?.aiScores?.quality)}`}>
                        {product?.aiScores?.quality}/100
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Deal Urgency</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(product?.aiScores?.urgency)}`}>
                        {product?.aiScores?.urgency}/100
                      </div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr className="border-b border-border">
              <td className="p-4 font-medium text-foreground">Rating</td>
              {products?.map((product) => (
                <td key={product?.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)]?.map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            size={16}
                            className={i < Math.floor(product?.rating) ? 'text-warning fill-current' : 'text-muted-foreground'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {product?.rating}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product?.reviewCount?.toLocaleString()} reviews
                    </div>
                    {product?.fakeReviewAlert && (
                      <div className="flex items-center space-x-1 text-xs text-error">
                        <Icon name="AlertTriangle" size={12} />
                        <span>Fake reviews detected</span>
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Key Specifications */}
            <tr className="border-b border-border">
              <td className="p-4 font-medium text-foreground">Key Specs</td>
              {products?.map((product) => (
                <td key={product?.id} className="p-4">
                  <div className="space-y-2">
                    {product?.keySpecs?.slice(0, expandedSpecs?.[product?.id] ? product?.keySpecs?.length : 3)?.map((spec, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{spec?.name}</span>
                        <span className="text-foreground font-medium">{spec?.value}</span>
                      </div>
                    ))}
                    {product?.keySpecs?.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSpecs(product?.id)}
                        className="text-xs text-primary"
                      >
                        {expandedSpecs?.[product?.id] ? 'Show Less' : `Show ${product?.keySpecs?.length - 3} More`}
                      </Button>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* AI Analysis */}
            <tr className="border-b border-border">
              <td className="p-4 font-medium text-foreground">AI Analysis</td>
              {products?.map((product) => (
                <td key={product?.id} className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-success mb-1">Pros</h4>
                      <ul className="space-y-1">
                        {product?.aiAnalysis?.pros?.map((pro, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start space-x-1">
                            <Icon name="Plus" size={12} className="text-success mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-error mb-1">Cons</h4>
                      <ul className="space-y-1">
                        {product?.aiAnalysis?.cons?.map((con, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start space-x-1">
                            <Icon name="Minus" size={12} className="text-error mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Actions Row */}
            <tr>
              <td className="p-4 font-medium text-foreground">Actions</td>
              {products?.map((product) => (
                <td key={product?.id} className="p-4">
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      iconName="ExternalLink"
                      iconPosition="right"
                    >
                      Buy Now - ₹{product?.currentPrice}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddToWatchlist(product?.id)}
                        iconName="Heart"
                      >
                        Watch
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetPriceAlert(product?.id)}
                        iconName="Bell"
                      >
                        Alert
                      </Button>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;