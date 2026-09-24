import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveUser, clearUser } from '../../utils/auth';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import ProfileHeader from './components/ProfileHeader';
import ShoppingPreferences from './components/ShoppingPreferences';
import SecuritySettings from './components/SecuritySettings';
import PrivacyControls from './components/PrivacyControls';
import AchievementsDisplay from './components/AchievementsDisplay';
import SubscriptionManagement from './components/SubscriptionManagement';

const UserProfileAndSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState(() => getUser() || {
    name: 'Guest User', email: '', phone: '', location: '',
    memberSince: 'Today', totalSavings: '0', dealsFound: 0, watchlistItems: 0
  });

  const shoppingPreferences = {
    favoriteCategories: ['electronics', 'fashion', 'home'],
    priceSensitivity: 'medium',
    budgetRange: { min: 50, max: 1000 },
    notificationTiming: 'daily',
    aiPersonalization: {
      recommendations: true,
      pricePrediction: true,
      behavioralLearning: false
    }
  };

  const securityData = {
    twoFactorEnabled: true,
    lastPasswordChange: "2025-10-15",
    connectedDevices: 3
  };

  const privacySettings = {
    dataSharing: {
      browsing: true,
      purchase: false,
      location: true,
      device: true
    },
    aiPersonalizationLevel: 'balanced',
    marketingPreferences: {
      email: true,
      push: true,
      sms: false,
      social: false
    },
    gdprSettings: {
      allowCookies: true,
      allowAnalytics: true,
      allowThirdParty: false
    }
  };

  const subscriptionData = {
    currentPlan: 'pro',
    billingCycle: 'monthly',
    nextBilling: 'November 26, 2025',
    autoRenewal: true
  };

  const tabs = [
  { id: 'profile', label: 'Profile', icon: 'User' },
  { id: 'preferences', label: 'Shopping', icon: 'ShoppingBag' },
  { id: 'security', label: 'Security', icon: 'Shield' },
  { id: 'privacy', label: 'Privacy', icon: 'Lock' },
  { id: 'achievements', label: 'Achievements', icon: 'Trophy' },
  { id: 'subscription', label: 'Subscription', icon: 'CreditCard' }];


  const handleUpdateProfile = (profileData) => {
    saveUser(profileData);
    setUserData(prev => ({ ...prev, ...profileData }));
  };

  const handleUploadAvatar = () => {};

  const handleUpdatePreferences = (preferences) => {
    console.log('Updating preferences:', preferences);
    // Update preferences logic
  };

  const handleUpdateSecurity = (securityUpdate) => {
    console.log('Updating security:', securityUpdate);
    // Update security logic
  };

  const handleUpdatePrivacy = (privacyUpdate) => {
    console.log('Updating privacy:', privacyUpdate);
    // Update privacy logic
  };

  const handleUpgrade = (planId, billingCycle) => {
    console.log('Upgrading to:', planId, billingCycle);
    // Upgrade logic
  };

  const handleDowngrade = (planId) => {
    console.log('Downgrading to:', planId);
    // Downgrade logic
  };

  const handleCancelSubscription = () => {
    console.log('Cancelling subscription');
    // Cancel subscription logic
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode logic
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileHeader
            user={userData}
            onUpdateProfile={handleUpdateProfile}
            onUploadAvatar={handleUploadAvatar} />);


      case 'preferences':
        return (
          <ShoppingPreferences
            preferences={shoppingPreferences}
            onUpdatePreferences={handleUpdatePreferences} />);


      case 'security':
        return (
          <SecuritySettings
            securityData={securityData}
            onUpdateSecurity={handleUpdateSecurity} />);


      case 'privacy':
        return (
          <PrivacyControls
            privacySettings={privacySettings}
            onUpdatePrivacy={handleUpdatePrivacy} />);


      case 'achievements':
        return (
          <AchievementsDisplay
            achievements={[]}
            userStats={userData} />);


      case 'subscription':
        return (
          <SubscriptionManagement
            subscription={subscriptionData}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
            onCancel={handleCancelSubscription} />);


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile, preferences, and account security
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Icon name="Sun" size={16} className="text-muted-foreground" />
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-primary' : 'bg-muted'}`
                }>

                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'}`
                  }>
                </div>
              </button>
              <Icon name="Moon" size={16} className="text-muted-foreground" />
            </div>
            
            {/* Quick Actions */}
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              iconName="ArrowLeft"
              iconPosition="left">

              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-lg border border-border p-4 sticky top-6">
              <nav className="space-y-2">
                {tabs?.map((tab) =>
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === tab?.id ?
                  'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
                  }>

                    <Icon name={tab?.icon} size={18} />
                    <span className="font-medium">{tab?.label}</span>
                  </button>
                )}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Saved</span>
                    <span className="font-medium text-success">₹{userData?.totalSavings || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deals Found</span>
                    <span className="font-medium text-primary">{userData?.dealsFound || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Watchlist</span>
                    <span className="font-medium text-accent">{userData?.watchlistItems || 0}</span>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Need Help?</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help Center</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="MessageCircle" size={16} />
                    <span>Contact Support</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="FileText" size={16} />
                    <span>Documentation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>);

};

export default UserProfileAndSettings;