"use client";

import { useState } from "react";
import { ItemForm } from "./item-form";
import { ItemsList } from "./items-list";
import { ReceiptScanner } from "./receipt-scanner";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import type { Item } from "@/types";

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

  const handleScannedItems = (
    scannedItems: { name: string; price: number }[]
  ) => {
    // Add scanned items to the items list
    onAddMultipleItems(scannedItems);
    setShowScanner(false);
  };

  if (showScanner) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <ReceiptScanner
          onItemsScanned={handleScannedItems}
          onClose={() => setShowScanner(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center mb-4">
          <Button
            onClick={() => setShowScanner(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-md"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Receipt
          </Button>
        </div>

        <ItemForm
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          names={names}
          selectedParticipants={selectedParticipants}
          toggleParticipant={toggleParticipant}
          isValid={isValidItem}
          onAddItem={onAddItem}
        />

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
    </div>
  );
}
