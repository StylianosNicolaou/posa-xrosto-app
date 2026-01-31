"use client";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";
import { AnimatedNumber } from "@/components/animated-number";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RotateCcw,
  ArrowLeft,
  Share2,
  FileText,
  List,
  ChevronDown,
  Check,
} from "lucide-react";
import type { PersonTotal } from "@/types";
import { motion } from "framer-motion";
import { getNameStyle } from "@/lib/easter-egg";

interface ResultsStepProps {
  results: PersonTotal[];
  totalAmount: number;
  namesCount: number;
  onBack: () => void;
  onReset: () => void;
}

export function ResultsStep({
  results,
  totalAmount,
  namesCount,
  onBack,
  onReset,
}: ResultsStepProps) {
  const generateSimpleBill = () => {
    return `\nTotal: $${totalAmount.toFixed(2)}\n\n${results
      .map((person) => `${person.name}: $${person.total.toFixed(2)}`)
      .join("\n")}\n\nSplit with Posa Xrosto!`;
  };

  const generateFullBill = () => {
    const personDetails = results
      .map((person) => {
        const itemsList = person.items
          .map((item) => `  • ${item.name}: $${item.share.toFixed(2)}`)
          .join("\n");
        return `${person.name}: $${person.total.toFixed(2)}\n${itemsList}`;
      })
      .join("\n\n");

    return `\nTotal: $${totalAmount.toFixed(2)}\n\n${personDetails}\n\nSplit with Posa Xrosto!`;
  };

  const handleShare = async (type: "simple" | "full") => {
    const shareText =
      type === "simple" ? generateSimpleBill() : generateFullBill();
    const title =
      type === "simple"
        ? "Simple Bill Split Result:"
        : "Full Bill Split Result:";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Results copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10 pb-24 bg-neutral-50">
      <ProgressBar currentStep={4} />
      <div className="max-w-4xl mx-auto w-full space-y-8 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 pt-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="inline-flex items-center justify-center p-3 bg-success/15 rounded-full mb-2"
          >
            <Check className="w-6 h-6 text-success" />
          </motion.div>
          <h2 className="text-4xl font-heading font-bold text-neutral-900">
            All Settled!
          </h2>
          <p className="text-neutral-500 text-lg">Here is the breakdown</p>
        </motion.div>

        {/* Total Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-primary text-white p-8 rounded-[2.5rem] shadow-2xl shadow-brand-primary/35 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="relative z-10">
            <p className="text-white/70 font-medium uppercase tracking-widest mb-2">
              Total Bill
            </p>
            <AnimatedNumber
              value={totalAmount}
              className="text-6xl md:text-7xl font-heading font-bold tracking-tight"
            />
            <div className="mt-4 inline-block px-4 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 text-sm font-medium">
              Split among {namesCount} people
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((person, index) => (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white border border-neutral-200 p-6 rounded-[2rem] hover:border-neutral-300 hover:shadow-lg transition-shadow duration-300 cursor-default"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-neutral-900" style={getNameStyle(person.name)}>{person.name}</h3>
                <AnimatedNumber
                  value={person.total}
                  className="text-2xl font-heading font-bold text-brand-primary"
                />
              </div>

              <div className="space-y-2">
                {person.items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.08 + i * 0.03 }}
                    className="flex justify-between text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors"
                  >
                    <span>{item.name}</span>
                    <span className="font-medium">
                      ${item.share.toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="h-16 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-0"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex-1 h-16 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-lg font-bold shadow-xl shadow-brand-primary/25">
                <Share2 className="w-5 h-5 mr-2" />
                Share
                <ChevronDown className="w-5 h-5 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 rounded-xl p-2 bg-white border-neutral-200">
              <DropdownMenuItem
                onClick={() => handleShare("full")}
                className="cursor-pointer py-3 rounded-lg text-neutral-700 focus:bg-neutral-100 focus:text-neutral-900"
              >
                <List className="w-4 h-4 mr-2" />
                Full Breakdown
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleShare("simple")}
                className="cursor-pointer py-3 rounded-lg text-neutral-700 focus:bg-neutral-100 focus:text-neutral-900"
              >
                <FileText className="w-4 h-4 mr-2" />
                Totals Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            onClick={onReset}
            className="h-16 rounded-2xl bg-danger hover:bg-danger/90 text-white shadow-xl shadow-danger/20"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
