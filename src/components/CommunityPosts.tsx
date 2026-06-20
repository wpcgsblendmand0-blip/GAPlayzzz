/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { MessageSquare, Heart, Share2, CornerDownRight, ShieldCheck, Flame, Cpu, Check } from "lucide-react";
import { Post } from "../types";

interface CommunityPostsProps {
  posts: Post[];
  onLikePost: (postId: string) => void;
  likedPosts: Record<string, boolean>;
}

export default function CommunityPosts({
  posts,
  onLikePost,
  likedPosts,
}: CommunityPostsProps) {
  // Simple nested interactive subscriber comment simulator
  const [activeComments, setActiveComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [postCommentsSim, setPostCommentsSim] = useState<Record<string, { author: string; text: string; date: string }[]>>({
    "p-1": [
      { author: "ProGamer_618", text: "Love the custom GTA updates! Stunt mapping setup is absolutely stellar.", date: "16 hours ago" },
      { author: "Nox_Shadow", text: "Vote for GTA V stunts tonight! Need custom drag racing loops.", date: "12 hours ago" }
    ],
    "p-2": [
      { author: "ApexClutcher", text: "Warmed up and ready! My wheels are completely locked down. Let's go!", date: "3 days ago" }
    ],
    "p-3": [
      { author: "CubeCrafter", text: "This stunt loop is legendary! Keep up the authentic content.", date: "5 days ago" }
    ]
  });

  const toggleComments = (postId: string) => {
    setActiveComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const comment = newCommentText[postId]?.trim();
    if (!comment) return;

    const freshComment = {
      author: "Site Visitor",
      text: comment,
      date: "Just now"
    };

    setPostCommentsSim((prev) => ({
      ...prev,
      [postId]: [freshComment, ...(prev[postId] || [])]
    }));

    setNewCommentText((prev) => ({ ...prev, [postId]: "" }));
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5">
        <h4 className="text-xs font-mono font-black tracking-widest text-zinc-400 uppercase flex items-center">
          <Cpu className="w-3.5 h-3.5 text-orange-500 mr-1.5 shrink-0" />
          Channel community posts
        </h4>
        <span className="text-[9px] font-mono text-zinc-500 uppercase">Interactive Bulletin Board</span>
      </div>

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3 relative overflow-hidden"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full border border-orange-500/30 bg-zinc-950 flex items-center justify-center">
                    <span className="text-xs font-black text-orange-500">GAP</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-zinc-100">GAPlayzzz</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 leading-none block">
                      {post.relativeTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Body Content */}
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                  {post.title}
                </h5>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Post Action Metrics bar */}
              <div className="flex items-center space-x-4 pt-3 border-t border-zinc-850 text-[10px] font-mono">
                {/* Liking trigger */}
                <button
                  id={`like-post-${post.id}`}
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center space-x-1.5 transition-colors ${
                    likedPosts[post.id]
                      ? "text-red-500 font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedPosts[post.id] ? "fill-current" : ""}`} />
                  <span>{(post.likes + (likedPosts[post.id] ? 1 : 0)).toLocaleString()}</span>
                </button>

                {/* View/Hide Comments toggle */}
                <button
                  id={`toggle-comments-${post.id}`}
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center space-x-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>
                    {(post.commentsCount + ((postCommentsSim[post.id]?.length || 0) - (post.id === "p-1" ? 2 : post.id === "p-2" ? 1 : 1))).toLocaleString()} Comments
                  </span>
                </button>

                {/* Share with squad */}
                <button
                  id={`share-post-${post.id}`}
                  className="flex items-center space-x-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(`GAPlayzzz Official update: ${post.title}`);
                    setCopiedPostId(post.id);
                    setTimeout(() => setCopiedPostId(null), 2500);
                  }}
                >
                  {copiedPostId === post.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500 animate-pulse shrink-0" />
                      <span className="text-green-400 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Nested Interactive Comments Simulator accordion */}
              {activeComments[post.id] && (
                <div className="mt-3 bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-3">
                  {/* Submit input */}
                  <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentText[post.id] || ""}
                      onChange={(e) =>
                        setNewCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Contribute to the channel discussions..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-xs px-3 py-1.5 rounded-md text-white focus:outline-none focus:border-orange-500 font-sans"
                      maxLength={100}
                      required
                    />
                    <button
                      id={`btn-add-comment-${post.id}`}
                      type="submit"
                      className="p-1 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-[10px] font-mono uppercase font-bold"
                    >
                      Reply
                    </button>
                  </form>

                  {/* Simulated list */}
                  <div className="space-y-2 mt-1 max-h-40 overflow-y-auto pr-1">
                    {(postCommentsSim[post.id] || []).map((cmt, idx) => (
                      <div key={idx} className="flex gap-2 text-[11px] font-sans">
                        <CornerDownRight className="w-3 h-3 text-zinc-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-1.5">
                            <strong className="text-zinc-300 font-mono text-[10px]">
                              {cmt.author}
                            </strong>
                            <span className="text-[8px] text-zinc-650 font-mono">
                              {cmt.date}
                            </span>
                          </div>
                          <p className="text-zinc-400 font-sans mt-0.5 leading-normal">
                            {cmt.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-850">
            <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest block font-bold">
              No community updates available.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
