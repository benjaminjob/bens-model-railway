"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Placeholder 3D model (free train locomotive .glb from Sketchfab CDN)
const MODEL_3D_URL =
  "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb";

const TRACK_PLAN_SVG = `
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <!-- Baseboard outline -->
  <rect x="10" y="10" width="780" height="380" fill="none" stroke="#2a2d38" stroke-width="3" rx="8"/>
  
  <!-- Main oval track -->
  <path d="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200" 
        fill="none" stroke="#4a4a5a" stroke-width="24" stroke-linecap="round"/>
  <path d="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200" 
        fill="none" stroke="#3a3a4a" stroke-width="18" stroke-linecap="round"/>
  <path d="M 150 200 Q 150 80 400 80 Q 650 80 650 200 Q 650 320 400 320 Q 150 320 150 200" 
        fill="none" stroke="#d4a843" stroke-width="4" stroke-dasharray="20,10" stroke-linecap="round"/>
  
  <!-- Inner siding (top) -->
  <path d="M 250 80 L 250 50 Q 250 40 260 40 L 340 40 Q 350 40 350 50 L 350 80" 
        fill="none" stroke="#3a3a4a" stroke-width="14" stroke-linecap="round"/>
  <path d="M 250 80 L 250 50 Q 250 40 260 40 L 340 40 Q 350 40 350 50 L 350 80" 
        fill="none" stroke="#d4a843" stroke-width="2" stroke-dasharray="8,8"/>
  
  <!-- Platform (bottom) -->
  <rect x="480" y="295" width="140" height="35" rx="4" fill="#1a1d26" stroke="#d4a843" stroke-width="2"/>
  <text x="550" y="318" text-anchor="middle" fill="#8a8fa0" font-size="11" font-family="sans-serif">PLATFORM</text>
  
  <!-- Points / turnout indicators -->
  <circle cx="250" cy="80" r="6" fill="#d4a843"/>
  <circle cx="350" cy="80" r="6" fill="#d4a843"/>
  <circle cx="480" cy="200" r="6" fill="#d4a843"/>
  
  <!-- Sidings (right) -->
  <path d="M 650 160 L 720 160 Q 730 160 730 170 L 730 230 Q 730 240 720 240 L 650 240" 
        fill="none" stroke="#3a3a4a" stroke-width="12" stroke-linecap="round"/>
  <path d="M 650 160 L 720 160 Q 730 160 730 170 L 730 230 Q 730 240 720 240 L 650 240" 
        fill="none" stroke="#d4a843" stroke-width="2"/>
  
  <!-- Station building (centre) -->
  <rect x="360" y="165" width="80" height="70" rx="4" fill="#1a1d26" stroke="#d4a843" stroke-width="2"/>
  <text x="400" y="197" text-anchor="middle" fill="#d4a843" font-size="10" font-family="sans-serif" font-weight="bold">STATION</text>
  <text x="400" y="212" text-anchor="middle" fill="#8a8fa0" font-size="8" font-family="sans-serif">BEN'S RLY</text>
  <rect x="372" y="220" width="14" height="15" rx="2" fill="#2a2d38" stroke="#8a8fa0"/>
  <rect x="394" y="220" width="14" height="15" rx="2" fill="#2a2d38" stroke="#8a8fa0"/>
  <polygon points="360,165 400,145 440,165" fill="#1a1d26" stroke="#d4a843" stroke-width="2"/>
  
  <!-- Track labels -->
  <text x="60" y="200" text-anchor="middle" fill="#8a8fa0" font-size="10" font-family="monospace" transform="rotate(-90,60,200)">MAIN LINE</text>
  <text x="750" y="200" text-anchor="middle" fill="#8a8fa0" font-size="9" font-family="monospace" transform="rotate(90,750,200)">SIDING</text>
</svg>
`;

const GALLERY_PLACEHOLDERS = [
  {
    src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
    alt: "Model locomotive on tracks",
  },
  {
    src: "https://images.unsplash.com/photo-1527684651001-731c474bbb5a?w=600&q=80",
    alt: "Railway station building",
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    alt: "Detailed railway scenery",
  },
];

const JOURNAL_ENTRIES = [
  {
    date: "April 2026",
    title: "Project Kicks Off",
    body:
      "The decision has been made — a brand new 00 gauge model railway at Mum's house. The plan: blend real railway locations with fictional adaptations, all skewed to fit the available baseboard. Fusion 360 for 3D modelling, RailwayController on the Mac for operational control.",
  },
  {
    date: "April 2026",
    title: "Choosing the Location",
    body:
      "After measuring up the available space at Mum's, we've settled on the baseboard dimensions. A combination of peninsula and fold-under layout to maximise scenic potential while keeping it practical.",
  },
  {
    date: "Coming soon",
    title: "Planning the Track Plan",
    body:
      "The track plan is taking shape — an oval main line with a station, fiddle yard, and a couple of sidings for operational interest. The 2D plan will be uploaded here once it's finalised.",
  },
];

const SOFTWARE_TOOLS = [
  {
    name: "RailwayController",
    desc: "macOS-native model railway control software for operating points and signals",
    icon: "💻",
  },
  {
    name: "Fusion 360",
    desc: "3D modelling for structures, vehicles, and detailed components",
    icon: "🔧",
  },
  {
    name: "Swiftly S/B",
    desc: "Planning and design tool for track layouts and scenic elements",
    icon: "📐",
  },
];

const HARDWARE_ITEMS = [
  { label: "Gauge", value: "00 (1:148)" },
  { label: "Scale", value: "4mm : 1ft" },
  { label: "Control", value: "DCC" },
  { label: "Track", value: "Peco Streamline" },
];

// Nav component
function Nav({ active }: { active: string }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "layout", label: "The Layout" },
    { id: "journal", label: "Build Journal" },
    { id: "renders", label: "3D Renders" },
    { id: "real-railways", label: "Real Railways" },
    { id: "software", label: "Software" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-railway-bg/90 backdrop-blur-md border-b border-railway-border">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-heading text-xl font-bold text-railway-accent">
          Ben&apos;s Model Railway
        </span>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`nav-link ${active === l.id ? "active" : ""}`}
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="https://github.com/benjaminjob1/bens-model-railway"
          target="_blank"
          rel="noopener noreferrer"
          className="text-railway-muted hover:text-railway-accent transition-colors text-sm"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  );
}

