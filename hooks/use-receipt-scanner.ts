"use client";

import { useState, useCallback } from "react";
import { detectCurrency, type Currency } from "@/lib/currency";

interface ScannedItem {
  name: string;
  price: number;
  quantity: number;
}

type ScannerStatus = "idle" | "processing" | "success" | "error";

export function useReceiptScanner() {
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [detectedCurrency, setDetectedCurrency] = useState<Currency | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setScannedItems([]);
    setDetectedCurrency(null);
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

      // Detect currency from the API response or fall back to detecting from text
      let currency: Currency | null = null;
      if (result.data.currency) {
        currency = result.data.currency as Currency;
      }
      
      setScannedItems(items);
      setDetectedCurrency(currency);
      setStatus("success");
      return { items, currency };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process receipt";
      setError(errorMessage);
      setStatus("error");
      return { items: [], currency: null };
    }
  }, []);

  return {
    status,
    scannedItems,
    detectedCurrency,
    error,
    processReceipt,
    reset,
    setScannedItems,
  };
}
