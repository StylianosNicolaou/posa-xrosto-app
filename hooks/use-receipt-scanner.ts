"use client";

import { useState, useRef, useCallback } from "react";

interface ScannedItem {
  name: string;
  price: number;
}

export function useReceiptScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setScannedItems([]); // Clear previous results
      setIsInitializing(true);

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera not supported in this browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to load before showing camera view
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, showing camera view');
          setIsInitializing(false);
          setIsScanning(true);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play, showing camera view');
          setIsInitializing(false);
          setIsScanning(true);
        };
        
        videoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          setError('Failed to load camera video');
          setIsInitializing(false);
        };
        
        // Fallback in case events don't fire
        setTimeout(() => {
          if (!isScanning && !error) {
            console.log('Fallback: showing camera view after timeout');
            setIsInitializing(false);
            setIsScanning(true);
          }
        }, 2000);

        // Force video to play on mobile
        setTimeout(() => {
          if (videoRef.current && videoRef.current.paused) {
            console.log('Forcing video to play');
            videoRef.current.play().catch(console.error);
          }
        }, 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (errorMessage.includes("Permission")) {
        setError(
          "Camera access denied. Please allow camera permissions and try again."
        );
      } else if (errorMessage.includes("NotFound")) {
        setError("No camera found on this device.");
      } else {
        setError("Failed to access camera. Please check your device settings.");
      }
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  // Real OCR processing using Google Cloud Vision API
  const processReceipt = useCallback(async (imageData: string) => {
    try {
      setError(null);
      setIsProcessing(true);

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process receipt");
      }

      if (!result.success || !result.data || !result.data.items) {
        throw new Error("Invalid response from OCR service");
      }

      const items: ScannedItem[] = result.data.items.map((item: any) => ({
        name: item.name,
        price: item.price,
      }));

      setScannedItems(items);
      setIsProcessing(false);
      return items;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process receipt";
      setError(errorMessage);
      setIsProcessing(false);
      return [];
    }
  }, []);

  const scanReceipt = useCallback(async () => {
    const imageData = captureImage();
    if (!imageData) {
      setError("Failed to capture image");
      return [];
    }

    return await processReceipt(imageData);
  }, [captureImage, processReceipt]);

  return {
    isScanning,
    isProcessing,
    isInitializing,
    scannedItems,
    error,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    scanReceipt,
    setScannedItems,
  };
}
