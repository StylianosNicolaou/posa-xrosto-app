"use client";

import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/animated-number";
import {
  Calculator,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Receipt,
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
  onToggleItemParticipant: (itemId: string, participantName: string) => void;
  onCalculate: () => void;
  onBack: () => void;
  currency: Currency;
}

export function ItemsList({
  items,
  names,
  totalAmount,
  onRemoveItem,
  onToggleItemParticipant,
  onCalculate,
  onBack,
  currency,
}: ItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-60">
        <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center">
          <Receipt className="w-10 h-10 text-neutral-400" />
        </div>
        <p className="text-xl font-heading font-medium text-neutral-900">
          No items yet
        </p>
        <p className="text-neutral-500">
          Tap the + button to add items manually
          <br />
          or scan a receipt
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
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
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-2xl font-heading font-bold text-neutral-500 mt-1">
                      {formatCurrency(item.price, currency)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-neutral-300 hover:text-danger hover:bg-danger/10 rounded-xl -mr-2 -mt-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
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
          disabled={items.length === 0 || items.some(item => item.participants.length === 0)}
          className="flex-1 h-16 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xl font-heading font-bold shadow-xl shadow-brand-primary/25 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Calculate Split
          <Calculator className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
}
