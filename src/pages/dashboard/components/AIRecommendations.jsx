import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const AIRecommendations = ({ recommendations = [], onViewProduct, onDismiss }) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-error';
  };

  const getReasonIcon = (reason) => {
    switch (reason) {
      case 'price_drop': return 'TrendingDown';
      case 'similar_purchase': return 'Users';
      case 'seasonal_trend': return 'Calendar';
      case 'ai_analysis': return 'Brain';
      default: return 'Sparkles';
    }
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
          <div key={rec?.id} className="bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20 rounded-lg p-4 hover:shadow-soft transition-smooth">
            <div className="flex items-start space-x-4">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <Image
                  src={rec?.image}
                  alt={rec?.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Recommendation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2">
                    {rec?.title}
                  </h4>
                  <div className={`text-xs font-medium ${getConfidenceColor(rec?.confidence)}`}>
                    {rec?.confidence}% match
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Icon name={getReasonIcon(rec?.reason)} size={14} className="text-accent" />
                  <span className="text-sm text-muted-foreground">
                    {rec?.reasonText}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-foreground">
                      ₹{rec?.price}
                    </span>
                    {rec?.originalPrice && rec?.originalPrice > rec?.price && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{rec?.originalPrice}
                        </span>
                        <span className="text-sm text-success font-medium">
                          {Math.round(((rec?.originalPrice - rec?.price) / rec?.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(rec?.id)}
                    >
                      <Icon name="X" size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProduct(rec)}
                    >
                      View
                    </Button>
                  </div>
                </div>

                {rec?.aiInsight && (
                  <div className="mt-2 p-2 bg-accent/10 rounded border border-accent/20">
                    <div className="flex items-start space-x-2">
                      <Icon name="Brain" size={14} className="text-accent mt-0.5" />
                      <p className="text-xs text-foreground">
                        {rec?.aiInsight}
                      </p>
                    </div>
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

export default AIRecommendations;