// Hero section
function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1020] via-[#0f1117] to-[#0f1117] hero-grain" />

      {/* Decorative tracks */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-railway-border to-transparent" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="text-railway-accent text-sm tracking-widest uppercase mb-4 font-medium">
          00 Gauge · 1:148 Scale
        </p>
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-railway-text mb-6 leading-tight">
          Ben&apos;s Model Railway
        </h1>
        <p className="text-railway-muted text-lg md:text-xl mb-4">
          A life-size railway in miniature
        </p>
        <p className="text-railway-muted text-base max-w-xl mx-auto mb-10 leading-relaxed">
          A detailed 00 gauge layout at Mum&apos;s house — featuring real-life-inspired
          locations, skewed and scaled to fit the baseboard. Built with precision,
          imagination, and a love for railways.
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {HARDWARE_ITEMS.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-railway-accent font-bold text-lg">{item.value}</p>
              <p className="text-railway-muted text-xs uppercase tracking-wide">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <a href="#layout" className="btn-accent inline-block">
          See the Layout ↓
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-5 h-8 border-2 border-railway-border rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-railway-accent rounded-full" />
        </div>
      </div>
    </section>
  );
}

// Track plan viewer
function TrackPlan() {
  return (
    <div className="card">
      <h3 className="font-heading text-xl font-bold mb-4 text-railway-text">
        2D Track Plan
      </h3>
      <p className="text-railway-muted text-sm mb-4">
        The current track plan — oval main line with station, platform, and sidings.
        Final layout TBC.
      </p>
      <div className="bg-railway-bg rounded-lg p-4 border border-railway-border">
        <div
          dangerouslySetInnerHTML={{ __html: TRACK_PLAN_SVG }}
          className="w-full"
        />
      </div>
      <p className="text-railway-muted text-xs mt-3 text-center">
        🟡 Gold line = running rail · Dark grey = sleepers/base
      </p>
    </div>
  );
}

// 3D Model Viewer
function ModelViewer() {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  return (
    <div className="card">
      <h3 className="font-heading text-xl font-bold mb-4 text-railway-text">
        3D Model Viewer
      </h3>
      <p className="text-railway-muted text-sm mb-4">
        Interactive 3D model viewer — drag to rotate, scroll to zoom. This will
        showcase Fusion 360 renders of structures and vehicles.
      </p>
      <div className="relative bg-railway-bg rounded-xl overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-railway-muted text-sm animate-pulse">
              Loading 3D model...
            </div>
          </div>
        )}
        {/* @ts-ignore */}
        <model-viewer
          src={MODEL_3D_URL}
          alt="3D model viewer"
          auto-rotate
          camera-controls
          shadow-intensity="1"
          environment-image="neutral"
          loading="eager"
          onLoad={() => setLoaded(true)}
          className={`w-full h-[400px] md:h-[500px] ${loaded ? "" : "opacity-0"}`}
        />
      </div>
      <p className="text-railway-muted text-xs mt-3 text-center">
        Showing placeholder · Upload your Fusion 360 .glb/.gltf to replace
      </p>
    </div>
  );
}

// Gaussian Splat section
function GaussianSplat() {
  return (
    <div className="card border-dashed border-2 border-railway-border bg-railway-bg/50">
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🪄</div>
        <h3 className="font-heading text-xl font-bold mb-3 text-railway-text">
          Gaussian Splat — Coming Soon
        </h3>
        <p className="text-railway-muted text-sm max-w-md mx-auto leading-relaxed">
          Once the layout is complete, the goal is to do a photogrammetry scan and
          create an interactive Gaussian splat — a point-cloud 3D reconstruction
          you can walk through in a browser. The ultimate way to show off the
          finished railway.
        </p>
        <div className="mt-4 inline-flex gap-2 text-xs text-railway-muted">
          <span className="bg-railway-surface px-2 py-1 rounded border border-railway-border">
            📷 Photogrammetry scan
          </span>
          <span className="bg-railway-surface px-2 py-1 rounded border border-railway-border">
            🖥️ Luma AI / SIBR viewer
          </span>
          <span className="bg-railway-surface px-2 py-1 rounded border border-railway-border">
            🌐 Web embed
          </span>
        </div>
      </div>
    </div>
  );
}

// The Layout section
function TheLayout() {
  return (
    <section id="layout" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-railway-text mb-2">The Layout</h2>
        <p className="text-railway-muted text-base mb-8">
          From track plan to 3D model — explore every angle of the railway
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <TrackPlan />
          <ModelViewer />
        </div>
        <div className="mt-8">
          <GaussianSplat />
        </div>
      </div>
    </section>
  );
}

