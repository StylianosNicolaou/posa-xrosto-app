"use client";

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
import { Camera, X, Check, ScanLine } from "lucide-react";

interface ReceiptScannerProps {
  onItemsScanned: (items: { name: string; price: number }[]) => void;
  onClose: () => void;
}

export function ReceiptScanner({
  onItemsScanned,
  onClose,
}: ReceiptScannerProps) {
  const {
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
  } = useReceiptScanner();

  const handleScan = async () => {
    const items = await scanReceipt();
    if (items.length > 0) {
      onItemsScanned(items);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isScanning && scannedItems.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-cyan-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-eerie-800">Scan Receipt</CardTitle>
          <CardDescription className="text-eerie-600">
            Use your camera to scan a receipt and automatically add items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
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
              onClick={startCamera}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-lg">Initializing camera...</p>
            <p className="text-sm text-gray-300 mt-2">Please wait</p>
          </div>
        </div>
        <div className="p-4 bg-white">
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full bg-transparent"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-white max-w-md">
            <div className="mb-6">
              <Camera className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <h2 className="text-xl font-bold mb-2">Take a Photo</h2>
              <p className="text-gray-300 mb-6">
                Take a clear photo of your receipt to scan it automatically
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => {
                  // Trigger file input
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.capture = 'environment';
                  fileInput.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        const imageData = e.target?.result as string;
                        if (imageData) {
                          const items = await scanReceipt(imageData);
                          if (items.length > 0) {
                            onItemsScanned(items);
                          }
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  fileInput.click();
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
              
              <Button
                onClick={() => {
                  // Trigger file input for gallery
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        const imageData = e.target?.result as string;
                        if (imageData) {
                          const items = await scanReceipt(imageData);
                          if (items.length > 0) {
                            onItemsScanned(items);
                          }
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  fileInput.click();
                }}
                variant="outline"
                className="w-full bg-transparent text-white border-white hover:bg-white hover:text-black"
              >
                Choose from Gallery
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white">
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full bg-transparent"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (scannedItems.length > 0) {
    const totalAmount = scannedItems.reduce((sum, item) => sum + item.price, 0);

    return (
      <Card className="w-full max-w-md mx-auto bg-white border-2 border-glaucous-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-glaucous-500 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-eerie-800">
            Receipt Scanned Successfully!
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
            <div className="text-sm text-cyan-800">
              <strong>Tip:</strong> All items will be added with all
              participants selected by default. You can adjust who shared each
              item after adding them.
            </div>
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
              onClick={() => {
                onItemsScanned(scannedItems);
                handleClose();
              }}
              className="flex-1 bg-glaucous-500 hover:bg-glaucous-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Add {scannedItems.length} Items
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
