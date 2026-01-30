"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface ItemFormProps {
  currentItem: { name: string; price: string };
  setCurrentItem: (item: { name: string; price: string }) => void;
  names: string[];
  selectedParticipants: string[];
  toggleParticipant: (name: string) => void;
  isValid: boolean;
  onAddItem: () => void;
}

export function ItemForm({
  currentItem,
  setCurrentItem,
  names,
  selectedParticipants,
  toggleParticipant,
  isValid,
  onAddItem,
}: ItemFormProps) {
  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-500 uppercase tracking-wider pl-1">
            What is it?
          </Label>
          <Input
            value={currentItem.name}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, name: e.target.value })
            }
            placeholder="e.g. Truffle Fries"
            className="h-16 rounded-2xl bg-neutral-100 border-transparent text-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-brand-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-500 uppercase tracking-wider pl-1">
            How much?
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-neutral-400">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={currentItem.price}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, price: e.target.value })
              }
              placeholder="0.00"
              className="h-16 pl-10 rounded-2xl bg-neutral-100 border-transparent text-3xl font-heading font-bold text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-neutral-500 uppercase tracking-wider pl-1">
          Who shared it?
        </Label>
        <div className="flex flex-wrap gap-3">
          {names.map((name) => {
            const isSelected = selectedParticipants.includes(name);
            return (
              <motion.button
                key={name}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleParticipant(name)}
                className={`
                  px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 border
                  ${
                    isSelected
                      ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                      : "bg-white border-neutral-200 text-neutral-700 hover:border-brand-primary/40"
                  }
                `}
              >
                {name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Add Button */}
      <Button
        onClick={onAddItem}
        disabled={!isValid}
        className="w-full h-20 rounded-[2rem] bg-brand-primary hover:bg-brand-primary-hover text-white text-xl font-heading font-bold shadow-xl shadow-brand-primary/25 disabled:opacity-50 disabled:shadow-none transition-all mt-8"
      >
        <Plus className="w-6 h-6 mr-2" />
        Add to Order
      </Button>
    </div>
  );
}
