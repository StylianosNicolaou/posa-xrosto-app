"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Orange",
  "Pink",
  "Teal",
  "Golden",
  "Silver",
  "Crimson",
  "Azure",
  "Emerald",
  "Coral",
  "Violet",
  "Indigo",
  "Scarlet",
  "Jade",
  "Amber",
  "Ivory",
];

const ANIMALS = [
  "Panda",
  "Tiger",
  "Eagle",
  "Wolf",
  "Fox",
  "Bear",
  "Lion",
  "Hawk",
  "Dolphin",
  "Owl",
  "Falcon",
  "Panther",
  "Phoenix",
  "Dragon",
  "Lynx",
  "Cobra",
  "Raven",
  "Jaguar",
  "Shark",
  "Koala",
];

interface NamesEntryStepProps {
  currentNames: string[];
  setCurrentNames: (names: string[]) => void;
  isValid: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function NamesEntryStep({
  currentNames,
  setCurrentNames,
  isValid,
  onNext,
  onBack,
}: NamesEntryStepProps) {
  const updateName = (index: number, value: string) => {
    const newNames = [...currentNames];
    newNames[index] = value;
    setCurrentNames(newNames);
  };

  const assignRandomNames = () => {
    const count = currentNames.length;
    const usedCombos = new Set<string>();
    const randomNames: string[] = [];

    while (randomNames.length < count) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
      const combo = `${color} ${animal}`;

      if (!usedCombos.has(combo)) {
        usedCombos.add(combo);
        randomNames.push(combo);
      }
    }

    setCurrentNames(randomNames);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative z-10">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 pt-8"
        >
          <h2 className="text-4xl font-heading font-bold text-black">
            Who's eating?
          </h2>
          <p className="text-zinc-500 text-lg">Name your squad members</p>
        </motion.div>

        {/* Auto Generate Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={assignRandomNames}
            className="w-full h-12 rounded-xl border-dashed border-black/20 text-zinc-700 hover:bg-zinc-50 hover:border-black/40 transition-all font-medium"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Auto-generate Names
          </Button>
        </motion.div>

        {/* Names List */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 min-h-[300px] scrollbar-hide">
          <AnimatePresence>
            {currentNames.map((name, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold font-mono">
                  {index + 1}
                </div>
                <Input
                  value={name}
                  onChange={(e) => updateName(index, e.target.value)}
                  placeholder={`Person ${index + 1}`}
                  className="h-14 pl-12 rounded-2xl bg-white/40 backdrop-blur-sm border-black/5 text-lg font-medium focus:bg-white/80 transition-all shadow-sm"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Validation Error */}
        {!isValid && currentNames.some((name) => name.trim() !== "") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl text-center"
          >
            <p className="text-sm text-red-600 font-medium">
              Please give everyone a unique name
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 pt-4 pb-6"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="h-16 w-16 rounded-2xl border border-black/5 hover:bg-zinc-100 text-black"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="flex-1 h-16 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xl font-heading font-bold shadow-xl shadow-black/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Next Step
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
