"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number; // 1-4 (steps after welcome)
  totalSteps?: number;
}

export function ProgressBar({ currentStep, totalSteps = 4 }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-1 bg-neutral-200 overflow-hidden">
      <motion.div
        className="h-full bg-brand-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
