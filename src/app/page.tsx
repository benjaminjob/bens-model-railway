"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

const TRACK_PLAN_SVG = `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
  </defs>
  <rect x="5" y="5" width="790" height="390" fill="#0a0d15" stroke="#1e2130" stroke-width="2" rx="8"/>
  <path d="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200" fill="none" stroke="#1a1d28" stroke-width="28" stroke-linecap="round"/>
  <path d="M 650 160 L 720 160 Q 730 160 730 170 L 730 230 Q 730 240 720 240 L 650 240" fill="none" stroke="#1a1d28" stroke-width="16" stroke-linecap="round"/>
  <path d="M 250 80 L 250 50 Q 250 40 260 40 L 340 40 Q 350 40 350 50 L 350 80" fill="none" stroke="#1a1d28" stroke-width="16" stroke-linecap="round"/>
  <path d="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200" fill="none" stroke="#3a3a4a" stroke-width="22" stroke-linecap="round"/>
  <path d="M 650 160 L 720 160 Q 730 160 730 170 L 730 230 Q 730 240 720 240 L 650 240" fill="none" stroke="#3a3a4a" stroke-width="14" stroke-linecap="round"/>
  <path d="M 250 80 L 250 50 Q 250 40 260 40 L 340 40 Q 350 40 350 50 L 350 80" fill="none" stroke="#3a3a4a" stroke-width="14" stroke-linecap="round"/>
  <path d="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200" fill="none" stroke="#d4a843" stroke-width="3" stroke-dasharray="16,12" stroke-linecap="round" filter="url(#glow)">
    <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2s" repeatCount="indefinite"/>
  </path>
  <path d="M 650 160 L 720 160 Q 730 160 730 170 L 730 230 Q 730 240 720 240 L 650 240" fill="none" stroke="#d4a843" stroke-width="2" stroke-dasharray="8,8" stroke-linecap="round" opacity="0.7"/>
  <path d="M 250 80 L 250 50 Q 250 40 260 40 L 340 40 Q 350 40 350 50 L 350 80" fill="none" stroke="#d4a843" stroke-width="2" stroke-dasharray="8,8" stroke-linecap="round" opacity="0.7"/>
  <rect x="360" y="160" width="80" height="80" rx="4" fill="#111520" stroke="#d4a843" stroke-width="2"/>
  <polygon points="360,160 400,135 440,160" fill="#0d1020" stroke="#d4a843" stroke-width="2"/>
  <rect x="373" y="172" width="54" height="44" rx="2" fill="#0a0d15" stroke="#d4a843" stroke-width="1" opacity="0.8"/>
  <rect x="377" y="176" width="10" height="12" rx="1" fill="#d4a843" opacity="0.6"/><rect x="391" y="176" width="10" height="12" rx="1" fill="#d4a843" opacity="0.4"/><rect x="405" y="176" width="10" height="12" rx="1" fill="#d4a843" opacity="0.6"/>
  <rect x="377" y="193" width="10" height="12" rx="1" fill="#d4a843" opacity="0.3"/><rect x="391" y="193" width="10" height="12" rx="1" fill="#d4a843" opacity="0.7"/><rect x="405" y="193" width="10" height="12" rx="1" fill="#d4a843" opacity="0.3"/>
  <text x="400" y="165" text-anchor="middle" fill="#d4a843" font-size="8" font-family="monospace" font-weight="bold" opacity="0.9">STATION</text>
  <rect x="475" y="290" width="150" height="30" rx="3" fill="#0d1020" stroke="#d4a843" stroke-width="1.5"/>
  <rect x="483" y="298" width="134" height="14" rx="2" fill="#111825"/>
  <text x="550" y="310" text-anchor="middle" fill="#8a8fa0" font-size="9" font-family="monospace">PLATFORM</text>
  <circle cx="250" cy="80" r="6" fill="#d4a843" filter="url(#glow)"><animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/></circle>
  <circle cx="350" cy="80" r="6" fill="#d4a843" filter="url(#glow)"><animate attributeName="opacity" values="1;0.3;1" dur="3s" begin="1s" repeatCount="indefinite"/></circle>
  <circle cx="650" cy="200" r="6" fill="#d4a843" filter="url(#glow)"><animate attributeName="opacity" values="1;0.3;1" dur="3s" begin="2s" repeatCount="indefinite"/></circle>
  <text x="60" y="200" text-anchor="middle" fill="#3a3a4a" font-size="8" font-family="monospace" transform="rotate(-90,60,200)">MAIN LINE</text>
  <text x="750" y="200" text-anchor="middle" fill="#3a3a4a" font-size="7" font-family="monospace" transform="rotate(90,750,200)">SIDING</text>
  <text x="300" y="55" text-anchor="middle" fill="#3a3a4a" font-size="7" font-family="monospace">UP MAIN</text>
  <text x="300" y="370" text-anchor="middle" fill="#3a3a4a" font-size="7" font-family="monospace">DOWN MAIN</text>
  <circle r="8" fill="#d4a843" filter="url(#glow)" opacity="0.9"><animateMotion dur="14s" repeatCount="indefinite" path="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200"/></circle>
  <circle r="4" fill="#fff" opacity="0.8"><animateMotion dur="14s" repeatCount="indefinite" path="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200"/></circle>
</svg>`;

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const GALLERY_ITEMS = [
  { src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80", alt: "Steam locomotive at platform", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1527684651001-731c474bbb5a?w=600&q=80", alt: "Historic railway station", span: "" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", alt: "Detailed railway scenery", span: "" },
  { src: "https://images.unsplash.com/photo-1508161820330-3a2b3e3f8a88?w=600&q=80", alt: "Model railway track work", span: "" },
  { src: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80", alt: "Railway viaduct in landscape", span: "col-span-2" },
];

function Nav({ active }: { active: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const whistleRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { whistleRef.current = new Audio("/sounds/train-move.mp3"); whistleRef.current.volume = 0.12; }, []);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  const links = [
    { id: "home", label: "Home" }, { id: "layout", label: "The Layout" }, { id: "journal", label: "Build Journal" },
    { id: "renders", label: "3D Renders" }, { page: "/real-railways", label: "Real Railways" }, { id: "software", label: "Software" },
  ];
  const playWhistle = () => { if (whistleRef.current) { whistleRef.current.currentTime = 0; whistleRef.current.play().catch(() => {}); } };
  return (
    <motion.nav className={`fixed top-0 left-0 right-0 z-[9998] transition-all duration-300 ${scrolled ? "nav-blur bg-railway-bg/80 border-b border-railway-border/50" : "bg-transparent"}`}
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-heading text-lg font-bold text-railway-accent tracking-wide">Ben&apos;s Model Railway</span>
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.label} href={l.page ?? `#${l.id}`} onClick={playWhistle}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 ${active === l.id ? "text-railway-accent" : "text-railway-muted hover:text-railway-text"}`}>
              {active === l.id && <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-railway-accent/10 border border-railway-accent/30 rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }}/>}
              <span className="relative z-10">{l.label}</span>
            </a>
          ))}
        </div>
        <button className="md:hidden text-railway-muted p-1" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">{menuOpen ? <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> : <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}</svg>
        </button>
      </div>
      <AnimatePresence>{menuOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-railway-surface border-t border-railway-border overflow-hidden">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <a key={l.label} href={l.page ?? `#${l.id}`} onClick={() => { playWhistle(); setMenuOpen(false); }}
                className={`px-3 py-2 text-sm rounded-lg ${active === l.id ? "bg-railway-accent/10 text-railway-accent" : "text-railway-muted"}`}>{l.label}</a>
            ))}
          </div>
        </motion.div>
      )}</AnimatePresence>
    </motion.nav>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0 hero-bg hero-grain"/>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-railway-accent/10 blur-[80px]" style={{ animation: "glowPulse 4s ease-in-out infinite" }}/>
        <div className="absolute bottom-0 left-0 w-[700px] h-[450px] rounded-full bg-railway-accent/8 blur-[60px]" style={{ animation: "glowPulse 5s ease-in-out infinite 1s" }}/>
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-railway-accent/5 blur-[60px]" style={{ animation: "glowPulse 6s ease-in-out infinite 2s" }}/>
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.p className="text-railway-accent text-xs tracking-[0.3em] uppercase mb-5 font-medium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          00 Gauge · 4mm : 1ft · DCC Control
        </motion.p>
        <motion.h1 className="font-heading text-[3.5rem] md:text-[6rem] lg:text-[7rem] font-bold leading-[0.9] mb-6 tracking-tight" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <span className="text-railway-text">Ben&apos;s</span><br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400" style={{ backgroundSize: "200% auto", animation: "shimmer 4s linear infinite" }}>Model Railway</span>
        </motion.h1>
        <motion.p className="text-railway-muted text-base md:text-lg mb-3 max-w-xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
          A life-size railway in miniature
        </motion.p>
        <motion.p className="text-railway-muted/70 text-sm max-w-lg mx-auto mb-10 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.75 }}>
          Real railways of Cornwall &amp; Devon, adapted and skewed to fit a baseboard. Built with precision, imagination, and a love for the railways.
        </motion.p>
        <motion.div className="flex flex-wrap justify-center gap-6 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9 }}>
          {[{ label: "Gauge", value: "00 (1:148)" }, { label: "Scale", value: "4mm : 1ft" }, { label: "Control", value: "DCC" }, { label: "Track", value: "Peco Streamline" }].map((item, i) => (
            <motion.div key={item.label} className="text-center" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.08 }}>
              <p className="text-railway-accent font-bold text-lg">{item.value}</p>
              <p className="text-railway-muted/60 text-[10px] uppercase tracking-widest">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="flex flex-wrap justify-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          <a href="#layout" onClick={() => { const a = new Audio("/sounds/train-move.mp3"); a.volume = 0.15; a.play().catch(() => {}); }}
            className="relative overflow-hidden btn-shine bg-railway-accent text-railway-bg font-bold px-7 py-3.5 rounded-xl transition-all duration-300 hover:bg-railway-accent-hover hover:shadow-xl hover:shadow-railway-accent/20 active:scale-95 cursor-pointer">
            Explore the Layout
          </a>
          <a href="/real-railways" onClick={() => { const a = new Audio("/sounds/train-move.mp3"); a.volume = 0.15; a.play().catch(() => {}); }}
            className="border border-railway-border text-railway-muted font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 hover:border-railway-accent/50 hover:text-railway-text hover:bg-railway-accent/5 active:scale-95">
            Real Railways →
          </a>
        </motion.div>
      </div>
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
        <p className="text-railway-muted/40 text-[10px] uppercase tracking-widest">Scroll</p>
        <div className="w-5 h-8 border border-railway-border/50 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2.5 bg-railway-accent/60 rounded-full" style={{ animation: "scrollBounce 1.5s ease-in-out infinite" }}/>
        </div>
      </motion.div>
      <style jsx global>{`@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } } @keyframes scrollBounce { 0%,100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(6px) scaleY(0.9); } }`}</style>
    </section>
  );
}

function ModelViewer3D({ src, onLoad, loaded }: { src: string; onLoad: () => void; loaded: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => onLoad();
    el.addEventListener("load", handler);
    (el as any).src = src;
    (el as any).autoRotate = true;
    (el as any).cameraControls = true;
    (el as any).shadowIntensity = "0.8";
    (el as any).environmentImage = "neutral";
    (el as any).loading = "eager";
    return () => el.removeEventListener("load", handler);
  }, [src, onLoad]);
  // @ts-ignore
  return <model-viewer ref={ref} alt="Interactive 3D model" className={`w-full h-full transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`} />;
}

function TheLayout() {
  const MODEL_3D_URL = "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb";
  const [modelLoaded, setModelLoaded] = useState(false);
  return (
    <section id="layout" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <Reveal><p className="text-railway-accent text-xs tracking-[0.25em] uppercase mb-3 font-medium text-center">The Design</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-railway-text text-center mb-3">The Layout</h2>
          <p className="text-railway-muted text-base text-center mb-16 max-w-xl mx-auto">From paper plan to miniature world — explore every view of the railway</p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-8">
          <Reveal delay={0.1}>
            <div className="card-animated card bg-railway-surface border border-railway-border rounded-2xl overflow-hidden">
              <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                <div><h3 className="font-heading text-lg font-bold text-railway-text">2D Track Plan</h3><p className="text-railway-muted text-xs mt-0.5">Oval main line with station &amp; sidings</p></div>
                <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "glowPulse 2s ease-in-out infinite" }}/>
              </div>
              <div className="px-4 pb-4"><div dangerouslySetInnerHTML={{ __html: TRACK_PLAN_SVG }} className="w-full rounded-xl overflow-hidden" style={{ background: "#0a0d15" }}/></div>
              <div className="px-6 pb-5 flex flex-wrap gap-3 text-xs text-railway-muted">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-railway-accent rounded-full inline-block"/> Running rail</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-railway-accent/40 inline-block"/> Sleeper</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-railway-accent inline-block"/> Points</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-railway-accent/50 inline-block" style={{ animation: "glowPulse 3s ease-in-out infinite" }}/> Signal</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="card-animated card bg-railway-surface border border-railway-border rounded-2xl overflow-hidden">
              <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                <div><h3 className="font-heading text-lg font-bold text-railway-text">3D Model</h3><p className="text-railway-muted text-xs mt-0.5">Drag to rotate · Scroll to zoom</p></div>
                {!modelLoaded && <div className="text-railway-muted/40 text-xs animate-pulse">Loading...</div>}
              </div>
              <div className="relative mx-4 mb-4 rounded-xl overflow-hidden" style={{ background: "#0d1020", height: "340px" }}>
                {!modelLoaded && <div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="w-10 h-10 border-2 border-railway-accent/30 border-t-railway-accent rounded-full animate-spin mx-auto mb-3"/><p className="text-railway-muted/50 text-xs">Loading 3D model...</p></div></div>}
                <ModelViewer3D src={MODEL_3D_URL} onLoad={() => setModelLoaded(true)} loaded={modelLoaded} />
              </div>
              <div className="px-6 pb-5"><p className="text-railway-muted/50 text-xs">Placeholder model · Upload your Fusion 360 .glb to replace</p></div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="mt-8">
          <div className="card-animated card border-dashed border-2 border-railway-border/50 bg-railway-bg/50 rounded-2xl p-10 text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="text-5xl mb-4">✨</motion.div>
            <h3 className="font-heading text-xl font-bold text-railway-text mb-2">Gaussian Splat — Coming Soon</h3>
            <p className="text-railway-muted text-sm max-w-md mx-auto leading-relaxed">Once the layout is built, the plan is to do a photogrammetry scan and create an interactive 3D point-cloud reconstruction — walk through the finished railway in a browser, in full detail.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {["📷 Photogrammetry", "🖥️ Luma AI / SIBR", "🌐 Web Embed"].map((tag) => (
                <span key={tag} className="text-xs bg-railway-surface border border-railway-border text-railway-muted px-3 py-1.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </Reveal>
        <style jsx global>{`@keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(212,168,67,0); } 50% { box-shadow: 0 0 8px 2px rgba(212,168,67,0.4); } }`}</style>
      </div>
    </section>
  );
}

const JOURNAL = [
  { date: "April 2026", title: "Project Kicks Off", body: "The decision has been made — a brand new 00 gauge model railway at Mum's house. The plan: blend real railway locations with fictional adaptations, all skewed to fit the available baseboard. Fusion 360 for 3D modelling, RailwayController on the Mac for operational control.", emoji: "🚂" },
  { date: "April 2026", title: "Planning the Layout", body: "After measuring up the available space, the baseboard dimensions are set. A peninsula and fold-under layout to maximise scenic potential while keeping it practical. The track plan is taking shape — an oval main line with a station, fiddle yard, and operational sidings.", emoji: "📐" },
  { date: "April 2026", title: "Structures & Scenery", body: "3D models of structures are well underway in Fusion 360. The plan is to build miniature people with the resin printer — starting with family members, then populating the station, the village, and the landscapes around the railway.", emoji: "🏗️" },
  { date: "Coming soon", title: "Track Laying Begins", body: "Once the baseboard is prepared and the track plan is finalised, the physical track laying will begin. Peco Streamline track, DCC control with computer interface, and careful ballasting to get the realistic look right.", emoji: "🛤️" },
];

function BuildJournal() {
  return (
    <section id="journal" className="py-24 px-4 bg-railway-surface/20">
      <div className="max-w-3xl mx-auto">
        <Reveal><p className="text-railway-accent text-xs tracking-[0.25em] uppercase mb-3 font-medium text-center">Progress</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-railway-text text-center mb-3">Build Journal</h2>
          <p className="text-railway-muted text-base text-center mb-16">Follow the journey as the railway takes shape</p>
        </Reveal>
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: "linear-gradient(180deg, rgba(212,168,67,0.6) 0%, rgba(212,168,67,0.1) 100%)", borderRadius: "9999px" }}/>
          <div className="space-y-8">
            {JOURNAL.map((entry, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="relative flex gap-6">
                  <motion.div className="relative z-10 w-10 h-10 rounded-full bg-railway-surface border-2 border-railway-border flex items-center justify-center text-lg flex-shrink-0 shadow-lg"
                    whileHover={{ scale: 1.15, rotate: [-5, 5, 0] }} transition={{ type: "spring", stiffness: 400 }}>
                    {entry.emoji}
                  </motion.div>
                  <div className="flex-1 pt-1">
                    <div className="card-animated card bg-railway-surface border border-railway-border rounded-xl p-5">
                      <p className="text-railway-accent text-xs font-medium uppercase tracking-wider">{entry.date}</p>
                      <h3 className="font-heading text-lg font-bold text-railway-text mt-0.5">{entry.title}</h3>
                      <p className="text-railway-muted text-sm leading-relaxed mt-2">{entry.body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RendersGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | null>(null);
  return (
    <section id="renders" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <Reveal><p className="text-railway-accent text-xs tracking-[0.25em] uppercase mb-3 font-medium text-center">Visualisations</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-railway-text text-center mb-3">3D Renders</h2>
          <p className="text-railway-muted text-base text-center mb-16 max-w-xl mx-auto">Fusion 360 renders of structures, vehicles, and scenic elements</p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <motion.div className={`relative overflow-hidden rounded-xl cursor-pointer group ${item.span}`} whileHover={{ scale: 1.03 }}
                onClick={() => { setLightbox(item.src); setLightboxAlt(item.alt); }}>
                <div className="relative" style={{ aspectRatio: item.span ? "2/1" : "4/3" }}>
                  <Image src={item.src} alt={item.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-xs font-medium">{item.alt}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
        <AnimatePresence>
          {lightbox && (
            <motion.div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backdropFilter: "blur(12px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
              <motion.div className="relative max-w-5xl w-full" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()}>
                <div className="relative aspect-video rounded-xl overflow-hidden"><Image src={lightbox} alt={lightboxAlt || ""} fill className="object-contain" sizes="100vw" priority/></div>
                {lightboxAlt && <p className="text-railway-muted text-sm text-center mt-3">{lightboxAlt}</p>}
              </motion.div>
              <button className="absolute top-4 right-4 text-white/70 hover:text-white text-4xl font-light transition-colors" onClick={() => setLightbox(null)}>×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

const SOFTWARE = [
  { name: "RailwayController", desc: "macOS-native model railway control software — operates points, signals, and routes from your Mac", iconPath: "M14 3L24 8v12L14 25 4 20V8L14 3z" },
  { name: "Fusion 360", desc: "3D CAD modelling for structures, vehicles, and detailed components — the backbone of the design process", iconPath: "M3 8l4 4 8-8 4 4-8 8-4-4" },
  { name: "Swiftly S/B", desc: "Planning and design tool for track layouts, scenic elements, and operational planning", iconPath: "M7 10h14M7 14h10M7 18h12" },
];
const HARDWARE = [{ label: "Gauge", value: "00", sub: "1:148" }, { label: "Scale", value: "4mm", sub: "per foot" }, { label: "Control", value: "DCC", sub: "Digital" }, { label: "Track", value: "Peco", sub: "Streamline" }];

function SoftwareSection() {
  return (
    <section id="software" className="py-24 px-4 bg-railway-surface/20">
      <div className="max-w-6xl mx-auto">
        <Reveal><p className="text-railway-accent text-xs tracking-[0.25em] uppercase mb-3 font-medium text-center">Tools</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-railway-text text-center mb-3">Software &amp; Hardware</h2>
          <p className="text-railway-muted text-base text-center mb-16">The tools and materials powering the build</p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Reveal delay={0.1}><h3 className="font-heading text-sm font-bold text-railway-accent uppercase tracking-widest mb-4">Software</h3></Reveal>
            <div className="space-y-3">
              {SOFTWARE.map((tool, i) => (
                <Reveal key={tool.name} delay={0.1 + i * 0.08}>
                  <motion.div className="card-animated card bg-railway-surface border border-railway-border rounded-xl p-5 flex gap-4" whileHover={{ x: 4 }}>
                    <div className="w-11 h-11 rounded-xl bg-railway-accent/10 border border-railway-accent/20 flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-railway-accent">
                        <path d={tool.iconPath} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div><h4 className="font-bold text-railway-text text-sm mb-1">{tool.name}</h4><p className="text-railway-muted text-xs leading-relaxed">{tool.desc}</p></div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal delay={0.1}><h3 className="font-heading text-sm font-bold text-railway-accent uppercase tracking-widest mb-4">Hardware</h3></Reveal>
            <Reveal delay={0.15}>
              <div className="card-animated card bg-railway-surface border border-railway-border rounded-xl p-6">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {HARDWARE.map((item) => (
                    <div key={item.label} className="bg-railway-bg rounded-xl p-4 text-center border border-railway-border/50">
                      <p className="text-railway-accent font-bold text-xl">{item.value}</p>
                      <p className="text-railway-muted text-[10px] uppercase tracking-wider mt-0.5">{item.sub}</p>
                      <p className="text-railway-muted/50 text-xs mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-railway-border">
                  {[
                    { label: "Track", value: "Peco Streamline 00 · Code 100" },
                    { label: "Baseboard", value: "MDF + timber frame, peninsula design" },
                    { label: "Control", value: "DCC with computer interface" },
                    { label: "Miniatures", value: "Resin-printed figures — family first" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-start gap-3 text-xs">
                      <span className="text-railway-muted/60">{row.label}:</span>
                      <span className="text-railway-muted text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-railway-border">
      <div className="max-w-6xl mx-auto text-center">
        <div className="h-px w-full mx-auto mb-10" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.3) 20%, rgba(212,168,67,0.6) 50%, rgba(212,168,67,0.3) 80%, transparent 100%)", maxWidth: "400px" }}/>
        <p className="font-heading text-2xl font-bold text-railway-accent mb-1">Ben&apos;s Model Railway</p>
        <p className="text-railway-muted text-sm mb-6">A life-size railway in miniature · Cornwall &amp; Devon inspired · © 2026</p>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <a href="/real-railways" className="text-railway-muted hover:text-railway-accent transition-colors">Real Railways →</a>
          <a href="https://github.com/benjaminjob1/bens-model-railway" target="_blank" rel="noopener noreferrer" className="text-railway-muted hover:text-railway-accent transition-colors">GitHub →</a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  useEffect(() => {
    // Play departure whistle on first page load
    const audio = new Audio("/sounds/departure.mp3");
    audio.volume = 0.15;
    audio.volume = 0.08; audio.play().catch(() => {});
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { threshold: 0.25, rootMargin: "-100px 0px -55% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return (
    <main className="relative z-10">
      <Nav active={activeSection} />
      <Hero />
      <TheLayout />
      <BuildJournal />
      <RendersGallery />
      <SoftwareSection />
      <Footer />
    </main>
  );
}
