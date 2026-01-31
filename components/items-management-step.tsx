"use client";

import { useState } from "react";
import { ItemForm } from "./item-form";
import { ItemsList } from "./items-list";
import { ReceiptScanner } from "./receipt-scanner";
import { ProgressBar } from "@/components/progress-bar";
import { CurrencySelector } from "@/components/currency-selector";
import { Button } from "@/components/ui/button";
import { Camera, Plus, ArrowLeft } from "lucide-react";
import type { Item } from "@/types";
import type { Currency } from "@/lib/currency";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ItemsManagementStepProps {
  names: string[];
  items: Item[];
  currentItem: { name: string; price: string };
  setCurrentItem: (item: { name: string; price: string }) => void;
  selectedParticipants: string[];
  toggleParticipant: (name: string) => void;
  totalAmount: number;
  isValidItem: boolean;
  onAddItem: () => void;
  onAddMultipleItems: (items: { name: string; price: number }[]) => void;
  onRemoveItem: (id: string) => void;
  onEditItem: (id: string, name: string, price: number) => void;
  onToggleItemParticipant: (itemId: string, participantName: string) => void;
  onCalculate: () => void;
  onBack: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export function ItemsManagementStep({
  names,
  items,
  currentItem,
  setCurrentItem,
  selectedParticipants,
  toggleParticipant,
  totalAmount,
  isValidItem,
  onAddItem,
  onAddMultipleItems,
  onRemoveItem,
  onEditItem,
  onToggleItemParticipant,
  onCalculate,
  onBack,
  currency,
  onCurrencyChange,
}: ItemsManagementStepProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleScannedItems = (
    scannedItems: { name: string; price: number }[],
    detectedCurrency?: Currency,
  ) => {
    onAddMultipleItems(scannedItems);
    if (detectedCurrency) {
      onCurrencyChange(detectedCurrency);
    }
    setShowScanner(false);
  };

  const handleManualAdd = () => {
    onAddItem();
    setIsFormOpen(false); // Close sheet after adding
  };

  if (showScanner) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-900">
        <ReceiptScanner
          onItemsScanned={handleScannedItems}
          onClose={() => setShowScanner(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10 pb-32 bg-neutral-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-30">
        <ProgressBar currentStep={3} />
      </div>

      {/* Header with Currency */}
      <div className="sticky top-1 z-20 bg-white/90 backdrop-blur-xl border-b border-neutral-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <h2 className="text-2xl font-heading font-bold text-neutral-900">
            Order List
          </h2>
          <CurrencySelector currency={currency} onCurrencyChange={onCurrencyChange} />
        </div>
      </div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6">
        <ItemsList
          items={items}
          names={names}
          totalAmount={totalAmount}
          onRemoveItem={onRemoveItem}
          onEditItem={onEditItem}
          onToggleItemParticipant={onToggleItemParticipant}
          onCalculate={onCalculate}
          onBack={onBack}
          currency={currency}
          onScanReceipt={() => setShowScanner(true)}
          onAddItem={() => setIsFormOpen(true)}
        />
      </div>

      {/* Sheet for Manual Add */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[2rem] h-[85vh] p-0 border-0 bg-white"
        >
          <div className="h-full overflow-y-auto p-6">
            <SheetHeader className="mb-6 text-left">
              <SheetTitle className="text-3xl font-heading font-bold text-neutral-900">
                Add Item
              </SheetTitle>
            </SheetHeader>
            <ItemForm
              currentItem={currentItem}
              setCurrentItem={setCurrentItem}
              names={names}
              selectedParticipants={selectedParticipants}
              toggleParticipant={toggleParticipant}
              isValid={isValidItem}
              onAddItem={handleManualAdd}
              currency={currency}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
