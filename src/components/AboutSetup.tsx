/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Monitor, Gamepad2, Twitch, Award, Settings, CheckCircle2 } from "lucide-react";

export default function AboutSetup() {
  // Pristine actual configuration, can be filled in by user as requested
  const specs = [
    { category: "Processor CPU", value: "Intel Core i9-14900K", icon: Monitor },
    { category: "Graphics GPU", value: "NVIDIA GeForce RTX 5070 Ti", icon: Settings },
    { category: "Memory RAM", value: "32GB DDR5 RAM", icon: Settings },
    { category: "Visual Stage", value: "DUAL Monitors Setup", icon: Monitor },
    { category: "Tactical Mouse", value: "Razer Cobra Mouse", icon: Gamepad2 },
    { category: "Keyboard Choice", value: "HyperX Alloy Origins Keyboard", icon: Gamepad2 },
  ];

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Bio text block */}
      <section className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-sm font-bold font-mono tracking-widest text-orange-500 uppercase flex items-center">
          <Award className="w-4 h-4 text-orange-500 mr-1.5 shrink-0" />
          Channel Biography & Bio
        </h3>
        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
          Welcome to the official hub of <strong className="text-orange-500 font-bold">GA Playzzz</strong>! I am a passionate creator dedicated to bringing high-fidelity Grand Theft Auto content, stunt challenges, and gameplay recordings to my viewers.
        </p>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Through this custom precision platform, we keep our community synchronized in real time. Configure state logs, track authentic YouTube video listings, and review official streaming gear parameters with absolute transparency.
        </p>
      </section>

      {/* Hardware Spec sheets section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5 flex-wrap gap-2">
          <h4 className="text-xs font-mono font-black tracking-widest text-zinc-400 uppercase">
            Official Streaming Gear & PC specs
          </h4>
          <span className="text-[9px] font-mono text-zinc-500">Authentic Configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {specs.map((sp, idx) => {
            const Icon = sp.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl hover:border-orange-500/40 transition-colors"
              >
                <div className="p-2 bg-zinc-950 border border-zinc-850 text-orange-500 rounded-lg shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase text-zinc-500 block leading-none">
                    {sp.category}
                  </span>
                  <span className="text-xs font-bold font-sans text-zinc-300 mt-1 block">
                    {sp.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
