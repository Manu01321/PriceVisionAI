import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({
  onVoiceSearch,
  onCameraSearch,
  onViewWatchlist,
  onViewAnalytics,
  onViewDeals
}) => {
  const actions = [
    {
      id: 'voice',
      icon: 'Mic',
      label: 'Voice Search',
      description: 'Search products with your voice',
      color: 'bg-primary text-primary-foreground',
      onClick: onVoiceSearch
    },
    {
      id: 'camera',
      icon: 'Camera',
      label: 'Scan Product',
      description: 'Take a photo to find products',
      color: 'bg-secondary text-secondary-foreground',
      onClick: onCameraSearch
    },
    {
      id: 'watchlist',
      icon: 'Heart',
      label: 'My Watchlist',
      description: 'View tracked products',
      color: 'bg-success text-success-foreground',
      onClick: onViewWatchlist
    },
    {
      id: 'analytics',
      icon: 'BarChart3',
      label: 'Price Analytics',
      description: 'View price trends & history',
      color: 'bg-warning text-warning-foreground',
      onClick: onViewAnalytics
    },
    {
      id: 'deals',
      icon: 'Tag',
      label: 'Hot Deals',
      description: 'Browse current deals',
      color: 'bg-error text-error-foreground',
      onClick: onViewDeals
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant="ghost"
            onClick={action?.onClick}
            className="h-auto p-4 justify-start hover:bg-muted/50 transition-smooth"
          >
            <div className="flex items-center space-x-4 w-full">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${action?.color}`}
              >
                <Icon name={action?.icon} size={20} />
              </div>

              <div className="flex-1 text-left">
                <div className="font-medium text-foreground">{action?.label}</div>
                <div className="text-sm text-muted-foreground">{action?.description}</div>
              </div>

              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
