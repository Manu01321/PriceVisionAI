import React from 'react';
import Icon from '../../../components/AppIcon';

const SummaryMetrics = ({ metrics }) => {
  const defaultMetrics = {
    totalSavings: 1247.50,
    dealsFound: 23,
    alertAccuracy: 94,
    activeAlerts: 12,
    weeklyTrend: 15.3,
    topCategory: 'Electronics',
    avgSavings: 54.20,
    successRate: 87
  };

  const data = metrics || defaultMetrics;

  const metricCards = [
    {
      title: 'Total Savings',
      value: `₹${data?.totalSavings?.toLocaleString()}`,
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: `+${data?.weeklyTrend}%`,
      trendColor: 'text-success'
    },
    {
      title: 'Deals Found',
      value: data?.dealsFound?.toString(),
      icon: 'Tag',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: 'This month',
      trendColor: 'text-muted-foreground'
    },
    {
      title: 'Alert Accuracy',
      value: `${data?.alertAccuracy}%`,
      icon: 'Target',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: 'AI Confidence',
      trendColor: 'text-muted-foreground'
    },
    {
      title: 'Active Alerts',
      value: data?.activeAlerts?.toString(),
      icon: 'Bell',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: 'Monitoring',
      trendColor: 'text-muted-foreground'
    }
  ];

  const achievements = [
    {
      title: 'Deal Hunter',
      description: 'Found 20+ deals this month',
      icon: 'Award',
      earned: data?.dealsFound >= 20,
      progress: Math.min((data?.dealsFound / 20) * 100, 100)
    },
    {
      title: 'Smart Saver',
      description: 'Saved over ₹83,000',
      icon: 'TrendingUp',
      earned: data?.totalSavings >= 1000,
      progress: Math.min((data?.totalSavings / 1000) * 100, 100)
    },
    {
      title: 'Alert Master',
      description: '90%+ alert accuracy',
      icon: 'Zap',
      earned: data?.alertAccuracy >= 90,
      progress: Math.min((data?.alertAccuracy / 90) * 100, 100)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards?.map((metric, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg p-4 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${metric?.bgColor} flex items-center justify-center`}>
                <Icon name={metric?.icon} size={20} className={metric?.color} />
              </div>
              <div className={`text-xs font-medium ${metric?.trendColor}`}>
                {metric?.trend}
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-foreground">{metric?.value}</h3>
              <p className="text-sm text-muted-foreground">{metric?.title}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Stats */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="BarChart3" size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Performance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Savings per Deal</span>
              <span className="font-semibold text-foreground">₹{data?.avgSavings}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="font-semibold text-foreground">{data?.successRate}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Top Category</span>
              <span className="font-semibold text-foreground">{data?.topCategory}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weekly Growth</span>
              <span className="font-semibold text-success">+{data?.weeklyTrend}%</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Trophy" size={18} className="text-warning" />
            <h3 className="font-semibold text-foreground">Achievements</h3>
          </div>
          
          <div className="space-y-4">
            {achievements?.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={achievement?.icon} 
                      size={16} 
                      className={achievement?.earned ? 'text-warning' : 'text-muted-foreground'} 
                    />
                    <span className={`text-sm font-medium ${achievement?.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {achievement?.title}
                    </span>
                  </div>
                  {achievement?.earned && (
                    <Icon name="Check" size={16} className="text-success" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground ml-6">
                  {achievement?.description}
                </p>
                
                <div className="ml-6">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        achievement?.earned ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${achievement?.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryMetrics;