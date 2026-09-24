import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SmartRecommendations = ({ currentProducts, onAddToComparison, onAddToWatchlist }) => {
  const [activeCategory, setActiveCategory] = useState('alternatives');

  const categories = [
    { id: 'alternatives', label: 'Alternatives', icon: 'Shuffle' },
    { id: 'bundles', label: 'Bundle Deals', icon: 'Package' },
    { id: 'seasonal', label: 'Seasonal Trends', icon: 'Calendar' },
    { id: 'similar', label: 'Similar Products', icon: 'Copy' }
  ];

  const mockRecommendations = {
    alternatives: [
      {
        id: 'alt-1',
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        image: 'https://images.unsplash.com/photo-1707410420102-faff6eb0e033',
        imageAlt:
          'Samsung Galaxy S24 Ultra smartphone in titanium gray color showing front and back design',
        currentPrice: 1199,
        originalPrice: 1299,
        rating: 4.6,
        reviewCount: 8420,
        aiScore: 92,
        whyRecommended: 'Better camera system and longer battery life for similar price range',
        savings: 100,
        dealUrgency: 75,
        keyFeatures: ['200MP Camera', '5000mAh Battery', 'S Pen Included', '12GB RAM']
      },
      {
        id: 'alt-2',
        name: 'Google Pixel 8 Pro',
        brand: 'Google',
        image: 'https://images.unsplash.com/photo-1697514261129-5524c0a04f91',
        imageAlt: 'Google Pixel 8 Pro smartphone in obsidian black showing clean minimalist design',
        currentPrice: 999,
        originalPrice: 1099,
        rating: 4.5,
        reviewCount: 5680,
        aiScore: 89,
        whyRecommended: 'Superior AI photography and pure Android experience at lower cost',
        savings: 100,
        dealUrgency: 60,
        keyFeatures: ['AI Photography', 'Pure Android', '7 Years Updates', 'Magic Eraser']
      }
    ],

    bundles: [
      {
        id: 'bundle-1',
        name: 'iPhone 15 Pro + AirPods Pro Bundle',
        items: ['iPhone 15 Pro', 'AirPods Pro 2nd Gen', 'MagSafe Charger'],
        image: 'https://images.unsplash.com/photo-1627475723321-c401163967d3',
        imageAlt:
          'iPhone 15 Pro bundle with AirPods Pro and MagSafe charger arranged on white surface',
        bundlePrice: 1299,
        individualPrice: 1448,
        savings: 149,
        dealUrgency: 85,
        validUntil: '2025-11-15',
        whyRecommended: 'Complete ecosystem bundle with significant savings'
      },
      {
        id: 'bundle-2',
        name: 'MacBook Air + Magic Accessories Bundle',
        items: ['MacBook Air M2', 'Magic Mouse', 'Magic Keyboard', 'USB-C Hub'],
        image: 'https://images.unsplash.com/photo-1693283115722-9dfb7a81b3a4',
        imageAlt: 'MacBook Air M2 with Magic Mouse and keyboard accessories on modern desk setup',
        bundlePrice: 1399,
        individualPrice: 1597,
        savings: 198,
        dealUrgency: 70,
        validUntil: '2025-11-30',
        whyRecommended: 'Perfect productivity setup with premium accessories included'
      }
    ],

    seasonal: [
      {
        id: 'seasonal-1',
        trend: 'Black Friday Electronics',
        category: 'Smartphones',
        predictedDiscount: '15-25%',
        peakSavingsDate: '2025-11-29',
        confidence: 94,
        historicalData: 'Average 20% discount in previous years',
        recommendedAction: 'Wait 3 weeks for maximum savings',
        affectedProducts: ['iPhone 15 Series', 'Samsung Galaxy S24', 'Google Pixel 8']
      },
      {
        id: 'seasonal-2',
        trend: 'Holiday Gaming Deals',
        category: 'Gaming Laptops',
        predictedDiscount: '20-30%',
        peakSavingsDate: '2025-12-15',
        confidence: 87,
        historicalData: 'Gaming hardware typically drops 25% in December',
        recommendedAction: 'Consider waiting for holiday sales',
        affectedProducts: ['Gaming Laptops', 'Graphics Cards', 'Gaming Accessories']
      }
    ],

    similar: [
      {
        id: 'similar-1',
        name: 'OnePlus 12',
        brand: 'OnePlus',
        image: 'https://images.unsplash.com/photo-1603543245818-22c7984c76cd',
        imageAlt: 'OnePlus 12 smartphone in silky black finish showing sleek curved design',
        currentPrice: 799,
        originalPrice: 899,
        rating: 4.4,
        reviewCount: 3240,
        similarityScore: 87,
        whyRecommended: 'Similar performance with faster charging at lower price',
        keyDifferences: ['Faster 100W charging', 'Lower price', 'OxygenOS interface']
      },
      {
        id: 'similar-2',
        name: 'Xiaomi 14 Ultra',
        brand: 'Xiaomi',
        image: 'https://images.unsplash.com/photo-1687331780289-f2bec66a0550',
        imageAlt: 'Xiaomi 14 Ultra smartphone in white ceramic finish with prominent camera module',
        currentPrice: 899,
        originalPrice: 999,
        rating: 4.3,
        reviewCount: 2180,
        similarityScore: 82,
        whyRecommended: 'Exceptional camera quality with Leica partnership',
        keyDifferences: ['Leica cameras', 'Ceramic build', 'MIUI interface']
      }
    ]
  };

  const getUrgencyColor = (urgency) => {
    if (urgency >= 80) return 'bg-error text-white';
    if (urgency >= 60) return 'bg-warning text-white';
    return 'bg-success text-white';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-warning';
    return 'text-error';
  };

  const renderAlternatives = () => (
    <div className="space-y-4">
      {mockRecommendations?.alternatives?.map((product) => (
        <div key={product?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={product?.image}
                alt={product?.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground line-clamp-1">{product?.name}</h4>
                  <p className="text-sm text-muted-foreground">{product?.brand}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(product?.dealUrgency)}`}
                >
                  {product?.dealUrgency}% Urgent
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-foreground">
                    ₹{product?.currentPrice}
                  </span>
                  {product?.originalPrice > product?.currentPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product?.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={14} className="text-warning fill-current" />
                  <span className="text-sm text-foreground">{product?.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product?.reviewCount?.toLocaleString()})
                  </span>
                </div>
                <div className={`text-sm font-medium ${getScoreColor(product?.aiScore)}`}>
                  AI: {product?.aiScore}/100
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{product?.whyRecommended}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {product?.keyFeatures?.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddToComparison(product)}
                  iconName="Plus"
                >
                  Compare
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToWatchlist(product)}
                  iconName="Heart"
                >
                  Watch
                </Button>
                <div className="flex items-center space-x-1 text-success text-sm">
                  <Icon name="TrendingDown" size={14} />
                  <span>Save ₹{product?.savings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBundles = () => (
    <div className="space-y-4">
      {mockRecommendations?.bundles?.map((bundle) => (
        <div
          key={bundle?.id}
          className="bg-gradient-to-r from-success/5 to-primary/5 rounded-lg p-4 border border-border"
        >
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={bundle?.image}
                alt={bundle?.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-foreground">{bundle?.name}</h4>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(bundle?.dealUrgency)}`}
                >
                  Limited Time
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-bold text-success">₹{bundle?.bundlePrice}</div>
                  <div className="text-sm text-muted-foreground line-through">
                    ₹{bundle?.individualPrice}
                  </div>
                  <div className="text-sm font-medium text-success">Save ₹{bundle?.savings}</div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={14} />
                  <span>Valid until {new Date(bundle.validUntil)?.toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{bundle?.whyRecommended}</p>

              <div className="space-y-2 mb-3">
                <div className="text-sm font-medium text-foreground">Bundle includes:</div>
                <div className="flex flex-wrap gap-1">
                  {bundle?.items?.map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted text-foreground text-xs rounded"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="default" size="sm" iconName="ShoppingCart">
                  Get Bundle
                </Button>
                <Button variant="outline" size="sm" iconName="Info">
                  Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSeasonal = () => (
    <div className="space-y-4">
      {mockRecommendations?.seasonal?.map((trend) => (
        <div
          key={trend?.id}
          className="bg-gradient-to-r from-warning/5 to-accent/5 rounded-lg p-4 border border-border"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground">{trend?.trend}</h4>
                <p className="text-sm text-muted-foreground">{trend?.category}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-warning">{trend?.predictedDiscount}</div>
                <div className="text-xs text-muted-foreground">Expected Discount</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={14} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Peak Savings</span>
                </div>
                <p className="text-sm text-muted-foreground">{trend?.peakSavingsDate}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={14} className="text-success" />
                  <span className="text-sm font-medium text-foreground">Confidence</span>
                </div>
                <p className="text-sm text-success font-medium">{trend?.confidence}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Historical Data:</div>
              <p className="text-sm text-muted-foreground">{trend?.historicalData}</p>
            </div>

            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Icon name="Lightbulb" size={14} className="text-primary" />
                <span className="text-sm font-medium text-primary">AI Recommendation</span>
              </div>
              <p className="text-sm text-foreground">{trend?.recommendedAction}</p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Affected Products:</div>
              <div className="flex flex-wrap gap-1">
                {trend?.affectedProducts?.map((product, index) => (
                  <span key={index} className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                    {product}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSimilar = () => (
    <div className="space-y-4">
      {mockRecommendations?.similar?.map((product) => (
        <div key={product?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={product?.image}
                alt={product?.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{product?.name}</h4>
                  <p className="text-sm text-muted-foreground">{product?.brand}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">
                    {product?.similarityScore}% Similar
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-foreground">
                    ₹{product?.currentPrice}
                  </span>
                  {product?.originalPrice > product?.currentPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product?.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={14} className="text-warning fill-current" />
                  <span className="text-sm text-foreground">{product?.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product?.reviewCount?.toLocaleString()})
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{product?.whyRecommended}</p>

              <div className="space-y-2 mb-3">
                <div className="text-sm font-medium text-foreground">Key Differences:</div>
                <div className="flex flex-wrap gap-1">
                  {product?.keyDifferences?.map((diff, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent/10 text-accent text-xs rounded"
                    >
                      {diff}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddToComparison(product)}
                  iconName="Plus"
                >
                  Compare
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToWatchlist(product)}
                  iconName="Heart"
                >
                  Watch
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Smart Recommendations</h3>
          <div className="flex items-center space-x-2">
            <Icon name="Sparkles" size={16} className="text-accent" />
            <span className="text-sm text-muted-foreground">AI-Powered Suggestions</span>
          </div>
        </div>
      </div>
      {/* Category Tabs */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setActiveCategory(category?.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeCategory === category?.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon name={category?.icon} size={16} />
              <span>{category?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        {activeCategory === 'alternatives' && renderAlternatives()}
        {activeCategory === 'bundles' && renderBundles()}
        {activeCategory === 'seasonal' && renderSeasonal()}
        {activeCategory === 'similar' && renderSimilar()}
      </div>
    </div>
  );
};

export default SmartRecommendations;
