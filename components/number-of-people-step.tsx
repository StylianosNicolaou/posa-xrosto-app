"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/progress-bar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface NumberOfPeopleStepProps {
  numberOfPeople: string;
  setNumberOfPeople: (value: string) => void;
  isValid: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function NumberOfPeopleStep({
  numberOfPeople,
  setNumberOfPeople,
  isValid,
  onNext,
  onBack,
}: NumberOfPeopleStepProps) {
  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-neutral-50">
      <ProgressBar currentStep={1} />
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full space-y-12 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900">
            How many
            <br />
            people?
          </h2>
          <p className="text-neutral-500 text-lg">Select the party size</p>
        </motion.div>

        {/* Grid Selection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {[2, 3, 4, 5, 6, 7].map((num, i) => (
            <motion.button
              key={num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => setNumberOfPeople(num.toString())}
              className={`
                relative h-24 rounded-3xl text-3xl font-heading font-bold transition-all duration-300
                ${
                  numberOfPeople === num.toString()
                    ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/25 scale-105"
                    : "bg-white border border-neutral-200 text-neutral-900 hover:border-brand-primary/40"
                }
              `}
            >
              {num}
            </motion.button>
          ))}
        </motion.div>

        {/* Custom Input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="relative">
            <Input
              type="number"
              min="2"
              max="20"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
              placeholder="Or type a number..."
              className="h-16 rounded-2xl bg-white border-neutral-200 text-center text-xl font-heading font-bold placeholder:text-neutral-400 focus:bg-white focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
            />
          </div>

          {numberOfPeople && !isValid && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-danger text-center font-medium bg-danger/10 py-2 rounded-lg"
            >
              Please enter between 2 and 20
            </motion.p>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
            onClick={() => isValid && onNext()}
            disabled={!isValid}
            className="flex-1 h-16 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xl font-heading font-bold shadow-xl shadow-brand-primary/25 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Next Step
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
