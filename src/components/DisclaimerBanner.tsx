"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNER_HEIGHT = 48;

export { BANNER_HEIGHT };

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("railway-disclaimer-dismissed");
    if (!dismissed) setVisible(true);
    document.documentElement.style.setProperty("--banner-h", dismissed ? "0px" : "48px");
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("railway-disclaimer-dismissed", "1");
    document.documentElement.style.setProperty("--banner-h", "0px");
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return <div style={{ height: `${BANNER_HEIGHT}px` }} />;

  return (
    <>
      {/* Fixed banner at the very top of the viewport */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -BANNER_HEIGHT, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -BANNER_HEIGHT, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              height: `${BANNER_HEIGHT}px`,
            }}
          >
            <div
              className="h-full border-b border-amber-700/50 px-4 flex items-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(217,162,43,0.14) 0%, rgba(180,120,20,0.09) 100%)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="max-w-6xl mx-auto flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 text-sm flex-shrink-0">⚠️</span>
                  <p className="text-amber-100 text-xs md:text-sm leading-snug">
                    <span className="font-semibold">Work in progress —</span> this site is built with AI-generated content and imagery. Everything is subject to change as the build progresses.
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-amber-400/60 hover:text-amber-200 transition-colors flex-shrink-0"
                  aria-label="Dismiss disclaimer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