// Build Journal
function BuildJournal() {
  return (
    <section id="journal" className="py-20 px-4 bg-railway-surface/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-railway-text mb-2">Build Journal</h2>
        <p className="text-railway-muted text-base mb-8">
          Follow the journey — progress updates as the railway takes shape
        </p>

        <div className="relative border-l-2 border-railway-border pl-8 space-y-10">
          {JOURNAL_ENTRIES.map((entry, i) => (
            <div key={i} className="relative">
              <div className="timeline-dot" />
              <p className="text-railway-accent text-xs font-medium uppercase tracking-wider mb-1">
                {entry.date}
              </p>
              <h3 className="font-heading text-xl font-bold text-railway-text mb-2">
                {entry.title}
              </h3>
              <p className="text-railway-muted text-sm leading-relaxed">
                {entry.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3D Renders gallery
function RendersGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="renders" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-railway-text mb-2">3D Renders</h2>
        <p className="text-railway-muted text-base mb-8">
          Fusion 360 renders of structures, vehicles, and scenic elements
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_PLACEHOLDERS.map((img, i) => (
            <div
              key={i}
              className="gallery-item relative aspect-[4/3]"
              onClick={() => setLightbox(img.src)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-xs">{img.alt}</span>
              </div>
            </div>
          ))}
        </div>

        {GALLERY_PLACEHOLDERS.length === 0 && (
          <div className="text-center py-16 text-railway-muted">
            <p className="text-4xl mb-4">🎨</p>
            <p>Renders will appear here as the build progresses</p>
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <div className="relative max-w-4xl w-full aspect-video">
              <Image
                src={lightbox}
                alt="Gallery full view"
                fill
                className="object-contain rounded-lg"
                sizes="100vw"
              />
            </div>
            <button className="absolute top-4 right-4 text-white text-3xl">
              ×
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// Software & Hardware
function SoftwareSection() {
  return (
    <section id="software" className="py-20 px-4 bg-railway-surface/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-railway-text mb-2">Software & Hardware</h2>
        <p className="text-railway-muted text-base mb-8">
          The tools and materials powering the build
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Software */}
          <div>
            <h3 className="font-heading text-lg font-bold text-railway-accent mb-4 uppercase tracking-wide text-sm">
              Software
            </h3>
            <div className="space-y-4">
              {SOFTWARE_TOOLS.map((tool) => (
                <div key={tool.name} className="card flex gap-4">
                  <span className="text-3xl">{tool.icon}</span>
                  <div>
                    <h4 className="font-bold text-railway-text">{tool.name}</h4>
                    <p className="text-railway-muted text-sm">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hardware */}
          <div>
            <h3 className="font-heading text-lg font-bold text-railway-accent mb-4 uppercase tracking-wide text-sm">
              Hardware
            </h3>
            <div className="card">
              <div className="grid grid-cols-2 gap-4">
                {HARDWARE_ITEMS.map((item) => (
                  <div key={item.label} className="text-center p-4 bg-railway-bg rounded-lg">
                    <p className="text-railway-accent font-bold text-lg">
                      {item.value}
                    </p>
                    <p className="text-railway-muted text-xs uppercase tracking-wide mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-railway-border">
                <p className="text-railway-muted text-sm">
                  <span className="text-railway-text font-medium">Track:</span> Peco
                  Streamline 00 · Code 100
                </p>
                <p className="text-railway-muted text-sm mt-1">
                  <span className="text-railway-text font-medium">Baseboard:</span>{" "}
                  MDF + timber frame, peninsula/fold-under design
                </p>
                <p className="text-railway-muted text-sm mt-1">
                  <span className="text-railway-text font-medium">Control:</span> DCC
                  with computer interface
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-10 px-4 border-t border-railway-border">
      <div className="max-w-6xl mx-auto text-center">
        <p className="font-heading text-xl font-bold text-railway-accent mb-2">
          Ben&apos;s Model Railway
        </p>
        <p className="text-railway-muted text-sm mb-4">
          A life-size railway in miniature · © 2026
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <a
            href="/real-railways"
            className="text-railway-muted hover:text-railway-accent text-sm transition-colors"
          >
            Real Railways (Inspiration) →
          </a>
          <a
            href="https://github.com/benjaminjob1/bens-model-railway"
            target="_blank"
            rel="noopener noreferrer"
            className="text-railway-muted hover:text-railway-accent text-sm transition-colors"
          >
            GitHub →
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main>
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
