import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InsightCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  color = 'primary',
  onClick,
  description,
  actionLabel,
  trend = []
}) => {
  const getColorClasses = (colorType) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      error: 'bg-error/10 text-error border-error/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20'
    };
    return colors?.[colorType] || colors?.primary;
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  return (
    <div
      className="bg-surface border border-border rounded-lg p-6 hover:shadow-soft transition-smooth cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}
        >
          <Icon name={icon} size={24} />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${getChangeColor(changeType)}`}>
            <Icon name={getChangeIcon(changeType)} size={16} />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {trend?.length > 0 && (
        <div className="mt-4 flex items-center space-x-1">
          {trend?.map((point, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                point > 0 ? 'bg-success' : point < 0 ? 'bg-error' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}
      {actionLabel && (
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
            {actionLabel}
            <Icon name="ArrowRight" size={14} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default InsightCard;
