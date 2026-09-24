import React, { useState, useRef, useCallback, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ImageUploadZone = ({ 
  onImageAnalysis,
  isProcessing = false,
  maxFiles = 5,
  className = "" 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [analysisError, setAnalysisError] = useState('');
  const fileInputRef = useRef(null);
  const progressIntervalRefs = useRef({});

  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Cleanup function for upload progress
  const cleanupProgress = useCallback((fileId) => {
    if (progressIntervalRefs?.current?.[fileId]) {
      clearInterval(progressIntervalRefs?.current?.[fileId]);
      delete progressIntervalRefs?.current?.[fileId];
    }
  }, []);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    setAnalysisError(''); // Clear previous errors
    
    const validFiles = files?.filter(file => {
      if (!supportedFormats?.includes(file?.type)) {
        setAnalysisError(`Unsupported file type: ${file?.name}. Please use JPG, PNG, WebP, or GIF.`);
        return false;
      }
      if (file?.size > maxFileSize) {
        setAnalysisError(`File too large: ${file?.name} (${(file?.size / 1024 / 1024)?.toFixed(1)}MB). Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (uploadedImages?.length + validFiles?.length > maxFiles) {
      setAnalysisError(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - uploadedImages?.length} more.`);
      return;
    }

    validFiles?.forEach(file => {
      const fileId = Date.now() + Math.random();
      
      // Initialize progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          id: fileId,
          file,
          url: e?.target?.result,
          name: file?.name,
          size: file?.size,
          type: file?.type,
          uploadedAt: new Date()
        };

        // Improved upload progress simulation
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15 + 5; // 5-20% increments
          
          if (progress >= 100) {
            progress = 100;
            cleanupProgress(fileId);
            
            // Remove from upload progress after completion
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress?.[fileId];
                return newProgress;
              });
            }, 500);
          }
          
          setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(progress, 100) }));
        }, 150);

        // Store interval reference for cleanup
        progressIntervalRefs.current[fileId] = progressInterval;
        
        setUploadedImages(prev => [...prev, imageData]);
      };
      
      reader.onerror = () => {
        cleanupProgress(fileId);
        setAnalysisError(`Failed to read file: ${file?.name}`);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress?.[fileId];
          return newProgress;
        });
      };
      
      reader?.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    cleanupProgress(imageId);
    setUploadedImages(prev => prev?.filter(img => img?.id !== imageId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress?.[imageId];
      return newProgress;
    });
  };

  const analyzeImages = async () => {
    if (!onImageAnalysis || !uploadedImages?.length) return;
    
    setAnalysisError(''); // Clear previous errors
    
    try {
      // Pass the actual File objects for Gemini AI analysis
      const imageFiles = uploadedImages?.map(img => img?.file);
      await onImageAnalysis(imageFiles);
    } catch (error) {
      console.error('Analysis initiation failed:', error);
      setAnalysisError('Failed to start analysis. Please try again.');
    }
  };

  const openFileDialog = () => {
    fileInputRef?.current?.click();
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      Object.values(progressIntervalRefs?.current)?.forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' :'border-border hover:border-primary/50 hover:bg-muted/30'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Upload Icon and Text */}
        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
            dragActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}>
            <Icon name={dragActive ? "Download" : "Upload"} size={32} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {dragActive ? 'Drop images here' : 'Upload Product Images'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop images or click to browse. AI will analyze your products automatically.
            </p>
            
            <Button 
              onClick={openFileDialog}
              disabled={isProcessing}
              className="mb-4"
            >
              <Icon name="FolderOpen" size={16} className="mr-2" />
              Choose Files
            </Button>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supported: JPG, PNG, WebP, GIF</p>
              <p>Max size: 10MB per file</p>
              <p>Max files: {maxFiles}</p>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={supportedFormats?.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {analysisError && (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error mt-0.5 flex-shrink-0" />
            <p className="text-sm text-error">{analysisError}</p>
          </div>
        </div>
      )}
      
      {/* Uploaded Images Grid */}
      {uploadedImages?.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground">
              Uploaded Images ({uploadedImages?.length}/{maxFiles})
            </h4>
            <Button
              onClick={analyzeImages}
              disabled={isProcessing || Object.keys(uploadProgress)?.length > 0}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Icon name="Sparkles" size={14} className="mr-2" />
              {isProcessing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages?.map((image) => (
              <div key={image?.id} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={image?.url}
                    alt={`Uploaded product image: ${image?.name}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Enhanced Upload Progress */}
                  {uploadProgress?.[image?.id] !== undefined && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                        <div className="text-white text-sm font-medium">
                          {Math.round(uploadProgress?.[image?.id])}%
                        </div>
                        <div className="text-white/80 text-xs mt-1">
                          Uploading...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(image?.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/90"
                    disabled={isProcessing}
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
                
                {/* Image Info */}
                <div className="mt-2">
                  <p className="text-xs font-medium text-foreground truncate">
                    {image?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(image?.size / 1024 / 1024)?.toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced Processing State */}
      {isProcessing && (
        <div className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h4 className="text-sm font-medium text-primary">AI Analysis in Progress</h4>
              <p className="text-sm text-primary/80">Gemini AI is analyzing your product images. This may take a moment...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Tips with AI Focus */}
      <div className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
          <Icon name="Sparkles" size={14} className="mr-2 text-primary" />
          AI Analysis Tips
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use clear, well-lit photos for better AI recognition</li>
          <li>• Include product labels, logos, and model numbers</li>
          <li>• Multiple angles help AI understand the product better</li>
          <li>• Avoid blurry or low-resolution images</li>
          <li>• AI works best with consumer electronics and branded products</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadZone;