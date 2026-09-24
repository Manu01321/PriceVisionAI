import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubscriptionManagement = ({ subscription, onUpgrade, onDowngrade, onCancel }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for casual shoppers',
      features: [
        '10 price alerts per month',
        'Basic AI recommendations',
        'Standard search capabilities',
        'Email notifications',
        'Community access'
      ],
      limitations: [
        'Limited to 5 watchlist items',
        'Basic price history (30 days)',
        'No priority support'
      ],
      color: 'muted',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'For serious deal hunters',
      features: [
        'Unlimited price alerts',
        'Advanced AI recommendations',
        'Voice & camera search',
        'Real-time notifications',
        'Price prediction insights',
        'Unlimited watchlist items',
        '90-day price history',
        'Priority customer support',
        'Export data capabilities'
      ],
      limitations: [],
      color: 'primary',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 29.99, yearly: 299.99 },
      description: 'For power users and businesses',
      features: [
        'Everything in Pro',
        'API access for integrations',
        'Custom deal categories',
        'Advanced analytics dashboard',
        'Bulk price monitoring',
        'White-label options',
        'Dedicated account manager',
        'Custom AI model training',
        'SLA guarantees'
      ],
      limitations: [],
      color: 'accent',
      popular: false
    }
  ];

  const usageStats = {
    priceAlerts: { used: 7, limit: 10 },
    watchlistItems: { used: 3, limit: 5 },
    apiCalls: { used: 0, limit: 0 },
    dataExports: { used: 0, limit: 1 }
  };

  const currentPlan = plans?.find((plan) => plan?.id === subscription?.currentPlan) || plans?.[0];

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price?.toFixed(2)}`;
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-error';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  const handlePlanChange = (planId) => {
    if (planId === subscription?.currentPlan) return;

    const newPlan = plans?.find((plan) => plan?.id === planId);
    const currentPlanIndex = plans?.findIndex((plan) => plan?.id === subscription?.currentPlan);
    const newPlanIndex = plans?.findIndex((plan) => plan?.id === planId);

    if (newPlanIndex > currentPlanIndex) {
      onUpgrade(planId, billingCycle);
    } else {
      onDowngrade(planId);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
          <Icon name="CreditCard" size={18} className="text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Subscription Management</h3>
      </div>
      {/* Current Plan Status */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">{currentPlan?.name} Plan</h4>
            <p className="text-sm text-muted-foreground">{currentPlan?.description}</p>
            {subscription?.currentPlan !== 'free' && (
              <p className="text-xs text-muted-foreground mt-1">
                Next billing: {subscription?.nextBilling} • Auto-renewal:{' '}
                {subscription?.autoRenewal ? 'On' : 'Off'}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(currentPlan?.price?.[subscription?.billingCycle || 'monthly'])}
            </div>
            {subscription?.currentPlan !== 'free' && (
              <div className="text-sm text-muted-foreground">
                /{subscription?.billingCycle || 'monthly'}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Usage Statistics */}
      {subscription?.currentPlan !== 'enterprise' && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Current Usage</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">Price Alerts</span>
                <span
                  className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usageStats?.priceAlerts?.used, usageStats?.priceAlerts?.limit))}`}
                >
                  {usageStats?.priceAlerts?.used}/{usageStats?.priceAlerts?.limit}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getUsagePercentage(
                      usageStats?.priceAlerts?.used,
                      usageStats?.priceAlerts?.limit
                    ) >= 90
                      ? 'bg-error'
                      : getUsagePercentage(
                            usageStats?.priceAlerts?.used,
                            usageStats?.priceAlerts?.limit
                          ) >= 70
                        ? 'bg-warning'
                        : 'bg-success'
                  }`}
                  style={{
                    width: `${getUsagePercentage(usageStats?.priceAlerts?.used, usageStats?.priceAlerts?.limit)}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">Watchlist Items</span>
                <span
                  className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usageStats?.watchlistItems?.used, usageStats?.watchlistItems?.limit))}`}
                >
                  {usageStats?.watchlistItems?.used}/{usageStats?.watchlistItems?.limit}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getUsagePercentage(
                      usageStats?.watchlistItems?.used,
                      usageStats?.watchlistItems?.limit
                    ) >= 90
                      ? 'bg-error'
                      : getUsagePercentage(
                            usageStats?.watchlistItems?.used,
                            usageStats?.watchlistItems?.limit
                          ) >= 70
                        ? 'bg-warning'
                        : 'bg-success'
                  }`}
                  style={{
                    width: `${getUsagePercentage(usageStats?.watchlistItems?.used, usageStats?.watchlistItems?.limit)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4 bg-muted rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-surface text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-surface text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="ml-1 px-2 py-1 bg-success/10 text-success text-xs rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>
      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {plans?.map((plan) => (
          <div
            key={plan?.id}
            className={`relative p-6 rounded-lg border transition-all ${
              plan?.id === subscription?.currentPlan
                ? `border-${plan?.color} bg-${plan?.color}/5`
                : 'border-border hover:border-primary/50'
            }`}
          >
            {plan?.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-primary text-white text-xs rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-foreground">{plan?.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{plan?.description}</p>
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(plan?.price?.[billingCycle])}
              </div>
              {plan?.price?.[billingCycle] > 0 && (
                <div className="text-sm text-muted-foreground">/{billingCycle}</div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {plan?.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-success" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
              {plan?.limitations?.map((limitation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Icon name="X" size={16} className="text-error" />
                  <span className="text-sm text-muted-foreground">{limitation}</span>
                </div>
              ))}
            </div>

            <Button
              fullWidth
              variant={plan?.id === subscription?.currentPlan ? 'outline' : 'default'}
              onClick={() => handlePlanChange(plan?.id)}
              disabled={plan?.id === subscription?.currentPlan}
            >
              {plan?.id === subscription?.currentPlan
                ? 'Current Plan'
                : plan?.price?.[billingCycle] === 0
                  ? 'Downgrade'
                  : 'Upgrade'}
            </Button>
          </div>
        ))}
      </div>
      {/* Billing Information */}
      {subscription?.currentPlan !== 'free' && (
        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Billing Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">Payment Method</h5>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <Icon name="CreditCard" size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">•••• •••• •••• 4242</div>
                  <div className="text-xs text-muted-foreground">Expires 12/2027</div>
                </div>
                <Button variant="ghost" size="sm" iconName="Edit" className="ml-auto">
                  Edit
                </Button>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">Billing Address</h5>
              <div className="p-3 border border-border rounded-lg">
                <div className="text-sm text-foreground">
                  123 Main Street
                  <br />
                  New York, NY 10001
                  <br />
                  United States
                </div>
                <Button variant="ghost" size="sm" iconName="Edit" className="mt-2">
                  Edit Address
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <div className="space-x-4">
              <Button variant="outline" iconName="Download" iconPosition="left">
                Download Invoice
              </Button>
              <Button variant="outline" iconName="Settings" iconPosition="left">
                Billing Settings
              </Button>
            </div>

            {subscription?.currentPlan !== 'free' && (
              <Button variant="destructive" onClick={onCancel} iconName="X" iconPosition="left">
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
