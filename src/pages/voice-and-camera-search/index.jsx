import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import AIAssistantPanel from '../../components/ui/AIAssistantPanel';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import CameraViewfinder from './components/CameraViewfinder';
import VoiceSearchInterface from './components/VoiceSearchInterface';
import SearchModeSelector from './components/SearchModeSelector';
import AIProcessingIndicator from './components/AIProcessingIndicator';
import ImageUploadZone from './components/ImageUploadZone';
import { productSearchService, imageSearchService } from '../../services';

const VoiceAndCameraSearch = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('voice');
  const [searchResults, setSearchResults] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleProcessingComplete = () => {
    setIsAnalyzing(false);
    if (searchResults?.products?.length) {
      navigate('/ai-search-results', {
        state: {
          searchQuery: searchResults?.query || '',
          searchType: searchResults?.type || 'upload',
          confidence: searchResults?.confidence,
          sourceImages: searchResults?.images,
          sourceImage: searchResults?.image,
          aiAnalysis: searchResults?.analysis,
          results: searchResults?.products
        }
      });
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('priceVision_history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Failed to load saved history', err);
    }
  }, []);

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setSearchResults(null);
    clearAnalysis(); // Clear previous AI results
  };

  const persistHistory = (entry) => {
    const next = [entry, ...searchHistory].slice(0, 30);
    setSearchHistory(next);
    try {
      localStorage.setItem('priceVision_history', JSON.stringify(next));
    } catch (err) {
      console.warn('Failed to persist history', err);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResults(null);
    setAnalysisError('');
    setAnalysisStage('');
    setAnalysisProgress(0);
    setIsAnalyzing(false);
  };

  const cancelAnalysis = () => {
    clearAnalysis();
    setIsProcessing(false);
    setProcessingStage('Cancelled');
  };

  const handleVoiceResult = async (result) => {
    if (!result?.transcript) return;

    setIsProcessing(true);
    setProcessingStage('Searching products...');
    setAnalysisError('');

    try {
      const response = await productSearchService.searchProducts(result.transcript, { limit: 20 });
      const entry = {
        id: Date.now(),
        type: 'voice',
        query: result.transcript,
        timestamp: new Date().toISOString(),
        confidence: result.confidence || 0,
        resultsCount: response.count || response.results?.length || 0
      };

      setConfidence(entry.confidence);
      setSearchResults({
        type: 'voice',
        query: result.transcript,
        products: response.results,
        metadata: response,
        timestamp: new Date()
      });
      persistHistory(entry);

      navigate('/ai-search-results', {
        state: {
          searchQuery: result.transcript,
          searchType: 'voice',
          confidence: entry.confidence,
          results: response.results,
          metadata: response
        }
      });
    } catch (error) {
      setAnalysisError(error.message || 'Voice search failed');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleCameraCapture = async (imageData) => {
    if (!imageData) return;
    setIsProcessing(true);
    setProcessingStage('Analyzing image...');
    setAnalysisStage('Analyzing image...');
    setAnalysisProgress(20);
    setAnalysisError('');
    setIsAnalyzing(true);

    try {
      const response = await imageSearchService.searchByImage(imageData, { limit: 15 });
      const extractedInfo = response.extractedInfo || response.aiAnalysis || {};
      const confidence = response.confidence ?? response.searchConfidence ?? 0;
      const queryLabel = extractedInfo?.productName || 'Camera capture';
      const entry = {
        id: Date.now(),
        type: 'camera',
        query: queryLabel,
        timestamp: new Date().toISOString(),
        confidence,
        resultsCount: response.results?.length || 0
      };

      setConfidence(confidence);
      setAnalysisResults({
        confidence,
        extractedData: extractedInfo,
        products: response.results
      });
      setAnalysisProgress(100);
      persistHistory(entry);

      setSearchResults({
        type: 'camera',
        query: queryLabel,
        image: imageData,
        products: response.results,
        analysis: extractedInfo,
        timestamp: new Date()
      });

      navigate('/ai-search-results', {
        state: {
          searchQuery: queryLabel,
          searchType: 'camera',
          confidence,
          sourceImage: imageData,
          results: response.results,
          aiAnalysis: extractedInfo
        }
      });
    } catch (error) {
      setAnalysisError(error.message || 'Image search failed');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
      setAnalysisStage('');
      setIsAnalyzing(false);
    }
  };

  const handleBarcodeDetected = async (barcodeData) => {
    if (!barcodeData?.code && !barcodeData?.product) return;
    const query = barcodeData?.product || barcodeData?.code;
    setIsProcessing(true);
    setProcessingStage('Looking up barcode...');
    setAnalysisError('');

    try {
      const response = await productSearchService.searchProducts(query, { limit: 15 });
      const entry = {
        id: Date.now(),
        type: 'barcode',
        query,
        timestamp: new Date().toISOString(),
        confidence: 0.98,
        resultsCount: response.count || response.results?.length || 0
      };
      setConfidence(entry.confidence);
      persistHistory(entry);

      setSearchResults({
        type: 'barcode',
        query,
        barcode: barcodeData?.code,
        products: response.results,
        timestamp: new Date()
      });

      navigate('/ai-search-results', {
        state: {
          searchQuery: query,
          searchType: 'barcode',
          confidence: entry.confidence,
          barcode: barcodeData?.code,
          results: response.results
        }
      });
    } catch (error) {
      setAnalysisError(error.message || 'Barcode search failed');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleImageUpload = async (imageFiles) => {
    if (!imageFiles?.length) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisStage('Uploading images...');
    setAnalysisProgress(10);

    try {
      const first = imageFiles[0];
      const searchResponse = await imageSearchService.searchByImage(first, { limit: 15 });
      const extractedInfo = searchResponse.extractedInfo || searchResponse.aiAnalysis || {};
      const confidence = searchResponse.confidence ?? searchResponse.searchConfidence ?? 0;
      const queryLabel = extractedInfo?.productName || 'Uploaded product';
      const entry = {
        id: Date.now(),
        type: 'upload',
        query: queryLabel,
        timestamp: new Date().toISOString(),
        confidence,
        resultsCount: searchResponse.results?.length || 0
      };

      setAnalysisStage('Analyzing product...');
      setAnalysisProgress(70);
      setAnalysisResults({
        confidence,
        extractedData: extractedInfo,
        products: searchResponse.results
      });
      setAnalysisProgress(100);
      persistHistory(entry);

      setSearchResults({
        type: 'upload',
        query: queryLabel,
        images: imageFiles,
        products: searchResponse.results,
        analysis: extractedInfo,
        confidence,
        timestamp: new Date()
      });

      navigate('/ai-search-results', {
        state: {
          searchQuery: queryLabel,
          searchType: 'upload',
          confidence,
          sourceImages: imageFiles,
          aiAnalysis: extractedInfo,
          results: searchResponse.results
        }
      });
    } catch (error) {
      setAnalysisError(error.message || 'Image upload analysis failed');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // (removed duplicate handleProcessingComplete)
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const when = timestamp ? new Date(timestamp) : new Date();
    const diff = now - when;
    if (Number.isNaN(diff)) return '';
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={24} color="white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Voice & Camera Search</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover products using AI-powered multimodal search. Speak, scan, or capture to find
            exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Search Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Mode Selector */}
            <SearchModeSelector activeMode={activeMode} onModeChange={handleModeChange} />

            {/* Search Interface */}
            <div className="bg-surface border border-border rounded-lg p-6">
              {activeMode === 'voice' && (
                <VoiceSearchInterface
                  onVoiceResult={handleVoiceResult}
                  onTranscriptionUpdate={(transcript) => {}}
                  isProcessing={isProcessing}
                />
              )}

              {(activeMode === 'camera' || activeMode === 'barcode') && (
                <CameraViewfinder
                  mode={activeMode}
                  onCapture={handleCameraCapture}
                  onBarcodeDetected={handleBarcodeDetected}
                  isProcessing={isProcessing}
                />
              )}

              {activeMode === 'upload' && (
                <ImageUploadZone onImageAnalysis={handleImageUpload} isProcessing={isProcessing} />
              )}
            </div>

            {/* AI Processing Indicator - Enhanced for Gemini */}
            {isAnalyzing && (
              <AIProcessingIndicator
                isProcessing={isAnalyzing}
                processingStage={analysisStage || 'Analyzing with Gemini AI...'}
                onComplete={handleProcessingComplete}
                showCancelButton={true}
                onCancel={cancelAnalysis}
              />
            )}

            {/* Analysis Error Display */}
            {analysisError && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-error" />
                  <div>
                    <h4 className="text-sm font-medium text-error">Analysis Failed</h4>
                    <p className="text-sm text-error/80">{analysisError}</p>
                  </div>
                </div>
                <Button onClick={clearAnalysis} size="sm" variant="outline" className="mt-3">
                  Try Again
                </Button>
              </div>
            )}

            {/* Analysis Results Preview */}
            {analysisResults && !isAnalyzing && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                    <h4 className="text-sm font-medium text-success">AI Analysis Complete</h4>
                  </div>
                  <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                    {Math.round((analysisResults?.confidence || 0) * 100)}% confident
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Product:</span>{' '}
                    {analysisResults?.extractedData?.productName}
                  </p>
                  {analysisResults?.extractedData?.brand && (
                    <p>
                      <span className="font-medium">Brand:</span>{' '}
                      {analysisResults?.extractedData?.brand}
                    </p>
                  )}
                  {analysisResults?.extractedData?.category && (
                    <p>
                      <span className="font-medium">Category:</span>{' '}
                      {analysisResults?.extractedData?.category}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {analysisResults?.products?.length} products found
                  </p>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Lightbulb" size={20} className="mr-3 text-warning" />
                Pro Tips for Better Results
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Icon name="Mic" size={16} className="text-primary mt-1" />
                    <div>
                      <h4 className="font-medium text-foreground">Voice Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Use specific brand names and model numbers for best results
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Icon name="Camera" size={16} className="text-secondary mt-1" />
                    <div>
                      <h4 className="font-medium text-foreground">Photo Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Ensure good lighting and focus on product details
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Icon name="Scan" size={16} className="text-success mt-1" />
                    <div>
                      <h4 className="font-medium text-foreground">Barcode Scan</h4>
                      <p className="text-sm text-muted-foreground">
                        Hold steady and align barcode within the frame
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Icon name="Upload" size={16} className="text-warning mt-1" />
                    <div>
                      <h4 className="font-medium text-foreground">Image Upload</h4>
                      <p className="text-sm text-muted-foreground">
                        Multiple angles improve AI recognition accuracy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search History */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="History" size={20} className="mr-3" />
                Recent Searches
              </h3>

              {searchHistory?.length > 0 ? (
                <div className="space-y-3">
                  {searchHistory?.map((search) => (
                    <button
                      key={search?.id}
                      onClick={() =>
                        navigate('/ai-search-results', {
                          state: {
                            searchQuery: search?.query,
                            searchType: search?.type,
                            confidence: search?.confidence
                          }
                        })
                      }
                      className="w-full text-left p-3 hover:bg-muted rounded-lg transition-smooth border border-border/50 hover:border-border"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            search?.type === 'voice'
                              ? 'bg-primary/10 text-primary'
                              : search?.type === 'camera'
                                ? 'bg-secondary/10 text-secondary'
                                : search?.type === 'barcode'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-warning/10 text-warning'
                          }`}
                        >
                          <Icon
                            name={
                              search?.type === 'voice'
                                ? 'Mic'
                                : search?.type === 'camera'
                                  ? 'Camera'
                                  : search?.type === 'barcode'
                                    ? 'Scan'
                                    : 'Upload'
                            }
                            size={16}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {search?.query}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(search?.timestamp)}
                            </span>
                            <span className="text-xs text-success">
                              {search?.resultsCount} results
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent searches</p>
                </div>
              )}
            </div>

            {/* Enhanced AI Features */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Brain" size={20} className="mr-3 text-accent" />
                Powered by Google Gemini AI
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Eye" size={16} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Advanced Vision Recognition
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Multi-modal AI understands products from images
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Icon name="Zap" size={16} className="text-secondary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Real-time Analysis</p>
                    <p className="text-xs text-muted-foreground">
                      Instant product identification and feature extraction
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Icon name="Target" size={16} className="text-success" />
                  <div>
                    <p className="font-medium text-foreground text-sm">High Accuracy</p>
                    <p className="text-xs text-muted-foreground">
                      Confidence scoring for reliable results
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Icon name="Shield" size={16} className="text-warning" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Content Safety</p>
                    <p className="text-xs text-muted-foreground">
                      Built-in safety filters and content moderation
                    </p>
                  </div>
                </div>
              </div>

              {!import.meta.env?.VITE_GEMINI_API_KEY && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-xs text-warning">
                    <Icon name="AlertTriangle" size={12} className="inline mr-1" />
                    Set up your Gemini API key to enable AI analysis
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icon name="Home" size={16} className="mr-3" />
                  Back to Dashboard
                </Button>

                <Button
                  onClick={() => navigate('/product-comparison')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icon name="BarChart3" size={16} className="mr-3" />
                  Compare Products
                </Button>

                <Button
                  onClick={() => navigate('/watchlist-management')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icon name="Heart" size={16} className="mr-3" />
                  My Watchlist
                </Button>

                <Button
                  onClick={() => setShowAIAssistant(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Icon name="MessageCircle" size={16} className="mr-3" />
                  AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isOpen={showAIAssistant}
        onToggle={() => setShowAIAssistant(!showAIAssistant)}
        onClose={() => setShowAIAssistant(false)}
        contextData={{ pageName: 'Voice and Camera Search' }}
        className="fixed right-4 bottom-20 lg:bottom-4 z-300"
      />
      {/* Quick Action Menu */}
      <QuickActionMenu
        onVoiceSearch={() => {
          setActiveMode('voice');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCameraSearch={() => {
          setActiveMode('camera');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickAdd={() => navigate('/watchlist-management')}
        onPriceAlert={() => navigate('/deal-alerts-and-notifications')}
      />
    </div>
  );
};

export default VoiceAndCameraSearch;
