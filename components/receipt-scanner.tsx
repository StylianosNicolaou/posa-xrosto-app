"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useReceiptScanner } from "@/hooks/use-receipt-scanner";
import {
  Camera,
  X,
  Check,
  Loader2,
  AlertCircle,
  ImageIcon,
  SwitchCamera,
} from "lucide-react";

interface ReceiptScannerProps {
  onItemsScanned: (items: { name: string; price: number }[]) => void;
  onClose: () => void;
}

type CameraState = "idle" | "requesting" | "active" | "error" | "not-supported";

export function ReceiptScanner({
  onItemsScanned,
  onClose,
}: ReceiptScannerProps) {
  const { status, scannedItems, error, processReceipt, reset } =
    useReceiptScanner();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const isStartingRef = useRef(false);
  const mountedRef = useRef(true);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );

  // Stop camera stream
  const stopCamera = useCallback(() => {
    isStartingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(
    async (requestedFacingMode?: "environment" | "user") => {
      // Prevent concurrent starts
      if (isStartingRef.current) {
        return;
      }

      // Check if camera API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState("not-supported");
        setCameraError(
          "Camera is not supported in this browser. Please use the gallery option.",
        );
        return;
      }

      isStartingRef.current = true;
      setCameraState("requesting");
      setCameraError(null);

      try {
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const mode = requestedFacingMode ?? facingMode;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        // Check if we were cancelled while waiting
        if (!isStartingRef.current || !mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Use onloadedmetadata event instead of direct play()
          await new Promise<void>((resolve, reject) => {
            const video = videoRef.current;
            if (!video) {
              reject(new Error("Video element not found"));
              return;
            }

            const handleLoadedMetadata = async () => {
              video.removeEventListener("loadedmetadata", handleLoadedMetadata);
              try {
                await video.play();
                resolve();
              } catch (playErr) {
                reject(playErr);
              }
            };

            // If metadata is already loaded
            if (video.readyState >= 1) {
              video.play().then(resolve).catch(reject);
            } else {
              video.addEventListener("loadedmetadata", handleLoadedMetadata);
            }
          });

          // Check again if still valid
          if (!isStartingRef.current || !mountedRef.current) {
            return;
          }

          setCameraState("active");
        }
      } catch (err) {
        // Ignore AbortError - it just means play was interrupted
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log(
            "Camera play() interrupted - this is normal during fast navigation",
          );
          return;
        }

        console.error("Camera error:", err);

        // Only update state if we're still supposed to be starting
        if (!isStartingRef.current || !mountedRef.current) {
          return;
        }

        setCameraState("error");

        if (err instanceof DOMException) {
          switch (err.name) {
            case "NotAllowedError":
              setCameraError(
                "Camera permission was denied. Please allow camera access and try again.",
              );
              break;
            case "NotFoundError":
              setCameraError("No camera found on this device.");
              break;
            case "NotReadableError":
              setCameraError(
                "Camera is already in use by another application.",
              );
              break;
            case "OverconstrainedError":
              setCameraError("Camera does not support the requested settings.");
              break;
            default:
              setCameraError(`Camera error: ${err.message}`);
          }
        } else {
          setCameraError("Failed to access camera. Please try again.");
        }
      } finally {
        isStartingRef.current = false;
      }
    },
    [facingMode],
  );

  // Auto-start camera on mount
  useEffect(() => {
    mountedRef.current = true;

    if (status === "idle" && cameraState === "idle") {
      startCamera();
    }

    return () => {
      mountedRef.current = false;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    stopCamera();
    // Small delay to ensure cleanup, then start with new mode
    setTimeout(() => {
      startCamera(newMode);
    }, 100);
  }, [facingMode, stopCamera, startCamera]);

  // Capture photo from video stream
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64
    const imageData = canvas.toDataURL("image/jpeg", 0.9);

    // Stop the camera stream
    stopCamera();
    setCameraState("idle");

    // Process the image
    await processReceipt(imageData);
  }, [processReceipt, stopCamera]);

  const handleFileSelect = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      if (imageData) {
        stopCamera();
        setCameraState("idle");
        await processReceipt(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  const handleClose = () => {
    stopCamera();
    reset();
    onClose();
  };

  const handleRetry = () => {
    reset();
    setCameraState("idle");
    setCameraError(null);
    // Start camera again after reset
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleAddItems = () => {
    onItemsScanned(scannedItems);
    handleClose();
  };

  // Hidden file input and canvas for capturing
  const hiddenElements = (
    <>
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Choose receipt from gallery"
      />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );

  // Processing state - show loading indicator
  if (status === "processing") {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        {hiddenElements}
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Processing Receipt
            </h2>
            <p className="text-neutral-500">Analyzing your receipt...</p>
          </div>
          <div className="flex justify-center gap-1.5">
            <div
              className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full h-14 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Error state (OCR processing error)
  if (status === "error") {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        {hiddenElements}
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-danger" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Scan Failed
            </h2>
            <p className="text-neutral-500">
              {error || "Failed to process receipt"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200 text-left">
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Tips for better results:
            </p>
            <ul className="text-sm text-neutral-500 space-y-1">
              <li>• Ensure good lighting</li>
              <li>• Hold the camera steady</li>
              <li>• Include the entire receipt</li>
              <li>• Avoid shadows and glare</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-14 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRetry}
              className="flex-1 h-14 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white"
            >
              <Camera className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show scanned items
  if (status === "success" && scannedItems.length > 0) {
    const totalAmount = scannedItems.reduce((sum, item) => sum + item.price, 0);
    const totalItems = scannedItems.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );

    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col p-6">
        {hiddenElements}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          {/* Header */}
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              Receipt Scanned!
            </h2>
            <p className="text-neutral-500">
              Found {totalItems} item{totalItems !== 1 ? "s" : ""} • Total: $
              {totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {scannedItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-white rounded-xl border border-neutral-200"
              >
                <div className="flex-1">
                  <span className="font-medium text-neutral-900">
                    {item.quantity > 1 && (
                      <span className="inline-flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full w-5 h-5 mr-2">
                        {item.quantity}
                      </span>
                    )}
                    {item.name}
                  </span>
                  {item.quantity > 1 && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      ${(item.price / item.quantity).toFixed(2)} each
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-white bg-brand-primary px-3 py-1 rounded-full">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10 mb-4">
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Note:</span> Items will be added
              without participants. You can assign who shared each item after
              adding.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 h-14 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            >
              <Camera className="w-5 h-5 mr-2" />
              Rescan
            </Button>
            <Button
              onClick={handleAddItems}
              className="flex-1 h-14 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold"
            >
              <Check className="w-5 h-5 mr-2" />
              Add Items
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Camera active state - show live preview
  if (cameraState === "active" || cameraState === "requesting") {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col p-6">
        {hiddenElements}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          {/* Camera preview container */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-neutral-900">
            {/* Video preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Requesting overlay */}
            {cameraState === "requesting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                <div className="text-center text-white">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-neutral-300">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Close button - top left */}
            <div className="absolute top-4 left-4 z-20">
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="text-white bg-black/40 hover:bg-black/60 border border-white/20 h-10 w-10 rounded-xl backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Camera controls - bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="flex items-center justify-center gap-16">
                {/* Gallery button */}
                <Button
                  onClick={() => galleryInputRef.current?.click()}
                  variant="ghost"
                  size="icon"
                  className="text-white bg-black/40 hover:bg-black/60 border border-white/20 h-12 w-12 rounded-xl backdrop-blur-sm"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>

                {/* Capture button */}
                <button
                  onClick={capturePhoto}
                  disabled={cameraState !== "active"}
                  className="h-16 w-16 rounded-full bg-white border-4 border-brand-primary flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
                >
                  <div className="h-12 w-12 rounded-full bg-brand-primary" />
                </button>

                {/* Switch camera button */}
                <Button
                  onClick={switchCamera}
                  variant="ghost"
                  size="icon"
                  className="text-white bg-black/40 hover:bg-black/60 border border-white/20 h-12 w-12 rounded-xl backdrop-blur-sm"
                >
                  <SwitchCamera className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instruction text */}
          <p className="text-center text-sm text-neutral-500 mt-4">
            Point at your receipt and tap to capture
          </p>
        </div>
      </div>
    );
  }

  // Camera error state or not supported
  if (cameraState === "error" || cameraState === "not-supported") {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        {hiddenElements}
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-warning" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Camera Unavailable
            </h2>
            <p className="text-neutral-500">
              {cameraError || "Unable to access camera"}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full h-14 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Choose from Gallery
            </Button>

            {cameraState === "error" && (
              <Button
                onClick={() => {
                  setCameraState("idle");
                  setCameraError(null);
                  startCamera();
                }}
                variant="outline"
                className="w-full h-14 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              >
                <Camera className="w-5 h-5 mr-2" />
                Try Camera Again
              </Button>
            )}

            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full h-12 text-neutral-500 hover:text-neutral-900"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Idle state - fallback UI (shouldn't normally be seen)
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
      {hiddenElements}
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center">
          <Camera className="w-10 h-10 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Scan Receipt
          </h2>
          <p className="text-neutral-500">
            Take a photo or choose an image of your receipt
          </p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => startCamera()}
            className="w-full h-14 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </Button>

          <Button
            onClick={() => galleryInputRef.current?.click()}
            variant="outline"
            className="w-full h-14 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-100"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Choose from Gallery
          </Button>

          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full h-12 text-neutral-500 hover:text-neutral-900"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
