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

// ──────────────────────────────────────────────
// LAYOUT 1: Double Oval with Passing Loop + Branch
// ──────────────────────────────────────────────
function makeDoubleOval(ox: number, oy: number) {
  const outerRX = 215, outerRY = 90;
  const innerRX = outerRX - TRACK_GAP * 1.5, innerRY = outerRY - 10;
  // Branch extends from right side of oval
  const bx = ox + outerRX, by = oy;

  const parts = [
    // CLOSED main oval (outer)
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 22, type: 'main' as const },
    // CLOSED inner passing loop
    { path: `M ${ox - innerRX} ${oy} A ${innerRX} ${innerRY} 0 0 1 ${ox + innerRX} ${oy} A ${innerRX} ${innerRY} 0 0 1 ${ox - innerRX} ${oy}`, trackWidth: 16, type: 'main' as const },
    // SUBSTANTIAL BRANCH — long extension from right side going up and right
    { path: `M ${bx} ${by} L ${bx + 80} ${by - 20} A 50 40 0 0 1 ${bx + 140} ${by - 55} L ${bx + 140} ${by - 100}`, trackWidth: 15, type: 'branch' as const },
    // Siding off branch
    { path: `M ${bx + 90} ${by - 35} L ${bx + 90} ${by - 70}`, trackWidth: 12, type: 'siding' as const },
    { path: `M ${bx + 115} ${by - 50} L ${bx + 145} ${by - 50}`, trackWidth: 12, type: 'yard' as const },
  ];
  const stations = [
    { x: ox, y: oy - outerRY - 8, label: 'PASSING LOOP' },
    { x: bx + 70, y: by - 55, label: 'BRANCH HALT' },
  ];
  return { parts, stations, name: "Double Oval + Branch", desc: "Two-track oval with long branch extension", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 2: Terminus with Approach Loop + Branch
// ──────────────────────────────────────────────
function makeTerminus(ox: number, oy: number) {
  const outerRX = 180, outerRY = 75;
  // A proper CLOSED approach oval
  const approachBX = ox - outerRX, approachBY = oy;
  // Branch from top of approach oval going to terminus area
  const termX = ox - 220, termY = oy - 30;

  const parts = [
    // CLOSED approach oval
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 20, type: 'main' as const },
    // Branch: from left of approach oval going to terminus platform
    { path: `M ${approachBX} ${approachBY} L ${approachBX - 60} ${approachBY - 20} L ${approachBX - 60} ${termY + 10} L ${termX + 60} ${termY + 10}`, trackWidth: 16, type: 'branch' as const },
    // Terminus platform tracks
    { path: `M ${termX + 60} ${termY + 10} L ${termX} ${termY + 10} L ${termX} ${termY - 25}`, trackWidth: 16, type: 'siding' as const },
    { path: `M ${termX + 60} ${termY + 28} L ${termX} ${termY + 28} L ${termX} ${termY + 48}`, trackWidth: 14, type: 'siding' as const },
    // Return line from terminus back to approach oval
    { path: `M ${termX} ${termY - 25} Q ${termX + 30} ${termY - 50} ${approachBX} ${approachBY - 50}`, trackWidth: 16, type: 'main' as const },
    // Second platform track connection
    { path: `M ${termX} ${termY + 48} Q ${termX + 30} ${termY + 70} ${approachBX} ${approachBY + 50}`, trackWidth: 14, type: 'siding' as const },
  ];
  const stations = [
    { x: ox, y: oy - outerRY - 8, label: 'APPROACH LOOP' },
    { x: (termX + termX + 60) / 2, y: termY + 20, label: 'TERMINUS' },
  ];
  return { parts, stations, name: "Terminus Station", desc: "Closed approach loop with terminus platforms and bay branch", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 3: Junction with Dual Branches
// ──────────────────────────────────────────────
function makeJunction(ox: number, oy: number) {
  const outerRX = 190, outerRY = 80;
  const rbx = ox + outerRX, rby = oy;
  const lbx = ox - outerRX, lby = oy;

  const parts = [
    // CLOSED main oval
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 22, type: 'main' as const },
    // Inner passing loop
    { path: `M ${ox - outerRX + TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox + outerRX - TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox - outerRX + TRACK_GAP} ${oy}`, trackWidth: 16, type: 'main' as const },
    // BRANCH A: long extension from right side going up-right
    { path: `M ${rbx} ${rby} L ${rbx + 70} ${rby - 30} A 60 45 0 0 1 ${rbx + 140} ${rby - 70} L ${rbx + 140} ${rby - 115}`, trackWidth: 15, type: 'branch' as const },
    // BRANCH B: extension from left side going down-left
    { path: `M ${lbx} ${lby} L ${lbx - 70} ${lby + 30} A 60 45 0 0 0 ${lbx - 140} ${lby + 70} L ${lbx - 140} ${lby + 115}`, trackWidth: 15, type: 'branch' as const },
    // Sidings off branch A
    { path: `M ${rbx + 100} ${rby - 50} L ${rbx + 100} ${rby - 80}`, trackWidth: 12, type: 'siding' as const },
    { path: `M ${rbx + 125} ${rby - 65} L ${rbx + 155} ${rby - 65}`, trackWidth: 12, type: 'yard' as const },
    // Siding off branch B
    { path: `M ${lbx - 100} ${lby + 50} L ${lbx - 100} ${lby + 80}`, trackWidth: 12, type: 'siding' as const },
  ];
  const stations = [
    { x: ox, y: oy - outerRY - 8, label: 'MAIN JUNCTION' },
    { x: rbx + 70, y: rby - 60, label: 'EAST BRANCH' },
    { x: lbx - 70, y: lby + 60, label: 'WEST BRANCH' },
  ];
  return { parts, stations, name: "Junction Station", desc: "Main line with two substantial branch extensions", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 4: Figure 8 with Extended Branches
// ──────────────────────────────────────────────
function makeFigure8(ox: number, oy: number) {
  const rX = 130, rY = 62, gap = 38;
  const rightX = ox + rX, leftX = ox - rX;

  const parts = [
    // CLOSED upper oval
    { path: `M ${ox - rX} ${oy - gap/2} A ${rX} ${rY} 0 0 1 ${ox + rX} ${oy - gap/2} A ${rX} ${rY} 0 0 1 ${ox - rX} ${oy - gap/2}`, trackWidth: 20, type: 'main' as const },
    // CLOSED lower oval
    { path: `M ${ox - rX} ${oy + gap/2} A ${rX} ${rY} 0 0 0 ${ox + rX} ${oy + gap/2} A ${rX} ${rY} 0 0 0 ${ox - rX} ${oy + gap/2}`, trackWidth: 20, type: 'main' as const },
    // Cross connectors (figure-8 crossover)
    { path: `M ${ox - rX} ${oy - gap/2} Q ${ox - rX/2} ${oy} ${ox - rX} ${oy + gap/2}`, trackWidth: 14, type: 'branch' as const },
    { path: `M ${ox + rX} ${oy - gap/2} Q ${ox + rX/2} ${oy} ${ox + rX} ${oy + gap/2}`, trackWidth: 14, type: 'branch' as const },
    // Extended branch from upper-right going up
    { path: `M ${rightX} ${oy - gap/2} L ${rightX + 80} ${oy - gap/2 - 30} A 50 40 0 0 1 ${rightX + 130} ${oy - gap/2 - 70}`, trackWidth: 14, type: 'branch' as const },
    // Extended branch from lower-left going down
    { path: `M ${leftX} ${oy + gap/2} L ${leftX - 80} ${oy + gap/2 + 30} A 50 40 0 0 0 ${leftX - 130} ${oy + gap/2 + 70}`, trackWidth: 14, type: 'branch' as const },
    // Sidings
    { path: `M ${rightX + 100} ${oy - gap/2 - 50} L ${rightX + 130} ${oy - gap/2 - 50}`, trackWidth: 11, type: 'siding' as const },
    { path: `M ${leftX - 100} ${oy + gap/2 + 50} L ${leftX - 130} ${oy + gap/2 + 50}`, trackWidth: 11, type: 'siding' as const },
  ];
  const stations = [
    { x: ox, y: oy - rY - gap/2 - 8, label: 'NORTH JUNCTION' },
    { x: ox, y: oy + rY + gap/2 + 8, label: 'SOUTH JUNCTION' },
  ];
  return { parts, stations, name: "Figure 8", desc: "Two ovals with crossover tracks and extended branches", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 5: Depot & Yard with Branch
// ──────────────────────────────────────────────
function makeDepot(ox: number, oy: number) {
  const outerRX = 200, outerRY = 85;
  const branchX = ox, branchY = oy - outerRY;

  const parts = [
    // CLOSED main oval
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 22, type: 'main' as const },
    // Inner oval
    { path: `M ${ox - outerRX + TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox + outerRX - TRACK_GAP} ${oy} A ${outerRX - TRACK_GAP} ${outerRY - 8} 0 0 1 ${ox - outerRX + TRACK_GAP} ${oy}`, trackWidth: 16, type: 'main' as const },
    // SUBSTANTIAL BRANCH: from top going up to engine shed area
    { path: `M ${branchX} ${branchY} L ${branchX} ${branchY - 50} A 40 35 0 0 1 ${branchX + 50} ${branchY - 85} L ${branchX + 50} ${branchY - 130}`, trackWidth: 15, type: 'branch' as const },
    // Shed roads branching off the main branch
    { path: `M ${branchX + 50} ${branchY - 80} L ${branchX + 90} ${branchY - 100} L ${branchX + 90} ${branchY - 145}`, trackWidth: 13, type: 'yard' as const },
    { path: `M ${branchX + 50} ${branchY - 95} L ${branchX + 90} ${branchY - 80} L ${branchX + 90} ${branchY - 50}`, trackWidth: 13, type: 'yard' as const },
    // Extra siding
    { path: `M ${branchX} ${branchY - 30} L ${branchX - 50} ${branchY - 60}`, trackWidth: 12, type: 'siding' as const },
  ];
  const stations = [
    { x: ox, y: oy - outerRY - 8, label: 'MAIN LINE' },
    { x: branchX + 45, y: branchY - 105, label: 'ENGINE SHED' },
  ];
  return { parts, stations, name: "Depot & Yard", desc: "Main line with substantial branch to engine shed and yard", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 6: Triple Track Main Line
// ──────────────────────────────────────────────
function makeTriple(ox: number, oy: number) {
  const outerRX = 210, outerRY = 88, gap = 12;

  const parts = [
    // CLOSED outer oval
    { path: `M ${ox - outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox + outerRX} ${oy} A ${outerRX} ${outerRY} 0 0 1 ${ox - outerRX} ${oy}`, trackWidth: 22, type: 'main' as const },
    // CLOSED middle oval
    { path: `M ${ox - outerRX + gap} ${oy} A ${outerRX - gap} ${outerRY - gap} 0 0 1 ${ox + outerRX - gap} ${oy} A ${outerRX - gap} ${outerRY - gap} 0 0 1 ${ox - outerRX + gap} ${oy}`, trackWidth: 17, type: 'main' as const },
    // CLOSED inner oval (branch-type so train visits it as a loop)
    { path: `M ${ox - outerRX + gap*2} ${oy} A ${outerRX - gap*2} ${outerRY - gap*2} 0 0 1 ${ox + outerRX - gap*2} ${oy} A ${outerRX - gap*2} ${outerRY - gap*2} 0 0 1 ${ox - outerRX + gap*2} ${oy}`, trackWidth: 14, type: 'branch' as const },
    // Long branch from right end going up and around
    { path: `M ${ox + outerRX} ${oy} L ${ox + outerRX + 60} ${oy - 20} A 70 55 0 0 1 ${ox + outerRX + 130} ${oy - 80} L ${ox + outerRX + 130} ${oy - 140}`, trackWidth: 14, type: 'branch' as const },
    // Siding off the long branch
    { path: `M ${ox + outerRX + 90} ${oy - 50} L ${ox + outerRX + 120} ${oy - 50}`, trackWidth: 11, type: 'siding' as const },
    // Short crossover
    { path: `M ${ox - outerRX} ${oy} L ${ox - outerRX + gap*2} ${oy + 18}`, trackWidth: 11, type: 'branch' as const },
  ];
  const stations = [
    { x: ox, y: oy - outerRY - 6, label: 'TRIPLE TRACK MAIN' },
    { x: ox + outerRX + 65, y: oy - 75, label: 'BRANCH' },
  ];
  return { parts, stations, name: "Triple Track", desc: "Three parallel tracks with extended branch line", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 7: Dog-Bone with Branch Extension
// ──────────────────────────────────────────────
function makeDogBone(ox: number, oy: number) {
  const endR = 110, straight = 265;
  const leftEndX = ox - straight/2 - endR, rightEndX = ox + straight/2 + endR;

  const parts = [
    // CLOSED dog-bone main track
    { path: `M ${leftEndX} ${oy} A ${endR} ${endR * 0.75} 0 0 1 ${ox + straight/2} ${oy} A ${endR} ${endR * 0.75} 0 0 1 ${leftEndX} ${oy}`, trackWidth: 22, type: 'main' as const },
    // Inner dog-bone
    { path: `M ${leftEndX + TRACK_GAP} ${oy} A ${endR - TRACK_GAP} ${endR * 0.75 - 8} 0 0 1 ${ox + straight/2 - TRACK_GAP} ${oy} A ${endR - TRACK_GAP} ${endR * 0.75 - 8} 0 0 1 ${leftEndX + TRACK_GAP} ${oy}`, trackWidth: 16, type: 'main' as const },
    // SUBSTANTIAL BRANCH from right end going up
    { path: `M ${rightEndX} ${oy} L ${rightEndX + 80} ${oy - 30} A 60 50 0 0 1 ${rightEndX + 140} ${oy - 80} L ${rightEndX + 140} ${oy - 130}`, trackWidth: 15, type: 'branch' as const },
    // Long siding along the straight section
    { path: `M ${ox - 40} ${oy - endR * 0.75 + 5} L ${ox + 80} ${oy - endR * 0.75 + 5}`, trackWidth: 12, type: 'siding' as const },
    // Branch from left end going down
    { path: `M ${leftEndX} ${oy} L ${leftEndX - 60} ${oy + 30} A 50 40 0 0 0 ${leftEndX - 110} ${oy + 70}`, trackWidth: 14, type: 'branch' as const },
    // Siding off left branch
    { path: `M ${leftEndX - 80} ${oy + 50} L ${leftEndX - 80} ${oy + 90}`, trackWidth: 12, type: 'yard' as const },
  ];
  const stations = [
    { x: ox, y: oy - endR * 0.75 - 8, label: 'DOG-BONE MAIN' },
    { x: rightEndX + 70, y: oy - 65, label: 'EAST BRANCH' },
    { x: leftEndX - 55, y: oy + 55, label: 'WEST BRANCH' },
  ];
  return { parts, stations, name: "Dog-Bone", desc: "Long straights with large-radius ends and substantial branch extensions", viewBox: "0 0 800 400" };
}

// ──────────────────────────────────────────────
// LAYOUT 8: Heritage / Industrial with Real Branch
// ──────────────────────────────────────────────
function makeHeritage(ox: number, oy: number) {
  const tR = 85;
  const branchX = ox + tR, branchY = oy - tR * 0.65;

  const parts = [
    // CLOSED main oval (heritage tight radius)
    { path: `M ${ox - tR} ${oy} A ${tR} ${tR * 0.65} 0 0 1 ${ox + tR} ${oy} A ${tR} ${tR * 0.65} 0 0 1 ${ox - tR} ${oy}`, trackWidth: 20, type: 'main' as const },
    // Inner heritage loop
    { path: `M ${ox - tR + TRACK_GAP} ${oy} A ${tR - TRACK_GAP} ${tR * 0.65 - 6} 0 0 1 ${ox + tR - TRACK_GAP} ${oy} A ${tR - TRACK_GAP} ${tR * 0.65 - 6} 0 0 1 ${ox - tR + TRACK_GAP} ${oy}`, trackWidth: 14, type: 'main' as const },
    // SUBSTANTIAL BRANCH: heritage line going up and over
    { path: `M ${branchX} ${branchY} L ${branchX + 50} ${branchY - 30} A 55 45 0 0 1 ${branchX + 110} ${branchY - 65} L ${branchX + 110} ${branchY - 115}`, trackWidth: 14, type: 'branch' as const },
    // Platform halt on main line
    { path: `M ${ox - 20} ${oy - tR * 0.65 + 5} L ${ox + 50} ${oy - tR * 0.65 + 5}`, trackWidth: 13, type: 'main' as const },
    // Branch terminus siding
    { path: `M ${branchX + 110} ${branchY - 80} L ${branchX + 150} ${branchY - 80} L ${branchX + 150} ${branchY - 55}`, trackWidth: 13, type: 'siding' as const },
    // Industrial spur
    { path: `M ${branchX + 70} ${branchY - 48} L ${branchX + 70} ${branchY - 20}`, trackWidth: 11, type: 'yard' as const },
  ];
  const stations = [
    { x: ox + 15, y: oy - tR * 0.65 - 5, label: 'HERITAGE HALT' },
    { x: branchX + 55, y: branchY - 50, label: 'BRANCH' },
  ];
  return { parts, stations, name: "Heritage Branch", desc: "Tight-radius oval with substantial heritage branch line", viewBox: "0 0 800 400" };
}


// ──────────────────────────────────────────────
const FACTORIES = [makeDoubleOval, makeTerminus, makeJunction, makeFigure8, makeDepot, makeTriple, makeDogBone, makeHeritage];

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
interface InteractiveTrainProps {
  /** Hide the Layout / Random selector — use for decorative background mode */
  showControls?: boolean;
}

export default function InteractiveTrain({ showControls = true }: InteractiveTrainProps) {
  const trainRef = useRef<HTMLDivElement>(null);
  const mainPathRef = useRef<SVGPathElement>(null);
  const branchPathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const initialized = useRef(false);
  
  const [trackMode, setTrackMode] = useState<'default' | 'random'>('default');
  const [trainPos, setTrainPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [trainAngle, setTrainAngle] = useState(0);
  const [trainScaleX, setTrainScaleX] = useState(1);
  const [svgRect, setSvgRect] = useState({ 
    left: typeof window !== 'undefined' ? window.innerWidth / 2 - 400 : 0, 
    top: typeof window !== 'undefined' ? window.innerHeight / 2 - 200 : 0, 
    width: 800, height: 400 
  });
  
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
    
    // Force initial rect update after mount so train positions correctly from start
    setTimeout(() => updateSvgRect(), 0);
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

    // Closed loop: train completes full oval FIRST, then visits branch and returns
    // Progress 0 → pathLength.main/total: traverse FULL main oval once
    // Progress pathLength.main/total → 1: traverse branch OUT AND BACK
    const ovalFraction = pathLength.current / totalLength.current;
    
    const getPointAtProgress = (p: number) => {
      if (p <= 0 || p > 1) p = ((p % 1) + 1) % 1;
      
      if (p <= ovalFraction) {
        // First phase: traverse the FULL main oval
        const mainP = p / ovalFraction; // 0 → 1 maps to full oval traversal
        const clampedP = Math.max(0, Math.min(1, mainP));
        return { point: mainPath.getPointAtLength(clampedP * pathLength.current), onBranch: false };
      } else if (branchPath) {
        // Second phase: branch out AND back to close the loop
        const branchP = (p - ovalFraction) / (1 - ovalFraction); // 0 → 1 = out, 1 → 0 = back
        const pingPongP = 1 - Math.abs((branchP * 2) - 1); // 0→1→0 triangle wave
        const clampedP = Math.max(0, Math.min(1, pingPongP));
        return { point: branchPath.getPointAtLength(clampedP * branchLength.current), onBranch: true };
      }
      return { point: mainPath.getPointAtLength(0), onBranch: false };
    };

    const updatePosition = (p: number) => {
      const { point } = getPointAtProgress(p);
      
      const delta = 0.003;
      const { point: nextPoint } = getPointAtProgress(Math.min(p + delta, 0.9999));
      const dx = nextPoint.x - point.x;
      const dy = nextPoint.y - point.y;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      // Flip train SVG when moving left so front faces correct direction
      const flipX = dx >= 0 ? 1 : -1;
      const scaleX = svgRect.width / 800;
      const scaleY = svgRect.height / 400;
      const pixelX = point.x * scaleX;
      const pixelY = point.y * scaleY;
      
      setTrainPos({ x: pixelX, y: pixelY });
      setTrainAngle(angle);
      setTrainScaleX(flipX);
      
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

  // Always use the first path as main (it's always a closed oval in every layout)
  // Branch = first branch-type path that differs from main, else undefined
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
          width: min(95vw, 1200px);
          height: min(47.5vw, 600px);
          opacity: 0.45;
        }
        @media (max-width: 640px) {
          .track-inner { width: 98vw; height: 49vw; }
        }
        .track-mode-selector {
          position: fixed;
          bottom: 24px; right: 24px;
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

      {/* Track mode selector — hidden when used as decorative background */}
      {showControls && (
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
      )}

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
              opacity: visible ? 0.6 : 0,
              transform: `translate(-50%, -50%) rotate(${trainAngle}deg) scaleX(${trainScaleX})`,
            }}
          >
            <svg viewBox="0 0 70 30" fill="none">
              {/* Boiler — faces RIGHT */}
              <ellipse cx="38" cy="17" rx="24" ry="10" fill="url(#engineBoilerR)"/>
              <ellipse cx="50" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
              <ellipse cx="42" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
              <ellipse cx="32" cy="17" rx="0.8" ry="9" fill="#b8942f" opacity="0.7"/>
              {/* Smokebox */}
              <rect x="52" y="9" width="12" height="16" rx="2" fill="url(#smokeboxGradR)"/>
              <ellipse cx="62" cy="17" rx="4" ry="8" fill="#1a1d28"/>
              {/* Chimney */}
              <rect x="54" y="2" width="8" height="10" rx="1" fill="url(#chimneyEngineGradR)"/>
              <rect x="53" y="1" width="10" height="3" rx="1" fill="#c9a033"/>
              <rect x="55" y="0" width="6" height="2" rx="0.5" fill="#d4a843"/>
              {/* Dome */}
              <ellipse cx="35" cy="7" rx="5" ry="3.5" fill="url(#domeEngineGradR)"/>
              {/* Safety valves */}
              <rect x="26" y="4" width="3" height="5" rx="0.5" fill="#b8942f"/>
              <rect x="22" y="4" width="3" height="5" rx="0.5" fill="#b8942f"/>
              {/* Cab */}
              <rect x="4" y="7" width="16" height="20" rx="2" fill="url(#cabEngineGradR)"/>
              <rect x="7" y="10" width="10" height="7" rx="1" fill="#0a0d15" opacity="0.9"/>
              <rect x="2" y="5" width="20" height="3" rx="1" fill="#a07c2a"/>
              {/* Wheels — rightmost=front (cowcatcher side) */}
              <circle cx="60" cy="25" r="4" fill="#1a1d28"/>
              <circle cx="60" cy="25" r="3.2" fill="#2a2a3a"/>
              <circle cx="60" cy="25" r="1.2" fill="#d4a843"/>
              <circle cx="46" cy="25" r="5" fill="#1a1d28"/>
              <circle cx="46" cy="25" r="4" fill="#2a2a3a"/>
              <circle cx="46" cy="25" r="1.5" fill="#d4a843"/>
              <circle cx="34" cy="25" r="5" fill="#1a1d28"/>
              <circle cx="34" cy="25" r="4" fill="#2a2a3a"/>
              <circle cx="34" cy="25" r="1.5" fill="#d4a843"/>
              {/* Coupling rods */}
              <rect x="34" y="23.5" width="26" height="2" rx="1" fill="#b8942f"/>
              {/* Cowcatcher — RIGHT side (front) */}
              <path d="M 68 20 L 70 26 L 66 26 L 64 23 Z" fill="#c9a033"/>
              <line x1="69" y1="21" x2="68.5" y2="26" stroke="#8a7020" strokeWidth="0.5"/>
              <line x1="67" y1="20" x2="66.5" y2="26" stroke="#8a7020" strokeWidth="0.5"/>
              {/* Headlight — RIGHT side (front) */}
              <circle cx="68" cy="14" r="2.5" fill="#fffbe6"/>
              <circle cx="68" cy="14" r="1.8" fill="#ffeb3b"/>
              <circle cx="68" cy="14" r="0.8" fill="#fff"/>
              {/* Gradients */}
              <defs>
                <linearGradient id="engineBoilerR" x1="62" y1="7" x2="62" y2="27" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#e8c865"/>
                  <stop offset="40%" stopColor="#d4a843"/>
                  <stop offset="100%" stopColor="#9a7a20"/>
                </linearGradient>
                <linearGradient id="smokeboxGradR" x1="58" y1="9" x2="58" y2="25" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3a3a4a"/>
                  <stop offset="100%" stopColor="#1a1d28"/>
                </linearGradient>
                <linearGradient id="chimneyEngineGradR" x1="58" y1="2" x2="58" y2="12" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#d4a843"/>
                  <stop offset="100%" stopColor="#8a7020"/>
                </linearGradient>
                <radialGradient id="domeEngineGradR" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#e8d080"/>
                  <stop offset="100%" stopColor="#c9a033"/>
                </radialGradient>
                <linearGradient id="cabEngineGradR" x1="4" y1="7" x2="20" y2="27" gradientUnits="userSpaceOnUse">
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
