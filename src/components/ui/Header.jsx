import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useTheme } from '../../App';
import { getUser, clearUser } from '../../utils/auth';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(getUser);

  const handleLogout = () => {
    clearUser();
    setUser(null);
  };

  const navigationItems = [
    {
      label: 'Discover',
      path: '/dashboard',
      icon: 'Search',
      tooltip: 'AI-powered product discovery and search'
    },
    {
      label: 'Analyze',
      path: '/product-comparison',
      icon: 'BarChart3',
      tooltip: 'Compare products and analyze price trends'
    },
    {
      label: 'Manage',
      path: '/watchlist-management',
      icon: 'Heart',
      tooltip: 'Manage watchlists and deal alerts'
    }
  ];

  const moreMenuItems = [
    {
      label: 'Voice & Camera Search',
      path: '/voice-and-camera-search',
      icon: 'Mic'
    },
    {
      label: 'Price Analytics',
      path: '/price-history-analytics',
      icon: 'TrendingUp'
    },
    {
      label: 'Deal Alerts',
      path: '/deal-alerts-and-notifications',
      icon: 'Bell'
    },
    {
      label: 'Settings',
      path: '/user-profile-and-settings',
      icon: 'Settings'
    }
  ];

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    setIsSearchExpanded(false);
  };

  const handleVoiceSearch = () => {
    navigate('/voice-and-camera-search');
  };

  const handleCameraSearch = () => {
    navigate('/voice-and-camera-search');
  };

  return (
    <header className="sticky top-0 z-100 w-full glassmorphism border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">Price Vision AI Pro</h1>
            </div>
          </div>
        </div>

        {/* AI Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className={`relative w-full transition-all duration-300 ${isSearchExpanded ? 'scale-105' : ''}`}>
            <div className="relative">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                placeholder="Search products with AI assistance..."
                className="w-full pl-10 pr-24 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceSearch}
                  className="h-8 w-8 hover:bg-primary/10"
                >
                  <Icon name="Mic" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCameraSearch}
                  className="h-8 w-8 hover:bg-primary/10"
                >
                  <Icon name="Camera" size={16} />
                </Button>
              </div>
            </div>
            {isSearchExpanded && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-surface border border-border rounded-lg shadow-elevated animate-slide-up">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Sparkles" size={16} className="text-accent" />
                  <span>AI-powered search ready</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Button
              key={item?.path}
              variant="ghost"
              onClick={() => navigate(item?.path)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-smooth"
              title={item?.tooltip}
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
            </Button>
          ))}
          
          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-smooth"
            >
              <Icon name="MoreHorizontal" size={18} />
              <span>More</span>
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-elevated animate-slide-up z-200">
                <div className="py-2">
                  {moreMenuItems?.map((item) => (
                    <button
                      key={item?.path}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                      onClick={() => { navigate(item?.path); setIsMenuOpen(false); }}
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button & Search */}
        <div className="flex items-center space-x-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceSearch}
            className="md:hidden"
          >
            <Icon name="Search" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>

        {/* Notification Badge */}
        <div className="hidden lg:flex items-center space-x-4 ml-4">
          {/* Dark/Light Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-full hover:bg-muted transition-smooth"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
          </Button>
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Icon name="Bell" size={20} />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                3
              </div>
            </Button>
          </div>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center cursor-pointer"
                title={user.name}
                onClick={() => navigate('/user-profile-and-settings')}
              >
                <span className="text-white text-xs font-bold uppercase">{user.name?.[0]}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="h-8 w-8">
                <Icon name="LogOut" size={16} />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-smooth"
            >
              <Icon name="LogIn" size={16} />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-surface border-b border-border shadow-elevated z-200">
          {/* Mobile Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                placeholder="Search with AI..."
                className="w-full pl-10 pr-20 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={handleVoiceSearch} className="h-8 w-8">
                  <Icon name="Mic" size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCameraSearch} className="h-8 w-8">
                  <Icon name="Camera" size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="py-2">
            {[...navigationItems, ...moreMenuItems]?.map((item) => (
              <button
                key={item?.path}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-smooth"
                onClick={() => { navigate(item?.path); setIsMenuOpen(false); }}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    <div
                      className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() => { navigate('/user-profile-and-settings'); setIsMenuOpen(false); }}
                    >
                      <span className="text-white text-xs font-bold uppercase">{user.name?.[0]}</span>
                    </div>
                    <button
                      className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
                      onClick={() => { navigate('/user-profile-and-settings'); setIsMenuOpen(false); }}
                    >{user.name}</button>
                  </>
                ) : (
                  <button
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  >
                    <Icon name="LogIn" size={16} />
                    Login
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                  <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
                </Button>
                <div className="relative">
                  <Icon name="Bell" size={20} className="text-muted-foreground" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;