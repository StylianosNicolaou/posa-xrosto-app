"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Receipt,
} from "lucide-react";
import type { Item } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface ItemsListProps {
  items: Item[];
  names: string[];
  totalAmount: number;
  onRemoveItem: (id: string) => void;
  onToggleItemParticipant: (itemId: string, participantName: string) => void;
  onCalculate: () => void;
  onBack: () => void;
}

export function ItemsList({
  items,
  names,
  totalAmount,
  onRemoveItem,
  onToggleItemParticipant,
  onCalculate,
  onBack,
}: ItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-60">
        <div className="w-24 h-24 rounded-full bg-zinc-100/50 flex items-center justify-center">
          <Receipt className="w-10 h-10 text-zinc-400" />
        </div>
        <p className="text-xl font-heading font-medium text-black">
          No items yet
        </p>
        <p className="text-zinc-500">
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
      <div className="bg-black text-white p-6 rounded-3xl shadow-xl shadow-black/20 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="relative z-10">
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
            Total Bill
          </p>
          <p className="text-4xl font-heading font-bold">
            ${totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
            Items
          </p>
          <p className="text-2xl font-heading font-bold">{items.length}</p>
        </div>
      </div>

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
                      ? "bg-white/60 backdrop-blur-md border-black/5 hover:bg-white/80"
                      : "bg-amber-50/80 border-amber-200/60"
                  }
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-2xl font-heading font-bold text-zinc-600 mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl -mr-2 -mt-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Participants Chips */}
                <div className="flex flex-wrap gap-2">
                  {names.map((name) => {
                    const isSelected = item.participants.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => onToggleItemParticipant(item.id, name)}
                        className={`
                          text-xs font-medium px-3 py-1.5 rounded-lg transition-all
                          ${
                            isSelected
                              ? "bg-black text-white border border-black"
                              : "bg-transparent border border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600"
                          }
                        `}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>

                {!hasParticipants && (
                  <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs font-medium bg-amber-100/50 px-3 py-1.5 rounded-lg w-fit">
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
          className="h-16 w-16 rounded-2xl border border-black/5 hover:bg-zinc-100 text-black bg-white/40 backdrop-blur-md"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          onClick={onCalculate}
          disabled={items.length === 0}
          className="flex-1 h-16 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xl font-heading font-bold shadow-xl shadow-black/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Calculate Split
          <Calculator className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
}
