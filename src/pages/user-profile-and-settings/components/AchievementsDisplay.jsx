import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AchievementsDisplay = ({ achievements, userStats }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Achievements', icon: 'Trophy' },
    { id: 'savings', label: 'Savings Master', icon: 'DollarSign' },
    { id: 'deals', label: 'Deal Hunter', icon: 'Target' },
    { id: 'social', label: 'Community', icon: 'Users' },
    { id: 'streaks', label: 'Consistency', icon: 'Zap' }
  ];

  const mockAchievements = [
    {
      id: 1,
      title: 'First Deal',
      description: 'Found your first great deal',
      category: 'deals',
      icon: 'Star',
      earned: true,
      earnedDate: '2025-10-15',
      progress: 100,
      maxProgress: 100,
      rarity: 'common',
      points: 50
    },
    {
      id: 2,
      title: 'Savings Champion',
      description: 'Saved over ₹41,500 in total',
      category: 'savings',
      icon: 'Award',
      earned: true,
      earnedDate: '2025-10-20',
      progress: 100,
      maxProgress: 100,
      rarity: 'rare',
      points: 200
    },
    {
      id: 3,
      title: 'Deal Streak',
      description: 'Found deals for 7 consecutive days',
      category: 'streaks',
      icon: 'Flame',
      earned: false,
      progress: 4,
      maxProgress: 7,
      rarity: 'epic',
      points: 300
    },
    {
      id: 4,
      title: 'Price Prophet',
      description: 'Correctly predicted 10 price drops',
      category: 'deals',
      icon: 'TrendingDown',
      earned: false,
      progress: 6,
      maxProgress: 10,
      rarity: 'legendary',
      points: 500
    },
    {
      id: 5,
      title: 'Community Helper',
      description: 'Shared 25 deals with the community',
      category: 'social',
      icon: 'Heart',
      earned: true,
      earnedDate: '2025-10-22',
      progress: 100,
      maxProgress: 100,
      rarity: 'rare',
      points: 150
    },
    {
      id: 6,
      title: 'Bargain Hunter',
      description: 'Found deals with 50%+ discount',
      category: 'deals',
      icon: 'Percent',
      earned: false,
      progress: 2,
      maxProgress: 5,
      rarity: 'epic',
      points: 250
    }
  ];

  const leaderboardData = [
    {
      rank: 1,
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1597621969117-1a305d3e0c68',
      avatarAlt:
        'Professional headshot of Asian woman with shoulder-length black hair in white blazer',
      totalSavings: 2450,
      dealsFound: 89
    },
    {
      rank: 2,
      name: 'Mike Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1596717951382-a3cbbdd4b8fd',
      avatarAlt: 'Professional headshot of Hispanic man with short dark hair in navy suit',
      totalSavings: 2180,
      dealsFound: 76
    },
    {
      rank: 3,
      name: 'You',
      avatar: userStats?.avatar,
      avatarAlt: userStats?.avatarAlt,
      totalSavings: 1850,
      dealsFound: 64,
      isCurrentUser: true
    },
    {
      rank: 4,
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1648466982925-65dac4ed0814',
      avatarAlt: 'Professional headshot of Caucasian woman with blonde hair in business attire',
      totalSavings: 1720,
      dealsFound: 58
    },
    {
      rank: 5,
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1687256457585-3608dfa736c5',
      avatarAlt: 'Professional headshot of Asian man with glasses in dark suit',
      totalSavings: 1650,
      dealsFound: 52
    }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'text-muted-foreground border-muted-foreground';
      case 'rare':
        return 'text-primary border-primary';
      case 'epic':
        return 'text-accent border-accent';
      case 'legendary':
        return 'text-warning border-warning';
      default:
        return 'text-muted-foreground border-muted-foreground';
    }
  };

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-muted/10';
      case 'rare':
        return 'bg-primary/10';
      case 'epic':
        return 'bg-accent/10';
      case 'legendary':
        return 'bg-warning/10';
      default:
        return 'bg-muted/10';
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? mockAchievements
      : mockAchievements?.filter((achievement) => achievement?.category === selectedCategory);

  const earnedAchievements = mockAchievements?.filter((a) => a?.earned);
  const totalPoints = earnedAchievements?.reduce((sum, a) => sum + a?.points, 0);

  const handleShare = (achievement) => {
    // Share achievement functionality
    console.log('Sharing achievement:', achievement?.title);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
          <Icon name="Trophy" size={18} className="text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Achievements & Leaderboard</h3>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-warning">{earnedAchievements?.length}</div>
          <div className="text-xs text-muted-foreground">Achievements</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-primary">{totalPoints}</div>
          <div className="text-xs text-muted-foreground">Points</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-success">#3</div>
          <div className="text-xs text-muted-foreground">Rank</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-accent">85%</div>
          <div className="text-xs text-muted-foreground">Completion</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground">Your Achievements</h4>
            <div className="flex space-x-1">
              {categories?.map((category) => (
                <button
                  key={category?.id}
                  onClick={() => setSelectedCategory(category?.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === category?.id
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  {category?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAchievements?.map((achievement) => (
              <div
                key={achievement?.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement?.earned
                    ? `${getRarityBg(achievement?.rarity)} ${getRarityColor(achievement?.rarity)}`
                    : 'bg-muted/30 border-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        achievement?.earned ? getRarityBg(achievement?.rarity) : 'bg-muted'
                      }`}
                    >
                      <Icon
                        name={achievement?.icon}
                        size={20}
                        className={
                          achievement?.earned
                            ? getRarityColor(achievement?.rarity)?.split(' ')?.[0]
                            : 'text-muted-foreground'
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium">{achievement?.title}</h5>
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${getRarityColor(achievement?.rarity)} ${getRarityBg(achievement?.rarity)}`}
                        >
                          {achievement?.rarity}
                        </span>
                      </div>
                      <p className="text-sm opacity-80 mt-1">{achievement?.description}</p>

                      {!achievement?.earned && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement?.progress}/{achievement?.maxProgress}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${(achievement?.progress / achievement?.maxProgress) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {achievement?.earned && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-80">
                            Earned on {new Date(achievement.earnedDate)?.toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(achievement)}
                            iconName="Share2"
                            className="h-6 px-2"
                          >
                            Share
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{achievement?.points} pts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Community Leaderboard</h4>
          <div className="space-y-3">
            {leaderboardData?.map((user) => (
              <div
                key={user?.rank}
                className={`p-4 rounded-lg border transition-all ${
                  user?.isCurrentUser
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      user?.rank === 1
                        ? 'bg-warning text-white'
                        : user?.rank === 2
                          ? 'bg-muted text-foreground'
                          : user?.rank === 3
                            ? 'bg-accent/20 text-accent'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user?.rank}
                  </div>

                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={user?.avatar}
                      alt={user?.avatarAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-medium ${user?.isCurrentUser ? 'text-primary' : 'text-foreground'}`}
                      >
                        {user?.name}
                      </span>
                      {user?.isCurrentUser && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{user?.totalSavings} saved • {user?.dealsFound} deals
                    </div>
                  </div>

                  {user?.rank <= 3 && (
                    <Icon
                      name="Trophy"
                      size={16}
                      className={
                        user?.rank === 1
                          ? 'text-warning'
                          : user?.rank === 2
                            ? 'text-muted-foreground'
                            : 'text-accent'
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} />
              <span>Rankings update daily based on total savings and community contributions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsDisplay;
