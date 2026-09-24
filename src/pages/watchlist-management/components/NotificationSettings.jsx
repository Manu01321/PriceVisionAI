import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const NotificationSettings = ({ 
  settings = {}, 
  onSettingsChange, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    alertFrequency: 'immediate',
    urgencyThreshold: 'medium',
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    categories: {
      priceDrops: true,
      backInStock: true,
      dealExpiry: true,
      newDeals: false
    },
    ...settings
  });

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Summary' },
    { value: 'weekly', label: 'Weekly Report' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low & Above (All alerts)' },
    { value: 'medium', label: 'Medium & Above' },
    { value: 'high', label: 'High Only (Critical)' }
  ];

  const handleSettingChange = (key, value) => {
    const updatedSettings = { ...localSettings, [key]: value };
    setLocalSettings(updatedSettings);
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };

  const handleCategoryChange = (category, enabled) => {
    const updatedCategories = { ...localSettings?.categories, [category]: enabled };
    handleSettingChange('categories', updatedCategories);
  };

  const handleQuietHoursChange = (key, value) => {
    const updatedQuietHours = { ...localSettings?.quietHours, [key]: value };
    handleSettingChange('quietHours', updatedQuietHours);
  };

  return (
    <div className={`bg-surface border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Settings" size={18} className="text-foreground" />
          <h3 className="font-semibold text-foreground">Notification Settings</h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          iconName={isOpen ? "ChevronUp" : "ChevronDown"}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Collapse' : 'Configure'}
        </Button>
      </div>
      {/* Settings Panel */}
      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Notification Channels */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Notification Channels</h4>
            <div className="space-y-3">
              <Checkbox
                label="Push Notifications"
                description="Instant alerts on your device"
                checked={localSettings?.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e?.target?.checked)}
              />
              
              <Checkbox
                label="Email Notifications"
                description="Receive alerts via email"
                checked={localSettings?.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e?.target?.checked)}
              />
              
              <Checkbox
                label="SMS Notifications"
                description="Text message alerts for urgent deals"
                checked={localSettings?.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Alert Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Alert Frequency"
              description="How often to receive notifications"
              options={frequencyOptions}
              value={localSettings?.alertFrequency}
              onChange={(value) => handleSettingChange('alertFrequency', value)}
            />
            
            <Select
              label="Urgency Threshold"
              description="Minimum urgency level for alerts"
              options={urgencyOptions}
              value={localSettings?.urgencyThreshold}
              onChange={(value) => handleSettingChange('urgencyThreshold', value)}
            />
          </div>

          {/* Quiet Hours */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Quiet Hours</h4>
            <div className="space-y-3">
              <Checkbox
                label="Enable Quiet Hours"
                description="Pause non-urgent notifications during specified hours"
                checked={localSettings?.quietHours?.enabled}
                onChange={(e) => handleQuietHoursChange('enabled', e?.target?.checked)}
              />
              
              {localSettings?.quietHours?.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="text-sm text-muted-foreground">Start Time</label>
                    <input
                      type="time"
                      value={localSettings?.quietHours?.start}
                      onChange={(e) => handleQuietHoursChange('start', e?.target?.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">End Time</label>
                    <input
                      type="time"
                      value={localSettings?.quietHours?.end}
                      onChange={(e) => handleQuietHoursChange('end', e?.target?.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alert Categories */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Alert Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Checkbox
                label="Price Drops"
                description="When tracked items decrease in price"
                checked={localSettings?.categories?.priceDrops}
                onChange={(e) => handleCategoryChange('priceDrops', e?.target?.checked)}
              />
              
              <Checkbox
                label="Back in Stock"
                description="When out-of-stock items become available"
                checked={localSettings?.categories?.backInStock}
                onChange={(e) => handleCategoryChange('backInStock', e?.target?.checked)}
              />
              
              <Checkbox
                label="Deal Expiry"
                description="When limited-time deals are about to end"
                checked={localSettings?.categories?.dealExpiry}
                onChange={(e) => handleCategoryChange('dealExpiry', e?.target?.checked)}
              />
              
              <Checkbox
                label="New Deals"
                description="When new deals are found for similar products"
                checked={localSettings?.categories?.newDeals}
                onChange={(e) => handleCategoryChange('newDeals', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to defaults
                const defaultSettings = {
                  pushNotifications: true,
                  emailNotifications: true,
                  smsNotifications: false,
                  alertFrequency: 'immediate',
                  urgencyThreshold: 'medium',
                  quietHours: { enabled: false, start: '22:00', end: '08:00' },
                  categories: {
                    priceDrops: true,
                    backInStock: true,
                    dealExpiry: true,
                    newDeals: false
                  }
                };
                setLocalSettings(defaultSettings);
                if (onSettingsChange) onSettingsChange(defaultSettings);
              }}
            >
              Reset to Defaults
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (onSettingsChange) onSettingsChange(localSettings);
                  setIsOpen(false);
                }}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;