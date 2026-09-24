import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionMenu = ({
  onVoiceSearch,
  onCameraSearch,
  onQuickAdd,
  onPriceAlert,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const actions = [
    {
      id: 'voice',
      icon: 'Mic',
      label: 'Voice Search',
      color: 'bg-primary',
      hoverColor: 'hover:bg-primary/90',
      onClick: onVoiceSearch
    },
    {
      id: 'camera',
      icon: 'Camera',
      label: 'Scan Product',
      color: 'bg-secondary',
      hoverColor: 'hover:bg-secondary/90',
      onClick: onCameraSearch
    },
    {
      id: 'watchlist',
      icon: 'Heart',
      label: 'Quick Add',
      color: 'bg-success',
      hoverColor: 'hover:bg-success/90',
      onClick: onQuickAdd
    },
    {
      id: 'alert',
      icon: 'Bell',
      label: 'Price Alert',
      color: 'bg-warning',
      hoverColor: 'hover:bg-warning/90',
      onClick: onPriceAlert
    }
  ];

  const handleActionClick = async (action) => {
    if (isProcessing) return;

    setActiveAction(action?.id);
    setIsProcessing(true);

    try {
      if (action?.onClick) {
        await action?.onClick();
      }

      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        setActiveAction(null);
        setIsOpen(false);
      }, 1000);
    } catch (error) {
      console.error('Action failed:', error);
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const toggleMenu = () => {
    if (!isProcessing) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-300 ${className}`}>
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-slide-up">
          {actions?.map((action, index) => (
            <div
              key={action?.id}
              className="flex items-center space-x-3"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Label */}
              <div className="bg-surface border border-border px-3 py-2 rounded-lg shadow-soft opacity-0 animate-fade-in whitespace-nowrap">
                <span className="text-sm font-medium text-foreground">{action?.label}</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleActionClick(action)}
                disabled={isProcessing}
                className={`
                  w-12 h-12 rounded-full ${action?.color} ${action?.hoverColor} 
                  text-white shadow-soft transition-all duration-200 
                  flex items-center justify-center
                  ${activeAction === action?.id ? 'scale-110 shadow-elevated' : 'hover:scale-105'}
                  ${isProcessing && activeAction !== action?.id ? 'opacity-50' : ''}
                `}
              >
                {activeAction === action?.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Icon name={action?.icon} size={20} color="white" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Main FAB */}
      <button
        onClick={toggleMenu}
        disabled={isProcessing}
        className={`
          w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent 
          text-white shadow-elevated transition-all duration-300
          flex items-center justify-center
          ${isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'}
          ${isProcessing ? 'animate-pulse' : ''}
        `}
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Icon
            name={isOpen ? 'X' : 'Plus'}
            size={24}
            color="white"
            className="transition-transform duration-200"
          />
        )}
      </button>
      {/* Ripple Effect */}
      {isOpen && <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>}
      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-transparent -z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default QuickActionMenu;
