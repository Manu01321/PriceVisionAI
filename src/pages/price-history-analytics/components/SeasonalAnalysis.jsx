import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SeasonalAnalysis = ({ productCategory }) => {
  const [activeView, setActiveView] = useState('monthly');

  // Mock seasonal data
  const monthlyData = [
    { month: 'Jan', avgPrice: 849, deals: 3, savings: 12 },
    { month: 'Feb', avgPrice: 839, deals: 2, savings: 8 },
    { month: 'Mar', avgPrice: 829, deals: 4, savings: 15 },
    { month: 'Apr', avgPrice: 819, deals: 3, savings: 11 },
    { month: 'May', avgPrice: 809, deals: 5, savings: 18 },
    { month: 'Jun', avgPrice: 799, deals: 4, savings: 14 },
    { month: 'Jul', avgPrice: 789, deals: 6, savings: 22 },
    { month: 'Aug', avgPrice: 779, deals: 5, savings: 19 },
    { month: 'Sep', avgPrice: 769, deals: 4, savings: 16 },
    { month: 'Oct', avgPrice: 759, deals: 7, savings: 25 },
    { month: 'Nov', avgPrice: 679, deals: 12, savings: 35 },
    { month: 'Dec', avgPrice: 699, deals: 8, savings: 28 }
  ];

  const seasonalPatterns = [
    {
      season: 'Spring',
      months: 'Mar - May',
      avgDiscount: '15%',
      bestMonth: 'May',
      pattern: 'Gradual decline',
      color: '#10B981'
    },
    {
      season: 'Summer',
      months: 'Jun - Aug',
      avgDiscount: '18%',
      bestMonth: 'July',
      pattern: 'Back-to-school sales',
      color: '#F59E0B'
    },
    {
      season: 'Fall',
      months: 'Sep - Nov',
      avgDiscount: '28%',
      bestMonth: 'November',
      pattern: 'Black Friday peak',
      color: '#EF4444'
    },
    {
      season: 'Winter',
      months: 'Dec - Feb',
      avgDiscount: '16%',
      bestMonth: 'January',
      pattern: 'Post-holiday clearance',
      color: '#3B82F6'
    }
  ];

  const dealFrequencyData = [
    { name: 'Black Friday', value: 35, color: '#EF4444' },
    { name: 'Cyber Monday', value: 28, color: '#8B5CF6' },
    { name: 'Prime Day', value: 22, color: '#F59E0B' },
    { name: 'Back to School', value: 18, color: '#10B981' },
    { name: 'Other Sales', value: 15, color: '#6B7280' }
  ];

  const formatPrice = (value) => `₹${value}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-elevated">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-muted-foreground">Avg Price:</span>
              <span className="text-sm font-medium text-foreground">₹{data?.avgPrice}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-muted-foreground">Deals:</span>
              <span className="text-sm font-medium text-foreground">{data?.deals}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-muted-foreground">Avg Savings:</span>
              <span className="text-sm font-medium text-success">{data?.savings}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seasonal Price Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Historical patterns and seasonal trends for {productCategory || 'Electronics'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={activeView === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={activeView === 'seasonal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('seasonal')}
          >
            Seasonal
          </Button>
        </div>
      </div>
      {activeView === 'monthly' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Price Chart */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h4 className="text-md font-medium text-foreground mb-4">Monthly Price Trends</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={formatPrice}
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="avgPrice" 
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deal Frequency */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h4 className="text-md font-medium text-foreground mb-4">Deal Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealFrequencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dealFrequencyData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Share']}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {dealFrequencyData?.map((item) => (
                <div key={item?.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item?.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item?.name}</span>
                  <span className="text-xs font-medium text-foreground">{item?.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seasonalPatterns?.map((season) => (
            <div key={season?.season} className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: season?.color }}
                  />
                  <h4 className="text-md font-medium text-foreground">{season?.season}</h4>
                </div>
                <span className="text-sm text-muted-foreground">{season?.months}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Discount</span>
                  <span className="text-lg font-semibold text-success">{season?.avgDiscount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Best Month</span>
                  <span className="text-sm font-medium text-foreground">{season?.bestMonth}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pattern</span>
                  <span className="text-sm text-foreground">{season?.pattern}</span>
                </div>
              </div>
              
              {/* Progress bar for discount level */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Discount Level</span>
                  <span>{season?.avgDiscount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      backgroundColor: season?.color,
                      width: `${parseInt(season?.avgDiscount)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* AI Insights */}
      <div className="bg-gradient-to-r from-accent/5 to-primary/5 border border-border rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Icon name="Brain" size={20} className="text-accent mt-0.5" />
          <div className="flex-1">
            <h4 className="text-md font-medium text-foreground mb-2">Seasonal Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingDown" size={14} className="text-success" />
                  <span>November shows the highest discount potential (35% average)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={14} className="text-primary" />
                  <span>Black Friday historically offers the best deals for this category</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={14} className="text-warning" />
                  <span>Summer months show consistent 18% average savings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Target" size={14} className="text-accent" />
                  <span>Next major sale event predicted in 18 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalAnalysis;