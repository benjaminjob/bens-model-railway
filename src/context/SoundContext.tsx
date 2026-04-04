"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SoundContextValue {
  isMuted: boolean;
  setIsMuted: (v: boolean) => void;
  hasDecided: boolean;
}

const SoundContext = createContext<SoundContextValue>({
  isMuted: false,
  setIsMuted: () => {},
  hasDecided: false,
});

function getStoredMute(): boolean | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("railway-sound-muted");
  if (stored === null) return null;
  return stored === "true";
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const storedMute = getStoredMute();
  const [isMuted, setIsMutedState] = useState(storedMute ?? false);
  const [hasDecided, setHasDecided] = useState(storedMute !== null);

  const setIsMuted = (v: boolean) => {
    setIsMutedState(v);
    setHasDecided(true);
    localStorage.setItem("railway-sound-muted", v ? "true" : "false");
  };

  return (
    <SoundContext.Provider value={{ isMuted, setIsMuted, hasDecided }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
