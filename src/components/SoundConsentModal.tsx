"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/context/SoundContext";

interface SoundConsentModalProps {
  onPlaySounds: () => void;
}

export default function SoundConsentModal({ onPlaySounds }: SoundConsentModalProps) {
  const { isMuted, setIsMuted } = useSound();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{ background: "rgba(6, 8, 15, 0.92)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm bg-railway-surface border border-railway-border rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Header bar */}
          <div className="px-6 pt-6 pb-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-railway-accent/15 border border-railway-accent/30 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V5l12-2v13" stroke="#d4a843" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="#d4a843" strokeWidth="1.8"/>
                <circle cx="18" cy="16" r="3" stroke="#d4a843" strokeWidth="1.8"/>
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-railway-text">Sound Effects</h2>
              <p className="text-railway-muted text-xs mt-0.5 leading-relaxed">This site plays railway sounds — station bells, whistles, and clicks.</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 flex flex-col gap-2.5">
            <button
              onClick={() => { onPlaySounds(); }}
              className="w-full bg-railway-accent hover:bg-railway-accent-hover text-railway-bg font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 text-sm tracking-wide"
            >
              🔊 Play Sounds
            </button>
            <button
              onClick={() => setIsMuted(true)}
              className="w-full border border-railway-border text-railway-muted hover:text-railway-text hover:border-railway-accent/40 font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              🔇 Mute Sounds
            </button>
          </div>

          <div className="px-6 pb-5">
            <p className="text-railway-muted/40 text-[10px] text-center">You can change this anytime using the 🔇 button in the top-right corner.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
