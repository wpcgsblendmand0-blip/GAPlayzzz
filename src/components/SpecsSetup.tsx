/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Cpu, 
  Tv, 
  Layers, 
  Monitor, 
  MousePointer, 
  Keyboard, 
  Mail, 
  ArrowUpRight, 
  ShieldCheck, 
  Flame, 
  Zap, 
  Sparkles 
} from "lucide-react";

export default function SpecsSetup() {
  const specs = [
    {
      category: "Processor CPU",
      name: "Intel Core i9-14900K",
      desc: "24 Cores / 32 Threads up to 6.0 GHz, the ultimate powerhouse for elite gaming performance and smooth ultra-smooth recording encoding.",
      color: "from-blue-600 to-cyan-500",
      icon: Cpu,
      priceSearchUrl: "https://www.google.com/search?q=Intel+Core+i9-14900K+price",
    },
    {
      category: "Graphics GPU",
      name: "NVIDIA GeForce RTX 5070 Ti",
      desc: "Next-gen architecture with high-speed DLSS ray reconstruction and massive AI capabilities for flawless high-framerate 4K stunt captures.",
      color: "from-green-600 to-emerald-500",
      icon: Tv,
      priceSearchUrl: "https://www.google.com/search?q=NVIDIA+GeForce+RTX+5070+Ti+price",
    },
    {
      category: "Memory RAM",
      name: "32GB DDR5 RAM",
      desc: "Dual-channel optimized extreme speed memory, giving latency-free gaming, instant clip rendering, and robust multi-app system operations.",
      color: "from-purple-600 to-indigo-500",
      icon: Layers,
      priceSearchUrl: "https://www.google.com/search?q=32GB+DDR5+RAM+price",
    },
    {
      category: "Visual Display",
      name: "DUAL Monitors Setup",
      desc: "High-refresh display setup for flawless widescreen immersion on Main and continuous livestream control flow diagnostics on Secondary.",
      color: "from-pink-600 to-rose-500",
      icon: Monitor,
      priceSearchUrl: "https://www.google.com/search?q=Dual+high+refresh+rate+Gaming+monitors+price",
    },
    {
      category: "Tactical Mouse",
      name: "Razer Cobra Mouse",
      desc: "Ultra-precise light optical triggers and custom ergonomics optimized for instant micro-adjustments in fast stunt challenges.",
      color: "from-teal-600 to-cyan-500",
      icon: MousePointer,
      priceSearchUrl: "https://www.google.com/search?q=Razer+Cobra+gaming+mouse+price",
    },
    {
      category: "Gaming Keyboard",
      name: "HyperX Alloy Origins Keyboard",
      desc: "Full-size gaming keyboard with pristine red linear tactile mechanical switches and durable aircraft-grade aluminum construct body.",
      color: "from-red-600 to-orange-500",
      icon: Keyboard,
      priceSearchUrl: "https://www.google.com/search?q=HyperX+Alloy+Origins+Full+Size+keyboard+price",
    },
  ];

  return (
    <div className="space-y-8 select-none animate-fadeIn max-w-5xl mx-auto py-4">
      {/* Immersive Rig Header */}
      <section className="relative p-6 md:p-8 bg-zinc-900/40 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-48 h-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[8.5px] font-mono tracking-widest bg-orange-600/20 text-orange-400 border border-orange-500/20 rounded-full font-black uppercase">
                ACTIVE RIG
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="text-xl md:text-2xl font-black font-sans tracking-wide text-zinc-100 uppercase">
              Streaming & Gaming Hardware Setup
            </h2>
            <p className="text-xs text-zinc-455 max-w-2xl leading-relaxed">
              Official workstation parameters used by <strong className="text-orange-500 font-extrabold">GA Playzzz</strong> to stream, edit, and export high-octane GTA content to the channel. Built for performance and reliability.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end space-y-1 font-mono text-[10px] text-zinc-500 uppercase tracking-widest shrink-0 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-3 md:pt-0 md:pl-4">
            <span className="flex items-center gap-1.5 font-bold text-orange-500">
               <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0" /> ULTRA SETTINGS
            </span>
            <span>Refreshed: Est. 2026</span>
          </div>
        </div>
      </section>

      {/* Grid containing high-fidelity items */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <a
              key={idx}
              href={item.priceSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-5 bg-zinc-900/20 hover:bg-zinc-900/35 border border-zinc-850 hover:border-orange-500/40 rounded-2xl transition-all duration-300 shadow overflow-hidden flex flex-col justify-between cursor-pointer"
            >
              {/* Highlight Hover glow effect */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-[0.02] group-hover:opacity-[0.07] rounded-full blur-2xl transition duration-500`} />

              <div className="space-y-3.5">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 bg-gradient-to-br ${item.color} bg-opacity-10 text-white rounded-xl shadow-lg border border-white/5`}>
                    <Icon className="w-4 h-4 text-zinc-100" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-zinc-500 block tracking-wider leading-none font-bold">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-black font-sans text-white mt-1 group-hover:text-orange-400 transition-colors uppercase tracking-tight">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans font-medium">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest border-t border-zinc-900/50 mt-3.5">
                <span>Verified Hardware</span>
                <span className="text-orange-500/85 group-hover:text-orange-500 transition-all font-extrabold flex items-center gap-[3px] group-hover:scale-105">
                  <Sparkles className="w-2.5 h-2.5 shrink-0 text-orange-500" /> Operational
                </span>
              </div>
            </a>
          );
        })}
      </section>
    </div>
  );
}
