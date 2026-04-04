"use client";

import { useEffect, useRef } from "react";

const WHISTLE_URL = "/sounds/whistle.mp3";
const DEPARTURE_URL = "/sounds/departure.mp3";

export function useTrainWhistle() {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    ref.current = new Audio(WHISTLE_URL);
    ref.current.volume = 0.25;
  }, []);
  return () => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  };
}

export function useDepartureSound() {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    ref.current = new Audio(DEPARTURE_URL);
    ref.current.volume = 0.2;
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.play().catch(() => {});
    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, []);
}

// Wrap a child element to play train whistle on click
export function Soundful({
  children,
  href,
  onClick,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const play = useTrainWhistle();
  return (
    <a
      href={href}
      onClick={() => { play(); onClick?.(); }}
      className={className}
    >
      {children}
    </a>
  );
}
