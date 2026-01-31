"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedNumber } from "@/components/animated-number";
import {
  Calculator,
  ArrowLeft,
  ArrowRight,
  Trash2,
  AlertCircle,
  Receipt,
  Camera,
  Plus,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { Item } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { getNameStyle } from "@/lib/easter-egg";
import { formatCurrency, type Currency } from "@/lib/currency";

interface ItemsListProps {
  items: Item[];
  names: string[];
  totalAmount: number;
  onRemoveItem: (id: string) => void;
  onEditItem: (id: string, name: string, price: number) => void;
  onToggleItemParticipant: (itemId: string, participantName: string) => void;
  onCalculate: () => void;
  onBack: () => void;
  currency: Currency;
  onScanReceipt?: () => void;
  onAddItem?: () => void;
}

export function ItemsList({
  items,
  names,
  totalAmount,
  onRemoveItem,
  onEditItem,
  onToggleItemParticipant,
  onCalculate,
  onBack,
  currency,
  onScanReceipt,
  onAddItem,
}: ItemsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const startEditing = (item: Item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const saveEdit = () => {
    if (editingId && editName.trim() && Number.parseFloat(editPrice) > 0) {
      onEditItem(editingId, editName.trim(), Number.parseFloat(editPrice));
      setEditingId(null);
      setEditName("");
      setEditPrice("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
  };
  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-[30vh] text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center">
            <Receipt className="w-10 h-10 text-neutral-400" />
          </div>
          <p className="text-xl font-heading font-medium text-neutral-900">
            No items yet
          </p>
          <p className="text-neutral-500">
            Start by scanning a receipt or adding items manually
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          {onScanReceipt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                onClick={onScanReceipt}
                className="w-full h-28 rounded-2xl bg-white border-2 border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/5 text-neutral-900 font-heading shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Camera className="w-7 h-7 text-brand-primary" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">Scan Receipt</div>
                  <div className="text-sm text-neutral-500 font-normal">Fast & automatic</div>
                </div>
              </Button>
            </motion.div>
          )}

          {onAddItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={onAddItem}
                className="w-full h-28 rounded-2xl bg-white border-2 border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/5 text-neutral-900 font-heading shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <Plus className="w-7 h-7 text-brand-primary" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">Add Items</div>
                  <div className="text-sm text-neutral-500 font-normal">Manually, one by one</div>
                </div>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 pt-4"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="h-16 w-16 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button
            disabled
            className="flex-1 h-16 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xl font-heading font-bold shadow-xl shadow-brand-primary/25 disabled:opacity-50 transition-all"
          >
            Next Step
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Action Buttons at Top */}
      <div className="flex gap-3">
        {onScanReceipt && (
          <Button
            onClick={onScanReceipt}
            variant="outline"
            className="flex-1 h-14 rounded-2xl bg-white border-2 border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/5 text-neutral-700 font-medium transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5 text-brand-primary" />
            Scan Receipt
          </Button>
        )}
        {onAddItem && (
          <Button
            onClick={onAddItem}
            className="flex-1 h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white font-medium shadow-lg shadow-brand-primary/25 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </Button>
        )}
      </div>

      {/* Total Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-primary text-white p-6 rounded-3xl shadow-xl shadow-brand-primary/30 flex justify-between items-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
            Total Bill
          </p>
          <AnimatedNumber
            value={totalAmount}
            className="text-4xl font-heading font-bold block"
            currency={currency}
          />
        </div>
        <div className="text-right relative z-10">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
            Items
          </p>
          <motion.p
            key={items.length}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-heading font-bold"
          >
            {items.length}
          </motion.p>
        </div>
      </motion.div>

      {/* Items List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const hasParticipants = item.participants.length > 0;
            const isEditing = editingId === item.id;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  group relative p-5 rounded-2xl border transition-all duration-300
                  ${
                    hasParticipants
                      ? "bg-white border-neutral-200 hover:border-neutral-300"
                      : "bg-warning/10 border-warning/30"
                  }
                `}
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Item name"
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 text-lg font-medium"
                      autoFocus
                    />
                    <Input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="Price"
                      step="0.01"
                      min="0"
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 text-lg font-medium"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={saveEdit}
                        disabled={!editName.trim() || Number.parseFloat(editPrice) <= 0}
                        className="flex-1 h-10 rounded-xl bg-success hover:bg-success/90 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        className="flex-1 h-10 rounded-xl border-neutral-200"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-2xl font-heading font-bold text-neutral-500 mt-1">
                          {formatCurrency(item.price, currency)}
                        </p>
                      </div>
                      <div className="flex gap-1 -mr-2 -mt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(item)}
                          className="text-neutral-300 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-300 hover:text-danger hover:bg-danger/10 rounded-xl"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Participants Chips */}
                    <div className="flex flex-wrap gap-2">
                      {names.map((name) => {
                        const isSelected = item.participants.includes(name);
                        const nameStyle = getNameStyle(name);
                        return (
                          <motion.button
                            key={name}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => onToggleItemParticipant(item.id, name)}
                            className={`
                              text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                              ${
                                isSelected
                                  ? "bg-brand-primary text-white border border-brand-primary"
                                  : "bg-transparent border border-neutral-200 text-neutral-500 hover:border-brand-primary/40 hover:text-neutral-700"
                              }
                            `}
                            style={!isSelected ? nameStyle : undefined}
                          >
                            {name}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Per-person share */}
                    {hasParticipants && (
                      <motion.p
                        key={item.participants.length}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-xs text-neutral-500"
                      >
                        {formatCurrency(item.price / item.participants.length, currency)} per person
                      </motion.p>
                    )}

                    {!hasParticipants && (
                      <div className="mt-3 flex items-center gap-2 text-warning text-xs font-medium bg-warning/20 px-3 py-1.5 rounded-lg w-fit">
                        <AlertCircle className="w-3 h-3" />
                        Assign to someone
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-16 w-16 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          onClick={onCalculate}
          disabled={items.length === 0}
          className="flex-1 h-16 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xl font-heading font-bold shadow-xl shadow-brand-primary/25 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Next Step
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
}
