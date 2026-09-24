import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const PrivacyControls = ({ privacySettings, onUpdatePrivacy }) => {
  const [localSettings, setLocalSettings] = useState(privacySettings);
  const [hasChanges, setHasChanges] = useState(false);

  const dataCategories = [
    {
      id: 'browsing',
      title: 'Browsing History',
      description: 'Products you view and search for',
      icon: 'Eye',
      sensitive: false
    },
    {
      id: 'purchase',
      title: 'Purchase History',
      description: 'Items you have bought through our platform',
      icon: 'ShoppingCart',
      sensitive: true
    },
    {
      id: 'location',
      title: 'Location Data',
      description: 'Your approximate location for local deals',
      icon: 'MapPin',
      sensitive: true
    },
    {
      id: 'device',
      title: 'Device Information',
      description: 'Device type, browser, and technical specifications',
      icon: 'Smartphone',
      sensitive: false
    }
  ];

  const aiPersonalizationLevels = [
    {
      id: 'minimal',
      title: 'Minimal',
      description: 'Basic recommendations based on categories only',
      features: ['Category-based suggestions', 'Popular products', 'Basic price alerts']
    },
    {
      id: 'balanced',
      title: 'Balanced',
      description: 'Moderate personalization with privacy protection',
      features: ['Personalized recommendations', 'Smart price predictions', 'Behavioral insights', 'Anonymous analytics']
    },
    {
      id: 'full',
      title: 'Full Personalization',
      description: 'Complete AI assistance with all features',
      features: ['Advanced AI recommendations', 'Predictive shopping', 'Full behavioral analysis', 'Cross-device sync', 'Social features']
    }
  ];

  const marketingPreferences = [
    {
      id: 'email',
      title: 'Email Marketing',
      description: 'Deal alerts, newsletters, and product updates',
      icon: 'Mail'
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Real-time price drops and urgent deals',
      icon: 'Bell'
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Critical alerts and verification codes',
      icon: 'MessageSquare'
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Personalized ads on social platforms',
      icon: 'Share2'
    }
  ];

  const handleDataSharingToggle = (categoryId) => {
    setLocalSettings(prev => ({
      ...prev,
      dataSharing: {
        ...prev?.dataSharing,
        [categoryId]: !prev?.dataSharing?.[categoryId]
      }
    }));
    setHasChanges(true);
  };

  const handleAILevelChange = (level) => {
    setLocalSettings(prev => ({
      ...prev,
      aiPersonalizationLevel: level
    }));
    setHasChanges(true);
  };

  const handleMarketingToggle = (preferenceId) => {
    setLocalSettings(prev => ({
      ...prev,
      marketingPreferences: {
        ...prev?.marketingPreferences,
        [preferenceId]: !prev?.marketingPreferences?.[preferenceId]
      }
    }));
    setHasChanges(true);
  };

  const handleGDPRToggle = (setting) => {
    setLocalSettings(prev => ({
      ...prev,
      gdprSettings: {
        ...prev?.gdprSettings,
        [setting]: !prev?.gdprSettings?.[setting]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdatePrivacy(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(privacySettings);
    setHasChanges(false);
  };

  const handleExportData = () => {
    // Trigger data export
    console.log('Exporting user data...');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Initiating account deletion...');
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Lock" size={18} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Privacy Controls</h3>
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
        {/* Data Sharing Preferences */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Data Sharing Preferences</h4>
          <div className="space-y-4">
            {dataCategories?.map((category) => (
              <div key={category?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    category?.sensitive ? 'bg-warning/10' : 'bg-muted'
                  }`}>
                    <Icon 
                      name={category?.icon} 
                      size={20} 
                      className={category?.sensitive ? 'text-warning' : 'text-muted-foreground'} 
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{category?.title}</span>
                      {category?.sensitive && (
                        <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">Sensitive</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{category?.description}</div>
                  </div>
                </div>
                <Checkbox
                  checked={localSettings?.dataSharing?.[category?.id]}
                  onChange={() => handleDataSharingToggle(category?.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Personalization Level */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">AI Personalization Level</h4>
          <div className="space-y-4">
            {aiPersonalizationLevels?.map((level) => (
              <div
                key={level?.id}
                onClick={() => handleAILevelChange(level?.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  localSettings?.aiPersonalizationLevel === level?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                    localSettings?.aiPersonalizationLevel === level?.id
                      ? 'border-primary bg-primary' :'border-muted-foreground'
                  }`}>
                    {localSettings?.aiPersonalizationLevel === level?.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{level?.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{level?.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {level?.features?.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Preferences */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Marketing Communications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketingPreferences?.map((preference) => (
              <div key={preference?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={preference?.icon} size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{preference?.title}</div>
                    <div className="text-xs text-muted-foreground">{preference?.description}</div>
                  </div>
                </div>
                <Checkbox
                  checked={localSettings?.marketingPreferences?.[preference?.id]}
                  onChange={() => handleMarketingToggle(preference?.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* GDPR Compliance */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">GDPR Rights</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium text-foreground">Data Portability</div>
                <div className="text-sm text-muted-foreground">Download all your personal data</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData} iconName="Download" iconPosition="left">
                Export Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <div className="font-medium text-foreground">Right to be Forgotten</div>
                <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount} iconName="Trash2" iconPosition="left">
                Delete Account
              </Button>
            </div>

            <div className="space-y-3">
              <Checkbox
                label="Allow cookies for enhanced experience"
                description="Enable cookies to remember your preferences and improve functionality"
                checked={localSettings?.gdprSettings?.allowCookies}
                onChange={() => handleGDPRToggle('allowCookies')}
              />
              <Checkbox
                label="Allow analytics tracking"
                description="Help us improve our service by sharing anonymous usage data"
                checked={localSettings?.gdprSettings?.allowAnalytics}
                onChange={() => handleGDPRToggle('allowAnalytics')}
              />
              <Checkbox
                label="Allow third-party integrations"
                description="Enable integrations with external services for better deals"
                checked={localSettings?.gdprSettings?.allowThirdParty}
                onChange={() => handleGDPRToggle('allowThirdParty')}
              />
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={18} className="text-accent mt-0.5" />
            <div>
              <h5 className="font-medium text-foreground mb-2">Your Privacy Matters</h5>
              <p className="text-sm text-muted-foreground mb-3">
                We are committed to protecting your privacy and giving you control over your data. 
                All settings are applied immediately and you can change them at any time.
              </p>
              <div className="flex space-x-4 text-xs">
                <button className="text-accent hover:underline">Privacy Policy</button>
                <button className="text-accent hover:underline">Terms of Service</button>
                <button className="text-accent hover:underline">Cookie Policy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyControls;