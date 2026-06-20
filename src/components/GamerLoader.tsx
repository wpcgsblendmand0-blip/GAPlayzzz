/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Youtube, Trophy, Flame, Play, Eye } from "lucide-react";

export default function GamerLoader() {
  return (
    <div id="loading-screen" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white select-none overflow-hidden touch-none">
      {/* Abstract Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />

      {/* Pulsing Game Logo Emblem */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-6 flex items-center justify-center"
      >
        <div className="absolute -inset-4 rounded-full bg-red-650/20 blur-xl animate-pulse" />
        <div className="relative p-5 rounded-2xl bg-zinc-900 border border-orange-500/30 flex items-center justify-center shadow-2xl shadow-orange-950/40">
          <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
          <Flame className="absolute -top-1 -right-1 w-6 h-6 text-red-500" />
        </div>
      </motion.div>

      {/* Main Branding Header with Cyberpunk typography */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-3xl font-bold font-sans tracking-widest text-orange-500 uppercase"
      >
        GAPlayzzz
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.4 }}
        className="text-xs font-mono mt-1 text-zinc-400 tracking-wider uppercase"
      >
        Initializing High-Performance Portal...
      </motion.p>

      {/* Skeleton YouTube-style Loader Body */}
      <div className="mt-12 w-full max-w-sm px-4 space-y-4">
        {/* Skeleton Card 1 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse flex items-center justify-center">
              <Youtube className="w-5 h-5 text-zinc-600" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-zinc-800 rounded animate-pulse" />
              <div className="h-2 w-1/2 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="relative aspect-video rounded-lg bg-zinc-800/80 animate-pulse overflow-hidden flex items-center justify-center">
            <Play className="w-10 h-10 text-zinc-700 opacity-60" />
            <div className="absolute right-2 bottom-2 h-4 w-10 bg-zinc-900/80 rounded animate-pulse" />
          </div>
        </div>

        {/* Skeleton Feed 2 */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl flex items-center space-x-4">
          <div className="w-20 aspect-video rounded-md bg-zinc-800 animate-pulse shrink-0 flex items-center justify-center">
            <Play className="w-5 h-5 text-zinc-700 opacity-50" />
          </div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-zinc-800 rounded-md w-full animate-pulse" />
            <div className="h-2 bg-zinc-800 rounded-md w-2/3 animate-pulse" />
            <div className="flex space-x-2 pt-1">
              <div className="h-2 bg-zinc-800 rounded-md w-8 animate-pulse" />
              <div className="h-2 bg-zinc-800 rounded-md w-12 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Connection Status Indicator */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center space-x-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block" />
        <span>SECURE CACHE LINK ACTIVE</span>
      </div>
    </div>
  );
}
