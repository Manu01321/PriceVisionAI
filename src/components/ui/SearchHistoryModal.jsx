import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import historyService from '../../services/historyService';
import { getUser } from '../../utils/auth';

const SearchHistoryModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const user = getUser();

  useEffect(() => {
    if (isOpen) {
      setHistory(historyService.getSearchHistory());
    }

    const handleUpdate = () => {
      setHistory(historyService.getSearchHistory());
    };

    window.addEventListener('pv_search_history_updated', handleUpdate);
    return () => window.removeEventListener('pv_search_history_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectQuery = (query) => {
    onClose();
    navigate('/ai-search-results', {
      state: {
        searchQuery: query,
        searchType: 'history'
      }
    });
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    historyService.removeSearchItem(id);
  };

  const handleClear = () => {
    historyService.clearSearchHistory();
  };

  return (
    <div className="fixed inset-0 z-500 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-primary/10 text-primary rounded-lg">
              <Icon name="History" size={18} />
            </span>
            <div>
              <h3 className="font-semibold text-foreground text-base">Search Product History</h3>
              <p className="text-xs text-muted-foreground">
                {user ? `Saved for ${user.email || user.name}` : 'Guest session history'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {history.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Icon name="Search" size={32} className="mx-auto text-muted-foreground/50 mb-1" />
              <p className="text-sm font-medium text-foreground">No search history found</p>
              <p className="text-xs">Your past product searches will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectQuery(item.query)}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60 hover:border-primary/50 hover:bg-muted/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0 mr-2">
                    <Icon
                      name="Clock"
                      size={16}
                      className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {item.query}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.formattedDate || item.timestamp}
                        {item.resultCount > 0 && ` • ${item.resultCount} products found`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                      Search ↗
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, item.id)}
                      className="p-1 text-muted-foreground hover:text-error rounded transition-colors"
                      title="Delete from history"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{history.length} searches recorded</span>
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-error hover:text-error/80">
              Clear All History
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistoryModal;
