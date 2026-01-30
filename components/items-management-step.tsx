"use client";

import { useState } from "react";
import { ItemForm } from "./item-form";
import { ItemsList } from "./items-list";
import { ReceiptScanner } from "./receipt-scanner";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";
import type { Item } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
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
}: ItemsManagementStepProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleScannedItems = (
    scannedItems: { name: string; price: number }[],
  ) => {
    onAddMultipleItems(scannedItems);
    setShowScanner(false);
  };

  const handleManualAdd = () => {
    onAddItem();
    setIsFormOpen(false); // Close sheet after adding
  };

  if (showScanner) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <ReceiptScanner
          onItemsScanned={handleScannedItems}
          onClose={() => setShowScanner(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10 pb-32">
      {/* Header / Actions */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-black/5 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <h2 className="text-2xl font-heading font-bold text-black">
            Order List
          </h2>
          <Button
            onClick={() => setShowScanner(true)}
            className="rounded-full bg-zinc-100 text-black hover:bg-zinc-200 border-0 font-medium px-6"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Receipt
          </Button>
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
        />
      </div>

      {/* Floating Action Button for Manual Add */}
      <div className="fixed bottom-8 right-6 z-30">
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-black text-white shadow-2xl shadow-black/30 hover:scale-110 transition-all active:scale-95"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-[2rem] h-[85vh] p-0 border-0 bg-white/95 backdrop-blur-xl"
          >
            <div className="h-full overflow-y-auto p-6">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-3xl font-heading font-bold text-black">
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
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
