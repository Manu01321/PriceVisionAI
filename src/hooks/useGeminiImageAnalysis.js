import { useRef, useState, useCallback, useEffect } from 'react';
import {
  analyzeProductImages,
  generateProductRecommendations,
  handleGeminiError
} from '../utils/geminiImageAnalysis';

/**
 * React hook for managing Gemini image analysis requests.
 * @returns {Object} Hook utilities for image analysis management.
 */
export function useGeminiImageAnalysis() {
  const abortControllerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');

  // Clean up function
  const cleanup = useCallback(() => {
    if (progressIntervalRef?.current) {
      clearInterval(progressIntervalRef?.current);
      progressIntervalRef.current = null;
    }
    if (timeoutRef?.current) {
      clearTimeout(timeoutRef?.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef?.current) {
      abortControllerRef?.current?.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const analyzeImages = async (imageFiles) => {
    if (!imageFiles?.length) {
      setError('Please upload at least one image.');
      return null;
    }

    // Validate API key first
    if (!import.meta.env?.VITE_GEMINI_API_KEY) {
      setError(
        'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.'
      );
      return null;
    }

    // Clean up any previous analysis
    cleanup();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Reset states
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStage('Initializing analysis...');
    setError('');
    setAnalysisResults(null);

    try {
      // Set up timeout (30 seconds)
      const TIMEOUT_DURATION = 30000;
      timeoutRef.current = setTimeout(() => {
        cleanup();
        setError(
          'Request timed out. Please try again with smaller images or check your internet connection.'
        );
        setIsProcessing(false);
        setProcessingProgress(0);
        setProcessingStage('Timeout');
      }, TIMEOUT_DURATION);

      // Progress stages - more conservative timing
      const progressStages = [
        { stage: 'Preparing images...', progress: 10, delay: 500 },
        { stage: 'Connecting to Gemini AI...', progress: 20, delay: 800 },
        { stage: 'Uploading images...', progress: 35, delay: 1200 },
        { stage: 'AI analyzing content...', progress: 50, delay: 2000 },
        { stage: 'Identifying products...', progress: 65, delay: 2500 },
        { stage: 'Extracting features...', progress: 80, delay: 1000 },
        { stage: 'Generating results...', progress: 90, delay: 800 }
      ];

      // Start conservative progress simulation
      let currentStageIndex = 0;
      let totalDelay = 0;

      const updateProgress = () => {
        if (
          currentStageIndex < progressStages?.length &&
          !abortControllerRef?.current?.signal?.aborted
        ) {
          const stage = progressStages?.[currentStageIndex];
          setProcessingStage(stage?.stage);
          setProcessingProgress(stage?.progress);

          totalDelay += stage?.delay;
          currentStageIndex++;

          progressIntervalRef.current = setTimeout(updateProgress, stage?.delay);
        }
      };

      // Start progress
      updateProgress();

      // Execute the actual analysis with proper timing
      const analysisPromise = analyzeProductImages(imageFiles, abortControllerRef?.current?.signal);

      const analysisResult = await analysisPromise;

      // Clean up progress simulation
      cleanup();

      if (!analysisResult) {
        throw new Error('No analysis results returned from Gemini AI.');
      }

      // Complete progress
      setProcessingProgress(100);
      setProcessingStage('Analysis complete!');

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAnalysisResults(analysisResult);

      return analysisResult;
    } catch (err) {
      console.error('Image analysis failed:', err);

      cleanup();

      if (
        err?.name === 'AbortError' ||
        err?.message?.includes('cancelled') ||
        err?.message?.includes('aborted')
      ) {
        setError('Analysis was cancelled.');
        setProcessingStage('Cancelled');
      } else if (err?.message?.includes('timeout')) {
        setError('Request timed out. Please try again with smaller images.');
        setProcessingStage('Timeout');
      } else {
        const friendlyError = handleGeminiError(err);
        setError(friendlyError);
        setProcessingStage('Analysis failed');
      }

      setProcessingProgress(0);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRecommendations = async (analysisText) => {
    if (!analysisText) {
      setError('No analysis data available for recommendations.');
      return null;
    }

    setIsProcessing(true);
    setProcessingStage('Generating recommendations...');
    setProcessingProgress(50);
    setError('');

    try {
      const recommendations = await generateProductRecommendations(analysisText);
      setProcessingStage('Recommendations ready!');
      setProcessingProgress(100);
      return recommendations;
    } catch (err) {
      const friendlyError = handleGeminiError(err);
      setError(friendlyError);
      setProcessingStage('Failed to generate recommendations');
      return null;
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const cancelAnalysis = useCallback(() => {
    cleanup();
    setIsProcessing(false);
    setProcessingStage('Cancelled by user');
    setProcessingProgress(0);
    setError('Analysis was cancelled by user.');
  }, [cleanup]);

  const clearResults = useCallback(() => {
    cleanup();
    setAnalysisResults(null);
    setError('');
    setProcessingStage('');
    setProcessingProgress(0);
    setIsProcessing(false);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Analysis methods
    analyzeImages,
    generateRecommendations,
    cancelAnalysis,
    clearResults,

    // State
    isProcessing,
    processingStage,
    processingProgress,
    analysisResults,
    error,

    // Computed states
    hasResults: !!analysisResults,
    canCancel: isProcessing && !!abortControllerRef?.current,
    confidence: analysisResults?.confidence || 0
  };
}

export default useGeminiImageAnalysis;
