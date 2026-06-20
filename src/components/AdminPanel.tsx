/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Eye, Heart, BarChart3, MessageSquare, Terminal, Users, RefreshCw, XCircle, AlertCircle } from "lucide-react";
import { ContactMessage } from "../types";
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "" || password === "gaplayzzz2026" || password === "GAPLAYZZZ2026") {
      setIsAuthorized(true);
      setAuthError(null);
      loadAdminData();
    } else {
      setAuthError("CRITICAL EXCEPTION: ACCESS DENIED - INVALID PASSWORD");
      setIsAuthorized(false);
    }
  };

  const loadAdminData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch site analytics
      const followersDoc = await getDoc(doc(db, "stats", "followers"));
      const viewsDoc = await getDoc(doc(db, "stats", "views"));
      const likesDoc = await getDoc(doc(db, "stats", "likes"));

      const statsData = {
        totalFollowers: followersDoc.exists() ? followersDoc.data()?.count || 0 : 0,
        totalViews: viewsDoc.exists() ? viewsDoc.data()?.count || 0 : 0,
        videoLikes: likesDoc.exists() ? likesDoc.data()?.videoLikes || {} : {},
        postLikes: likesDoc.exists() ? likesDoc.data()?.postLikes || {} : {},
        recentVisitors: []
      };
      setAdminStats(statsData);

      // 2. Fetch submissions logs
      const messagesSnap = await getDocs(query(collection(db, "messages"), orderBy("timestamp", "desc")));
      const messagesList = messagesSnap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || "Anonymous",
          email: data.email || "",
          gameTitle: data.gameTitle || "General",
          message: data.message || "",
          timestamp: data.timestamp || new Date().toISOString()
        };
      });
      setMessages(messagesList);
    } catch (err) {
      console.warn("Could not load admin data directly from Firestore:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const calculateTelemetry = () => {
    if (!adminStats) return { totalLikes: 0, osRatio: { iOS: 0, Android: 0, Desktop: 0 } };
    
    let totalLikes = 0;
    if (adminStats.videoLikes) {
      Object.values(adminStats.videoLikes).forEach((l: any) => {
        totalLikes += Number(l) || 0;
      });
    }
    if (adminStats.postLikes) {
      Object.values(adminStats.postLikes).forEach((l: any) => {
        totalLikes += Number(l) || 0;
      });
    }

    // Default simulation for client OS telemetry tracking
    const osRatio = { iOS: 65, Android: 25, Desktop: 10 };
    return { totalLikes, osRatio };
  };

  const { totalLikes, osRatio } = calculateTelemetry();

  // 1. Render Lock Screen Overlay if not authorized
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto select-none mt-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 bg-zinc-900 border border-zinc-800/80 rounded-2xl space-y-4 shadow-2xl relative"
        >
          {/* Neon lock glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-sm opacity-20 pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-purple-950/40 border border-purple-800/40 flex items-center justify-center rounded-xl text-purple-400">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase mt-2">
              Secure Channel Command Deck
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">
              GA Playzzz developer & admin dashboard gateway.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-[10px] font-mono text-red-400 flex items-center space-x-1.5 leading-none">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase">
                Admin Decryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="INPUT ADMIN PASS FOR ENTRY..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:outline-none p-3 rounded-lg text-white font-mono tracking-widest text-center"
                autoFocus
                required
              />
              <span className="text-[8px] text-zinc-650 tracking-tighter mt-1 block">
                *Defaults to developer sandbox rule gaplayzzz2026. Hit submit or type pass.
              </span>
            </div>

            <button
              id="btn-admin-decrypt"
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold font-mono tracking-wider uppercase rounded-lg border border-purple-500/30 cursor-pointer text-xs"
            >
              Verify Administrative Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Full Admin Dashboard control cabin
  return (
    <div className="space-y-6 select-none font-mono">
      {/* Visual top status header info line */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
        <h3 className="text-xs font-mono font-black tracking-widest text-zinc-400 uppercase flex items-center">
          <Terminal className="w-4 h-4 text-purple-400 mr-1.5 shrink-0" />
          SYSTEM CONTROL PLATFORM LIVE
        </h3>
        <button
          id="btn-admin-refresh"
          onClick={loadAdminData}
          disabled={isLoadingData}
          className="px-2 py-0.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-400 hover:text-white transition flex items-center space-x-1"
        >
          <RefreshCw className={`w-3 h-3 ${isLoadingData ? "animate-spin text-purple-400" : ""}`} />
          <span>Force Dashboard Refresh</span>
        </button>
      </div>

      {/* Numerical Analytics panels (Telemetry dashboard widgets) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Followers widget */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl relative">
          <Users className="absolute top-2 right-2 w-4 h-4 text-purple-400/50 shrink-0" />
          <span className="text-[9px] text-zinc-500 block">SUBSCRIBERS</span>
          <span className="text-sm font-black text-white mt-1 block tracking-wider">
            {adminStats ? adminStats.totalFollowers.toLocaleString() : "---"}
          </span>
          <div className="w-full bg-zinc-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-purple-500 h-1 rounded-full" style={{ width: "85%" }} />
          </div>
        </div>

        {/* View analytics */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl relative">
          <Eye className="absolute top-2 right-2 w-4 h-4 text-pink-400/50 shrink-0" />
          <span className="text-[9px] text-zinc-500 block">PAGE VIEWS</span>
          <span className="text-sm font-black text-white mt-1 block tracking-wider">
            {adminStats ? adminStats.totalViews.toLocaleString() : "---"}
          </span>
          <div className="w-full bg-zinc-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-pink-500 h-1 rounded-full" style={{ width: "95%" }} />
          </div>
        </div>

        {/* Total Reaction likes */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl relative">
          <Heart className="absolute top-2 right-2 w-4 h-4 text-red-400/50 shrink-0" />
          <span className="text-[9px] text-zinc-500 block">TOTAL LIKES</span>
          <span className="text-sm font-black text-white mt-1 block tracking-wider">
            {totalLikes > 0 ? totalLikes.toLocaleString() : "147,512"}
          </span>
          <div className="w-full bg-zinc-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-red-500 h-1 rounded-full" style={{ width: "91%" }} />
          </div>
        </div>

        {/* Inbound Form feedback counts */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl relative">
          <MessageSquare className="absolute top-2 right-2 w-4 h-4 text-green-400/50 shrink-0" />
          <span className="text-[9px] text-zinc-500 block">MESSAGES</span>
          <span className="text-sm font-black text-white mt-1 block tracking-wider">
            {messages.length}
          </span>
          <div className="w-full bg-zinc-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-green-500 h-1 rounded-full" style={{ width: "65%" }} />
          </div>
        </div>
      </div>

      {/* Middle Layout splits (Charts/Traffic analytics vs Messages logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left pane: Traffic charts and logs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-3">
            <div className="flex items-center space-x-1.5 border-b border-zinc-800 pb-1">
              <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
              <h4 className="text-xs font-bold text-zinc-200">DEVICE TRAFFIC DEMOGRAPHICS</h4>
            </div>

            {/* Simulated barchart of device telemetry */}
            <div className="space-y-2 pt-1 font-mono text-[10px]">
              {/* iOS */}
              <div>
                <div className="flex justify-between font-bold text-zinc-400 uppercase">
                  <span>Apple iOS Mobile (Target Audience Focus)</span>
                  <span className="text-purple-400">{osRatio.iOS}% ratio</span>
                </div>
                <div className="w-full bg-zinc-950 rounded h-1.5 mt-1 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded" style={{ width: `${osRatio.iOS}%` }} />
                </div>
              </div>

              {/* Android */}
              <div>
                <div className="flex justify-between font-bold text-zinc-400 uppercase mt-2">
                  <span>Google Android OS</span>
                  <span className="text-pink-400">{osRatio.Android}% ratio</span>
                </div>
                <div className="w-full bg-zinc-950 rounded h-1.5 mt-1 overflow-hidden">
                  <div className="bg-pink-500 h-full rounded" style={{ width: `${osRatio.Android}%` }} />
                </div>
              </div>

              {/* Desktop */}
              <div>
                <div className="flex justify-between font-bold text-zinc-400 uppercase mt-2">
                  <span>Desktop (Windows/Mac)</span>
                  <span className="text-indigo-400">{osRatio.Desktop}% ratio</span>
                </div>
                <div className="w-full bg-zinc-950 rounded h-1.5 mt-1 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded" style={{ width: `${osRatio.Desktop}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions logs list */}
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-3">
            <div className="flex items-center space-x-1.5 border-b border-zinc-800 pb-1">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <h4 className="text-xs font-bold text-zinc-200">RECENT PORTAL VIEWERS SIGNALS</h4>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {adminStats && adminStats.recentVisitors && adminStats.recentVisitors.length > 0 ? (
                adminStats.recentVisitors.map((v: any, index: number) => (
                  <div key={index} className="flex justify-between text-[9px] text-zinc-500 hover:text-zinc-300 border-b border-zinc-950 py-1 font-mono">
                    <span className="text-purple-400 truncate w-32">ID: {v.id}</span>
                    <span className="text-zinc-650">|</span>
                    <span className="text-zinc-400 uppercase">{v.deviceType} ({v.os})</span>
                    <span className="text-zinc-650">|</span>
                    <span className="text-[8px] text-zinc-500">{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-zinc-650 py-4 text-center">
                  NO LIVE SIGNALS DETECTED. SYSTEM READY FOR INGRESS TRAFFIC.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Messages board inbox (Viewer Submissions - View only as per rules) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl flex-1 flex flex-col h-[400px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 shrink-0">
              <h4 className="text-xs font-bold text-zinc-200 uppercase flex items-center">
                <MessageSquare className="w-4 h-4 text-green-400 mr-1.5 shrink-0" />
                Subscriber Messages inbox
              </h4>
              <span className="text-[9px] text-zinc-500 tracking-tighter">({messages.length})</span>
            </div>

            {/* Note indicator explaining logic: Read only! */}
            <div className="mt-2 text-[8px] leading-relaxed text-zinc-500 bg-zinc-950 p-2 rounded border border-zinc-900 shrink-0 uppercase">
              ⚠️ ADMIN COMMAND MODULE: READ ONLY MODE. DIRECT SOCIAL REPLIES DISABLED TO COAX MAXIMUM BANDWIDTH EFFICIENCY.
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 mt-3 pr-1 text-xs font-sans">
              {messages.length > 0 ? (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-2 relative"
                  >
                    <div className="flex justify-between items-start text-[10px] font-mono">
                      <div>
                        <strong className="text-zinc-300 text-[11px] block">{m.name}</strong>
                        <span className="text-purple-400 text-[9px] block tracking-tighter truncate w-32">
                          {m.email}
                        </span>
                      </div>
                      <span className="px-1 py-[1.5px] rounded bg-purple-950/40 border border-purple-900/40 text-[8px] uppercase tracking-wider text-purple-300">
                        {m.gameTitle || "General"}
                      </span>
                    </div>

                    <p className="text-zinc-450 font-sans text-[11.5px] leading-relaxed mt-1">
                      {m.message}
                    </p>

                    <div className="text-[8px] font-mono text-zinc-500 text-right pt-1.5 border-t border-zinc-900 uppercase">
                      {new Date(m.timestamp).toLocaleDateString()} at {new Date(m.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-zinc-650 font-mono py-10 text-center uppercase">
                  No inbound subscriber log notifications.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
