import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ShoppingPreferences = ({ preferences, onUpdatePreferences }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const categories = [
    { id: 'electronics', label: 'Electronics', icon: 'Smartphone' },
    { id: 'fashion', label: 'Fashion & Clothing', icon: 'Shirt' },
    { id: 'home', label: 'Home & Garden', icon: 'Home' },
    { id: 'sports', label: 'Sports & Outdoors', icon: 'Dumbbell' },
    { id: 'books', label: 'Books & Media', icon: 'Book' },
    { id: 'automotive', label: 'Automotive', icon: 'Car' },
    { id: 'health', label: 'Health & Beauty', icon: 'Heart' },
    { id: 'toys', label: 'Toys & Games', icon: 'Gamepad2' }
  ];

  const priceSensitivityLevels = [
    { id: 'low', label: 'Low', description: 'I prioritize quality over price', color: 'text-error' },
    { id: 'medium', label: 'Medium', description: 'I balance quality and price', color: 'text-warning' },
    { id: 'high', label: 'High', description: 'I always look for the best deals', color: 'text-success' }
  ];

  const notificationTiming = [
    { id: 'instant', label: 'Instant', description: 'Notify me immediately' },
    { id: 'daily', label: 'Daily Digest', description: 'Once per day summary' },
    { id: 'weekly', label: 'Weekly Summary', description: 'Weekly deal roundup' }
  ];

  const handleCategoryToggle = (categoryId) => {
    const updatedCategories = localPreferences?.favoriteCategories?.includes(categoryId)
      ? localPreferences?.favoriteCategories?.filter(id => id !== categoryId)
      : [...localPreferences?.favoriteCategories, categoryId];
    
    setLocalPreferences(prev => ({
      ...prev,
      favoriteCategories: updatedCategories
    }));
    setHasChanges(true);
  };

  const handlePriceSensitivityChange = (level) => {
    setLocalPreferences(prev => ({
      ...prev,
      priceSensitivity: level
    }));
    setHasChanges(true);
  };

  const handleNotificationTimingChange = (timing) => {
    setLocalPreferences(prev => ({
      ...prev,
      notificationTiming: timing
    }));
    setHasChanges(true);
  };

  const handleBudgetRangeChange = (field, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      budgetRange: {
        ...prev?.budgetRange,
        [field]: parseInt(value) || 0
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdatePreferences(localPreferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Settings" size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Shopping Preferences</h3>
        </div>
        {hasChanges && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} iconName="Check" iconPosition="left">
              Save Changes
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-8">
        {/* Favorite Categories */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Favorite Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories?.map((category) => (
              <div
                key={category?.id}
                onClick={() => handleCategoryToggle(category?.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  localPreferences?.favoriteCategories?.includes(category?.id)
                    ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon name={category?.icon} size={20} />
                  <span className="text-xs font-medium text-center">{category?.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Sensitivity */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Price Sensitivity</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priceSensitivityLevels?.map((level) => (
              <div
                key={level?.id}
                onClick={() => handlePriceSensitivityChange(level?.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  localPreferences?.priceSensitivity === level?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    localPreferences?.priceSensitivity === level?.id
                      ? 'border-primary bg-primary' :'border-muted-foreground'
                  }`}>
                    {localPreferences?.priceSensitivity === level?.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${level?.color}`}>{level?.label}</div>
                    <div className="text-xs text-muted-foreground">{level?.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Typical Budget Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Minimum Budget (₹)</label>
              <input
                type="number"
                value={localPreferences?.budgetRange?.min}
                onChange={(e) => handleBudgetRangeChange('min', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Maximum Budget (₹)</label>
              <input
                type="number"
                value={localPreferences?.budgetRange?.max}
                onChange={(e) => handleBudgetRangeChange('max', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="1000"
              />
            </div>
          </div>
        </div>

        {/* Notification Timing */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Notification Timing</h4>
          <div className="space-y-3">
            {notificationTiming?.map((timing) => (
              <div
                key={timing?.id}
                onClick={() => handleNotificationTimingChange(timing?.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  localPreferences?.notificationTiming === timing?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    localPreferences?.notificationTiming === timing?.id
                      ? 'border-primary bg-primary' :'border-muted-foreground'
                  }`}>
                    {localPreferences?.notificationTiming === timing?.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{timing?.label}</div>
                    <div className="text-xs text-muted-foreground">{timing?.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Personalization */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">AI Personalization</h4>
          <div className="space-y-4">
            <Checkbox
              label="Enable AI-powered product recommendations"
              description="Let AI suggest products based on your shopping history"
              checked={localPreferences?.aiPersonalization?.recommendations}
              onChange={(e) => {
                setLocalPreferences(prev => ({
                  ...prev,
                  aiPersonalization: {
                    ...prev?.aiPersonalization,
                    recommendations: e?.target?.checked
                  }
                }));
                setHasChanges(true);
              }}
            />
            <Checkbox
              label="Smart price prediction alerts"
              description="Get notified when AI predicts optimal buying times"
              checked={localPreferences?.aiPersonalization?.pricePrediction}
              onChange={(e) => {
                setLocalPreferences(prev => ({
                  ...prev,
                  aiPersonalization: {
                    ...prev?.aiPersonalization,
                    pricePrediction: e?.target?.checked
                  }
                }));
                setHasChanges(true);
              }}
            />
            <Checkbox
              label="Behavioral learning"
              description="Allow AI to learn from your browsing and purchase patterns"
              checked={localPreferences?.aiPersonalization?.behavioralLearning}
              onChange={(e) => {
                setLocalPreferences(prev => ({
                  ...prev,
                  aiPersonalization: {
                    ...prev?.aiPersonalization,
                    behavioralLearning: e?.target?.checked
                  }
                }));
                setHasChanges(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPreferences;