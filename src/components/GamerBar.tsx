import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Home, Library, Info, Cpu, Flame, Check, ShieldCheck } from "lucide-react";

interface GamerBarProps {
  activeTab: "home" | "library" | "about" | "specs" | "admin";
  setActiveTab: (tab: "home" | "library" | "about" | "specs" | "admin") => void;
  onFollow: () => Promise<void>;
  hasFollowed: boolean;
  isAdminUnlocked: boolean;
  followerCount: number;
}

function formatFollowers(num: number): string {
  if (num <= 0) return "0";
  if (num < 1000) return `${num}`;
  if (num < 1000000) {
    const val = num / 1000;
    return val % 1 === 0 ? `${val.toFixed(0)}k` : `${val.toFixed(1).replace(/\.0$/, "")}k`;
  }
  const val = num / 1000000;
  return val % 1 === 0 ? `${val.toFixed(0)}M` : `${val.toFixed(1).replace(/\.0$/, "")}M`;
}

export default function GamerBar({
  activeTab,
  setActiveTab,
  onFollow,
  hasFollowed,
  isAdminUnlocked,
  followerCount,
}: GamerBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<{ id: string; left: number; width: number }[]>([]);
  const [dragHoverTab, setDragHoverTab] = useState<string | null>(null);
  const [isHoldingBar, setIsHoldingBar] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1250);
    return () => clearTimeout(timer);
  }, []);

  const navItems: { id: "home" | "library" | "about" | "specs" | "admin"; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "Library", icon: Library },
    { id: "about", label: "About", icon: Info },
    { id: "specs", label: "Setup", icon: Cpu },
  ];

  if (isAdminUnlocked) {
    if (!navItems.find((n) => n.id === "admin")) {
      navItems.push({ id: "admin", label: "Admin", icon: ShieldCheck });
    }
  }

  // Measure tab button horizontal offsets inside container
  useEffect(() => {
    if (!containerRef.current) return;
    const calculatePositions = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttons = containerRef.current.querySelectorAll(".nav-tab-btn");
      const tmp: { id: string; left: number; width: number }[] = [];
      buttons.forEach((btn) => {
        const id = btn.getAttribute("data-tab-id") || "";
        const rect = btn.getBoundingClientRect();
        tmp.push({
          id,
          left: rect.left - containerRect.left,
          width: rect.width,
        });
      });
      setPositions(tmp);
    };

    // Perform clean measurement passes immediately and on subsequent frames to settle layout shifts
    calculatePositions();
    const frame0 = setTimeout(calculatePositions, 0);
    const frame1 = setTimeout(calculatePositions, 50);
    const frame2 = setTimeout(calculatePositions, 150);
    const frame3 = setTimeout(calculatePositions, 350);
    const frame4 = setTimeout(calculatePositions, 800);

    // ResizeObserver instantly updates bounds on orientation changes/resizes
    const resizeObserver = new ResizeObserver(() => {
      calculatePositions();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener("resize", calculatePositions);
    window.addEventListener("orientationchange", calculatePositions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculatePositions);
      window.removeEventListener("orientationchange", calculatePositions);
      clearTimeout(frame0);
      clearTimeout(frame1);
      clearTimeout(frame2);
      clearTimeout(frame3);
      clearTimeout(frame4);
    };
  }, [navItems.length, activeTab]);

  // Handle Drag / Slide coordinate calculation with HTML5 Pointer API
  const handlePointerDrag = (clientX: number) => {
    if (!containerRef.current || positions.length === 0) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - containerRect.left;

    let closestId = activeTab;
    let minDistance = Infinity;
    positions.forEach((pos) => {
      const center = pos.left + pos.width / 2;
      const distance = Math.abs(relativeX - center);
      if (distance < minDistance) {
        minDistance = distance;
        closestId = pos.id as any;
      }
    });

    if (closestId !== dragHoverTab) {
      setDragHoverTab(closestId);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsHoldingBar(true);
    handlePointerDrag(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isHoldingBar) {
      handlePointerDrag(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isHoldingBar) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsHoldingBar(false);
      if (dragHoverTab) {
        setActiveTab(dragHoverTab as any);
      }
      setDragHoverTab(null);
    }
  };

  const activePos = positions.find((p) => p.id === (dragHoverTab || activeTab)) || positions[0];

  return (
    <>
      {/* ================= COMPACT PRO BRAND HEADER ================= */}
      <header className="w-full bg-zinc-950/85 select-none py-4 px-6 md:px-8 border-b border-zinc-900/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Element - GAPlayzzz Logo & Name (Classic simple orange accents) */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-orange-600 rounded-full blur-sm opacity-40 animate-pulse" />
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-orange-500/20 bg-zinc-950 flex items-center justify-center shadow-lg">
                <span className="text-[11px] font-black text-orange-500 uppercase tracking-tighter">
                  GAP
                </span>
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <h1 className="text-xl font-bold font-sans tracking-widest text-orange-500 uppercase leading-none">
                  GAPlayzzz
                </h1>
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping shrink-0" />
                <span className="text-[8px] tracking-wider text-orange-450 bg-orange-955 border border-orange-900/50 px-1.5 py-[1px] rounded uppercase font-black">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 font-mono mt-0.5 tracking-wider uppercase">
                Official Copyrighted Channel Portal
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span>Verified Creator Identity</span>
            <span>•</span>
            <span className="text-orange-500 font-bold">EST. 2026</span>
          </div>

        </div>
      </header>


      {/* ================= DOCK NAVIGATION DOCK (Bottom center) =================
          Fully professional custom-draggability satisfying the precise requested iOS real-feel:
          - NO colourful gradients filling inside, NO harsh corners. Pure, custom empty outliner indicator.
          - Perfect rounded-full iOS capsule docking with fluid liquid glass borders.
      */}
      <motion.div 
        initial={{ opacity: 0, y: 70, x: "-50%" }}
        animate={isVisible ? { opacity: 1, y: 0, x: "-50%" } : { opacity: 0, y: 70, x: "-50%" }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="fixed bottom-6 left-1/2 z-50 w-[96vw] max-w-2xl select-none transition-transform duration-300"
        style={{ left: "50%" }}
      >
        
        {/* Dock outer container with stylish zoomed glassmorphic transparency and circular corners */}
        <div 
          className="relative bg-zinc-950/45 backdrop-blur-3xl rounded-full border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] p-1.5 hover:scale-[1.02] active:scale-[1.015] transition-all duration-300"
        >
          {/* Subtle Liquid Back Glow */}
          <div className="absolute -inset-1 -z-10 bg-orange-500/5 rounded-full blur-xl opacity-90 pointer-events-none" />

          <div className="flex items-center justify-between gap-3 w-full pl-3 pr-1.5 py-0.5">
            
            {/* Nav Items slider area */}
            <div 
              ref={containerRef}
              className="relative flex items-center flex-1 justify-around py-0.5 gap-2 touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              
              {/* Dynamic Sliding Capsule - Containing the inside orange, preventing shadow leak */}
              <motion.div
                animate={
                  activePos 
                    ? { 
                        left: activePos.left, 
                        width: activePos.width,
                        scale: isHoldingBar ? 0.96 : 1,
                        opacity: 1
                      } 
                    : { opacity: 0 }
                }
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="absolute top-1 bottom-1 border border-orange-500/50 bg-gradient-to-r from-orange-600/20 to-amber-500/15 rounded-full shadow-[inset_0_1px_10px_rgba(234,88,12,0.4)] pointer-events-none z-10 flex items-center justify-center p-1"
                style={{ height: "calc(100% - 8px)" }}
              >
                {/* Micro outline indicator bar pulsing accent */}
                <div className="absolute bottom-1 w-5 h-[1.5px] bg-orange-500 rounded-full animate-pulse" />
              </motion.div>

              {/* Render Tab buttons - clean centered icons & texts */}
              {navItems.map((item) => {
                const isTargetActive = (dragHoverTab || activeTab) === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-tab-id={item.id}
                    onClick={() => {
                      if (!isHoldingBar) {
                        setActiveTab(item.id);
                      }
                    }}
                    className="nav-tab-btn relative px-1 py-1 flex flex-col items-center justify-center text-center rounded-full transition-all duration-300 outline-none select-none cursor-pointer group z-20 flex-1 h-11 md:h-12 bg-transparent hover:bg-white/[0.04]"
                  >
                    {/* Icon automatically gets colored inside and professionally orange when active */}
                    <Icon className={`w-4 h-4 md:w-4.5 md:h-4.5 shrink-0 transition-all duration-300 ${
                      isTargetActive 
                        ? "text-orange-500 fill-orange-500/40 scale-110 drop-shadow-[0_2px_8px_rgba(249,115,22,0.3)]" 
                        : "text-zinc-500 hover:text-zinc-350 fill-none"
                    }`} />
                    
                    <span className={`text-[7.5px] md:text-[8.5px] font-sans uppercase font-black tracking-wider text-center transition-all duration-300 leading-none ${
                      isTargetActive 
                        ? "text-orange-500 drop-shadow-[0_2px_8px_rgba(249,115,22,0.2)] font-black" 
                        : "text-zinc-400 group-hover:text-zinc-200"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* Vertical glass separator */}
            <div className="w-[1.5px] h-4 bg-zinc-800/60 shrink-0 self-center" />

            {/* Sleek follow button designed fully as a curved cohesive capsule matching home */}
            <button
              id="follow-bottom-anchor-action"
              onClick={onFollow}
              className={`px-3.5 py-1.5 md:px-5 flex flex-row items-center justify-center space-x-1 rounded-full border transition-all duration-350 active:scale-95 text-[8.5px] md:text-[9.5px] font-sans cursor-pointer font-black shrink-0 select-none h-10 md:h-11 uppercase ${
                hasFollowed
                  ? "bg-zinc-950/80 border-orange-500/30 text-orange-500 shadow-[inset_0_1px_8px_rgba(234,88,12,0.15)]"
                  : "bg-gradient-to-r from-orange-600 to-amber-500 border-transparent hover:from-orange-500 hover:to-orange-400 text-white font-bold shadow-md shadow-orange-600/10"
              }`}
            >
              {hasFollowed ? (
                <>
                  <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="leading-none text-orange-500 tracking-tight font-black">
                    Followed
                  </span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
                  <span className="leading-none text-white tracking-tight font-black">
                    Follow
                  </span>
                </>
              )}
            </button>

          </div>

        </div>
      </motion.div>
    </>
  );
}
