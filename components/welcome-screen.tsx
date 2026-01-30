"use client";

import { Button } from "@/components/ui/button";
import { Users, Utensils, Download, ArrowRight } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10 bg-neutral-50">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-12">
        {/* Hero Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white backdrop-blur-md border border-neutral-200 rounded-2xl shadow-sm mb-4">
            <Utensils className="w-6 h-6 text-brand-primary" />
          </div>

          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter text-neutral-900 leading-[0.9]">
            POSA
            <br />
            <span className="text-brand-primary">XROSTO?</span>
          </h1>

          <p className="text-xl text-neutral-500 font-medium max-w-[300px] mx-auto leading-relaxed">
            The art of splitting bills without breaking friendships.
          </p>
        </motion.div>

        {/* Interactive Features Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          <div className="group p-6 bg-white border border-neutral-200 rounded-3xl hover:border-neutral-300 transition-all duration-300">
            <div className="mb-3 p-3 bg-brand-primary/10 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-lg font-heading font-bold text-neutral-900">
              Add Diners
            </h3>
            <p className="text-sm text-neutral-500">Split among friends</p>
          </div>

          <div className="group p-6 bg-white border border-neutral-200 rounded-3xl hover:border-neutral-300 transition-all duration-300">
            <div className="mb-3 p-3 bg-brand-support/20 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Utensils className="w-6 h-6 text-brand-support" />
            </div>
            <h3 className="text-lg font-heading font-bold text-neutral-900">
              Scan Items
            </h3>
            <p className="text-sm text-neutral-500">OCR receipt scan</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full space-y-4"
        >
          <Button
            onClick={onStart}
            className="w-full h-20 text-2xl font-heading font-bold rounded-[2rem] bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xl shadow-brand-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
          >
            Start Splitting
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>

          {isInstallable && !isInstalled && (
            <Button
              onClick={installApp}
              variant="ghost"
              className="w-full h-12 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
