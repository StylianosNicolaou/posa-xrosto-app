"use client";

import { useState } from "react";
import { ItemForm } from "./item-form";
import { ItemsList } from "./items-list";
import { ReceiptScanner } from "./receipt-scanner";
import { ProgressBar } from "@/components/progress-bar";
import { CurrencySelector } from "@/components/currency-selector";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";
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

      {/* Header / Actions */}
      <div className="sticky top-1 z-20 bg-white/90 backdrop-blur-xl border-b border-neutral-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <h2 className="text-2xl font-heading font-bold text-neutral-900">
            Order List
          </h2>
          <div className="flex items-center gap-3">
            <CurrencySelector currency={currency} onCurrencyChange={onCurrencyChange} />
            <Button
              onClick={() => setShowScanner(true)}
              className="rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-0 font-medium px-6"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan Receipt
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6">
        <ItemsList
          items={items}
          names={names}
          totalAmount={totalAmount}
          onRemoveItem={onRemoveItem}
          onToggleItemParticipant={onToggleItemParticipant}
          onCalculate={onCalculate}
          onBack={onBack}
          currency={currency}
        />
      </div>

      {/* Floating Action Button - ACCENT color (2% usage, rare!) */}
      <motion.div
        className="fixed bottom-8 right-6 z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      >
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger asChild>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-brand-accent text-neutral-900 shadow-2xl shadow-brand-accent/40 hover:bg-brand-accent-hover transition-colors"
              >
                <Plus className="w-8 h-8" />
              </Button>
            </motion.div>
          </SheetTrigger>
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
      </motion.div>
    </div>
  );
}
