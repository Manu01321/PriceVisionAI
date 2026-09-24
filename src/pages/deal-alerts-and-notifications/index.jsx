import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import AIAssistantPanel from '../../components/ui/AIAssistantPanel';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import AlertCard from './components/AlertCard';
import NotificationSettings from './components/NotificationSettings';
import AlertFilters from './components/AlertFilters';
import SummaryMetrics from './components/SummaryMetrics';
import BulkActions from './components/BulkActions';

const DealAlertsAndNotifications = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

  // Mock alerts data
  const mockAlerts = [
  {
    id: 1,
    type: 'price_drop',
    title: 'Price Drop Alert',
    message: 'iPhone 15 Pro Max dropped by ₹4,150 - now ₹78,817',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    urgency: 'high',
    category: 'electronics',
    isRead: false,
    product: {
      name: 'iPhone 15 Pro Max 256GB',
      brand: 'Apple',
      image: "https://images.unsplash.com/photo-1697292866700-148d1078b17a",
      imageAlt: 'Silver iPhone 15 Pro Max showing home screen with app icons'
    },
    priceInfo: {
      oldPrice: 999,
      newPrice: 949,
      savings: 5
    },
    aiInsights: `Based on historical data, this is the lowest price in 3 months. Similar drops typically last 2-3 days during this season.`,
    details: {
      store: 'Best Buy',
      availability: 'In Stock',
      validUntil: 'Oct 28, 2025',
      confidence: 94
    }
  },
  {
    id: 2,
    type: 'deal_found',
    title: 'Great Deal Discovered',
    message: 'MacBook Air M2 - 15% off at Amazon',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    urgency: 'medium',
    category: 'electronics',
    isRead: false,
    product: {
      name: 'MacBook Air M2 13-inch',
      brand: 'Apple',
      image: "https://images.unsplash.com/photo-1662569081210-6e8b240def2e",
      imageAlt: 'Silver MacBook Air M2 open on white desk showing desktop wallpaper'
    },
    priceInfo: {
      oldPrice: 1199,
      newPrice: 1019,
      savings: 15
    },
    aiInsights: `This deal matches your search history for laptops. The discount is above average for this model.`,
    details: {
      store: 'Amazon',
      availability: 'Limited Stock',
      validUntil: 'Oct 30, 2025',
      confidence: 88
    }
  },
  {
    id: 3,
    type: 'back_in_stock',
    title: 'Back in Stock',
    message: 'PlayStation 5 Console available at MSRP',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    urgency: 'high',
    category: 'electronics',
    isRead: true,
    product: {
      name: 'PlayStation 5 Console',
      brand: 'Sony',
      image: "https://images.unsplash.com/photo-1676817055540-9fdb8849d201",
      imageAlt: 'White PlayStation 5 console with controller on dark surface'
    },
    details: {
      store: 'GameStop',
      availability: 'In Stock',
      confidence: 96
    }
  },
  {
    id: 4,
    type: 'ai_recommendation',
    title: 'AI Recommendation',
    message: 'Better alternative found for Samsung Galaxy S24',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    urgency: 'medium',
    category: 'electronics',
    isRead: false,
    product: {
      name: 'Google Pixel 8 Pro',
      brand: 'Google',
      image: "https://images.unsplash.com/photo-1697514261129-5524c0a04f91",
      imageAlt: 'Black Google Pixel 8 Pro smartphone showing camera module design'
    },
    priceInfo: {
      oldPrice: 899,
      newPrice: 799,
      savings: 11
    },
    aiInsights: `Based on your preferences for camera quality and battery life, this alternative offers better value with similar features.`,
    details: {
      store: 'Google Store',
      availability: 'In Stock',
      confidence: 91
    }
  },
  {
    id: 5,
    type: 'price_target',
    title: 'Price Target Reached',
    message: 'AirPods Pro 2nd Gen reached your target price of ₹16,549',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    urgency: 'high',
    category: 'electronics',
    isRead: false,
    product: {
      name: 'AirPods Pro 2nd Generation',
      brand: 'Apple',
      image: "https://images.unsplash.com/photo-1728669188638-4fa1d424b3d0",
      imageAlt: 'White AirPods Pro earbuds in charging case on marble surface'
    },
    priceInfo: {
      oldPrice: 249,
      newPrice: 199,
      savings: 20
    },
    details: {
      store: 'Target',
      availability: 'In Stock',
      validUntil: 'Oct 27, 2025',
      confidence: 97
    }
  }];


  const mockAlertCounts = {
    total: 156,
    electronics: 89,
    fashion: 23,
    home: 18,
    sports: 15,
    books: 11
  };

  const mockSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    priceDropThreshold: 10,
    dealUrgencyLevel: 'medium',
    frequency: 'immediate',
    categories: ['electronics', 'fashion'],
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    },
    aiRecommendations: true,
    weeklyDigest: true
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setAlerts(mockAlerts);
      setFilteredAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter alerts based on search query
    let filtered = alerts;

    if (searchQuery?.trim()) {
      filtered = alerts?.filter((alert) =>
      alert?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      alert?.message?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      alert?.product?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchQuery]);

  const handleFilterChange = (filters) => {
    let filtered = alerts;

    // Apply filters
    if (filters?.category !== 'all') {
      filtered = filtered?.filter((alert) => alert?.category === filters?.category);
    }

    if (filters?.urgency !== 'all') {
      filtered = filtered?.filter((alert) => alert?.urgency === filters?.urgency);
    }

    if (filters?.type !== 'all') {
      filtered = filtered?.filter((alert) => alert?.type === filters?.type);
    }

    if (filters?.status !== 'all') {
      if (filters?.status === 'unread') {
        filtered = filtered?.filter((alert) => !alert?.isRead);
      } else if (filters?.status === 'read') {
        filtered = filtered?.filter((alert) => alert?.isRead);
      }
    }

    // Apply search query
    if (searchQuery?.trim()) {
      filtered = filtered?.filter((alert) =>
      alert?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      alert?.message?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      alert?.product?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const handleAlertSelection = (alertId, isSelected) => {
    if (isSelected) {
      setSelectedAlerts((prev) => [...prev, alertId]);
    } else {
      setSelectedAlerts((prev) => prev?.filter((id) => id !== alertId));
    }
  };

  const handleBulkAction = async (actionData) => {
    console.log('Bulk action:', actionData);

    if (actionData?.type === 'select_all') {
      setSelectedAlerts(filteredAlerts?.map((alert) => alert?.id));
    } else if (actionData?.type === 'clear_selection') {
      setSelectedAlerts([]);
    } else {
      // Process bulk action
      setSelectedAlerts([]);
    }
  };

  const handleMarkAsRead = (alertId) => {
    setAlerts((prev) => prev?.map((alert) =>
    alert?.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleQuickAction = (alertId, action) => {
    console.log('Quick action:', action, 'for alert:', alertId);

    switch (action) {
      case 'view_product':navigate('/product-comparison');
        break;
      case 'add_to_watchlist':navigate('/watchlist-management');
        break;
      case 'compare_prices':navigate('/product-comparison');
        break;
      case 'set_alert':
        // Handle set alert
        break;
      default:
        break;
    }
  };

  const handleSettingsChange = (newSettings) => {
    console.log('Settings changed:', newSettings);
  };

  const handleSettingsSave = (settings) => {
    console.log('Settings saved:', settings);
  };

  const tabs = [
  { id: 'alerts', label: 'Alerts', icon: 'Bell', count: filteredAlerts?.length },
  { id: 'metrics', label: 'Metrics', icon: 'BarChart3' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }];


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading alerts...</span>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-foreground mb-2">Deal Alerts & Notifications</h1>
            <p className="text-muted-foreground">
              Manage your price alerts and discover the best deals with AI-powered insights
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              iconName="ArrowLeft"
              iconPosition="left">

              Back to Dashboard
            </Button>
            
            <Button
              onClick={() => setIsAIAssistantOpen(true)}
              iconName="Bot"
              iconPosition="left">

              AI Assistant
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          {tabs?.map((tab) =>
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab?.id ?
            'bg-surface text-foreground shadow-sm' :
            'text-muted-foreground hover:text-foreground'}`
            }>

              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
              {tab?.count !== undefined &&
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {tab?.count}
                </div>
            }
            </button>
          )}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'alerts' &&
            <>
                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                      type="search"
                      placeholder="Search alerts by product, message, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e?.target?.value)} />

                    </div>
                    
                    <Button
                    variant="outline"
                    onClick={() => {
                      setAlerts((prev) => prev?.map((alert) => ({ ...alert, isRead: true })));
                    }}
                    iconName="CheckCheck"
                    iconPosition="left">

                      Mark All Read
                    </Button>
                  </div>

                  <AlertFilters
                  onFilterChange={handleFilterChange}
                  alertCounts={mockAlertCounts} />

                </div>

                {/* Bulk Actions */}
                {selectedAlerts?.length > 0 &&
              <BulkActions
                selectedAlerts={selectedAlerts}
                onBulkAction={handleBulkAction}
                totalAlerts={filteredAlerts?.length} />

              }

                {/* Alerts List */}
                <div className="space-y-4">
                  {filteredAlerts?.length > 0 ?
                filteredAlerts?.map((alert) =>
                <div key={alert?.id} className="flex items-start space-x-3">
                        <div className="pt-4">
                          <input
                      type="checkbox"
                      checked={selectedAlerts?.includes(alert?.id)}
                      onChange={(e) => handleAlertSelection(alert?.id, e?.target?.checked)}
                      className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2" />

                        </div>
                        <div className="flex-1">
                          <AlertCard
                      alert={alert}
                      onMarkAsRead={handleMarkAsRead}
                      onQuickAction={handleQuickAction}
                      onArchive={() => console.log('Archive alert:', alert?.id)} />

                        </div>
                      </div>
                ) :

                <div className="text-center py-12">
                      <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No alerts found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'Try adjusting your search or filters' : 'Set up price alerts to get notified of great deals'}
                      </p>
                      <Button
                    onClick={() => navigate('/watchlist-management')}
                    iconName="Plus"
                    iconPosition="left">

                        Create Alert
                      </Button>
                    </div>
                }
                </div>
              </>
            }

            {activeTab === 'metrics' &&
            <SummaryMetrics
              metrics={{
                totalAlerts: alerts?.length || 0,
                unreadAlerts: alerts?.filter((a) => !a?.isRead)?.length || 0,
                highPriorityAlerts: alerts?.filter((a) => a?.urgency === 'high')?.length || 0,
                todaysAlerts: alerts?.filter((a) => {
                  const today = new Date();
                  const alertDate = new Date(a.timestamp);
                  return alertDate?.toDateString() === today?.toDateString();
                })?.length || 0
              }} />

            }

            {activeTab === 'settings' &&
            <NotificationSettings
              settings={mockSettings}
              onSettingsChange={handleSettingsChange}
              onSave={handleSettingsSave} />

            }
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unread Alerts</span>
                  <span className="font-semibold text-error">
                    {alerts?.filter((a) => !a?.isRead)?.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High Priority</span>
                  <span className="font-semibold text-warning">
                    {alerts?.filter((a) => a?.urgency === 'high')?.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Alerts</span>
                  <span className="font-semibold text-success">
                    {alerts?.filter((a) => {
                      const today = new Date();
                      const alertDate = new Date(a.timestamp);
                      return alertDate?.toDateString() === today?.toDateString();
                    })?.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {alerts?.slice(0, 3)?.map((alert) =>
                <div key={alert?.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                  alert?.urgency === 'high' ? 'bg-error' :
                  alert?.urgency === 'medium' ? 'bg-warning' : 'bg-success'}`
                  }></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{alert?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp)?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/watchlist-management')}
                  iconName="Heart"
                  iconPosition="left">

                  Manage Watchlist
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/price-history-analytics')}
                  iconName="TrendingUp"
                  iconPosition="left">

                  Price Analytics
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/user-profile-and-settings')}
                  iconName="Settings"
                  iconPosition="left">

                  Account Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* AI Assistant */}
      <AIAssistantPanel
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        onClose={() => setIsAIAssistantOpen(false)}
        contextData={{ pageName: 'Deal Alerts & Notifications' }} />

      {/* Quick Action Menu */}
      <QuickActionMenu
        onVoiceSearch={() => navigate('/voice-and-camera-search')}
        onCameraSearch={() => navigate('/voice-and-camera-search')}
        onQuickAdd={() => navigate('/watchlist-management')}
        onPriceAlert={() => setActiveTab('settings')} />

    </div>);

};

export default DealAlertsAndNotifications;