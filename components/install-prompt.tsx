"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Download, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if iOS Safari
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsIOS(iOS && isSafari);

    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem("installPromptDismissed");
    if (wasDismissed) {
      setDismissed(true);
    }

    // Show prompt after a short delay if not installed and not dismissed
    const timer = setTimeout(() => {
      if (!isInstalled && !wasDismissed) {
        setShowPrompt(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem("installPromptDismissed", "true");
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed || !showPrompt) {
    return null;
  }

  // iOS Safari - Collapsible button with instructions
  if (isIOS) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Collapsible Header Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-heading font-bold text-neutral-900">Install App</p>
                  <p className="text-neutral-500 text-sm">Add to home screen</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            {/* Expandable Instructions */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">1</span>
                        <p className="text-neutral-700 text-sm">
                          Tap the <span className="inline-flex items-center mx-1 px-2 py-0.5 bg-neutral-200 rounded font-medium"><svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>Share</span> button in Safari
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">2</span>
                        <p className="text-neutral-700 text-sm">
                          Scroll down and tap <span className="font-semibold">&quot;Add to Home Screen&quot;</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">3</span>
                        <p className="text-neutral-700 text-sm">
                          Tap <span className="font-semibold">&quot;Add&quot;</span> in the top right
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Chrome/Android native install prompt
  if (isInstallable) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-heading font-bold">PX</span>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-neutral-900 text-lg mb-1">
                  Install Posa Xrosto
                </h3>
                <p className="text-neutral-500 text-sm">
                  Add to your home screen for quick access
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="flex-1 h-12 rounded-xl text-neutral-500 hover:bg-neutral-100"
              >
                Not now
              </Button>
              <Button
                onClick={handleInstall}
                className="flex-1 h-12 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold shadow-lg shadow-brand-primary/25"
              >
                <Download className="w-4 h-4 mr-2" />
                Install
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
