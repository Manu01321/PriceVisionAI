import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import aiProductService from '../../services/aiProductService';

const AIAssistantPanel = ({
  isOpen = false,
  onToggle,
  onClose,
  contextData = null,
  className = ''
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock conversation data
  const initialMessages = [
    {
      id: 1,
      type: 'assistant',
      content:
        "Hi! I'm your AI shopping assistant. I can help you find the best deals, compare products, and track prices. What are you looking for today?",
      timestamp: new Date(Date.now() - 60000),
      confidence: 95
    }
  ];

  useEffect(() => {
    if (messages?.length === 0) {
      setMessages(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef?.current) {
      inputRef?.current?.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue?.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue?.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue?.trim();
    setInputValue('');
    setIsTyping(true);

    try {
      if (!aiProductService.isAvailable()) {
        throw new Error(
          'No AI API key configured. Please add VITE_OPENAI_API_KEY or VITE_GEMINI_API_KEY in your .env file.'
        );
      }

      const results = await aiProductService.searchProducts(query);
      const products = Array.isArray(results) ? results : results.products || results || [];

      let replyContent;
      if (products.length > 0) {
        const top = products
          .slice(0, 3)
          .map(
            (p) =>
              `• ${p.name} — ₹${Number(p.currentPrice || 0).toLocaleString('en-IN')}${p.discount ? ` (${p.discount}% off)` : ''}`
          )
          .join('\n');
        replyContent = `Here are top results for "${query}":\n\n${top}\n\nWould you like me to compare prices or set a price alert?`;
      } else {
        replyContent = `I searched for "${query}" but found no results. Try a more specific term like a brand name or model number.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: replyContent,
          timestamp: new Date(),
          suggestions: [
            'Show price history',
            'Find similar products',
            'Set price alert',
            'Compare alternatives'
          ]
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Sorry, I ran into an issue: ${err.message}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef?.current?.focus();
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
  };

  const formatTimestamp = (timestamp) => {
    return timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-200 lg:hidden"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-elevated z-300 lg:relative lg:w-80 lg:shadow-none lg:border-l-0 lg:border border-border lg:rounded-lg ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Icon name="Bot" size={16} color="white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Assistant</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
              <Icon name="Minimize2" size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>

        {/* Context Info */}
        {contextData && (
          <div className="p-3 bg-muted/50 border-b border-border">
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Info" size={14} className="text-primary" />
              <span className="text-muted-foreground">
                Viewing: {contextData?.productName || contextData?.pageName || 'Current page'}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 lg:h-80">
          {messages?.map((message) => (
            <div
              key={message?.id}
              className={`flex ${message?.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message?.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message?.type === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <Icon name="Bot" size={12} color="white" />
                    </div>
                    <span className="text-xs text-muted-foreground">AI Assistant</span>
                    {message?.confidence && (
                      <div className="text-xs text-success">{message?.confidence}% confident</div>
                    )}
                  </div>
                )}

                <div
                  className={`p-3 rounded-lg ${
                    message?.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-8'
                      : 'bg-muted text-foreground mr-8'
                  }`}
                >
                  <p className="text-sm">{message?.content}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {formatTimestamp(message?.timestamp)}
                  </div>
                </div>

                {/* Suggestions */}
                {message?.suggestions && (
                  <div className="mt-2 space-y-1">
                    {message?.suggestions?.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left p-2 text-xs text-primary hover:bg-primary/5 rounded border border-primary/20 transition-smooth"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg mr-8">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <Icon name="Bot" size={12} color="white" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-surface">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e?.target?.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about products or deals..."
                className="w-full p-3 pr-10 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceToggle}
                className={`absolute right-2 top-2 h-7 w-7 ${isListening ? 'text-error' : 'text-muted-foreground'}`}
              >
                <Icon name={isListening ? 'MicOff' : 'Mic'} size={14} />
              </Button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputValue?.trim() || isTyping}
              size="icon"
              className="h-11 w-11"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick('Find best deals')}
              className="text-xs"
            >
              <Icon name="Tag" size={12} className="mr-1" />
              Best Deals
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick('Compare prices')}
              className="text-xs"
            >
              <Icon name="BarChart3" size={12} className="mr-1" />
              Compare
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick('Track prices')}
              className="text-xs"
            >
              <Icon name="TrendingUp" size={12} className="mr-1" />
              Track
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistantPanel;
