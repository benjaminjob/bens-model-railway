"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("railway-disclaimer-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  return (
    <div className="sticky top-0 z-[60]">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="border-b border-amber-800/40 px-4 py-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(217,162,43,0.12) 0%, rgba(180,120,20,0.07) 100%)",
              }}
            >
              <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-base mt-0.5 flex-shrink-0">⚠️</span>
                  <p className="text-amber-200/90 text-xs md:text-sm leading-relaxed">
                    <span className="font-semibold">Work in progress —</span> this site is built with AI-generated content and imagery. Everything here is subject to change as the build progresses.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVisible(false);
                    sessionStorage.setItem("railway-disclaimer-dismissed", "1");
                  }}
                  className="text-amber-400/60 hover:text-amber-300 transition-colors flex-shrink-0 mt-0.5"
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
    </div>
  );
}
