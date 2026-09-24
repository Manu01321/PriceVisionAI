import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const NotificationSettings = ({ settings, onSettingsChange, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings || {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    priceDropThreshold: 10,
    dealUrgencyLevel: 'medium',
    frequency: 'immediate',
    categories: ['electronics', 'fashion', 'home'],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    aiRecommendations: true,
    weeklyDigest: true
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority Only' },
    { value: 'medium', label: 'Medium & High Priority' },
    { value: 'high', label: 'High Priority Only' },
    { value: 'all', label: 'All Alerts' }
  ];

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books & Media' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'health', label: 'Health & Beauty' },
    { value: 'toys', label: 'Toys & Games' }
  ];

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleCategoryChange = (category, checked) => {
    const newCategories = checked 
      ? [...localSettings?.categories, category]
      : localSettings?.categories?.filter(c => c !== category);
    
    handleSettingChange('categories', newCategories);
  };

  const handleQuietHoursChange = (key, value) => {
    const newQuietHours = { ...localSettings?.quietHours, [key]: value };
    handleSettingChange('quietHours', newQuietHours);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localSettings);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Settings" size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Notification Settings</h3>
            <p className="text-sm text-muted-foreground">Customize your alert preferences</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </Button>
      </div>
      {/* Quick Settings */}
      <div className="p-4 space-y-4">
        {/* Notification Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Delivery Methods</h4>
          <div className="space-y-2">
            <Checkbox
              label="Email Notifications"
              description="Receive alerts via email"
              checked={localSettings?.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e?.target?.checked)}
            />
            <Checkbox
              label="Push Notifications"
              description="Browser and mobile push alerts"
              checked={localSettings?.pushNotifications}
              onChange={(e) => handleSettingChange('pushNotifications', e?.target?.checked)}
            />
            <Checkbox
              label="SMS Notifications"
              description="Text message alerts for urgent deals"
              checked={localSettings?.smsNotifications}
              onChange={(e) => handleSettingChange('smsNotifications', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Basic Thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Price Drop Threshold"
            type="number"
            description="Minimum % discount to trigger alert"
            value={localSettings?.priceDropThreshold}
            onChange={(e) => handleSettingChange('priceDropThreshold', parseInt(e?.target?.value))}
            min="1"
            max="90"
          />
          
          <Select
            label="Alert Frequency"
            description="How often to receive notifications"
            options={frequencyOptions}
            value={localSettings?.frequency}
            onChange={(value) => handleSettingChange('frequency', value)}
          />
        </div>
      </div>
      {/* Expanded Settings */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 animate-slide-up">
          {/* Advanced Filters */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Advanced Filters</h4>
            
            <Select
              label="Deal Urgency Level"
              description="Filter alerts by priority level"
              options={urgencyOptions}
              value={localSettings?.dealUrgencyLevel}
              onChange={(value) => handleSettingChange('dealUrgencyLevel', value)}
            />

            {/* Categories */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Product Categories</label>
              <p className="text-xs text-muted-foreground">Select categories you're interested in</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categoryOptions?.map((category) => (
                  <Checkbox
                    key={category?.value}
                    label={category?.label}
                    size="sm"
                    checked={localSettings?.categories?.includes(category?.value)}
                    onChange={(e) => handleCategoryChange(category?.value, e?.target?.checked)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Quiet Hours</h4>
            
            <Checkbox
              label="Enable Quiet Hours"
              description="Pause notifications during specified times"
              checked={localSettings?.quietHours?.enabled}
              onChange={(e) => handleQuietHoursChange('enabled', e?.target?.checked)}
            />

            {localSettings?.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <Input
                  label="Start Time"
                  type="time"
                  value={localSettings?.quietHours?.start}
                  onChange={(e) => handleQuietHoursChange('start', e?.target?.value)}
                />
                <Input
                  label="End Time"
                  type="time"
                  value={localSettings?.quietHours?.end}
                  onChange={(e) => handleQuietHoursChange('end', e?.target?.value)}
                />
              </div>
            )}
          </div>

          {/* AI Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">AI Features</h4>
            <div className="space-y-2">
              <Checkbox
                label="AI Recommendations"
                description="Receive personalized product suggestions"
                checked={localSettings?.aiRecommendations}
                onChange={(e) => handleSettingChange('aiRecommendations', e?.target?.checked)}
              />
              <Checkbox
                label="Weekly Digest"
                description="Summary of best deals and savings"
                checked={localSettings?.weeklyDigest}
                onChange={(e) => handleSettingChange('weeklyDigest', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              iconName="Save"
              iconPosition="left"
            >
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;