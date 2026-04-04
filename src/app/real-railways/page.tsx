"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const RAILWAY_DATA = {
  cornishMainLine: {
    name: "Cornish Main Line",
    tagline: "The artery of Cornwall — Plymouth to Penzance",
    era: "1859–present (original sections from 1837)",
    status: "Operational",
    color: "#d4a843",
    overview:
      "The Cornish Main Line runs the full length of Cornwall from Plymouth (in Devon) to Penzance at the western tip. It was progressively built from 1859, connecting communities that had previously relied on coastal shipping. The line follows the coastline across the River Tamar via Brunel's famous Royal Albert Bridge, then threads through the heart of Cornwall serving towns that grew up around the railway.",
    history:
      "The line we see today is the product of several railway companies that were gradually merged and standardised. The Cornwall Railway opened the Plymouth–Truro section in 1859, reaching Penzance by 1860. However, the westernmost section from Carn Brea to Angarrack predates even this — it was part of the original Hayle Railway, opened in 1837 to serve the copper mining industry. This makes some of the track bed around Hayle nearly 190 years old.",
    stations: [
      { name: "Plymouth", detail: "Devon — junction for the Tamar Valley Line", operational: true },
      { name: "Saltash", detail: "Just across the Royal Albert Bridge", operational: true },
      { name: "St Germans", detail: "Near the River Tavy estuary", operational: true },
      { name: "Liskeard", detail: "Junction for the Looe Valley line", operational: true },
      { name: "Bodmin Parkway", detail: "Near the Camel Trail", operational: true },
      { name: "Lostwithiel", detail: "Nearest station to Eden Project", operational: true },
      { name: "Par", detail: "Junction for Newquay line", operational: true },
      { name: "St Austell", detail: "Near the China Clay country", operational: true },
      { name: "Truro", detail: "Junction for Falmouth branch", operational: true },
      { name: "Redruth", detail: "Heart of the Camborne–Redruth mining district", operational: true },
      { name: "Camborne", detail: "Camborne School of Mines nearby", operational: true },
      { name: "Hayle", detail: "The local hub — copper, engineering, and the sea", operational: true },
      { name: "St Erth", detail: "Junction for St Ives Bay line", operational: true },
      { name: "Penzance", detail: "Western terminus — the end of the line", operational: true },
    ],
    notes:
      "The line is electrified as far as Paddington (London) but runs diesel-powered services in Cornwall. CrossCountry and Great Western Railway operate the route, with St Ives Bay Line services branching at St Erth.",
  },

  hayleArea: {
    name: "Hayle — Railways of the Copper Country",
    tagline: "Where Cornwall's railway story began",
    era: "1837–present",
    status: "Hayle station operational; heritage branches lost",
    color: "#d4a843",
    overview:
      "Hayle is one of the most historically significant railway locations in Britain — not because of its size, but because of its age and the industries it served. The town sits at the mouth of the River Hayle, where copper ore from the rich mines around Camborne and Redruth was concentrated before shipping. The railway arrived here before almost anywhere else in the West Country.",
    history: [
      {
        year: "1837",
        event:
          "Hayle Railway opens — one of the world's first railways built specifically for mineral traffic. A horse-drawn plateway connected Copperhouse Docks (Hayle) with Redruth, carrying copper ore to shipping. The original station was near the waterfront.",
      },
      {
        year: "1843",
        event:
          "Passenger services begin on the Hayle Railway route, making it one of the earliest passenger-carrying railways in Cornwall.",
      },
      {
        year: "1852",
        event:
          "West Cornwall Railway opens a new line through Hayle on a sweeping viaduct over Foundry Square, high above the original Hayle Railway terminus. The Angarrack Viaduct — ten arches crossing the valley — is a landmark structure still visible today.",
      },
      {
        year: "1852–1860s",
        event:
          "Hayle's three iron foundries (J.S. Fox, Harvey & Co, and the Copperhouse foundry) were major employers, manufacturing locomotives, bridges, and machinery. Harvey & Co built the hydraulic machinery for Brunel's Great Western Railway.",
      },
      {
        year: "Early 1900s",
        event:
          "Hayle's three railway companies (Hayle Railway, West Cornwall Railway, Cornwall Railway) are absorbed into the Great Western Railway. The branch lines to Hayle Wharf and the foundries are at their peak.",
      },
      {
        year: "1960s",
        event:
          "The Hayle Wharf and foundry branches close. The Royal Albert Bridge at Saltash carries the main line over the Tamar. The St Ives Bay Line remains operational from St Erth.",
      },
      {
        year: "Today",
        event:
          "Hayle station sits on the Cornish Main Line, 7 miles north-east of Penzance. The old foundry sites and harbour branch have been reclaimed by nature and industry. The Angarrack Viaduct remains a striking piece of Victorian engineering.",
      },
    ],
    locations: [
      {
        name: "Hayle Station",
        desc: "Opened 1852 on the Cornish Main Line. Currently served by Great Western Railway. The station sits on an embankment above the town.",
      },
      {
        name: "Angarrack Viaduct",
        desc: "Ten-arch railway viaduct spanning the valley near Hayle. Built 1852 by the West Cornwall Railway to bypass the steep inclines of the original Hayle Railway. One of the most impressive railway structures in Cornwall.",
      },
      {
        name: "Foundry Square",
        desc: "The original heart of Hayle's railway — the site of the first Hayle Railway terminus in 1837, later bypassed when the new line was built on the viaduct above. The wooden supports over Foundry Square were replaced with stone pillars.",
      },
      {
        name: "Copperhouse Pool & Docks",
        desc: "The tidal inlet at the mouth of the Hayle where copper ore was loaded onto ships. The original Hayle Railway ran along the bank of Copperhouse Creek. The area is now a nature reserve.",
      },
      {
        name: "Harvey & Co Foundry (Hayle)",
        desc: "One of Cornwall's largest iron foundries — built locomotives, structural ironwork for railways, and ship components. The foundry closed in the 1960s; the site has been partially redeveloped.",
      },
      {
        name: "Penponds",
        desc: "A small village near Camborne. The original Hayle Railway came down an inclined plane here. The 1852 rerouting avoided the incline with a timber viaduct 693 feet long.",
      },
    ],
    notes:
      "Hayle's railway story is deeply tied to the copper mining boom of the 19th century. When the mines began to decline, so did the town's railway traffic. The shift from heavy mineral traffic to passenger tourism shaped the modern Cornish Main Line.",
  },

  helstonBranch: {
    name: "Helston Branch",
    tagline: "England's most southerly standard gauge railway — almost to the Lizard",
    era: "1887–1964 (heritage: 2005–present)",
    status: "Mostly closed; heritage railway active",
    color: "#d4a843",
    overview:
      "The Helston Railway was an ambitious branch line that ran from Gwinear Road on the Cornish Main Line down to Helston — the most southerly town on the British mainland. Built to open up the agricultural district of south-west Cornwall, it was promoted by local businessmen and took seven years to construct due to difficult terrain and funding problems.",
    history: [
      {
        year: "1880",
        event:
          "The Helston Railway Act passed by Parliament — authorising construction of a single-track branch from Gwinear Road to Helston.",
      },
      {
        year: "1887",
        event:
          "The Helston Railway opens on 9 May 1887. The line was 8 miles long with intermediate stations at Praze, Nancegollan, Prospidnick, and Truthall Platform. Helston station was built on an embankment that would have allowed extension further south had funds permitted.",
      },
      {
        year: "1898",
        event:
          "The Helston Railway is absorbed into the Great Western Railway, becoming the Helston branch of the GWR.",
      },
      {
        year: "WWII",
        event:
          "The branch carried military traffic to and from RNAS Culdrose (Royal Naval Air Station), which opened near Helston in 1944. Nancegollan station was extended to handle the materials for building the air station.",
      },
      {
        year: "1962",
        event: "Helston Railway closes to passengers on 3 December.",
      },
      {
        year: "1964",
        event: "The line closes to freight on 4 November. Track is lifted shortly after.",
      },
      {
        year: "2002",
        event:
          "The Helston Railway Preservation Society is formed, with a vision to restore the line.",
      },
      {
        year: "2005",
        event:
          "The heritage Helston Railway begins operating on a short section between Prospidnick Halt and just short of Truthall Platform.",
      },
      {
        year: "Today",
        event:
          "The Helston Railway Preservation Society continues to restore the line and run passenger trains on summer weekends. The goal is to extend back to Helston. England’s most southerly heritage railway.",
      },
    ],
    stations: [
      {
        name: "Gwinear Road",
        desc: "Junction with the Cornish Main Line. Opened 1852. Branch line platforms closed 1962. Was a busy junction in the copper mining era.",
      },
      {
        name: "Praze",
        desc: "First intermediate station on the branch. A small village halt serving the local farming community.",
      },
      {
        name: "Nancegollan",
        desc: "Extended during WWII to handle materials for RNAS Culdrose. Was the junction for the short branch to Helston Town (later closed).",
      },
      {
        name: "Prospidnick",
        desc: "Served the farms of the Prospidnick area. The current heritage railway's upper limit of operations.",
      },
      {
        name: "Truthall Platform",
        desc: "A small platform serving the Truthall estate. The heritage railway's current terminus.",
      },
      {
        name: "Helston",
        desc: "Terminus of the branch line. Built on an embankment — intended to allow a bridge across what is now Godolphin Road to continue south, but the cost was prohibitive. Station buildings demolished after closure.",
      },
    ],
    notes:
      "The Helston Railway Preservation Society has been working for over 20 years to restore the line. Their current operational section is between Prospidnick Halt and Truthall. Building a new station at Prospidnick and eventually extending back to Helston is an ongoing project. Trains typically run on summer weekends with both vintage steam and diesel traction.",
  },

  plymouthDevon: {
    name: "Plymouth & Devon — Tamar Valley",
    tagline: "Where Devon meets Cornwall across Brunel's bridge",
    era: "1859–present (Tamar Valley Line: 1890–present)",
    status: "Operational",
    color: "#d4a843",
    overview:
      "Plymouth is the eastern gateway to the Cornish Main Line. The city sits at the confluence of the rivers Plym and Tamar, and the railways here have always been shaped by these water barriers. Brunel's famous Royal Albert Bridge (1859) crosses the Tamar at Saltash, carrying the main line into Cornwall. The surrounding Devon countryside has its own network of branch lines, some operational, some heritage.",
    locations: [
      {
        name: "Plymouth Station",
        desc: "The main station on the Cornish Main Line. Has seven through platforms. Served by CrossCountry (to the North and Scotland), Great Western Railway (to London Paddington), and the Tamar Valley Line.",
      },
      {
        name: "Royal Albert Bridge",
        desc: "Designed by Isambard Kingdom Brunel, opened 1859. Carries the Cornish Main Line across the River Tamar between Devon and Cornwall. A Grade I listed structure and one of Britain's most iconic railway bridges — 1,000ft long with 19 wrought-iron arches.",
      },
      {
        name: "Tamar Valley Line",
        desc: "An operational branch line running from Plymouth to Gunnislake via St Budeaux, Bere Alston, Calstock, and other stops. Opened 1890 as part of the Plymouth, Devonport and South Western Junction Railway. A scenic route through the Tamar Valley — one of the most picturesque branch lines in England.",
      },
      {
        name: "St Budeaux",
        desc: "A junction station where the Plymouth–Gunnislake branch diverges from the Cornish Main Line. Two platform station serving the suburb of St Budeaux.",
      },
      {
        name: "Bere Alston",
        desc: "Junction where the branch to Tavistock (now closed) diverged. The line to Gunnislake continues from here through increasingly remote Tamar Valley scenery.",
      },
      {
        name: "Gunnislake",
        desc: "The terminus of the Tamar Valley Line in Cornwall. A picturesque village in the upper Tamar Valley. The line here used to continue to Callington and Tavistock before the cuts of the 1960s.",
      },
      {
        name: "Plym Valley Railway",
        desc: "A heritage railway operating on a short section of the former South Devon main line from Marsh Mills to Plym Bridge. An industrial locomotive and a small selection of carriages are on display.",
      },
      {
        name: "Laira (Plymouth)",
        desc: "Former depot near Plymouth — historically an important facility for maintaining and stabling Great Western Railway locomotives. The site is now largely disused.",
      },
    ],
    notes:
      "The Tamar Valley Line is one of the few surviving rural branch lines in the UK — credited to its scenic value and role as a community transport link. It survived the Beeching cuts of the 1960s because the route had no parallel road connection, making it a social necessity.",
  },

  otherBranches: {
    name: "Other Notable Branches",
    tagline: "Lost and surviving lines of the South West",
    era: "Various",
    color: "#8a8fa0",
    branches: [
      {
        name: "St Ives Bay Line",
        route: "St Erth → St Ives",
        status: "Operational",
        desc: "A single-track branch from the Cornish Main Line at St Erth to the seaside town of St Ives. One of the most scenic branch lines in Britain — the train runs along the sea wall with views of St Ives Bay. Operated by Great Western Railway.",
      },
      {
        name: "Truro–Falmouth Branch",
        route: "Truro → Falmouth",
        status: "Operational",
        desc: "A short branch from Truro to Falmouth via Penmere. Still served by GWR. The line follows the River Fal into the historic port town of Falmouth.",
      },
      {
        name: "Par–Newquay Line",
        route: "Par → Newquay",
        status: "Operational",
        desc: "A scenic coastal branch from Par on the Cornish Main Line to the beach resort of Newquay. One of the most popular summer tourist routes in the region.",
      },
      {
        name: "Liskeard–Looe Valley",
        route: "Liskeard → Looe",
        status: "Operational",
        desc: "A beautiful branch line following the Looe Valley from Liskeard down to the fishing port of Looe. A single-track line with an intensive service.",
      },
      {
        name: "Bodmin & Wadebridge Railway",
        route: "Bodmin → Wadebridge",
        status: "Heritage",
        desc: "The first public railway in Cornwall, opening in 1834 to carry minerals from the Bodmin area. Now a heritage railway running on a short section between Bodmin and Wenford. The oldest standard gauge railway in the South West still operating.",
      },
      {
        name: "Penzance–St Ives (St Ives Bay Line)",
        status: "See above",
        desc: "Merged into St Ives Bay Line above.",
      },
      {
        name: "Redruth–Penzance (original Hayle Railway section)",
        route: "Camborne/Redruth → Hayle → Penzance",
        status: "Operational (as part of Cornish Main Line)",
        desc: "The oldest section of the Cornish Main Line — the original Hayle Railway route opened 1837. The track bed from Camborne to Angarrack is still in use today as part of the main line.",
      },
      {
        name: "Mithian Branch",
        route: "Chacewater → Mithian",
        status: "Closed",
        desc: "A short mineral railway serving the copper mines near Mithian, north of Truro. Closed in the early 20th century. A reminder of how many short industrial branches were built just to serve individual mines.",
      },
      {
        name: "Perranporth Branch",
        route: "Chacewater → Perranporth",
        status: "Closed (1934)",
        desc: "Served the seaside town of Perranporth and the china clay district. A classic rural branch with a picturesque coastal finale. Closed to passengers in 1934.",
      },
      {
        name: "Newquay–Perranporth (halt stations)",
        status: "Closed",
        desc: "The Newquay line had numerous small halts serving the beaches and villages of the north Cornwall coast, many of which didn't survive beyond the 1930s.",
      },
    ],
  },
};

