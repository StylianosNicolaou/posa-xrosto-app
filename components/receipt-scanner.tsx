"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-brand-primary/30">
        {hiddenElements}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <CardTitle className="text-xl text-neutral-900">
            Processing Receipt
          </CardTitle>
          <CardDescription className="text-neutral-500">
            Analyzing your receipt with OCR...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex gap-1">
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
            </div>
            <p className="text-center text-sm text-neutral-500">
              This may take a few seconds
            </p>
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full bg-transparent border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state (OCR processing error)
  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-danger/30">
        {hiddenElements}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-danger rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-neutral-900">Scan Failed</CardTitle>
          <CardDescription className="text-danger">
            {error || "Failed to process receipt"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
            <p className="text-sm text-danger">
              <strong>Tips for better results:</strong>
            </p>
            <ul className="text-sm text-danger/80 mt-2 list-disc list-inside space-y-1">
              <li>Ensure good lighting</li>
              <li>Hold the camera steady</li>
              <li>Include the entire receipt</li>
              <li>Avoid shadows and glare</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-transparent border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleRetry}
              className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
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
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-success/30">
        {hiddenElements}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-success rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-neutral-900">
            Receipt Scanned!
          </CardTitle>
          <CardDescription className="text-neutral-500">
            Found {totalItems} item{totalItems !== 1 ? "s" : ""} • Total: $
            {totalAmount.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {scannedItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg border border-neutral-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">
                    {item.quantity > 1 && (
                      <span className="inline-flex items-center justify-center bg-brand-primary/15 text-brand-primary text-xs font-bold rounded-full w-5 h-5 mr-2">
                        {item.quantity}
                      </span>
                    )}
                    {item.name}
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-xs text-neutral-500 mt-0.5">
                      ${(item.price / item.quantity).toFixed(2)} each
                    </div>
                  )}
                </div>
                <Badge className="bg-brand-primary text-white font-semibold">
                  ${item.price.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 bg-info/10 rounded-lg border border-info/20">
            <p className="text-sm text-neutral-700">
              <strong>Note:</strong> Items will be added with all participants
              selected. You can adjust who shared each item after adding.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 bg-transparent border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            >
              <Camera className="w-4 h-4 mr-2" />
              Rescan
            </Button>
            <Button
              onClick={handleAddItems}
              className="flex-1 bg-success hover:bg-success/90 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Add Items
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Camera active state - show live preview
  if (cameraState === "active" || cameraState === "requesting") {
    return (
      <div className="w-full max-w-md mx-auto">
        {hiddenElements}
        <Card className="bg-neutral-900 border-2 border-brand-primary/30 overflow-hidden">
          <div className="relative">
            {/* Video preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[3/4] object-cover bg-neutral-900"
            />

            {/* Requesting overlay */}
            {cameraState === "requesting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Camera controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between gap-4">
                {/* Close button */}
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-12 w-12"
                >
                  <X className="w-6 h-6" />
                </Button>

                {/* Capture button */}
                <Button
                  onClick={capturePhoto}
                  disabled={cameraState !== "active"}
                  className="h-16 w-16 rounded-full bg-white hover:bg-gray-100 border-4 border-brand-primary p-0"
                >
                  <div className="h-12 w-12 rounded-full bg-brand-primary" />
                </Button>

                {/* Switch camera button */}
                <Button
                  onClick={switchCamera}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-12 w-12"
                >
                  <SwitchCamera className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Gallery option */}
            <div className="absolute top-4 right-4">
              <Button
                onClick={() => galleryInputRef.current?.click()}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
        <p className="text-center text-sm text-neutral-400 mt-3">
          Point at your receipt and tap the capture button
        </p>
      </div>
    );
  }

  // Camera error state or not supported
  if (cameraState === "error" || cameraState === "not-supported") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-warning/40">
        {hiddenElements}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-warning rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-neutral-900">
            Camera Unavailable
          </CardTitle>
          <CardDescription className="text-warning">
            {cameraError || "Unable to access camera"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => galleryInputRef.current?.click()}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-6"
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
              className="w-full border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-100 py-6"
            >
              <Camera className="w-5 h-5 mr-2" />
              Try Camera Again
            </Button>
          )}

          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full text-neutral-500 hover:text-neutral-900"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Idle state - fallback UI (shouldn't normally be seen)
  return (
    <Card className="w-full max-w-md mx-auto bg-white border-2 border-brand-primary/30">
      {hiddenElements}
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl text-neutral-900">Scan Receipt</CardTitle>
        <CardDescription className="text-neutral-500">
          Take a photo or choose an image of your receipt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            onClick={() => startCamera()}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-6"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </Button>

          <Button
            onClick={() => galleryInputRef.current?.click()}
            variant="outline"
            className="w-full border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-100 py-6"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Choose from Gallery
          </Button>
        </div>

        <Button
          onClick={handleClose}
          variant="ghost"
          className="w-full text-neutral-500 hover:text-neutral-900"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
