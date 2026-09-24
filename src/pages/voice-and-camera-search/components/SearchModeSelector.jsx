import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SearchModeSelector = ({ activeMode, onModeChange, className = '' }) => {
  const searchModes = [
    {
      id: 'voice',
      name: 'Voice Search',
      icon: 'Mic',
      description: 'Speak your product search',
      color: 'bg-primary',
      features: ['Speech-to-text', 'Natural language', 'Hands-free']
    },
    {
      id: 'camera',
      name: 'Photo Search',
      icon: 'Camera',
      description: 'Capture product images',
      color: 'bg-secondary',
      features: ['Visual similarity', 'AI recognition', 'Instant results']
    },
    {
      id: 'barcode',
      name: 'Barcode Scan',
      icon: 'Scan',
      description: 'Scan product barcodes',
      color: 'bg-success',
      features: ['Precise matching', 'Quick lookup', 'Product details']
    },
    {
      id: 'upload',
      name: 'Upload Image',
      icon: 'Upload',
      description: 'Upload existing photos',
      color: 'bg-warning',
      features: ['Gallery access', 'Batch upload', 'AI analysis']
    }
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {searchModes?.map((mode) => (
          <button
            key={mode?.id}
            onClick={() => onModeChange(mode?.id)}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              activeMode === mode?.id
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                activeMode === mode?.id ? mode?.color : 'bg-muted'
              }`}
            >
              <Icon
                name={mode?.icon}
                size={20}
                color={activeMode === mode?.id ? 'white' : 'currentColor'}
              />
            </div>

            {/* Content */}
            <h3
              className={`font-medium text-sm mb-1 ${
                activeMode === mode?.id ? 'text-primary' : 'text-foreground'
              }`}
            >
              {mode?.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{mode?.description}</p>

            {/* Active Indicator */}
            {activeMode === mode?.id && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full">
                <div className="w-full h-full bg-primary rounded-full animate-ping opacity-75"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      {/* Active Mode Details */}
      {activeMode && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                searchModes?.find((m) => m?.id === activeMode)?.color || 'bg-muted'
              }`}
            >
              <Icon
                name={searchModes?.find((m) => m?.id === activeMode)?.icon || 'Search'}
                size={24}
                color="white"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                {searchModes?.find((m) => m?.id === activeMode)?.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {searchModes?.find((m) => m?.id === activeMode)?.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {searchModes
                  ?.find((m) => m?.id === activeMode)
                  ?.features?.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      <Icon name="Check" size={12} className="mr-1" />
                      {feature}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Mode-specific Tips */}
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Icon name="Lightbulb" size={14} className="mr-2 text-warning" />
              Tips for best results
            </h4>

            {activeMode === 'voice' && (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Speak clearly and at normal pace</li>
                <li>• Include brand names and specific models</li>
                <li>• Use natural language like "Find iPhone 15 Pro Max"</li>
              </ul>
            )}

            {activeMode === 'camera' && (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure good lighting and clear focus</li>
                <li>• Center the product in the frame</li>
                <li>• Avoid reflections and shadows</li>
              </ul>
            )}

            {activeMode === 'barcode' && (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hold steady and align barcode in frame</li>
                <li>• Ensure barcode is clean and undamaged</li>
                <li>• Keep camera 4-6 inches from barcode</li>
              </ul>
            )}

            {activeMode === 'upload' && (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use high-quality images for better results</li>
                <li>• Multiple angles improve accuracy</li>
                <li>• Supported formats: JPG, PNG, WebP</li>
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Quick Switch Buttons */}
      <div className="flex items-center justify-center space-x-2 mt-4">
        {searchModes?.map((mode) => (
          <Button
            key={mode?.id}
            onClick={() => onModeChange(mode?.id)}
            variant={activeMode === mode?.id ? 'default' : 'outline'}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Icon name={mode?.icon} size={14} />
            <span className="hidden sm:inline">{mode?.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SearchModeSelector;
