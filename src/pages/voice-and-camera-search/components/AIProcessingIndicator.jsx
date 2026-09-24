import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const AIProcessingIndicator = ({ 
  isProcessing = false,
  processingStage = 'analyzing',
  onComplete,
  showCancelButton = false,
  onCancel,
  className = "" 
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const processingStages = [
    {
      id: 'analyzing',
      name: 'Analyzing Input',
      description: 'Processing your search input...',
      icon: 'Brain',
      color: 'text-primary',
      duration: 600
    },
    {
      id: 'extracting',
      name: 'Extracting Features',
      description: 'Identifying product characteristics...',
      icon: 'Zap',
      color: 'text-secondary',
      duration: 500
    },
    {
      id: 'matching',
      name: 'Finding Matches',
      description: 'Searching product database...',
      icon: 'Search',
      color: 'text-success',
      duration: 500
    },
    {
      id: 'scoring',
      name: 'Calculating Confidence',
      description: 'Scoring search results...',
      icon: 'Target',
      color: 'text-warning',
      duration: 400
    },
    {
      id: 'complete',
      name: 'Complete',
      description: 'Results ready!',
      icon: 'CheckCircle',
      color: 'text-success',
      duration: 200
    }
  ];

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    let stageIndex = 0;
    let progressValue = 0;

    const advanceStage = () => {
      if (stageIndex < processingStages?.length - 1) {
        setCurrentStage(stageIndex);
        
        const stageDuration = processingStages?.[stageIndex]?.duration;
        const progressIncrement = 100 / stageDuration * 50; // Update every 50ms
        
        const progressInterval = setInterval(() => {
          progressValue += progressIncrement;
          setProgress(Math.min(progressValue, (stageIndex + 1) * 20));
          
          if (progressValue >= 20) {
            clearInterval(progressInterval);
            stageIndex++;
            setTimeout(advanceStage, 100);
          }
        }, 50);
      } else {
        setCurrentStage(stageIndex);
        setProgress(100);
        if (onComplete) {
          onComplete();
        }
      }
    };

    advanceStage();
  }, [isProcessing, onComplete]);

  if (!isProcessing && progress === 0) return null;

  const currentStageData = processingStages?.[currentStage] || processingStages?.[0];

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Main Processing Card */}
      <div className="bg-surface border border-border rounded-lg p-6 shadow-soft">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 ${currentStageData?.color}`}>
              <Icon 
                name={currentStageData?.icon} 
                size={32} 
                className={`${currentStageData?.color} ${isProcessing ? 'animate-pulse' : ''}`}
              />
            </div>
            
            {/* Spinning Ring */}
            {isProcessing && (
              <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {currentStageData?.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentStageData?.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex items-center justify-between mb-4">
          {processingStages?.slice(0, -1)?.map((stage, index) => (
            <div key={stage?.id} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                index <= currentStage 
                  ? 'bg-primary text-white' :'bg-muted text-muted-foreground'
              }`}>
                {index < currentStage ? (
                  <Icon name="Check" size={16} />
                ) : index === currentStage ? (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                ) : (
                  <Icon name={stage?.icon} size={16} />
                )}
              </div>
              <span className={`text-xs text-center ${
                index <= currentStage ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {stage?.name?.split(' ')?.[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Processing Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Cpu" size={12} />
            <span>Powered by Google Gemini Flash</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Zap" size={12} />
            <span>Multimodal AI Processing</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={12} />
            <span>Secure & Private Analysis</span>
          </div>
        </div>
      </div>
      {/* Processing Animation */}
      {isProcessing && (
        <div className="mt-4 flex items-center justify-center space-x-1">
          {Array.from({ length: 3 })?.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
      {showCancelButton && onCancel && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AIProcessingIndicator;
