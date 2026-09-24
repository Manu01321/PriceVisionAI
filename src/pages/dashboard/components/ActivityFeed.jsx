import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'price_drop': return 'TrendingDown';
      case 'deal_found': return 'Tag';
      case 'ai_insight': return 'Sparkles';
      case 'watchlist_add': return 'Heart';
      case 'price_alert': return 'Bell';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'price_drop': return 'text-success bg-success/10';
      case 'deal_found': return 'text-warning bg-warning/10';
      case 'ai_insight': return 'text-accent bg-accent/10';
      case 'watchlist_add': return 'text-primary bg-primary/10';
      case 'price_alert': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-smooth">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 bg-surface border border-border rounded-lg hover:shadow-soft transition-smooth">
            {/* Activity Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={16} />
            </div>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity?.description}
                  </p>
                  
                  {activity?.product && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-6 h-6 rounded overflow-hidden bg-muted">
                        <Image
                          src={activity?.product?.image}
                          alt={activity?.product?.imageAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activity?.product?.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(activity?.timestamp)}
                  </span>
                  
                  {activity?.relevanceScore && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity?.relevanceScore >= 80 ? 'bg-success/10 text-success' :
                      activity?.relevanceScore >= 60 ? 'bg-warning/10 text-warning': 'bg-error/10 text-error'
                    }`}>
                      {activity?.relevanceScore}%
                    </div>
                  )}
                </div>
              </div>

              {activity?.priceChange && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-muted/50 rounded">
                  <span className="text-sm text-muted-foreground">
                    ₹{activity?.priceChange?.oldPrice}
                  </span>
                  <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                  <span className={`text-sm font-medium ${
                    activity?.priceChange?.newPrice < activity?.priceChange?.oldPrice ? 'text-success' : 'text-error'
                  }`}>
                    ₹{activity?.priceChange?.newPrice}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;