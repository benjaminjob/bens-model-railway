"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

// ============================================
// REAL 00 GAUGE (4mm/ft) TRACK SPECIFICATIONS
// Based on Hornby/Peco Setrack geometry
// Track gauge: 16.5mm | Track spacing: 67mm centre-to-centre
// Turnout angle: 22.5° | Rail height: code 100
// Standard radii: 371mm (1st), 438mm (2nd), 505mm (3rd), 571.5mm (4th)
// ============================================

const MM = 0.2; // 1 unit = 5mm real → 1mm = 0.2 SVG units
const TRACK_GAP = Math.round(67 * MM); // 13 units

// ──────────────────────────────────────────────
// LAYOUT 1: Simple Oval with Passing Loop
// ──────────────────────────────────────────────
function makeOval(ox: number, oy: number) {
  const outerRX = 220, outerRY = 90;
  const innerRX = outerRX - TRACK_GAP * 1.5, innerRY = outerRY - 10;
  
  const parts = [
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 20, type: 'main' as const },
    { path: `M ${ox - innerRX} ${oy} A ${innerRX} ${innerRY} 0 0 1 ${ox + innerRX} ${oy} A ${innerRX} ${innerRY} 0 0 1 ${ox - innerRX} ${oy}`, trackWidth: 16, type: 'main' as const },
  ];
  const stations = [{ x: ox, y: oy - outerRY - 8, label: 'PASSING LOOP' }];
  return { parts, stations, name: "Oval with Passing Loop", desc: "Classic two-track oval with inner passing loop", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 2: Terminus Station
// ──────────────────────────────────────────────
function makeTerminus(ox: number, oy: number) {
  const R3 = 101;
  const throatX = ox - R3 - 20;
  const platY = oy - 60;
  
  const parts = [
    { path: `M ${throatX} ${oy} A ${R3} ${R3 * 0.7} 0 0 1 ${ox + R3} ${oy} A ${R3} ${R3 * 0.7} 0 0 1 ${throatX} ${oy}`, trackWidth: 18, type: 'main' as const },
    { path: `M ${throatX} ${oy} L ${throatX - 70} ${oy} L ${throatX - 70} ${platY + 20}`, trackWidth: 18, type: 'main' as const },
    { path: `M ${throatX - 70} ${platY + 10} L ${throatX - 160} ${platY + 10}`, trackWidth: 15, type: 'main' as const },
    { path: `M ${throatX - 70} ${platY + 30} L ${throatX - 160} ${platY + 30}`, trackWidth: 15, type: 'main' as const },
    { path: `M ${throatX - 160} ${platY + 5} L ${throatX - 160} ${platY + 15}`, trackWidth: 15, type: 'siding' as const },
    { path: `M ${throatX - 160} ${platY + 25} L ${throatX - 160} ${platY + 35}`, trackWidth: 15, type: 'siding' as const },
    { path: `M ${throatX - 70} ${platY + 30} Q ${throatX - 50} ${oy + 20} ${throatX} ${oy}`, trackWidth: 18, type: 'main' as const },
  ];
  const stations = [{ x: throatX - 115, y: platY + 20, label: 'TERMINUS' }];
  return { parts, stations, name: "Terminus Station", desc: "Station at end of line — trains reverse direction", viewBox: "0 0 800 400", platformRect: { x: throatX - 158, y: platY + 3, w: 86, h: 38 } };
}

// ──────────────────────────────────────────────
// LAYOUT 3: Branch Line
// ──────────────────────────────────────────────
function makeBranch(ox: number, oy: number) {
  const outerRX = 190, outerRY = 82;
  const bx = ox + outerRX, by = oy - outerRY;
  
  const parts = [
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 20, type: 'main' as const },
    { path: `M ${ox - outerRX + TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox + outerRX - TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox - outerRX + TRACK_GAP} ${oy}`, trackWidth: 16, type: 'main' as const },
    { path: `M ${bx} ${by} L ${bx + 60} ${by - 50} L ${bx + 60} ${by - 110}`, trackWidth: 14, type: 'branch' as const },
    { path: `M ${bx + 60} ${by - 110} L ${bx + 60} ${by - 80}`, trackWidth: 14, type: 'siding' as const },
    { path: `M ${bx + 40} ${by - 90} L ${bx + 80} ${by - 90}`, trackWidth: 12, type: 'yard' as const },
  ];
  const stations = [{ x: ox, y: oy - outerRY - 8, label: 'BRANCH JUNCTION' }];
  return { parts, stations, name: "Branch Line", desc: "Main line with branch off to terminus siding", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 4: Figure 8
// ──────────────────────────────────────────────
function makeFigure8(ox: number, oy: number) {
  const rX = 130, rY = 65, gap = 36;
  
  const parts = [
    { path: `M ${ox - rX} ${oy - gap/2} A ${rX} ${rY} 0 0 1 ${ox + rX} ${oy - gap/2} A ${rX} ${rY} 0 0 1 ${ox - rX} ${oy - gap/2}`, trackWidth: 18, type: 'main' as const },
    { path: `M ${ox - rX} ${oy + gap/2} A ${rX} ${rY} 0 0 0 ${ox + rX} ${oy + gap/2} A ${rX} ${rY} 0 0 0 ${ox - rX} ${oy + gap/2}`, trackWidth: 18, type: 'main' as const },
    { path: `M ${ox - rX} ${oy - gap/2} Q ${ox - rX/2} ${oy} ${ox - rX} ${oy + gap/2}`, trackWidth: 14, type: 'branch' as const },
    { path: `M ${ox + rX} ${oy - gap/2} Q ${ox + rX/2} ${oy} ${ox + rX} ${oy + gap/2}`, trackWidth: 14, type: 'branch' as const },
  ];
  const stations = [
    { x: ox, y: oy - rY - gap/2 - 8, label: 'NORTH JUNCTION' },
    { x: ox, y: oy + rY + gap/2 + 8, label: 'SOUTH JUNCTION' },
  ];
  return { parts, stations, name: "Figure 8", desc: "Two ovals connected by crossover tracks", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 5: Depot & Engine Shed
// ──────────────────────────────────────────────
function makeDepot(ox: number, oy: number) {
  const outerRX = 200, outerRY = 85;
  const shedX = ox + outerRX - 30, shedY = oy - outerRY + 15;
  
  const parts = [
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 22, type: 'main' as const },
    { path: `M ${ox - outerRX + TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox + outerRX - TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox - outerRX + TRACK_GAP} ${oy}`, trackWidth: 16, type: 'main' as const },
    { path: `M ${shedX} ${oy - outerRY + 8} L ${shedX + 55} ${shedY + 5} L ${shedX + 55} ${shedY + 18}`, trackWidth: 13, type: 'yard' as const },
    { path: `M ${shedX} ${oy - outerRY + 8} L ${shedX + 55} ${shedY + 25} L ${shedX + 55} ${shedY + 38}`, trackWidth: 13, type: 'yard' as const },
    { path: `M ${shedX} ${oy - outerRY + 8} L ${shedX + 55} ${shedY + 45} L ${shedX + 55} ${shedY + 58}`, trackWidth: 13, type: 'yard' as const },
  ];
  const stations = [{ x: shedX + 28, y: shedY + 32, label: 'ENGINE SHED' }];
  return { parts, stations, name: "Depot & Yard", desc: "Main line with multi-road engine shed", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 6: Continuous Triple Track
// ──────────────────────────────────────────────
function makeTriple(ox: number, oy: number) {
  const outerRX = 205, outerRY = 88, gap = 11;
  
  const parts = [
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 22, type: 'main' as const },
    { path: `M ${ox - outerRX + gap} ${oy} A ${outerRX - gap} ${outerRY - gap} 0 0 1 ${ox + outerRX - gap} ${oy} A ${outerRX - gap} ${outerRY - gap} 0 0 1 ${ox - outerRX + gap} ${oy}`, trackWidth: 16, type: 'main' as const },
    { path: `M ${ox - outerRX + gap*2} ${oy} A ${outerRX - gap*2} ${outerRY - gap*2} 0 0 1 ${ox + outerRX - gap*2} ${oy} A ${outerRX - gap*2} ${outerRY - gap*2} 0 0 1 ${ox - outerRX + gap*2} ${oy}`, trackWidth: 14, type: 'branch' as const },
    { path: `M ${ox - outerRX} ${oy} L ${ox - outerRX + gap*2} ${oy + 14}`, trackWidth: 13, type: 'branch' as const },
    { path: `M ${ox + outerRX} ${oy} L ${ox + outerRX - gap} ${oy - 12}`, trackWidth: 13, type: 'branch' as const },
  ];
  const stations = [{ x: ox, y: oy - outerRY - 6, label: 'TRIPLE TRACK MAIN' }];
  return { parts, stations, name: "Triple Track", desc: "Three parallel tracks with crossovers", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 7: Dog-Bone (long straights + big radius ends)
// ──────────────────────────────────────────────
function makeDogBone(ox: number, oy: number) {
  const endR = 114, straight = 260;
  
  const parts = [
    { path: `M ${ox - straight/2 - endR} ${oy} A ${endR} ${endR * 0.75} 0 0 1 ${ox + straight/2} ${oy} A ${endR} ${endR * 0.75} 0 0 1 ${ox - straight/2 - endR} ${oy}`, trackWidth: 22, type: 'main' as const },
    { path: `M ${ox - straight/2 - endR + TRACK_GAP} ${oy} A ${endR - TRACK_GAP} ${endR * 0.75 - 8} 0 0 1 ${ox + straight/2 - TRACK_GAP} ${oy} A ${endR - TRACK_GAP} ${endR * 0.75 - 8} 0 0 1 ${ox - straight/2 - endR + TRACK_GAP} ${oy}`, trackWidth: 16, type: 'main' as const },
  ];
  const stations = [{ x: ox, y: oy - endR * 0.75 - 8, label: 'PASSING LOOP' }];
  return { parts, stations, name: "Dog-Bone", desc: "Long straights with large-radius curved ends — ideal for continuous running", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 8: Heritage / Industrial Branch
// Tight radii, industrial feel
// ──────────────────────────────────────────────
function makeHeritage(ox: number, oy: number) {
  const tR = 88; // 2nd radius for tighter feel
  
  const parts = [
    { path: `M ${ox - tR} ${oy} A ${tR} ${tR * 0.65} 0 0 1 ${ox + tR} ${oy} A ${tR} ${tR * 0.65} 0 0 1 ${ox - tR} ${oy}`, trackWidth: 18, type: 'main' as const },
    { path: `M ${ox - tR + TRACK_GAP} ${oy} A ${tR - TRACK_GAP} ${tR * 0.65 - 6} 0 0 1 ${ox + tR - TRACK_GAP} ${oy} A ${tR - TRACK_GAP} ${tR * 0.65 - 6} 0 0 1 ${ox - tR + TRACK_GAP} ${oy}`, trackWidth: 14, type: 'main' as const },
    { path: `M ${ox + tR - 20} ${oy - tR * 0.65} L ${ox + tR - 100} ${oy - tR * 0.65} L ${ox + tR - 100} ${oy - tR * 0.65 + 18}`, trackWidth: 14, type: 'main' as const },
    { path: `M ${ox - tR + 15} ${oy + tR * 0.65 - 5} L ${ox - tR - 35} ${oy + tR * 0.65 + 45} L ${ox - tR - 35} ${oy + tR * 0.65 + 75}`, trackWidth: 12, type: 'siding' as const },
    { path: `M ${ox - tR - 35} ${oy + tR * 0.65 + 75} L ${ox - tR - 35} ${oy + tR * 0.65 + 55}`, trackWidth: 12, type: 'yard' as const },
  ];
  const stations = [{ x: ox + tR - 60, y: oy - tR * 0.65 + 9, label: 'HALT' }];
  return { parts, stations, name: "Heritage Branch", desc: "Tight-radius industrial layout with branch terminus and siding", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT REGISTRY
// ──────────────────────────────────────────────
const FACTORIES = [makeOval, makeTerminus, makeBranch, makeFigure8, makeDepot, makeTriple, makeDogBone, makeHeritage];

// ──────────────────────────────────────────────
// GENERATOR
// ──────────────────────────────────────────────
function genLayout(seed: number) {
  const rng = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  
  const idx = Math.floor(rng(0) * FACTORIES.length);
  const jx = (rng(1) - 0.5) * 50;
  const jy = (rng(2) - 0.5) * 30;
  
  const layout = FACTORIES[idx](400 + jx, 200 + jy);
  
  // Mirror horizontally 50% of time
  if (rng(3) > 0.5) {
    layout.parts = layout.parts.map(p => {
      const mirrored = p.path.replace(/(-?[\d.]+)\s+(-?[\d.]+)/g, (_, x, y) => `${(800 - parseFloat(x)).toFixed(1)} ${y}`);
      return { ...p, path: mirrored };
    });
    layout.stations = layout.stations.map(s => ({ ...s, x: 800 - s.x }));
  }
  
  return layout;
}

// ──────────────────────────────────────────────
// ORIGINAL LAYOUT (from 2D track plan)
// ──────────────────────────────────────────────
const ORIGINAL_LAYOUT = {
  mainPath: "M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200",
  branchPath: "M 650 160 L 720 160 Q 730 160 730 170 L 730 230 Q 730 240 720 240 L 650 240",
  upMainPath: "M 250 80 L 250 50 Q 250 40 260 40 L 340 40 Q 350 40 350 50 L 350 80",
};

// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────
export default function InteractiveTrain() {
  const trainRef = useRef<HTMLDivElement>(null);
  const mainPathRef = useRef<SVGPathElement>(null);
  const branchPathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [trackMode, setTrackMode] = useState<'default' | 'random'>('default');
  const [trainPos, setTrainPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [trainAngle, setTrainAngle] = useState(0);
  const [svgRect, setSvgRect] = useState({ left: 0, top: 0, width: 800, height: 400 });
  
  const progress = useRef(0.1);
  const animFrame = useRef<number>(0);
  const trailId = useRef(0);
  const lastTrailTime = useRef(0);
  const pathLength = useRef(0);
  const branchLength = useRef(0);
  const totalLength = useRef(0);
  
  const randomLayout = useMemo(() => genLayout(Date.now()), []);
  
  const trackParts = trackMode === 'default'
    ? [
        { path: ORIGINAL_LAYOUT.mainPath, trackWidth: 22, type: 'main' as const },
        { path: ORIGINAL_LAYOUT.branchPath, trackWidth: 16, type: 'branch' as const },
        { path: ORIGINAL_LAYOUT.upMainPath, trackWidth: 16, type: 'branch' as const },
      ]
    : randomLayout.parts;

  const currentViewBox = trackMode === 'default' ? '0 0 800 400' : randomLayout.viewBox;
  const currentStations = trackMode === 'default' 
    ? [{ x: 400, y: 160, label: 'STATION' }]
    : randomLayout.stations;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem('railway-track-mode');
    if (saved === 'random' || saved === 'default') setTrackMode(saved);
  }, []);

  const handleModeChange = useCallback((mode: 'default' | 'random') => {
    setTrackMode(mode);
    localStorage.setItem('railway-track-mode', mode);
  }, []);

  const updateSvgRect = useCallback(() => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setSvgRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mainPath = mainPathRef.current;
    const branchPath = branchPathRef.current;
    if (!mainPath) return;
    
    pathLength.current = mainPath.getTotalLength();
    if (branchPath) branchLength.current = branchPath.getTotalLength();
    totalLength.current = pathLength.current + branchLength.current;

    updateSvgRect();

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
      
      const delta = 0.005;
      const { point: nextPoint } = getPointAtProgress(p + delta);
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
      
      const scaleX = svgRect.width / 800;
      const scaleY = svgRect.height / 400;
      const pixelX = svgRect.left + point.x * scaleX;
      const pixelY = svgRect.top + point.y * scaleY;
      
      setTrainPos({ x: pixelX, y: pixelY });
      setTrainAngle(angle);
      
      const now = Date.now();
      if (now - lastTrailTime.current > 80) {
        lastTrailTime.current = now;
        const id = ++trailId.current;
        setTrail(t => [...t.slice(-25), { x: pixelX, y: pixelY, id }]);
        setTimeout(() => setTrail(t => t.filter(i => i.id !== id)), 1200);
      }
    };

    const animate = () => {
      if (!isDragging) {
        progress.current = (progress.current + 0.00025) % 1;
        updatePosition(progress.current);
      }
      animFrame.current = requestAnimationFrame(animate);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      
      const mouseX = ((clientX - rect.left) / rect.width) * 800;
      const mouseY = ((clientY - rect.top) / rect.height) * 400;

      let minDist = Infinity, bestP = progress.current;
      
      for (let i = 0; i <= 300; i++) {
        const p = i / 300;
        const pt = mainPath.getPointAtLength(p * pathLength.current);
        const d = Math.hypot(mouseX - pt.x, mouseY - pt.y);
        if (d < minDist) { minDist = d; bestP = p * (pathLength.current / totalLength.current); }
      }
      
      if (branchPath) {
        for (let i = 0; i <= 150; i++) {
          const p = i / 150;
          const pt = branchPath.getPointAtLength(p * branchLength.current);
          const d = Math.hypot(mouseX - pt.x, mouseY - pt.y);
          if (d < minDist) { minDist = d; bestP = (pathLength.current / totalLength.current) + (p * (branchLength.current / totalLength.current)); }
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
      if (dist < 70) {
        setIsDragging(true);
        const a = new Audio("/sounds/train-move.mp3");
        a.volume = 0.2;
        a.play().catch(() => {});
      }
    };

    const handleUp = () => setIsDragging(false);

    const resizeObserver = new ResizeObserver(() => updateSvgRect());
    if (svgRef.current) resizeObserver.observe(svgRef.current);
    window.addEventListener('resize', updateSvgRect, { passive: true });
    window.addEventListener('scroll', updateSvgRect, { passive: true });

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
      window.removeEventListener("resize", updateSvgRect);
      window.removeEventListener("scroll", updateSvgRect);
      resizeObserver.disconnect();
      cancelAnimationFrame(animFrame.current);
    };
  }, [isDragging, visible, svgRect, trackMode, updateSvgRect]);

  const mainTrackPath = trackParts[0]?.path || '';
  const branchTrackPath = trackParts.find(p => p.type === 'branch' && p.path !== mainTrackPath)?.path || '';

  return (
    <>
      <style>{`
        .train-trail-dot {
          position: absolute;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(212,168,67,0.75);
          pointer-events: none;
          z-index: 2;
          animation: trainTrailFade 1.2s ease-out forwards;
          transform: translate(-50%, -50%);
        }
        @keyframes trainTrailFade {
          0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }
        }
        .train-cursor {
          position: absolute;
          width: 60px; height: 26px;
          pointer-events: all;
          z-index: 3;
          cursor: grab;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.8));
          transition: opacity 0.5s;
        }
        .train-cursor:active { cursor: grabbing; }
        .track-container {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          pointer-events: none;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .track-inner {
          position: relative;
          width: min(85vw, 900px);
          height: min(42.5vw, 450px);
        }
        @media (max-width: 640px) {
          .track-inner { width: 95vw; height: 47.5vw; }
        }
        .track-mode-selector {
          position: fixed;
          top: 80px; right: 16px;
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
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          border-radius: 10px; border: none;
          cursor: pointer; transition: all 0.2s;
          font-family: inherit; text-align: center;
        }
        .track-mode-btn.default { background: transparent; color: rgba(212, 168, 67, 0.5); }
        .track-mode-btn.default.active {
          background: linear-gradient(135deg, rgba(212, 168, 67, 0.25) 0%, rgba(212, 168, 67, 0.1) 100%);
          color: #d4a843;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 0 12px rgba(212, 168, 67, 0.2);
        }
        .track-mode-btn.random { background: transparent; color: rgba(212, 168, 67, 0.5); }
        .track-mode-btn.random.active {
          background: linear-gradient(135deg, rgba(212, 168, 67, 0.25) 0%, rgba(212, 168, 67, 0.1) 100%);
          color: #d4a843;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 0 12px rgba(212, 168, 67, 0.2);
        }
        .track-mode-btn:hover:not(.active) {
          color: rgba(212, 168, 67, 0.9);
          background: rgba(212, 168, 67, 0.08);
        }
        .station-label {
          position: absolute;
          font-family: 'Courier New', monospace;
          font-size: 7px;
          font-weight: bold;
          letter-spacing: 0.08em;
          color: rgba(212,168,67,0.7);
          pointer-events: none;
          white-space: nowrap;
        }
      `}</style>

      {/* Track mode selector */}
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

      {/* Track path - behind everything */}
      <div className="track-container">
        <div className="track-inner">
          <svg 
            ref={svgRef}
            viewBox={currentViewBox} 
            className="w-full h-full"
            style={{ display: 'block' }}
          >
            <defs>
              <filter id="railGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            
            {/* Render all track parts */}
            {trackParts.map((part, idx) => {
              const isMain = part.type === 'main';
              const ballastColor = isMain ? '#3a3a4a' : '#323240';
              const railColor = '#d4a843';
              const sw = part.trackWidth;
              const railW = Math.max(sw - (isMain ? 16 : 12), 4);
              
              return (
                <g key={idx}>
                  {/* Ballast */}
                  <path d={part.path} fill="none" stroke={ballastColor} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Rail base */}
                  <path d={part.path} fill="none" stroke="#252530" strokeWidth={sw - 4} strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Golden running rail with glow */}
                  <path d={part.path} fill="none" stroke={railColor} strokeWidth="2" strokeDasharray="12,10" strokeLinecap="round" opacity="0.9" filter="url(#railGlow)">
                    {idx === 0 && <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="2.5s" repeatCount="indefinite"/>}
                  </path>
                </g>
              );
            })}
            
            {/* Station labels */}
            {currentStations.map((station, idx) => (
              <g key={`station-${idx}`}>
                <rect 
                  x={station.x - 42} 
                  y={station.y - 18} 
                  width="84" 
                  height="28" 
                  rx="3" 
                  fill="rgba(17,21,32,0.85)" 
                  stroke="#d4a843" 
                  strokeWidth="1.5"
                />
                <text 
                  x={station.x} 
                  y={station.y + 2} 
                  textAnchor="middle" 
                  fill="#d4a843" 
                  fontSize="8" 
                  fontFamily="'Courier New', monospace" 
                  fontWeight="bold"
                >
                  {station.label}
                </text>
              </g>
            ))}
            
            {/* Hidden main path for train interaction */}
            <path ref={mainPathRef} d={mainTrackPath} fill="none" stroke="transparent" strokeWidth="50"/>
            {branchTrackPath && (
              <path ref={branchPathRef} d={branchTrackPath} fill="none" stroke="transparent" strokeWidth="40"/>
            )}
          </svg>
          
          {/* Trail dots */}
          {trail.map(dot => (
            <div key={dot.id} className="train-trail-dot" style={{ left: dot.x, top: dot.y }}/>
          ))}
          
          {/* Train cursor */}
          <div
            ref={trainRef}
            className="train-cursor"
            style={{
              left: trainPos.x,
              top: trainPos.y,
              opacity: visible ? 1 : 0,
              transform: `translate(-50%, -50%) rotate(${trainAngle}deg)`,
            }}
          >
            <svg viewBox="0 0 70 30" fill="none">
              {/* Boiler */}
              <ellipse cx="32" cy="17" rx="24" ry="10" fill="url(#engineBoiler)"/>
              <ellipse cx="20" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
              <ellipse cx="28" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
              <ellipse cx="38" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
              {/* Smokebox */}
              <rect x="6" y="9" width="12" height="16" rx="2" fill="url(#smokeboxGrad)"/>
              <ellipse cx="8" cy="17" rx="4" ry="8" fill="#1a1d28"/>
              {/* Chimney */}
              <rect x="10" y="2" width="8" height="10" rx="1" fill="url(#chimneyEngineGrad)"/>
              <rect x="9" y="1" width="10" height="3" rx="1" fill="#c9a033"/>
              <rect x="11" y="0" width="6" height="2" rx="0.5" fill="#d4a843"/>
              {/* Dome */}
              <ellipse cx="35" cy="7" rx="5" ry="3.5" fill="url(#domeEngineGrad)"/>
              {/* Safety valves */}
              <rect x="40" y="4" width="3" height="5" rx="0.5" fill="#b8942f"/>
              <rect x="44" y="4" width="3" height="5" rx="0.5" fill="#b8942f"/>
              {/* Cab */}
              <rect x="50" y="7" width="16" height="20" rx="2" fill="url(#cabEngineGrad)"/>
              <rect x="53" y="10" width="10" height="7" rx="1" fill="#0a0d15" opacity="0.9"/>
              <rect x="48" y="5" width="20" height="3" rx="1" fill="#a07c2a"/>
              {/* Wheels */}
              <circle cx="10" cy="25" r="4" fill="#1a1d28"/>
              <circle cx="10" cy="25" r="3.2" fill="#2a2a3a"/>
              <circle cx="10" cy="25" r="1.2" fill="#d4a843"/>
              <circle cx="24" cy="25" r="5" fill="#1a1d28"/>
              <circle cx="24" cy="25" r="4" fill="#2a2a3a"/>
              <circle cx="24" cy="25" r="1.5" fill="#d4a843"/>
              <circle cx="36" cy="25" r="5" fill="#1a1d28"/>
              <circle cx="36" cy="25" r="4" fill="#2a2a3a"/>
              <circle cx="36" cy="25" r="1.5" fill="#d4a843"/>
              {/* Coupling rods */}
              <rect x="10" y="23.5" width="26" height="2" rx="1" fill="#b8942f"/>
              {/* Cowcatcher */}
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
        </div>
      </div>
    </>
  );
}
