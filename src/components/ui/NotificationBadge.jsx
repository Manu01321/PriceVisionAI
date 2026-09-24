import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationBadge = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Mock notifications for demo
  const mockNotifications = [
    {
      id: 1,
      type: 'price_drop',
      title: 'Price Drop Alert',
      message: 'iPhone 15 Pro dropped by ₹4,150',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      urgency: 'high',
      data: { productId: 'iphone-15-pro', oldPrice: 999, newPrice: 949 }
    },
    {
      id: 2,
      type: 'deal_found',
      title: 'Great Deal Found',
      message: 'MacBook Air M2 - 15% off at Best Buy',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      urgency: 'medium',
      data: { productId: 'macbook-air-m2', discount: 15, store: 'Best Buy' }
    },
    {
      id: 3,
      type: 'watchlist_update',
      title: 'Watchlist Update',
      message: '3 items in your watchlist have price changes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      urgency: 'low',
      data: { itemCount: 3 }
    },
    {
      id: 4,
      type: 'ai_recommendation',
      title: 'AI Recommendation',
      message: 'Better alternative found for Samsung Galaxy S24',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: false,
      urgency: 'medium',
      data: { productId: 'galaxy-s24', alternativeId: 'pixel-8-pro' }
    }
  ];

  useEffect(() => {
    const notificationData = notifications?.length > 0 ? notifications : mockNotifications;
    setRecentNotifications(notificationData?.slice(0, 5));
    setUnreadCount(notificationData?.filter((n) => !n?.isRead)?.length);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return 'TrendingDown';
      case 'deal_found':
        return 'Tag';
      case 'watchlist_update':
        return 'Heart';
      case 'ai_recommendation':
        return 'Sparkles';
      default:
        return 'Bell';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
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

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (!notification?.isRead && onMarkAsRead) {
      onMarkAsRead(notification?.id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
    setUnreadCount(0);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="relative hover:bg-primary/5 transition-smooth"
      >
        <Icon name="Bell" size={20} className="text-foreground" />

        {/* Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-error text-white text-xs rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}

        {/* Pulse indicator for new notifications */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full animate-ping opacity-20"></div>
        )}
      </Button>
      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-200" onClick={() => setIsOpen(false)}></div>

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-lg shadow-elevated animate-slide-up z-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <Icon name="Bell" size={18} className="text-foreground" />
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {unreadCount} new
                  </div>
                )}
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications?.length > 0 ? (
                <div className="py-2">
                  {recentNotifications?.map((notification) => (
                    <button
                      key={notification?.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full flex items-start space-x-3 p-4 hover:bg-muted transition-smooth text-left ${
                        !notification?.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notification?.urgency === 'high'
                            ? 'bg-error/10'
                            : notification?.urgency === 'medium'
                              ? 'bg-warning/10'
                              : 'bg-success/10'
                        }`}
                      >
                        <Icon
                          name={getNotificationIcon(notification?.type)}
                          size={16}
                          className={getUrgencyColor(notification?.urgency)}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={`text-sm font-medium ${
                              !notification?.isRead ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {notification?.title}
                          </h4>
                          {!notification?.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2 mt-1"></div>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification?.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification?.timestamp)}
                          </span>

                          {notification?.type === 'price_drop' && notification?.data && (
                            <div className="flex items-center space-x-1 text-xs">
                              <span className="text-muted-foreground">
                                ₹{notification?.data?.oldPrice}
                              </span>
                              <Icon name="ArrowRight" size={12} className="text-muted-foreground" />
                              <span className="text-success font-medium">
                                ₹{notification?.data?.newPrice}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll notify you about price drops and great deals
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications?.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-primary hover:text-primary/80"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBadge;
