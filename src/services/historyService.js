import { getUser } from '../utils/auth';

const getHistoryStorageKey = () => {
  const user = getUser();
  const userId = user?.email || user?.id || user?.name || 'guest';
  return `priceVision_user_${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}_history`;
};

export const historyService = {
  getSearchHistory: () => {
    try {
      const key = getHistoryStorageKey();
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load search history:', e);
      return [];
    }
  },

  saveSearchQuery: (query, meta = {}) => {
    if (!query || typeof query !== 'string' || !query.trim()) return;

    try {
      const key = getHistoryStorageKey();
      const current = historyService.getSearchHistory();
      const trimmed = query.trim();

      // Avoid adjacent duplicates
      const filtered = current.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());

      const newEntry = {
        id: `search-${Date.now()}`,
        query: trimmed,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        resultCount: meta.resultCount || 0,
        category: meta.category || 'General',
        topProduct: meta.topProduct || null
      };

      const updated = [newEntry, ...filtered].slice(0, 30);
      localStorage.setItem(key, JSON.stringify(updated));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pv_search_history_updated'));
      }
    } catch (e) {
      console.warn('Failed to save search history:', e);
    }
  },

  removeSearchItem: (id) => {
    try {
      const key = getHistoryStorageKey();
      const updated = historyService.getSearchHistory().filter((item) => item.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pv_search_history_updated'));
      }
    } catch (e) {
      console.warn('Failed to remove history item:', e);
    }
  },

  clearSearchHistory: () => {
    try {
      const key = getHistoryStorageKey();
      localStorage.removeItem(key);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pv_search_history_updated'));
      }
    } catch (e) {
      console.warn('Failed to clear search history:', e);
    }
  }
};

export default historyService;
