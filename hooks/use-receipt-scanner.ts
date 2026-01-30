"use client";

import { useState, useCallback } from "react";

interface ScannedItem {
  name: string;
  price: number;
  quantity: number;
}

type ScannerStatus = "idle" | "processing" | "success" | "error";

export function useReceiptScanner() {
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setScannedItems([]);
    setError(null);
  }, []);

  const processReceipt = useCallback(async (imageData: string) => {
    try {
      setError(null);
      setStatus("processing");

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

      const items: ScannedItem[] = result.data.items.map(
        (item: { name: string; price: number; quantity?: number }) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
        }),
      );

      if (items.length === 0) {
        throw new Error("No items found in the receipt");
      }

      setScannedItems(items);
      setStatus("success");
      return items;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process receipt";
      setError(errorMessage);
      setStatus("error");
      return [];
    }
  }, []);

  return {
    status,
    scannedItems,
    error,
    processReceipt,
    reset,
    setScannedItems,
  };
}
