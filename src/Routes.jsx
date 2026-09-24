import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import VoiceAndCameraSearch from './pages/voice-and-camera-search';
import UserProfileAndSettings from './pages/user-profile-and-settings';
import WatchlistManagement from './pages/watchlist-management';
import Dashboard from './pages/dashboard';
import PriceHistoryAnalytics from './pages/price-history-analytics';
import AISearchResults from './pages/ai-search-results';
import DealAlertsAndNotifications from './pages/deal-alerts-and-notifications';
import ProductComparison from './pages/product-comparison';
import Login from './pages/login';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<VoiceAndCameraSearch />} />
        <Route path="/voice-and-camera-search" element={<VoiceAndCameraSearch />} />
        <Route path="/user-profile-and-settings" element={<UserProfileAndSettings />} />
        <Route path="/watchlist-management" element={<WatchlistManagement />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/price-history-analytics" element={<PriceHistoryAnalytics />} />
        <Route path="/ai-search-results" element={<AISearchResults />} />
        <Route path="/deal-alerts-and-notifications" element={<DealAlertsAndNotifications />} />
        <Route path="/product-comparison" element={<ProductComparison />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
