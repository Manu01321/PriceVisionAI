import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VoiceSearchInterface = ({
  onVoiceResult,
  onTranscriptionUpdate,
  isProcessing = false,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0));

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  // Ref to avoid stale closure in rAF loop
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    return () => {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      audioContextRef.current?.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
      setHasPermission(true);
      setupAudioAnalysis(stream);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser');
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = false;

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (!lastResult) return;

        const text = lastResult[0]?.transcript?.trim() || '';
        const conf = lastResult[0]?.confidence || 0;

        setTranscript(text);
        setConfidence(conf);

        if (onTranscriptionUpdate) onTranscriptionUpdate(text, conf);

        if (lastResult.isFinal && onVoiceResult) {
          onVoiceResult({ transcript: text, confidence: conf });
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (err) => {
        setError(err?.message || 'Voice recognition error');
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
      };

      isListeningRef.current = true;
      setIsListening(true);
      setTranscript('');
      setConfidence(0);
      recognitionRef.current.start();
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
      setHasPermission(false);
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
    audioContextRef.current?.close();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const setupAudioAnalysis = (stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        // Use ref to avoid stale closure — fixes waveform never updating
        if (!isListeningRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average / 255);

        const waveform = Array.from({ length: 20 }, (_, i) => {
          const index = Math.floor((i / 20) * bufferLength);
          return (dataArray[index] || 0) / 255;
        });
        setWaveformData(waveform);

        animationRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
    } catch (err) {
      console.error('Audio analysis setup failed:', err);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setConfidence(0);
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Voice Control Button */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || hasPermission === false}
            className={`w-24 h-24 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-error hover:bg-error/90 animate-pulse'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <Icon name={isListening ? 'MicOff' : 'Mic'} size={32} color="white" />
          </Button>

          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-error/30 animate-ping"></div>
              <div
                className="absolute inset-0 rounded-full bg-error/20 animate-ping"
                style={{ animationDelay: '0.5s' }}
              ></div>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-3">
          {isListening ? 'Listening...' : 'Tap to start voice search'}
        </p>
      </div>

      {/* Waveform Visualization */}
      {isListening && (
        <div className="flex items-center justify-center space-x-1 mb-6 h-16">
          {waveformData.map((level, index) => (
            <div
              key={index}
              className="bg-primary rounded-full transition-all duration-100"
              style={{
                width: '4px',
                height: `${Math.max(4, level * 60)}px`,
                opacity: 0.7 + level * 0.3
              }}
            />
          ))}
        </div>
      )}

      {/* Audio Level Indicator */}
      {isListening && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Audio Level</span>
            <span>{Math.round(audioLevel * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-100"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">Transcript</h4>
            <div className="flex items-center space-x-2">
              {confidence > 0 && (
                <div
                  className={`text-xs font-medium ${
                    confidence >= 0.8
                      ? 'text-success'
                      : confidence >= 0.6
                        ? 'text-warning'
                        : 'text-error'
                  }`}
                >
                  {Math.round(confidence * 100)}% confident
                </div>
              )}
              <Button onClick={clearTranscript} variant="ghost" size="icon" className="h-6 w-6">
                <Icon name="X" size={12} />
              </Button>
            </div>
          </div>

          <p className="text-foreground text-sm leading-relaxed">
            {transcript}
            {isListening && <span className="animate-pulse">|</span>}
          </p>

          {confidence > 0 && (
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    confidence >= 0.8 ? 'bg-success' : confidence >= 0.6 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-error">Voice Search Error</h4>
              <p className="text-sm text-error/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h4 className="text-sm font-medium text-primary">Processing Voice Input</h4>
              <p className="text-sm text-primary/80 mt-1">AI is analyzing your request...</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions — clicking a suggestion now triggers the search */}
      {!isListening && !isProcessing && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-3">Try saying:</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              'Find the best price for iPhone 15',
              'Compare Samsung Galaxy phones',
              'Show me gaming laptops under 50000'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setTranscript(suggestion);
                  setConfidence(0.95);
                  if (onVoiceResult) onVoiceResult({ transcript: suggestion, confidence: 0.95 });
                }}
                className="text-left p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth border border-border/50 hover:border-border"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSearchInterface;
