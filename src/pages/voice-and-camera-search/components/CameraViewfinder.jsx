import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CameraViewfinder = ({
  onCapture,
  onBarcodeDetected,
  isProcessing = false,
  mode = 'camera', // 'camera', 'barcode'
  className = ''
}) => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanningAnimation, setScanningAnimation] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream?.getTracks()?.forEach((track) => track?.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices?.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      setHasPermission(true);
      setIsActive(true);

      if (videoRef?.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream?.getTracks()?.forEach((track) => track?.stop());
      setStream(null);
    }
    setIsActive(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (!videoRef?.current || !canvasRef?.current) return;

    const video = videoRef?.current;
    const canvas = canvasRef?.current;
    const context = canvas?.getContext('2d');

    canvas.width = video?.videoWidth;
    canvas.height = video?.videoHeight;
    context?.drawImage(video, 0, 0);

    const imageData = canvas?.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    if (onCapture) {
      onCapture(imageData);
    }
  };

  const scanBarcode = async () => {
    if (!('BarcodeDetector' in window)) {
      setError('Barcode detection is not supported in this browser.');
      return;
    }

    if (!videoRef?.current || !canvasRef?.current) {
      setError('Camera is not active.');
      return;
    }

    try {
      setScanningAnimation(true);
      const detector = new window.BarcodeDetector({
        formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
      });

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const bitmap = await createImageBitmap(canvas);
      const codes = await detector.detect(bitmap);

      setScanningAnimation(false);

      if (codes.length > 0 && onBarcodeDetected) {
        onBarcodeDetected({
          code: codes[0].rawValue,
          format: codes[0].format
        });
      } else {
        setError('No barcode detected. Please try again.');
      }
    } catch (err) {
      setScanningAnimation(false);
      setError(err.message || 'Barcode scan failed.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className={`relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video Stream */}
      {isActive && !capturedImage && (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured product for AI analysis"
          className="w-full h-full object-cover"
        />
      )}

      {/* Camera Inactive State */}
      {!isActive && !capturedImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <Icon name="Camera" size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-2">Camera Ready</p>
            <p className="text-gray-400 text-sm mb-4">
              {mode === 'barcode' ? 'Scan product barcodes' : 'Capture product images'}
            </p>
            <Button onClick={startCamera} className="bg-primary hover:bg-primary/90">
              <Icon name="Camera" size={16} className="mr-2" />
              Start Camera
            </Button>
          </div>
        </div>
      )}

      {/* Barcode Scanning Overlay */}
      {mode === 'barcode' && isActive && !capturedImage && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanning Frame */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-primary rounded-lg">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
          </div>

          {/* Scanning Animation */}
          {scanningAnimation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32">
              <div className="w-full h-0.5 bg-primary animate-pulse"></div>
              <div className="w-full h-0.5 bg-primary/50 animate-bounce mt-2"></div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg">
            <p className="text-white text-sm text-center">
              {scanningAnimation ? 'Scanning barcode...' : 'Align barcode within the frame'}
            </p>
          </div>
        </div>
      )}

      {/* Product Photo Overlay */}
      {mode === 'camera' && isActive && !capturedImage && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Center Guide */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/50 rounded-lg">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg">
            <p className="text-white text-sm text-center">
              Center the product in the frame for best results
            </p>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-gray-900">AI Processing...</p>
            <p className="text-xs text-gray-500 mt-1">Analyzing image with Gemini 2.0</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center p-6">
            <Icon name="AlertCircle" size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-2">Camera Error</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <Button
              onClick={startCamera}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      {isActive && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          {!capturedImage ? (
            <>
              <Button
                onClick={stopCamera}
                variant="outline"
                size="icon"
                className="bg-black/50 border-white/30 text-white hover:bg-black/70"
              >
                <Icon name="X" size={20} />
              </Button>

              <Button
                onClick={mode === 'barcode' ? scanBarcode : capturePhoto}
                disabled={isProcessing || scanningAnimation}
                className="bg-primary hover:bg-primary/90 w-16 h-16 rounded-full"
              >
                <Icon name={mode === 'barcode' ? 'Scan' : 'Camera'} size={24} />
              </Button>

              <Button
                onClick={() => {
                  /* Switch camera */
                }}
                variant="outline"
                size="icon"
                className="bg-black/50 border-white/30 text-white hover:bg-black/70"
              >
                <Icon name="RotateCcw" size={20} />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="bg-black/50 border-white/30 text-white hover:bg-black/70"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Retake
              </Button>

              <Button
                onClick={() => onCapture && onCapture(capturedImage)}
                className="bg-success hover:bg-success/90"
              >
                <Icon name="Check" size={16} className="mr-2" />
                Use Photo
              </Button>
            </>
          )}
        </div>
      )}

      {/* Hidden Canvas for Image Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraViewfinder;
