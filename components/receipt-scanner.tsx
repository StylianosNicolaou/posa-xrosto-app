"use client";

import { useRef, useEffect } from "react";
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
import { Camera, X, Check, Loader2, AlertCircle, ImageIcon } from "lucide-react";

interface ReceiptScannerProps {
  onItemsScanned: (items: { name: string; price: number }[]) => void;
  onClose: () => void;
}

export function ReceiptScanner({
  onItemsScanned,
  onClose,
}: ReceiptScannerProps) {
  const {
    status,
    scannedItems,
    error,
    processReceipt,
    reset,
  } = useReceiptScanner();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Auto-trigger camera on mount for mobile-first experience
  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      if (cameraInputRef.current && status === "idle") {
        cameraInputRef.current.click();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [status]);

  const handleFileSelect = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      if (imageData) {
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
    reset();
    onClose();
  };

  const handleRetry = () => {
    reset();
    // Trigger camera again after reset
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 100);
  };

  const handleAddItems = () => {
    onItemsScanned(scannedItems);
    handleClose();
  };

  // Hidden file inputs
  const fileInputs = (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Take photo of receipt"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Choose receipt from gallery"
      />
    </>
  );

  // Processing state - show loading indicator
  if (status === "processing") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-cyan-200">
        {fileInputs}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <CardTitle className="text-xl text-eerie-800">Processing Receipt</CardTitle>
          <CardDescription className="text-eerie-600">
            Analyzing your receipt with OCR...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
            <p className="text-center text-sm text-eerie-600">
              This may take a few seconds
            </p>
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-red-200">
        {fileInputs}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-eerie-800">Scan Failed</CardTitle>
          <CardDescription className="text-red-600">
            {error || "Failed to process receipt"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Tips for better results:</strong>
            </p>
            <ul className="text-sm text-red-600 mt-2 list-disc list-inside space-y-1">
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
              className="flex-1 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleRetry}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
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

    return (
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-glaucous-200">
        {fileInputs}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-glaucous-500 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-eerie-800">
            Receipt Scanned!
          </CardTitle>
          <CardDescription className="text-eerie-600">
            Found {scannedItems.length} items • Total: ${totalAmount.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {scannedItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-glaucous-50 rounded-lg border border-glaucous-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-eerie-800">{item.name}</div>
                  <div className="text-xs text-eerie-600">Item {index + 1}</div>
                </div>
                <Badge className="bg-glaucous-500 text-white font-semibold">
                  ${item.price.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800">
              <strong>Note:</strong> Items will be added with all participants selected.
              You can adjust who shared each item after adding.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Camera className="w-4 h-4 mr-2" />
              Rescan
            </Button>
            <Button
              onClick={handleAddItems}
              className="flex-1 bg-glaucous-500 hover:bg-glaucous-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Add Items
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Idle state - waiting for user to take/select photo
  // Camera should auto-open, but show options if user cancels or if auto-open fails
  return (
    <Card className="w-full max-w-md mx-auto bg-white border-2 border-cyan-200">
      {fileInputs}
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl text-eerie-800">Scan Receipt</CardTitle>
        <CardDescription className="text-eerie-600">
          Take a photo or choose an image of your receipt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6"
          >
            <Camera className="w-5 h-5 mr-2" />
            Take Photo
          </Button>
          
          <Button
            onClick={() => galleryInputRef.current?.click()}
            variant="outline"
            className="w-full border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 py-6"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Choose from Gallery
          </Button>
        </div>

        <Button
          onClick={handleClose}
          variant="ghost"
          className="w-full text-eerie-500 hover:text-eerie-700"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
