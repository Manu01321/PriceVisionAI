import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIRefinementPanel = ({ searchQuery, onRefinementSelect, onAlternativeSelect }) => {
  const [activeTab, setActiveTab] = useState('refinements');

  // Mock AI-generated refinements and alternatives
  const refinements = [
    {
      id: 1,
      query: `${searchQuery} wireless`,
      confidence: 92,
      reason: "Added \'wireless\' based on current trends",
      resultCount: 1247
    },
    {
      id: 2,
      query: `${searchQuery} under $100`,
      confidence: 88,
      reason: "Price filter for budget-conscious shoppers",
      resultCount: 856
    },
    {
      id: 3,
      query: `${searchQuery} 2024 model`,
      confidence: 85,
      reason: "Latest models often have better features",
      resultCount: 432
    },
    {
      id: 4,
      query: `${searchQuery} with warranty`,
      confidence: 79,
      reason: "Warranty protection adds value",
      resultCount: 623
    }
  ];

  const alternatives = [
    {
      id: 1,
      name: "Premium Alternative",
      description: "Higher-end option with advanced features",
      confidence: 94,
      priceRange: "$200 - $500",
      keyFeatures: ["Premium build quality", "Extended warranty", "Advanced features"],
      icon: "Crown"
    },
    {
      id: 2,
      name: "Budget-Friendly Option",
      description: "Cost-effective choice with essential features",
      confidence: 89,
      priceRange: "$50 - $150",
      keyFeatures: ["Great value", "Essential features", "Reliable brand"],
      icon: "DollarSign"
    },
    {
      id: 3,
      name: "Eco-Friendly Choice",
      description: "Sustainable option with environmental benefits",
      confidence: 82,
      priceRange: "$100 - $300",
      keyFeatures: ["Sustainable materials", "Energy efficient", "Recyclable"],
      icon: "Leaf"
    },
    {
      id: 4,
      name: "Professional Grade",
      description: "Commercial-quality for demanding users",
      confidence: 91,
      priceRange: "$300 - $800",
      keyFeatures: ["Professional quality", "Heavy-duty build", "Extended support"],
      icon: "Briefcase"
    }
  ];

  const smartKeywords = [
    { keyword: "wireless", boost: "+15% relevance", color: "bg-primary/10 text-primary" },
    { keyword: "portable", boost: "+12% relevance", color: "bg-secondary/10 text-secondary" },
    { keyword: "durable", boost: "+10% relevance", color: "bg-success/10 text-success" },
    { keyword: "compact", boost: "+8% relevance", color: "bg-warning/10 text-warning" },
    { keyword: "premium", boost: "+6% relevance", color: "bg-accent/10 text-accent" }
  ];

  const tabs = [
    { id: 'refinements', label: 'Refinements', icon: 'Search', count: refinements?.length },
    { id: 'alternatives', label: 'Alternatives', icon: 'Lightbulb', count: alternatives?.length },
    { id: 'keywords', label: 'Keywords', icon: 'Tag', count: smartKeywords?.length }
  ];

  const handleRefinementClick = (refinement) => {
    if (onRefinementSelect) {
      onRefinementSelect(refinement?.query);
    }
  };

  const handleAlternativeClick = (alternative) => {
    if (onAlternativeSelect) {
      onAlternativeSelect(alternative);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 80) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Icon name="Sparkles" size={16} color="white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Suggestions</h3>
            <p className="text-xs text-muted-foreground">Smart refinements for better results</p>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab?.id
                ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon name={tab?.icon} size={14} />
            <span>{tab?.label}</span>
            <div className="px-1.5 py-0.5 bg-muted text-xs rounded-full">
              {tab?.count}
            </div>
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'refinements' && (
          <div className="space-y-3">
            {refinements?.map((refinement) => (
              <button
                key={refinement?.id}
                onClick={() => handleRefinementClick(refinement)}
                className="w-full p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon name="Search" size={14} className="text-primary" />
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        "{refinement?.query}"
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{refinement?.reason}</p>
                  </div>
                  <div className={`text-xs font-medium ${getConfidenceColor(refinement?.confidence)}`}>
                    {refinement?.confidence}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{refinement?.resultCount?.toLocaleString()} results</span>
                  <Icon name="ArrowRight" size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-3">
            {alternatives?.map((alternative) => (
              <button
                key={alternative?.id}
                onClick={() => handleAlternativeClick(alternative)}
                className="w-full p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={alternative?.icon} size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {alternative?.name}
                      </h4>
                      <div className={`text-xs font-medium ${getConfidenceColor(alternative?.confidence)}`}>
                        {alternative?.confidence}%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alternative?.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{alternative?.priceRange}</span>
                      <Icon name="ArrowRight" size={12} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {alternative?.keyFeatures?.slice(0, 2)?.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/5 text-primary text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {alternative?.keyFeatures?.length > 2 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                          +{alternative?.keyFeatures?.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Smart keywords to enhance your search results:
            </div>
            <div className="space-y-2">
              {smartKeywords?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleRefinementClick(`${searchQuery} ${item?.keyword}`)}
                  className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${item?.color}`}>
                      {item?.keyword}
                    </div>
                    <span className="text-xs text-muted-foreground">{item?.boost}</span>
                  </div>
                  <Icon name="Plus" size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
            
            {/* Custom Keyword Input */}
            <div className="pt-3 border-t border-border">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add custom keyword..."
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button size="sm" variant="outline">
                  <Icon name="Plus" size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRefinementPanel;