import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const AISearchBar = ({
  onSearch,
  onVoiceSearch,
  onCameraSearch,
  placeholder = 'Search products with AI assistance...',
  className = '',
  showConfidence = true,
  isProcessing = false
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const mockSuggestions = [
    { text: 'iPhone 15 Pro Max best price', confidence: 95 },
    { text: 'Gaming laptops under ₹83,000', confidence: 88 },
    { text: 'Wireless headphones comparison', confidence: 92 },
    { text: 'Smart TV deals Black Friday', confidence: 90 }
  ];

  useEffect(() => {
    if (query?.length > 2) {
      const filtered = mockSuggestions?.filter((s) =>
        s?.text?.toLowerCase()?.includes(query?.toLowerCase())
      );
      setSuggestions(filtered?.slice(0, 4));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    setQuery(value);

    // Simulate AI confidence scoring
    if (value?.length > 0) {
      const newConfidence = Math.min(95, Math.max(60, value?.length * 8));
      setConfidence(newConfidence);
    } else {
      setConfidence(0);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query?.trim() && onSearch) {
      onSearch(query?.trim());
      setIsExpanded(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion?.text);
    setConfidence(suggestion?.confidence);
    if (onSearch) {
      onSearch(suggestion?.text);
    }
    setIsExpanded(false);
  };

  const handleVoiceClick = () => {
    setIsListening(!isListening);
    if (onVoiceSearch) {
      onVoiceSearch();
    }
  };

  const handleCameraClick = () => {
    if (onCameraSearch) {
      onCameraSearch();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = (e) => {
    // Delay to allow suggestion clicks
    setTimeout(() => {
      if (!e?.currentTarget?.contains(document.activeElement)) {
        setIsExpanded(false);
      }
    }, 150);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative transition-all duration-300 ${isExpanded ? 'scale-105' : ''}`}>
          {/* Search Input */}
          <div className="relative">
            <Icon
              name="Search"
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
            />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full pl-10 pr-24 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth text-sm"
              disabled={isProcessing}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceClick}
                className={`h-8 w-8 transition-colors ${isListening ? 'bg-error/10 text-error' : 'hover:bg-primary/10'}`}
                disabled={isProcessing}
              >
                <Icon name={isListening ? 'MicOff' : 'Mic'} size={16} />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCameraClick}
                className="h-8 w-8 hover:bg-primary/10"
                disabled={isProcessing}
              >
                <Icon name="Camera" size={16} />
              </Button>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="absolute inset-0 bg-surface/80 rounded-lg flex items-center justify-center">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>AI Processing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Confidence Indicator */}
          {showConfidence && confidence > 0 && !isProcessing && (
            <div className="absolute -bottom-1 left-3 right-24">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    confidence >= 80 ? 'bg-success' : confidence >= 60 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded State Info */}
        {isExpanded && !isProcessing && (
          <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-surface border border-border rounded-lg shadow-elevated animate-slide-up z-200">
            {query?.length === 0 ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Sparkles" size={16} className="text-accent" />
                  <span>AI-powered search ready</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Mic" size={14} />
                    <span>Voice search</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Camera" size={14} />
                    <span>Image search</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Zap" size={14} />
                    <span>Smart suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="TrendingUp" size={14} />
                    <span>Price tracking</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {showConfidence && confidence > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Icon name="Brain" size={16} className="text-accent" />
                      <span className="text-muted-foreground">AI Confidence:</span>
                    </div>
                    <div
                      className={`font-medium ${
                        confidence >= 80
                          ? 'text-success'
                          : confidence >= 60
                            ? 'text-warning'
                            : 'text-error'
                      }`}
                    >
                      {confidence}%
                    </div>
                  </div>
                )}

                {suggestions?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">Suggestions:</div>
                    {suggestions?.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center justify-between p-2 text-sm text-left hover:bg-muted rounded-md transition-smooth"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon name="Search" size={14} className="text-muted-foreground" />
                          <span>{suggestion?.text}</span>
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            suggestion?.confidence >= 80
                              ? 'text-success'
                              : suggestion?.confidence >= 60
                                ? 'text-warning'
                                : 'text-error'
                          }`}
                        >
                          {suggestion?.confidence}%
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default AISearchBar;
