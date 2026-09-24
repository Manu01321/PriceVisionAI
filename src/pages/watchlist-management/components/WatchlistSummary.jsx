import React from 'react';
import Icon from '../../../components/AppIcon';

const WatchlistSummary = ({ 
  totalItems = 0, 
  activeAlerts = 0, 
  potentialSavings = 0, 
  achievementBadges = [] 
}) => {
  const summaryStats = [
    {
      id: 'items',
      label: 'Tracked Items',
      value: totalItems,
      icon: 'Heart',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'alerts',
      label: 'Active Alerts',
      value: activeAlerts,
      icon: 'Bell',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      id: 'savings',
      label: 'Potential Savings',
      value: `₹${potentialSavings?.toFixed(2)}`,
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Watchlist Summary</h2>
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} className="text-success" />
          <span className="text-sm text-success font-medium">+12% savings this month</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {summaryStats?.map((stat) => (
          <div key={stat?.id} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
            <div className={`w-10 h-10 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
              <p className="text-sm text-muted-foreground">{stat?.label}</p>
            </div>
          </div>
        ))}
      </div>
      {achievementBadges?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Recent Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {achievementBadges?.map((badge, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-3 py-2 bg-accent/10 text-accent rounded-full text-sm"
              >
                <Icon name={badge?.icon} size={14} />
                <span>{badge?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistSummary;