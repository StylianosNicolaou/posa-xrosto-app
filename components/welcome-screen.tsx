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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-12">
        {/* Hero Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white/50 backdrop-blur-md border border-black/10 rounded-2xl shadow-sm mb-4">
            <Utensils className="w-6 h-6 text-black" />
          </div>

          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter text-black leading-[0.9]">
            POSA
            <br />
            <span className="text-zinc-500">XROSTO?</span>
          </h1>

          <p className="text-xl text-zinc-500 font-medium max-w-[300px] mx-auto leading-relaxed">
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
          <div className="group p-6 bg-white/40 backdrop-blur-sm border border-black/5 rounded-3xl hover:bg-white/60 transition-all duration-300">
            <div className="mb-3 p-3 bg-zinc-100 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-heading font-bold text-black">
              Add Diners
            </h3>
            <p className="text-sm text-zinc-500">Split among friends</p>
          </div>

          <div className="group p-6 bg-white/40 backdrop-blur-sm border border-black/5 rounded-3xl hover:bg-white/60 transition-all duration-300">
            <div className="mb-3 p-3 bg-zinc-100 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Utensils className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-heading font-bold text-black">
              Scan Items
            </h3>
            <p className="text-sm text-zinc-500">OCR receipt scan</p>
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
            className="w-full h-20 text-2xl font-heading font-bold rounded-[2rem] bg-black hover:bg-zinc-800 text-white shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
          >
            Start Splitting
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>

          {isInstallable && !isInstalled && (
            <Button
              onClick={installApp}
              variant="ghost"
              className="w-full h-12 text-zinc-600 hover:bg-zinc-100 rounded-xl"
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
