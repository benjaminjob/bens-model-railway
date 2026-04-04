"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveTrain() {
  const trainRef = useRef<HTMLDivElement>(null);
  const [trainPos, setTrainPos] = useState({ x: 50, y: 50 });
  const [visible, setVisible] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const targetPos = useRef({ x: 50, y: 50 });
  const animFrame = useRef<number>(0);
  const trailId = useRef(0);
  const lastMove = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      const x = ("touches" in e ? e.touches[0].clientX : e.clientX) / window.innerWidth * 100;
      const y = ("touches" in e ? e.touches[0].clientY : e.clientY) / window.innerHeight * 100;
      targetPos.current = { x, y };
      if (!visible) setVisible(true);

      const now = Date.now();
      if (now - lastMove.current > 80) {
        lastMove.current = now;
        setTrainPos({ x, y });
        const id = ++trailId.current;
        setTrail(t => [...t.slice(-18), { x, y, id }]);
        setTimeout(() => setTrail(t => t.filter(i => i.id !== id)), 2000);
      }
    };

    const click = (e: MouseEvent) => {
      if (!trainRef.current) return;
      const rect = trainRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 40) {
        const a = new Audio("/sounds/train-move.mp3");
        a.volume = 0.25;
        a.play().catch(() => {});
        // Ripple effect
        const ripple = document.createElement("div");
        ripple.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:6px;height:6px;border-radius:50%;background:rgba(212,168,67,0.8);pointer-events:none;z-index:9997;transform:translate(-50%,-50%);animation:trainRipple 0.6s ease-out forwards;`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
    };

    const animate = () => {
      animFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("click", click);
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("click", click);
      cancelAnimationFrame(animFrame.current);
    };
  }, [visible]);

  return (
    <>
      <style>{`
        @keyframes trainRipple {
          0% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(12); opacity: 0; }
        }
        @keyframes trainTrail {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3); }
        }
        .train-trail-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(212,168,67,0.5);
          pointer-events: none;
          z-index: 9996;
          animation: trainTrail 2s ease-out forwards;
          transform: translate(-50%, -50%);
        }
        .interactive-train {
          position: fixed;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle, #f0d060 0%, #d4a843 50%, rgba(212,168,67,0) 100%);
          box-shadow: 0 0 16px 6px rgba(212,168,67,0.5), 0 0 40px 12px rgba(212,168,67,0.2);
          pointer-events: all;
          z-index: 9997;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: box-shadow 0.2s;
        }
        .interactive-train::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(212,168,67,0.3);
          animation: trainPulse 1.5s ease-in-out infinite;
        }
        @keyframes trainPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      {/* Trail dots */}
      {trail.map(dot => (
        <div
          key={dot.id}
          className="train-trail-dot"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
        />
      ))}

      {/* Main train dot */}
      <div
        ref={trainRef}
        className="interactive-train"
        style={{
          left: `${trainPos.x}%`,
          top: `${trainPos.y}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  );
}
