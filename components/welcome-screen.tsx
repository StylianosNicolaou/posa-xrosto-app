"use client";

import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";
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
          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter text-neutral-900 leading-[0.9]">
            POSA
            <br />
            <span className="text-brand-primary">XROSTO?</span>
          </h1>

          <p className="text-xl text-neutral-500 font-medium max-w-[300px] mx-auto leading-relaxed">
            The art of splitting bills without breaking friendships.
          </p>
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
              variant="outline"
              className="w-full h-14 text-neutral-700 bg-white border-2 border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/5 rounded-2xl font-medium transition-all"
            >
              <Download className="w-5 h-5 mr-2 text-brand-primary" />
              Install App
            </Button>
          )}

          {isInstalled && (
            <p className="text-sm text-success font-medium flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              App installed
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
