import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const CompetitorAnalysis = ({ productId }) => {
  const [sortBy, setSortBy] = useState('price');
  const [showDetails, setShowDetails] = useState({});

  // Mock competitor data
  const competitors = [
    {
      id: 'amazon',
      name: 'Amazon',
      logo: 'https://images.unsplash.com/photo-1704204656144-3dd12c110dd8',
      logoAlt: 'Amazon logo on white background with orange smile arrow',
      currentPrice: 729,
      originalPrice: 899,
      discount: 19,
      inStock: true,
      shipping: 'Free',
      shippingDays: 1,
      rating: 4.5,
      reviews: 12847,
      priceHistory: [899, 879, 859, 849, 829, 819, 799, 789, 779, 769, 759, 749, 739, 729],
      lastUpdated: '2 min ago',
      trustScore: 98,
      returnPolicy: '30 days',
      warranty: '1 year manufacturer'
    },
    {
      id: 'bestbuy',
      name: 'Best Buy',
      logo: 'https://images.unsplash.com/photo-1724212148187-562d8802fbdd',
      logoAlt: 'Best Buy store front with blue and yellow signage',
      currentPrice: 759,
      originalPrice: 929,
      discount: 18,
      inStock: true,
      shipping: 'Free',
      shippingDays: 2,
      rating: 4.3,
      reviews: 8934,
      priceHistory: [929, 909, 889, 879, 859, 849, 829, 819, 809, 799, 789, 779, 769, 759],
      lastUpdated: '5 min ago',
      trustScore: 95,
      returnPolicy: '15 days',
      warranty: '1 year manufacturer + Geek Squad'
    },
    {
      id: 'walmart',
      name: 'Walmart',
      logo: 'https://images.unsplash.com/photo-1611154379317-339daf919a9a',
      logoAlt: 'Walmart store exterior with blue and white signage and shopping carts',
      currentPrice: 749,
      originalPrice: 919,
      discount: 18,
      inStock: true,
      shipping: '₹499',
      shippingDays: 3,
      rating: 4.1,
      reviews: 5672,
      priceHistory: [919, 899, 879, 869, 849, 839, 819, 809, 799, 789, 779, 769, 759, 749],
      lastUpdated: '8 min ago',
      trustScore: 92,
      returnPolicy: '90 days',
      warranty: '1 year manufacturer'
    },
    {
      id: 'target',
      name: 'Target',
      logo: 'https://images.unsplash.com/photo-1607016552642-b667f4a0a4e2',
      logoAlt: 'Target store front with red bullseye logo and modern architecture',
      currentPrice: 779,
      originalPrice: 939,
      discount: 17,
      inStock: false,
      shipping: 'Free',
      shippingDays: 5,
      rating: 4.2,
      reviews: 3421,
      priceHistory: [939, 929, 909, 899, 879, 869, 849, 839, 829, 819, 809, 799, 789, 779],
      lastUpdated: '12 min ago',
      trustScore: 89,
      returnPolicy: '30 days',
      warranty: '1 year manufacturer'
    },
    {
      id: 'newegg',
      name: 'Newegg',
      logo: 'https://images.unsplash.com/photo-1527226984552-c117c43d0fef',
      logoAlt: 'Computer hardware store display with various electronic components and devices',
      currentPrice: 799,
      originalPrice: 949,
      discount: 16,
      inStock: true,
      shipping: '₹830',
      shippingDays: 4,
      rating: 4.0,
      reviews: 2156,
      priceHistory: [949, 939, 919, 909, 889, 879, 859, 849, 839, 829, 819, 809, 799, 799],
      lastUpdated: '15 min ago',
      trustScore: 87,
      returnPolicy: '30 days',
      warranty: '1 year manufacturer'
    }
  ];

  const sortedCompetitors = [...competitors]?.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a?.currentPrice - b?.currentPrice;
      case 'discount':
        return b?.discount - a?.discount;
      case 'rating':
        return b?.rating - a?.rating;
      case 'trust':
        return b?.trustScore - a?.trustScore;
      default:
        return 0;
    }
  });

  const toggleDetails = (competitorId) => {
    setShowDetails((prev) => ({
      ...prev,
      [competitorId]: !prev?.[competitorId]
    }));
  };

  const getBestDealBadge = (competitor, index) => {
    if (index === 0 && sortBy === 'price') {
      return (
        <div className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-1 rounded-full font-medium">
          Best Price
        </div>
      );
    }
    if (competitor?.discount >= 19) {
      return (
        <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
          Best Deal
        </div>
      );
    }
    return null;
  };

  const getStockStatus = (inStock) => {
    return inStock ? (
      <div className="flex items-center space-x-1 text-success">
        <Icon name="CheckCircle" size={14} />
        <span className="text-xs">In Stock</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1 text-error">
        <Icon name="XCircle" size={14} />
        <span className="text-xs">Out of Stock</span>
      </div>
    );
  };

  const getTrustBadge = (score) => {
    if (score >= 95) return { color: 'text-success', bg: 'bg-success/10', label: 'Excellent' };
    if (score >= 90) return { color: 'text-primary', bg: 'bg-primary/10', label: 'Very Good' };
    if (score >= 85) return { color: 'text-warning', bg: 'bg-warning/10', label: 'Good' };
    return { color: 'text-error', bg: 'bg-error/10', label: 'Fair' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Competitor Price Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Real-time price comparison across major retailers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="price">Price (Low to High)</option>
            <option value="discount">Discount %</option>
            <option value="rating">Rating</option>
            <option value="trust">Trust Score</option>
          </select>
        </div>
      </div>
      {/* Competitor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedCompetitors?.map((competitor, index) => {
          const trustBadge = getTrustBadge(competitor?.trustScore);

          return (
            <div
              key={competitor?.id}
              className="relative bg-surface border border-border rounded-lg p-6 hover:shadow-soft transition-smooth"
            >
              {getBestDealBadge(competitor, index)}
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <Image
                      src={competitor?.logo}
                      alt={competitor?.logoAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{competitor?.name}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={12} className="text-warning fill-current" />
                        <span className="text-xs text-muted-foreground">
                          {competitor?.rating} ({competitor?.reviews?.toLocaleString()})
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${trustBadge?.bg} ${trustBadge?.color}`}
                      >
                        {trustBadge?.label}
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => toggleDetails(competitor?.id)}>
                  <Icon
                    name={showDetails?.[competitor?.id] ? 'ChevronUp' : 'ChevronDown'}
                    size={16}
                  />
                </Button>
              </div>
              {/* Price Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-foreground">
                      ₹{competitor?.currentPrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{competitor?.originalPrice}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-medium text-success">
                      {competitor?.discount}% off
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Save ₹{competitor?.originalPrice - competitor?.currentPrice}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {getStockStatus(competitor?.inStock)}
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <Icon name="Truck" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {competitor?.shipping === 'Free' ? 'Free shipping' : competitor?.shipping}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {competitor?.shippingDays} day{competitor?.shippingDays > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  variant={competitor?.inStock ? 'default' : 'outline'}
                  size="sm"
                  disabled={!competitor?.inStock}
                  className="flex-1"
                  iconName="ExternalLink"
                  iconPosition="right"
                >
                  {competitor?.inStock ? 'Buy Now' : 'Notify When Available'}
                </Button>
                <Button variant="outline" size="sm" iconName="Heart">
                  Track
                </Button>
              </div>
              {/* Expanded Details */}
              {showDetails?.[competitor?.id] && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Return Policy:</span>
                      <span className="ml-2 text-foreground">{competitor?.returnPolicy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warranty:</span>
                      <span className="ml-2 text-foreground">{competitor?.warranty}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trust Score:</span>
                      <span className="ml-2 text-foreground">{competitor?.trustScore}/100</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="ml-2 text-foreground">{competitor?.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Mini Price History */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">14-Day Price Trend</div>
                    <div className="flex items-end space-x-1 h-8">
                      {competitor?.priceHistory?.slice(-14)?.map((price, idx) => {
                        const height =
                          ((price - Math.min(...competitor?.priceHistory)) /
                            (Math.max(...competitor?.priceHistory) -
                              Math.min(...competitor?.priceHistory))) *
                          100;
                        return (
                          <div
                            key={idx}
                            className="bg-primary/20 rounded-t flex-1"
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`₹${price}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* Last Updated */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} />
                  <span>Updated {competitor?.lastUpdated}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Shield" size={12} />
                  <span>Trust: {competitor?.trustScore}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Icon name="BarChart3" size={20} className="text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="text-md font-medium text-foreground mb-2">Price Analysis Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingDown" size={14} className="text-success" />
                  <span className="text-muted-foreground">Best Price:</span>
                  <span className="font-medium text-foreground">
                    ₹{Math.min(...competitors?.map((c) => c?.currentPrice))}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Percent" size={14} className="text-accent" />
                  <span className="text-muted-foreground">Max Discount:</span>
                  <span className="font-medium text-foreground">
                    {Math.max(...competitors?.map((c) => c?.discount))}%
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon name="DollarSign" size={14} className="text-warning" />
                  <span className="text-muted-foreground">Price Range:</span>
                  <span className="font-medium text-foreground">
                    ₹{Math.min(...competitors?.map((c) => c?.currentPrice))} - ₹
                    {Math.max(...competitors?.map((c) => c?.currentPrice))}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Package" size={14} className="text-primary" />
                  <span className="text-muted-foreground">In Stock:</span>
                  <span className="font-medium text-foreground">
                    {competitors?.filter((c) => c?.inStock)?.length}/{competitors?.length} retailers
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon name="Star" size={14} className="text-warning" />
                  <span className="text-muted-foreground">Avg Rating:</span>
                  <span className="font-medium text-foreground">
                    {(
                      competitors?.reduce((sum, c) => sum + c?.rating, 0) / competitors?.length
                    )?.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={14} className="text-success" />
                  <span className="text-muted-foreground">Avg Trust:</span>
                  <span className="font-medium text-foreground">
                    {Math.round(
                      competitors?.reduce((sum, c) => sum + c?.trustScore, 0) / competitors?.length
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
