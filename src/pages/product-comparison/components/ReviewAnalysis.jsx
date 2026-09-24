import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReviewAnalysis = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(products?.[0]?.id);
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = [
    { id: 'summary', label: 'Summary', icon: 'FileText' },
    { id: 'sentiment', label: 'Sentiment', icon: 'Heart' },
    { id: 'keywords', label: 'Keywords', icon: 'Tag' },
    { id: 'authenticity', label: 'Authenticity', icon: 'Shield' }
  ];

  const selectedProductData = products?.find(p => p?.id === selectedProduct);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'neutral': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-success/10';
      case 'negative': return 'bg-error/10';
      case 'neutral': return 'bg-warning/10';
      default: return 'bg-muted/10';
    }
  };

  if (!selectedProductData) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <Icon name="MessageSquare" size={32} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No review data available</p>
      </div>
    );
  }

  const renderSummaryTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="ThumbsUp" size={16} className="text-success" />
            <h4 className="font-medium text-foreground">What Users Love</h4>
          </div>
          <ul className="space-y-2">
            {selectedProductData?.reviewAnalysis?.positiveHighlights?.map((highlight, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                <Icon name="Plus" size={12} className="text-success mt-1 flex-shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="ThumbsDown" size={16} className="text-error" />
            <h4 className="font-medium text-foreground">Common Complaints</h4>
          </div>
          <ul className="space-y-2">
            {selectedProductData?.reviewAnalysis?.negativeHighlights?.map((highlight, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                <Icon name="Minus" size={12} className="text-error mt-1 flex-shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Brain" size={16} className="text-accent" />
          <h4 className="font-medium text-foreground">AI Summary</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedProductData?.reviewAnalysis?.aiSummary}
        </p>
      </div>
    </div>
  );

  const renderSentimentTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(selectedProductData?.reviewAnalysis?.sentimentBreakdown)?.map(([sentiment, data]) => (
          <div key={sentiment} className={`${getSentimentBg(sentiment)} rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold ${getSentimentColor(sentiment)}`}>
              {data?.percentage}%
            </div>
            <div className="text-sm text-muted-foreground capitalize">{sentiment}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data?.count?.toLocaleString()} reviews
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Recent Sentiment Trends</h4>
        {selectedProductData?.reviewAnalysis?.sentimentTrends?.map((trend, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon 
                name={trend?.sentiment === 'positive' ? 'TrendingUp' : trend?.sentiment === 'negative' ? 'TrendingDown' : 'Minus'} 
                size={16} 
                className={getSentimentColor(trend?.sentiment)} 
              />
              <div>
                <div className="text-sm font-medium text-foreground">{trend?.period}</div>
                <div className="text-xs text-muted-foreground">{trend?.description}</div>
              </div>
            </div>
            <div className={`text-sm font-medium ${getSentimentColor(trend?.sentiment)}`}>
              {trend?.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKeywordsTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-foreground mb-3">Most Mentioned Features</h4>
        <div className="flex flex-wrap gap-2">
          {selectedProductData?.reviewAnalysis?.topKeywords?.map((keyword, index) => (
            <div key={index} className="flex items-center space-x-2 bg-muted/30 rounded-full px-3 py-1">
              <span className="text-sm text-foreground">{keyword?.word}</span>
              <div className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {keyword?.mentions}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-foreground mb-3">Feature Ratings</h4>
        <div className="space-y-3">
          {selectedProductData?.reviewAnalysis?.featureRatings?.map((feature, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{feature?.name}</span>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)]?.map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={12}
                        className={i < Math.floor(feature?.rating) ? 'text-warning fill-current' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{feature?.rating}</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(feature?.rating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAuthenticityTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Shield" size={16} className="text-success" />
            <h4 className="font-medium text-foreground">Authenticity Score</h4>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {selectedProductData?.reviewAnalysis?.authenticityScore}%
            </div>
            <div className="text-sm text-muted-foreground">Verified Reviews</div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <h4 className="font-medium text-foreground">Suspicious Activity</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fake Reviews</span>
              <span className="text-error font-medium">{selectedProductData?.reviewAnalysis?.suspiciousReviews}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bot Activity</span>
              <span className="text-warning font-medium">{selectedProductData?.reviewAnalysis?.botActivity}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Review Quality Indicators</h4>
        {selectedProductData?.reviewAnalysis?.qualityIndicators?.map((indicator, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon 
                name={indicator?.status === 'good' ? 'CheckCircle' : indicator?.status === 'warning' ? 'AlertCircle' : 'XCircle'} 
                size={16} 
                className={indicator?.status === 'good' ? 'text-success' : indicator?.status === 'warning' ? 'text-warning' : 'text-error'} 
              />
              <div>
                <div className="text-sm font-medium text-foreground">{indicator?.metric}</div>
                <div className="text-xs text-muted-foreground">{indicator?.description}</div>
              </div>
            </div>
            <div className={`text-sm font-medium ${
              indicator?.status === 'good' ? 'text-success' : 
              indicator?.status === 'warning' ? 'text-warning' : 'text-error'
            }`}>
              {indicator?.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Review Analysis</h3>
          <div className="flex items-center space-x-2">
            <Icon name="MessageSquare" size={16} className="text-accent" />
            <span className="text-sm text-muted-foreground">AI-Powered Insights</span>
          </div>
        </div>

        {/* Product Selector */}
        <div className="flex flex-wrap gap-2">
          {products?.map((product) => (
            <Button
              key={product?.id}
              variant={selectedProduct === product?.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProduct(product?.id)}
              className="text-xs"
            >
              {product?.name?.split(' ')?.slice(0, 2)?.join(' ')}
            </Button>
          ))}
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'sentiment' && renderSentimentTab()}
        {activeTab === 'keywords' && renderKeywordsTab()}
        {activeTab === 'authenticity' && renderAuthenticityTab()}
      </div>
    </div>
  );
};

export default ReviewAnalysis;