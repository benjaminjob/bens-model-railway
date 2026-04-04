"use client";

import { useEffect, useRef, useState, useMemo } from "react";

// ============================================
// EXACT PATHS FROM 2D TRACK PLAN
// ============================================
const LAYOUT_MAIN_PATH = "M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200";
const LAYOUT_BRANCH_PATH = "M 650 160 L 720 160 Q 730 160 730 170 L 730 230 Q 730 240 720 240 L 650 240";
const LAYOUT_UP_MAIN_PATH = "M 250 80 L 250 50 Q 250 40 260 40 L 340 40 Q 350 40 350 50 L 350 80";

const LAYOUT_TRACK = {
  mainPath: LAYOUT_MAIN_PATH,
  branchPath: LAYOUT_BRANCH_PATH,
  upMainPath: LAYOUT_UP_MAIN_PATH,
  viewBox: "0 0 800 400",
  stations: [{ x: 400, y: 160, label: 'STATION' }]
};

// ============================================
// PROCEDURAL TRACK GENERATOR
// ============================================
function generateTrack(seed: number): typeof LAYOUT_TRACK {
  const random = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  
  const cx = 400;
  const cy = 200;
  const rx = 180 + random(1) * 60;
  const ry = 120 + random(2) * 40;
  
  const numPoints = 8;
  const points: Array<{x: number, y: number}> = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const jitter = 20;
    const x = cx + Math.cos(angle) * rx + (random(i * 3) - 0.5) * jitter;
    const y = cy + Math.sin(angle) * ry + (random(i * 3 + 1) - 0.5) * jitter;
    points.push({x, y});
  }
  
  let mainPath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % points.length];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    mainPath += ` Q ${p0.x} ${p0.y} ${midX} ${midY}`;
  }
  mainPath += ' Z';
  
  const hasBranch = random(100) > 0.4;
  let branchPath = '';
  
  if (hasBranch) {
    const branchStartIdx = Math.floor(random(50) * points.length);
    const branchStart = points[branchStartIdx];
    const branchAngle = Math.atan2(branchStart.y - cy, branchStart.x - cx);
    const branchLen = 80 + random(51) * 60;
    const endX = branchStart.x + Math.cos(branchAngle) * branchLen;
    const endY = branchStart.y + Math.sin(branchAngle) * branchLen;
    const ctrlX = branchStart.x + Math.cos(branchAngle) * branchLen * 0.7;
    const ctrlY = branchStart.y + Math.sin(branchAngle) * branchLen * 0.5;
    branchPath = `M ${branchStart.x} ${branchStart.y} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
  }
  
  const stationPoint = points[Math.floor(points.length / 2)];
  
  return { 
    mainPath, 
    branchPath,
    upMainPath: '',
    viewBox: '0 0 800 400',
    stations: [{ x: stationPoint.x, y: stationPoint.y, label: 'STATION' }]
  };
}

// ============================================
// TRAIN COMPONENT
// ============================================
export default function InteractiveTrain() {
  const trainRef = useRef<HTMLDivElement>(null);
  const mainPathRef = useRef<SVGPathElement>(null);
  const branchPathRef = useRef<SVGPathElement>(null);
  
  const [trackMode, setTrackMode] = useState<'default' | 'random'>('default');
  const [trainPos, setTrainPos] = useState({ x: 50, y: 50 });
  const [visible, setVisible] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [trainAngle, setTrainAngle] = useState(0);
  
  const progress = useRef(0.1);
  const animFrame = useRef<number>(0);
  const trailId = useRef(0);
  const lastTrailTime = useRef(0);
  const pathLength = useRef(0);
  const branchLength = useRef(0);
  const totalLength = useRef(0);
  
  // Generate random track once on mount
  const randomTrack = useMemo(() => generateTrack(Date.now()), []);
  
  // Current track data
  const track = trackMode === 'default' ? LAYOUT_TRACK : randomTrack;

  // Load saved track mode from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem('railway-track-mode');
    if (saved === 'random' || saved === 'default') {
      setTrackMode(saved);
    }
  }, []);

  // Save track mode to localStorage when changed
  const handleModeChange = (mode: 'default' | 'random') => {
    setTrackMode(mode);
    localStorage.setItem('railway-track-mode', mode);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mainPath = mainPathRef.current;
    const branchPath = branchPathRef.current;
    if (!mainPath) return;
    
    pathLength.current = mainPath.getTotalLength();
    if (branchPath) branchLength.current = branchPath.getTotalLength();
    totalLength.current = pathLength.current + branchLength.current;

    const getPointAtProgress = (p: number) => {
      if (p <= 0 || p > 1) p = ((p % 1) + 1) % 1;
      
      if (p <= pathLength.current / totalLength.current) {
        const mainP = p * (totalLength.current / pathLength.current);
        const clampedP = Math.max(0, Math.min(1, mainP));
        return { point: mainPath.getPointAtLength(clampedP * pathLength.current), onBranch: false };
      } else if (branchPath) {
        const branchP = (p - pathLength.current / totalLength.current) * (totalLength.current / branchLength.current);
        const clampedP = Math.max(0, Math.min(1, branchP));
        return { point: branchPath.getPointAtLength(clampedP * branchLength.current), onBranch: true };
      }
      return { point: mainPath.getPointAtLength(0), onBranch: false };
    };

    const updatePosition = (p: number) => {
      const { point } = getPointAtProgress(p);
      
      const delta = 0.01;
      const { point: nextPoint } = getPointAtProgress(p + delta);
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
      
      const x = (point.x / 800) * 100;
      const y = (point.y / 400) * 100;
      
      setTrainPos({ x, y });
      setTrainAngle(angle);
      
      const now = Date.now();
      if (now - lastTrailTime.current > 100) {
        lastTrailTime.current = now;
        const id = ++trailId.current;
        setTrail(t => [...t.slice(-20), { x, y, id }]);
        setTimeout(() => setTrail(t => t.filter(i => i.id !== id)), 1500);
      }
    };

    const animate = () => {
      if (!isDragging) {
        progress.current = (progress.current + 0.0003) % 1;
        updatePosition(progress.current);
      }
      animFrame.current = requestAnimationFrame(animate);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const svgEl = mainPathRef.current?.ownerSVGElement;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      
      const mouseX = ((clientX - rect.left) / rect.width) * 800;
      const mouseY = ((clientY - rect.top) / rect.height) * 400;

      let minDist = Infinity;
      let bestP = progress.current;
      
      for (let i = 0; i <= 200; i++) {
        const p = i / 200;
        const pt = mainPath.getPointAtLength(p * pathLength.current);
        const d = Math.hypot(mouseX - pt.x, mouseY - pt.y);
        if (d < minDist) {
          minDist = d;
          bestP = p * (pathLength.current / totalLength.current);
        }
      }
      
      if (branchPath) {
        for (let i = 0; i <= 100; i++) {
          const p = i / 100;
          const pt = branchPath.getPointAtLength(p * branchLength.current);
          const d = Math.hypot(mouseX - pt.x, mouseY - pt.y);
          if (d < minDist) {
            minDist = d;
            bestP = (pathLength.current / totalLength.current) + (p * (branchLength.current / totalLength.current));
          }
        }
      }
      
      progress.current = Math.max(0.001, Math.min(0.999, bestP));
      updatePosition(progress.current);
      if (!visible) setVisible(true);
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      if (!trainRef.current) return;
      const rect = trainRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      
      const dist = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
      if (dist < 60) {
        setIsDragging(true);
        const a = new Audio("/sounds/train-move.mp3");
        a.volume = 0.2;
        a.play().catch(() => {});
      }
    };

    const handleUp = () => setIsDragging(false);

    animFrame.current = requestAnimationFrame(animate);
    setVisible(true);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("touchstart", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("touchstart", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
      cancelAnimationFrame(animFrame.current);
    };
  }, [isDragging, visible, track, trackMode]);

  return (
    <>
      <style>{`
        .train-trail-dot {
          position: fixed;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(212,168,67,0.6);
          pointer-events: none;
          z-index: 2;
          animation: trainTrailFade 1.5s ease-out forwards;
          transform: translate(-50%, -50%);
        }
        @keyframes trainTrailFade {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
        }
        .train-cursor {
          position: fixed;
          width: 56px;
          height: 24px;
          pointer-events: all;
          z-index: 3;
          cursor: grab;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
          transition: opacity 0.5s;
        }
        .train-cursor:active { cursor: grabbing; }
        .track-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(85vw, 900px);
          height: min(42.5vw, 450px);
          pointer-events: none;
          z-index: 0;
        }
        @media (max-width: 640px) {
          .track-container {
            width: 95vw;
            height: 47.5vw;
          }
        }
        .track-mode-selector {
          position: fixed;
          top: 80px;
          right: 16px;
          z-index: 9990;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 6px;
          background: rgba(10, 13, 21, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 168, 67, 0.25);
          border-radius: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .track-mode-btn {
          padding: 8px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          text-align: center;
        }
        .track-mode-btn.default {
          background: transparent;
          color: rgba(212, 168, 67, 0.5);
        }
        .track-mode-btn.default.active {
          background: linear-gradient(135deg, rgba(212, 168, 67, 0.25) 0%, rgba(212, 168, 67, 0.1) 100%);
          color: #d4a843;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 0 12px rgba(212, 168, 67, 0.2);
        }
        .track-mode-btn.random {
          background: transparent;
          color: rgba(212, 168, 67, 0.5);
        }
        .track-mode-btn.random.active {
          background: linear-gradient(135deg, rgba(212, 168, 67, 0.25) 0%, rgba(212, 168, 67, 0.1) 100%);
          color: #d4a843;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 0 12px rgba(212, 168, 67, 0.2);
        }
        .track-mode-btn:hover:not(.active) {
          color: rgba(212, 168, 67, 0.9);
          background: rgba(212, 168, 67, 0.08);
        }
      `}</style>

      {/* Track mode selector - top right corner */}
      <div className="track-mode-selector">
        <button 
          className={`track-mode-btn default ${trackMode === 'default' ? 'active' : ''}`}
          onClick={() => handleModeChange('default')}
        >
          Layout
        </button>
        <button 
          className={`track-mode-btn random ${trackMode === 'random' ? 'active' : ''}`}
          onClick={() => handleModeChange('random')}
        >
          Random
        </button>
      </div>

      {/* Track path - behind content (z-index: 0) */}
      <div className="track-container">
        <svg viewBox={track.viewBox} className="w-full h-full">
          {/* Main oval track - ballast/sleepers (dark) */}
          <path d={track.mainPath} fill="none" stroke="#1a1d28" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Branch ballast */}
          {track.branchPath && (
            <path d={track.branchPath} fill="none" stroke="#1a1d28" strokeWidth="18" strokeLinecap="round"/>
          )}
          {/* UP Main ballast */}
          {track.upMainPath && (
            <path d={track.upMainPath} fill="none" stroke="#1a1d28" strokeWidth="18" strokeLinecap="round"/>
          )}
          
          {/* Main track - rail base (grey) */}
          <path d={track.mainPath} fill="none" stroke="#2a2a3a" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
          {track.branchPath && (
            <path d={track.branchPath} fill="none" stroke="#2a2a3a" strokeWidth="14" strokeLinecap="round"/>
          )}
          {track.upMainPath && (
            <path d={track.upMainPath} fill="none" stroke="#2a2a3a" strokeWidth="14" strokeLinecap="round"/>
          )}
          
          {/* Main track - running rail (golden animated) */}
          <path d={track.mainPath} fill="none" stroke="#d4a843" strokeWidth="2.5" strokeDasharray="16,12" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
            <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2s" repeatCount="indefinite"/>
          </path>
          {/* Branch rail */}
          {track.branchPath && (
            <path d={track.branchPath} fill="none" stroke="#d4a843" strokeWidth="2" strokeDasharray="10,8" strokeLinecap="round" opacity="0.6"/>
          )}
          {/* UP Main rail */}
          {track.upMainPath && (
            <path d={track.upMainPath} fill="none" stroke="#d4a843" strokeWidth="2" strokeDasharray="10,8" strokeLinecap="round" opacity="0.6"/>
          )}
          
          {/* Station */}
          <rect x="360" y="155" width="80" height="50" rx="4" fill="#111520" stroke="#d4a843" strokeWidth="1.5" opacity="0.9"/>
          <text x="400" y="177" textAnchor="middle" fill="#d4a843" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.95">STATION</text>
          <rect x="370" y="185" width="60" height="12" rx="2" fill="#0a0d15" stroke="#d4a843" strokeWidth="0.5" opacity="0.7"/>
          
          {/* Platform */}
          <rect x="475" y="285" width="150" height="30" rx="3" fill="#0d1020" stroke="#d4a843" strokeWidth="1"/>
          <rect x="483" y="293" width="134" height="14" rx="2" fill="#111825"/>
          <text x="550" y="305" textAnchor="middle" fill="#8a8fa0" fontSize="9" fontFamily="monospace">PLATFORM</text>
          
          {/* Hidden paths for interaction - wider hit area */}
          <path ref={mainPathRef} d={track.mainPath} fill="none" stroke="transparent" strokeWidth="50"/>
          {track.branchPath && (
            <path ref={branchPathRef} d={track.branchPath} fill="none" stroke="transparent" strokeWidth="40"/>
          )}
        </svg>
      </div>

      {/* Trail dots - behind train */}
      {trail.map(dot => (
        <div
          key={dot.id}
          className="train-trail-dot"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
        />
      ))}

      {/* Train cursor - realistic locomotive side view - z-index above track but below content */}
      <div
        ref={trainRef}
        className="train-cursor"
        style={{
          left: `${trainPos.x}%`,
          top: `${trainPos.y}%`,
          opacity: visible ? 1 : 0,
          transform: `translate(-50%, -50%) rotate(${trainAngle}deg)`,
          zIndex: 3
        }}
      >
        <svg viewBox="0 0 70 30" fill="none">
          {/* Locomotive side profile - facing RIGHT */}
          
          {/* Boiler - main body cylinder */}
          <ellipse cx="32" cy="17" rx="24" ry="10" fill="url(#engineBoiler)"/>
          
          {/* Boiler bands */}
          <ellipse cx="20" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
          <ellipse cx="28" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
          <ellipse cx="38" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
          
          {/* Smokebox - front dark section */}
          <rect x="6" y="9" width="12" height="16" rx="2" fill="url(#smokeboxGrad)"/>
          <ellipse cx="8" cy="17" rx="4" ry="8" fill="#1a1d28"/>
          
          {/* Chimney - vertical stack */}
          <rect x="10" y="2" width="8" height="10" rx="1" fill="url(#chimneyEngineGrad)"/>
          <rect x="9" y="1" width="10" height="3" rx="1" fill="#c9a033"/>
          <rect x="11" y="0" width="6" height="2" rx="0.5" fill="#d4a843"/>
          
          {/* Dome - steam dome on top */}
          <ellipse cx="35" cy="7" rx="5" ry="3.5" fill="url(#domeEngineGrad)"/>
          
          {/* Safety valves */}
          <rect x="40" y="4" width="3" height="5" rx="0.5" fill="#b8942f"/>
          <rect x="44" y="4" width="3" height="5" rx="0.5" fill="#b8942f"/>
          
          {/* Cab - driver's compartment */}
          <rect x="50" y="7" width="16" height="20" rx="2" fill="url(#cabEngineGrad)"/>
          {/* Cab window */}
          <rect x="53" y="10" width="10" height="7" rx="1" fill="#0a0d15" opacity="0.9"/>
          {/* Cab roof overhang */}
          <rect x="48" y="5" width="20" height="3" rx="1" fill="#a07c2a"/>
          
          {/* Wheels - 3 main wheels with detail */}
          {/* Front small wheel */}
          <circle cx="10" cy="25" r="4" fill="#1a1d28"/>
          <circle cx="10" cy="25" r="3.2" fill="#2a2a3a"/>
          <circle cx="10" cy="25" r="1.2" fill="#d4a843"/>
          <circle cx="10" cy="25" r="2.8" fill="none" stroke="#d4a843" strokeWidth="0.4" opacity="0.5"/>
          
          {/* Middle driving wheel */}
          <circle cx="24" cy="25" r="5" fill="#1a1d28"/>
          <circle cx="24" cy="25" r="4" fill="#2a2a3a"/>
          <circle cx="24" cy="25" r="1.5" fill="#d4a843"/>
          <circle cx="24" cy="25" r="3.5" fill="none" stroke="#d4a843" strokeWidth="0.5" opacity="0.5"/>
          
          {/* Rear driving wheel */}
          <circle cx="36" cy="25" r="5" fill="#1a1d28"/>
          <circle cx="36" cy="25" r="4" fill="#2a2a3a"/>
          <circle cx="36" cy="25" r="1.5" fill="#d4a843"/>
          <circle cx="36" cy="25" r="3.5" fill="none" stroke="#d4a843" strokeWidth="0.5" opacity="0.5"/>
          
          {/* Coupling rods connecting wheels */}
          <rect x="10" y="23.5" width="26" height="2" rx="1" fill="#b8942f"/>
          
          {/* Cowcatcher - front buffer */}
          <path d="M 2 20 L 0 26 L 4 26 L 6 23 Z" fill="#c9a033"/>
          <line x1="1" y1="21" x2="1.5" y2="26" stroke="#8a7020" strokeWidth="0.5"/>
          <line x1="3" y1="20" x2="3.5" y2="26" stroke="#8a7020" strokeWidth="0.5"/>
          
          {/* Headlight */}
          <circle cx="2" cy="14" r="2.5" fill="#fffbe6"/>
          <circle cx="2" cy="14" r="1.8" fill="#ffeb3b"/>
          <circle cx="2" cy="14" r="0.8" fill="#fff"/>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="engineBoiler" x1="8" y1="7" x2="8" y2="27" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e8c865"/>
              <stop offset="40%" stopColor="#d4a843"/>
              <stop offset="100%" stopColor="#9a7a20"/>
            </linearGradient>
            <linearGradient id="smokeboxGrad" x1="12" y1="9" x2="12" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3a3a4a"/>
              <stop offset="100%" stopColor="#1a1d28"/>
            </linearGradient>
            <linearGradient id="chimneyEngineGrad" x1="14" y1="2" x2="14" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d4a843"/>
              <stop offset="100%" stopColor="#8a7020"/>
            </linearGradient>
            <radialGradient id="domeEngineGrad" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#e8d080"/>
              <stop offset="100%" stopColor="#c9a033"/>
            </radialGradient>
            <linearGradient id="cabEngineGrad" x1="50" y1="7" x2="66" y2="27" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c9a033"/>
              <stop offset="100%" stopColor="#8a7020"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}
