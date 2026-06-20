/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Eye, Clock, Sparkles, X, Heart, MessageSquare, Share2 } from "lucide-react";
import { Video, checkIfVideoIsShort } from "../types";

interface SpotlightPlayerProps {
  videos: Video[];
  onLikeVideo: (vidId: string) => void;
  likedVideos: Record<string, boolean>;
  onNavigateToLibrary?: () => void;
  onShareVideo?: (video: Video) => void;
}

export default function SpotlightPlayer({
  videos,
  onLikeVideo,
  likedVideos,
  onNavigateToLibrary,
  onShareVideo,
}: SpotlightPlayerProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);

  // Spotlight video selection (the first YouTube video from the shuffled combined pool)
  const spotlightVideo = videos[0];

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* 1. Main Immersive Spotlight Theatre Display */}
      {spotlightVideo ? (
        <section className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-850 shadow-2xl">
          {/* Vibrant warm-cool gradient glow backing */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-red-650/15 via-orange-550/10 to-yellow-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-gradient-to-tr from-green-600/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row">
            {/* Spotlight Media Player Container */}
            <div className="relative w-full lg:w-[65%] aspect-video bg-black flex items-center justify-center group overflow-hidden">
              {activePlayId === spotlightVideo.id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${spotlightVideo.id}?autoplay=1&rel=0`}
                  title={spotlightVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <>
                  <img
                    referrerPolicy="no-referrer"
                    src={spotlightVideo.thumbnail}
                    alt={spotlightVideo.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  {/* Subtle Dark Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  {/* Play HUD Overlay Emblem */}
                  <button
                    id={`play-spotlight-${spotlightVideo.id}`}
                    onClick={() => setActivePlayId(spotlightVideo.id)}
                    className="absolute p-5 rounded-full bg-orange-600 hover:bg-orange-550 text-white shadow-xl hover:scale-110 duration-300 cursor-pointer flex items-center justify-center transform group-hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
                  >
                    <Play className="w-6 h-6 fill-current text-white ml-0.5" />
                  </button>

                  {/* Duration Badge */}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-mono bg-zinc-950/90 text-zinc-300 border border-zinc-800 rounded">
                    {spotlightVideo.duration}
                  </span>

                  {/* Feature Status badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[8.5px] font-mono tracking-widest bg-orange-600 text-white border border-orange-500/20 rounded-full uppercase flex items-center space-x-1 font-black shadow-lg">
                    <Sparkles className="w-3 h-3 text-orange-200 shrink-0" />
                    <span className="text-[8.5px] font-black text-white">LATEST</span>
                  </span>
                </>
              )}
            </div>

            {/* Spotlight Metadatas Panel */}
            <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-black text-white tracking-wide leading-tight group-hover:text-orange-500 transition-colors uppercase">
                  {spotlightVideo.title}
                </h3>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-4">
                  {spotlightVideo.description}
                </p>
              </div>

              {/* Action metadata metrics */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-850 text-zinc-500 text-xs font-mono">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-zinc-400 mr-0.5 shrink-0" />
                    <span className="text-zinc-300 font-bold">{spotlightVideo.viewCount} views</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {onShareVideo && (
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      onClick={() => onShareVideo(spotlightVideo)}
                      className="p-2.5 rounded-lg border bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 border-zinc-800 hover:text-white flex items-center justify-center cursor-pointer"
                      title="Share Video"
                    >
                      <Share2 className="w-3.5 h-3.5 text-orange-500" />
                    </motion.button>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.82 }}
                    id={`like-main-${spotlightVideo.id}`}
                    onClick={() => onLikeVideo(spotlightVideo.id)}
                    className={`p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      likedVideos[spotlightVideo.id]
                        ? "bg-red-950/20 text-red-500 border-red-900/40 shadow-sm shadow-red-500/5"
                        : "bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 mr-1.5 transition-transform ${likedVideos[spotlightVideo.id] ? "fill-current scale-110 text-red-500" : ""}`} />
                    <span className="text-[10px] font-mono leading-none font-bold">
                      {likedVideos[spotlightVideo.id] ? "Liked" : "Like"}
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-850">
          <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest block">No latest video available.</span>
        </div>
      )}

      {/* Inline Unified Full Video Theatre Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setActiveVideo(null)} />

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {/* Outer Header Bezels */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950">
                <span className="px-2 py-0.5 text-[8.5px] font-mono text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 font-black uppercase tracking-widest">
                  {activeVideo.isShort ? "YouTube Shorts Portal" : "GAPlayzzz Theatre"}
                </span>
                <button
                  id="close-theatre-modal"
                  onClick={() => setActiveVideo(null)}
                  className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-805 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Aspect Ratio Screen */}
              <div className={`relative bg-black w-full ${activeVideo.isShort ? "max-w-xs mx-auto aspect-[9/16]" : "aspect-video"}`}>
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Detail Info panel */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-900 space-y-2">
                <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                  {activeVideo.title}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans line-clamp-2">
                  {activeVideo.description || "Official gameplay capture broadcast by GAPlayzzz."}
                </p>

                 <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-[10px] font-mono text-zinc-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-zinc-400 mr-0.5 shrink-0" />
                      <span className="text-zinc-350 font-bold">{activeVideo.viewCount} views</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onShareVideo && (
                      <button
                        onClick={() => onShareVideo(activeVideo)}
                        className="p-1.5 px-3 rounded-lg border border-zinc-850 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition text-[9px] font-mono font-bold flex items-center space-x-1"
                        title="Share Video"
                      >
                        <Share2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Share</span>
                      </button>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      id={`like-theatre-${activeVideo.id}`}
                      onClick={() => onLikeVideo(activeVideo.id)}
                      className={`px-3 py-1.5 rounded-lg border font-mono flex items-center space-x-1.5 transition-all text-[9px] cursor-pointer ${
                        likedVideos[activeVideo.id]
                          ? "bg-red-950/20 text-red-500 border-red-900/40"
                          : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedVideos[activeVideo.id] ? "fill-current text-red-500" : ""}`} />
                      <span className="font-bold">{likedVideos[activeVideo.id] ? "Liked" : "Like"}</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main List of long-form videos underneath */}
      <VideoGridSection
        videos={videos}
        onSelectVideo={(v) => setActiveVideo(v)}
        onLikeVideo={onLikeVideo}
        likedVideos={likedVideos}
        onNavigateToLibrary={onNavigateToLibrary}
        onShareVideo={onShareVideo}
      />
    </div>
  );
}

// 4. Latest Sub Grid of Videos
interface VideoGridProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onLikeVideo: (vidId: string) => void;
  likedVideos: Record<string, boolean>;
  onNavigateToLibrary?: () => void;
  onShareVideo?: (video: Video) => void;
}function VideoGridSection({
  videos,
  onSelectVideo,
  onLikeVideo,
  likedVideos,
  onNavigateToLibrary,
  onShareVideo,
}: VideoGridProps) {
  // Index 0 in the combined homepage videos state is always the Latest Highlight Spotlight.
  // The remaining standard videos cycle under it, with a beautiful fade and shuffle feel.
  const standardVideos = videos.slice(1);

  return (
    <section className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <h4 className="text-xs font-mono font-black tracking-widest text-zinc-400 uppercase">
          YouTube Videos
        </h4>
        <div className="flex items-center space-x-1.5 text-[9px] font-mono text-zinc-500 uppercase">
          <span>Primary Library Grid in which it shows the six videos from that type of pool</span>
        </div>
      </div>

      {standardVideos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {standardVideos.map((vid) => (
                <motion.div
                  key={vid.id}
                  layout
                  initial={{ opacity: 0, filter: "blur(6px)", y: 12 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(6px)", y: -12 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="group relative flex flex-col bg-zinc-900/30 rounded-xl border border-zinc-850 overflow-hidden hover:border-orange-500/40 transition-colors"
                >
                  {/* Video Thumbnail anchor */}
                  <div className="relative aspect-video bg-black shrink-0 overflow-hidden">
                    <img
                      referrerPolicy="no-referrer"
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-[1.02] duration-350 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/0" />

                    {/* Quick Play Trigger Overlay button on hover */}
                    <div
                      id={`play-hover-${vid.id}`}
                      onClick={() => onSelectVideo(vid)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/40 cursor-pointer"
                    >
                      <div className="p-3 bg-orange-600 rounded-full text-white shadow-lg transition-transform hover:scale-110">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Video Duration */}
                    <span className="absolute bottom-2 right-2 text-[9px] font-mono text-zinc-350 bg-zinc-950/85 border border-zinc-900/60 px-1.5 py-0.5 rounded">
                      {vid.duration}
                    </span>
                  </div>

                  {/* Video Meta details block */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h5
                        id={`vid-card-title-${vid.id}`}
                        onClick={() => onSelectVideo(vid)}
                        className="text-xs font-bold font-sans text-zinc-100 line-clamp-2 hover:text-orange-500 transition-colors cursor-pointer uppercase tracking-tight"
                      >
                        {vid.title}
                      </h5>
                      <p className="text-[10px] text-zinc-450 font-sans mt-1 line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    {/* Analytics row */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-zinc-850/80 text-[9px] font-mono text-zinc-550">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-zinc-400 mr-0.5 shrink-0" />
                        <span className="text-zinc-350 font-bold">{vid.viewCount} views</span>
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {onShareVideo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShareVideo(vid);
                            }}
                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
                            title="Share Video"
                          >
                            <Share2 className="w-3 h-3 text-orange-500" />
                          </button>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          id={`like-card-${vid.id}`}
                          onClick={() => onLikeVideo(vid.id)}
                          className={`p-1 px-2 rounded-md border flex items-center space-x-1 cursor-pointer ${
                            likedVideos[vid.id]
                              ? "bg-red-950/10 text-red-500 border-red-900/30"
                              : "bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border-zinc-800 hover:text-white"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedVideos[vid.id] ? "fill-current text-red-500" : ""}`} />
                          <span className="text-[8px] font-bold">
                            {likedVideos[vid.id] ? "Liked" : "Like"}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* SLA/CTA action block */}
          {onNavigateToLibrary && (
            <div className="pt-6 text-center select-none">
              <button
                id="btn-goto-library"
                onClick={onNavigateToLibrary}
                className="relative overflow-hidden px-8 py-3 rounded-xl text-xs font-bold font-sans tracking-widest text-white shadow-xl bg-orange-600 hover:bg-orange-500 active:scale-95 transition-all duration-250 select-none uppercase cursor-pointer"
              >
                Browse YouTube Library
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-850 space-y-1">
          <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest block font-bold">No videos found as you do.</span>
          <span className="text-zinc-600 font-sans text-xs block">Pull latest data via subscriber dashboard. Users are using my website.</span>
        </div>
      )}
    </section>
  );
}