function TimelineEntry({ year, event }: { year: string; event: string }) {
  return (
    <div className="mb-6 pl-4 border-l-2 border-railway-border relative">
      <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-railway-accent border-2 border-railway-bg" />
      <p className="text-railway-accent text-xs font-bold uppercase tracking-wider mb-1">{year}</p>
      <p className="text-railway-muted text-sm leading-relaxed">{event}</p>
    </div>
  );
}

function StationTag({ station }: { station: { name: string; detail: string; operational: boolean } }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${station.operational ? "bg-green-400" : "bg-railway-muted"}`} />
      <div>
        <p className="text-railway-text text-sm font-medium">{station.name}</p>
        <p className="text-railway-muted text-xs">{station.detail}</p>
      </div>
    </div>
  );
}

function LocationCard({ loc }: { loc: { name: string; desc: string } }) {
  return (
    <div className="bg-railway-bg rounded-lg p-4 border border-railway-border">
      <h4 className="text-railway-text font-bold text-sm mb-2">{loc.name}</h4>
      <p className="text-railway-muted text-xs leading-relaxed">{loc.desc}</p>
    </div>
  );
}

function SectionHero({ title, tagline, era, status, color }: { title: string; tagline: string; era: string; status: string; color: string }) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-railway-text">{title}</h2>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {status}
        </span>
      </div>
      <p className="text-railway-accent text-sm italic mb-1">{tagline}</p>
      <p className="text-railway-muted text-xs">Era: {era}</p>
    </div>
  );
}

// Nav component (duplicated here for this page)
function Nav({ active }: { active: string }) {
  const navClickRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    navClickRef.current = new Audio("/sounds/nav-click.mp3");
    navClickRef.current.volume = 0.3;
    // Page load bell
    const bell = new Audio("/sounds/page-load.mp3");
    bell.volume = 0.2;
    bell.play().catch(() => {});
  }, []);
  const links = [
    { id: "cornish-main", label: "Cornish Main Line", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> },
    { id: "hayle", label: "Hayle Area", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> },
    { id: "helston", label: "Helston Branch", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> },
    { id: "plymouth", label: "Plymouth & Devon", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> },
    { id: "other", label: "Other Branches", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-railway-bg/90 backdrop-blur-lg border-b border-railway-border/30 py-4 mb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3">
          {/* Home button */}
          <a
            href="/"
            onClick={() => { if (navClickRef.current) { navClickRef.current.currentTime = 0; navClickRef.current.play().catch(() => {}); } }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-railway-surface border border-railway-border/60 text-railway-text hover:text-railway-accent hover:border-railway-accent/40 hover:bg-railway-accent/5 transition-all duration-200 text-sm font-semibold shadow-lg shadow-black/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Home</span>
          </a>
          
          {/* Divider */}
          <div className="w-px h-8 bg-railway-border/50 mx-1"/>
          
          {/* Section links */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-1">
            {links.map((l) => {
              const isActive = active === l.id;
              return (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={() => { if (navClickRef.current) { navClickRef.current.currentTime = 0; navClickRef.current.play().catch(() => {}); } }}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                    isActive
                      ? "bg-railway-accent text-railway-bg shadow-lg shadow-railway-accent/25"
                      : "text-railway-muted hover:text-railway-accent hover:bg-railway-accent/8"
                  }`}
                >
                  <span>{l.label}</span>
                  {isActive && <span className="opacity-70">{l.icon}</span>}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RealRailways() {
  const [activeSection, setActiveSection] = useState("cornish-main");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.2, rootMargin: "-100px 0px -60% 0px" }
    );

    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-railway-bg">
      {/* Page header */}
      <div className="bg-railway-surface border-b border-railway-border py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-railway-accent text-sm tracking-widest uppercase mb-3 font-medium">
            Inspiration
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-railway-text mb-4">
            Real Railways of Cornwall & Devon
          </h1>
          <p className="text-railway-muted max-w-2xl leading-relaxed">
            The layout takes inspiration from real railways of the South West — the busy Cornish Main Line, the historic Hayle Railway, the preserved Helston Branch, and the scenic Tamar Valley. This page documents the real railways that inspired the design.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <Nav active={activeSection} />

        {/* ── Cornish Main Line ── */}
        <section id="cornish-main" className="mb-20 scroll-mt-36">
          <SectionHero
            title="Cornish Main Line"
            tagline={RAILWAY_DATA.cornishMainLine.tagline}
            era={RAILWAY_DATA.cornishMainLine.era}
            status={RAILWAY_DATA.cornishMainLine.status}
            color={RAILWAY_DATA.cornishMainLine.color}
          />
          <p className="text-railway-muted text-sm leading-relaxed mb-6">
            {RAILWAY_DATA.cornishMainLine.overview}
          </p>
          <p className="text-railway-muted text-sm leading-relaxed mb-8">
            {RAILWAY_DATA.cornishMainLine.history}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="font-bold text-railway-text mb-3 text-sm uppercase tracking-wide">
                Stations on the Cornish Main Line
              </h3>
              <div className="divide-y divide-railway-border">
                {RAILWAY_DATA.cornishMainLine.stations.map((s) => (
                  <StationTag key={s.name} station={s} />
                ))}
              </div>
            </div>
            <div>
              <div className="card mb-4">
                <h3 className="font-bold text-railway-text mb-3 text-sm uppercase tracking-wide">
                  Royal Albert Bridge
                </h3>
                <p className="text-railway-muted text-sm leading-relaxed">
                  Designed by Isambard Kingdom Brunel and opened in 1859, the Royal Albert Bridge
                  crosses the River Tamar between Devon (St Budeaux) and Cornwall (Saltash). It
                  remains one of Britain's most iconic railway structures — 1,000ft long with
                  19 wrought-iron arches, carrying the Cornish Main Line into Cornwall.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Opened", value: "1859" },
                    { label: "Length", value: "1,000ft" },
                    { label: "Arches", value: "19" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-railway-bg rounded-lg p-2">
                      <p className="text-railway-accent font-bold text-sm">{stat.value}</p>
                      <p className="text-railway-muted text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-bold text-railway-text mb-3 text-sm uppercase tracking-wide">
                  Quick Facts
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Distance", value: "~225 miles (London Paddington to Penzance)" },
                    { label: "Operator", value: "Great Western Railway + CrossCountry" },
                    { label: "Oldest section", value: "Hayle Railway, 1837 (still in use!)" },
                    { label: "Tallest structure", value: "St Budeaux Viaduct" },
                    { label: "Notable feature", value: "Electrified to Plymouth; diesel beyond" },
                  ].map((f) => (
                    <div key={f.label} className="flex gap-2 text-xs">
                      <span className="text-railway-accent font-medium min-w-[90px]">{f.label}:</span>
                      <span className="text-railway-muted">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-railway-muted text-xs italic">{RAILWAY_DATA.cornishMainLine.notes}</p>
        </section>

        {/* ── Hayle Area ── */}
        <section id="hayle" className="mb-20 scroll-mt-36">
          <SectionHero
            title="Hayle — Railways of the Copper Country"
            tagline={RAILWAY_DATA.hayleArea.tagline}
            era={RAILWAY_DATA.hayleArea.era}
            status={RAILWAY_DATA.hayleArea.status}
            color={RAILWAY_DATA.hayleArea.color}
          />
          <p className="text-railway-muted text-sm leading-relaxed mb-8">
            {RAILWAY_DATA.hayleArea.overview}
          </p>

          <div className="card mb-6">
            <h3 className="font-bold text-railway-text mb-4 text-sm uppercase tracking-wide">
              History of the Hayle Railway
            </h3>
            {RAILWAY_DATA.hayleArea.history.map((h) => (
              <TimelineEntry key={h.year} year={h.year} event={h.event} />
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-railway-text mb-4 text-sm uppercase tracking-wide">
              Key Locations Around Hayle
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {RAILWAY_DATA.hayleArea.locations.map((loc) => (
                <LocationCard key={loc.name} loc={loc} />
              ))}
            </div>
          </div>
          <p className="text-railway-muted text-xs italic">{RAILWAY_DATA.hayleArea.notes}</p>
        </section>

        {/* ── Helston Branch ── */}
        <section id="helston" className="mb-20 scroll-mt-36">
          <SectionHero
            title="Helston Branch"
            tagline={RAILWAY_DATA.helstonBranch.tagline}
            era={RAILWAY_DATA.helstonBranch.era}
            status={RAILWAY_DATA.helstonBranch.status}
            color={RAILWAY_DATA.helstonBranch.color}
          />
          <p className="text-railway-muted text-sm leading-relaxed mb-8">
            {RAILWAY_DATA.helstonBranch.overview}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="font-bold text-railway-text mb-4 text-sm uppercase tracking-wide">
                History
              </h3>
              {RAILWAY_DATA.helstonBranch.history.map((h) => (
                <TimelineEntry key={h.year} year={h.year} event={h.event} />
              ))}
            </div>
            <div>
              <div className="card mb-4">
                <h3 className="font-bold text-railway-text mb-3 text-sm uppercase tracking-wide">
                  Stations on the Helston Branch
                </h3>
                <div className="divide-y divide-railway-border">
                  {RAILWAY_DATA.helstonBranch.stations.map((s) => (
                    <div key={s.name} className="py-2">
                      <p className="text-railway-text text-sm font-medium">{s.name}</p>
                      <p className="text-railway-muted text-xs">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card bg-railway-bg border-railway-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🚂</span>
                  <h3 className="font-bold text-railway-accent text-sm">Helston Railway Preservation Society</h3>
                </div>
                <p className="text-railway-muted text-xs leading-relaxed">
                  Working since 2002 to restore the old Helston Branch line. Currently operating
                  between Prospidnick Halt and Truthall Platform. A long-term project to extend
                  back to Helston is ongoing. Their goal: rebuild what was lost and bring trains
                  back to England's most southerly town.
                </p>
                <a
                  href="https://www.helstonrailway.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-railway-accent text-xs hover:underline"
                >
                  helstonrailway.co.uk →
                </a>
              </div>
            </div>
          </div>
          <p className="text-railway-muted text-xs italic">{RAILWAY_DATA.helstonBranch.notes}</p>
        </section>

        {/* ── Plymouth & Devon ── */}
        <section id="plymouth" className="mb-20 scroll-mt-36">
          <SectionHero
            title="Plymouth & Devon — Tamar Valley"
            tagline={RAILWAY_DATA.plymouthDevon.tagline}
            era={RAILWAY_DATA.plymouthDevon.era}
            status={RAILWAY_DATA.plymouthDevon.status}
            color={RAILWAY_DATA.plymouthDevon.color}
          />
          <p className="text-railway-muted text-sm leading-relaxed mb-8">
            {RAILWAY_DATA.plymouthDevon.overview}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {RAILWAY_DATA.plymouthDevon.locations.map((loc) => (
              <LocationCard key={loc.name} loc={loc} />
            ))}
          </div>
          <p className="text-railway-muted text-xs italic">{RAILWAY_DATA.plymouthDevon.notes}</p>
        </section>

        {/* ── Other Branches ── */}
        <section id="other" className="mb-20 scroll-mt-36">
          <SectionHero
            title="Other Notable Branches"
            tagline={RAILWAY_DATA.otherBranches.tagline}
            era="Various — 1834–present"
            status="Mixed"
            color={RAILWAY_DATA.otherBranches.color}
          />
          <div className="space-y-4">
            {RAILWAY_DATA.otherBranches.branches.map((b) => (
              <div key={b.name} className="card flex gap-4">
                <div className="mt-1">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1 ${
                      b.status === "Operational"
                        ? "bg-green-400"
                        : b.status === "Heritage"
                        ? "bg-yellow-400"
                        : "bg-railway-muted"
                    }`}
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-railway-text text-sm font-bold">{b.name}</h4>
                    {b.route && (
                      <span className="text-railway-muted text-xs font-mono">{b.route}</span>
                    )}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        b.status === "Operational"
                          ? "bg-green-400/20 text-green-400"
                          : b.status === "Heritage"
                          ? "bg-yellow-400/20 text-yellow-400"
                          : "bg-railway-border text-railway-muted"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-railway-muted text-xs leading-relaxed">{b.desc}                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-railway-border text-center">
          <p className="text-railway-muted text-xs">
            Sources: Wikipedia, Cornwall Railway Society, Helston Railway Preservation Society,
            Devon & Cornwall Rail Partnership, Hayle Town Council.
          </p>
          <p className="text-railway-muted text-xs mt-1">
            All historical facts are documented from public records. Railway layout inspired by real locations.
          </p>
        </footer>
      </div>
    </main>
  );
}
