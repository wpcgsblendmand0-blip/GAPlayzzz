/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gamepad2, Youtube, Instagram, Heart, Flame, HeartCrack, Share2, X, Copy, Check } from "lucide-react";
import { Video, Post, UpcomingVideo, SiteStats } from "./types";

// Firebase imports integration
import { db } from "./firebase";
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment, collection, getDocs, orderBy, query } from "firebase/firestore";

// Modular UI imports
import Magnetic from "./components/Magnetic";
import GamerLoader from "./components/GamerLoader";
import GamerBar from "./components/GamerBar";
import SpotlightPlayer from "./components/SpotlightPlayer";
import CommunityPosts from "./components/CommunityPosts";
import AboutSetup from "./components/AboutSetup";
import SpecsSetup from "./components/SpecsSetup";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // Tab navigation states
  const [activeTab, setActiveTab] = useState<"home" | "library" | "about" | "specs" | "admin">("home");
  const [libraryType, setLibraryType] = useState<"videos" | "shorts">("videos");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Telemetry loading simulation states
  const [isLoading, setIsLoading] = useState(true);
  const [videosState, setVideosState] = useState<Video[]>([]);
  const [postsState, setPostsState] = useState<Post[]>([]);
  const [upcomingState, setUpcomingState] = useState<UpcomingVideo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats stats
  const [followerCount, setFollowerCount] = useState(0);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [floatingParticles, setFloatingParticles] = useState<{ id: string; type: "heart" | "flame" | "cracked-heart"; direction: "up" | "down"; x: number; y: number; size: number; color: string }[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Monitor bottom reach to eliminate black borders by lifting content
  useEffect(() => {
    const checkBottom = () => {
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12;
      setIsAtBottom(isBottom);
    };
    window.addEventListener("scroll", checkBottom, { passive: true });
    return () => window.removeEventListener("scroll", checkBottom);
  }, []);

  // Iframe Shorts active theater overlay state
  const [activeShortTheatre, setActiveShortTheatre] = useState<Video | null>(null);

  // Fluent device level native sharing toast states
  const [copiedToastVisible, setCopiedToastVisible] = useState(false);

  // 1. Initial mounting operations: Parse client details, analytic views, fetch channel list
  useEffect(() => {
    // Check if user has already followed the channel previously in this browser
    const storedFollow = localStorage.getItem("ga_playzzz_has_followed") === "true";
    setHasFollowed(storedFollow);

    // Private query decryption parameter to lock/unlock Admin from UI
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("admin") === "secret" || searchParams.get("secret") === "active") {
        setIsAdminUnlocked(true);
        localStorage.setItem("ga_playzzz_admin_unlocked", "true");
      } else if (localStorage.getItem("ga_playzzz_admin_unlocked") === "true") {
        setIsAdminUnlocked(true);
      }
    } catch (_) {}

    // Load liked states dictionary
    try {
      const storedVideoLikes = JSON.parse(localStorage.getItem("ga_playzzz_liked_videos") || "{}");
      const storedPostLikes = JSON.parse(localStorage.getItem("ga_playzzz_liked_posts") || "{}");
      setLikedVideos(storedVideoLikes);
      setLikedPosts(storedPostLikes);
    } catch (_) {}

    // Initialize/retrieve a unique client session track ID
    let clientId = localStorage.getItem("ga_playzzz_client_uuid");
    if (!clientId) {
      clientId = "gap_uuid_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("ga_playzzz_client_uuid", clientId);
    }

    // Sync follow state from Firestore in background
    const syncFollowFirestore = async () => {
      try {
        const docRef = doc(db, "followers", clientId || "temp_id");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHasFollowed(true);
          localStorage.setItem("ga_playzzz_has_followed", "true");
        } else {
          setHasFollowed(false);
          localStorage.setItem("ga_playzzz_has_followed", "false");
        }
      } catch (err) {
        console.warn("Firestore offline fallback or empty rules:", err);
      }
    };
    if (clientId) {
      syncFollowFirestore();
    }

    // Support Shared video URL deep linking
    const loadSharedVideo = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const sharedVidId = searchParams.get("video");
        if (sharedVidId) {
          let videosList: Video[] = [];
          try {
            const cacheDocSnap = await getDoc(doc(db, "cache", "youtube"));
            if (cacheDocSnap.exists()) {
              const cacheData = cacheDocSnap.data();
              if (cacheData && Array.isArray(cacheData.videos)) {
                videosList = cacheData.videos;
              }
            }
          } catch (_) {}
          if (videosList && videosList.length > 0) {
            const matched = videosList.find((v: Video) => v.id === sharedVidId);
            if (matched) {
              setActiveShortTheatre(matched);
            }
          }
        }
      } catch (_) {}
    };
    loadSharedVideo();

    // Determine basic hardware client OS telemetry
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    let os = "Windows/Desktop";
    let deviceType = "Desktop";

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      os = "iOS";
      deviceType = "Mobile";
    } else if (/Android/.test(userAgent)) {
      os = "Android";
      deviceType = "Mobile";
    } else if (/Macintosh|Windows|Linux/.test(userAgent)) {
      deviceType = "Desktop";
    }

    // Record page view in Firestore views count atomically
    try {
      const viewsRef = doc(db, "stats", "views");
      updateDoc(viewsRef, {
        count: increment(1)
      }).catch(() => {
        setDoc(viewsRef, { count: 1 }, { merge: true }).catch(() => {});
      });
    } catch (_) {}

    // Fetch master gaming lists & database records
    fetchAppData();

    // Custom slow loader simulation overlay for gaming client feel (min 1.2s duration)
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(loadTimer);
  }, []);

  const fetchAppData = async (forceRefresh = false) => {
    setIsRefreshing(true);
    const YOUTUBE_API_KEY = "AIzaSyB_eHm49n5XyK0R6et2jrpcOqMbUE2y2LM";
    const YOUTUBE_CHANNEL_ID = "UCdHgG_YvbHdMBrQA6rW1Elg";

    // 1. Fetch direct from YouTube API, falling back to Firestore Cache
    try {
      const fetchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=30&type=video`;
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean);

        let statsMap: Record<string, { viewCount: string; duration: string }> = {};
        if (videoIds.length > 0) {
          try {
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&part=statistics,contentDetails&id=${videoIds.join(",")}`;
            const statsRes = await fetch(statsUrl);
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              (statsData.items || []).forEach((vItem: any) => {
                const rawDuration = vItem.contentDetails?.duration || "";
                let durationStr = "10:00"; 
                let match = rawDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                if (match) {
                  const hours = parseInt(match[1] || "0", 10);
                  const minutes = parseInt(match[2] || "0", 10);
                  const seconds = parseInt(match[3] || "0", 10);
                  if (hours > 0) {
                    durationStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                  } else {
                    durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                  }
                }
                statsMap[vItem.id] = {
                  viewCount: Number(vItem.statistics?.viewCount || 0).toLocaleString(),
                  duration: durationStr
                };
              });
            }
          } catch (eStats) {
            console.error("Secondary YouTube stats fetch failed:", eStats);
          }
        }

        const mappedVideos: Video[] = items.map((item: any) => {
          const vidId = item.id.videoId;
          const cachedStats = statsMap[vidId];
          const viewCountStr = cachedStats?.viewCount || "0";
          const durationStr = cachedStats?.duration || "10:00";

          const isShortTitle = item.snippet.title.toLowerCase().includes("#shorts") || item.snippet.title.toLowerCase().includes("shorts");
          let isShort = isShortTitle;
          const parts = durationStr.split(":");
          if (parts.length === 2 && parts[0] === "0") {
            isShort = true;
          } else if (parts.length === 2 && parseInt(parts[0]) === 0) {
            isShort = true;
          }

          return {
            id: vidId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            publishedDate: new Date(item.snippet.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }),
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
            videoUrl: isShort ? `https://www.youtube.com/shorts/${vidId}` : `https://www.youtube.com/watch?v=${vidId}`,
            isShort: isShort,
            viewCount: viewCountStr,
            duration: durationStr
          };
        });

        if (mappedVideos.length > 0) {
          setVideosState(mappedVideos);
          try {
            await setDoc(doc(db, "cache", "youtube"), {
              videos: mappedVideos,
              timestamp: new Date().toISOString()
            });
          } catch (_) {}
        }
      } else {
        throw new Error("HTTP " + response.status);
      }
    } catch (eYoutube) {
      console.warn("Direct YouTube API failed, falling back to Firestore cache:", eYoutube);
      try {
        const cacheDocSnap = await getDoc(doc(db, "cache", "youtube"));
        if (cacheDocSnap.exists()) {
          const data = cacheDocSnap.data();
          if (data && Array.isArray(data.videos)) {
            setVideosState(data.videos);
          }
        }
      } catch (_) {}
    }

    // 2. Fetch community updates directly from Firestore
    try {
      const postsSnapshot = await getDocs(collection(db, "posts"));
      if (!postsSnapshot.empty) {
        const postsList: Post[] = postsSnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || "Post Title",
            content: data.content || "",
            relativeTime: data.relativeTime || "Just now",
            likes: data.likes || 0,
            commentsCount: data.commentsCount || 0
          };
        });
        setPostsState(postsList);
      } else {
        setPostsState([]);
      }
    } catch (ePosts) {
      console.warn("Could not retrieve posts from Firestore:", ePosts);
      setPostsState([]);
    }

    // 3. Fetch upcoming milestones directly from Firestore
    try {
      const upcomingSnapshot = await getDocs(collection(db, "upcoming"));
      if (!upcomingSnapshot.empty) {
        const upcomingList: UpcomingVideo[] = upcomingSnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || "Upcoming",
            scheduledTime: data.scheduledTime || "Coming Soon",
            thumbnail: data.thumbnail || "",
            game: data.game || "GTA 5",
            hypeCount: Number(data.hypeCount || 0)
          };
        });
        setUpcomingState(upcomingList);
      } else {
        setUpcomingState([]);
      }
    } catch (eUpcoming) {
      console.warn("Could not retrieve upcoming from Firestore:", eUpcoming);
      setUpcomingState([]);
    }

    // 4. Fetch subscriber metrics directly from Firestore stats doc
    try {
      const followersDoc = await getDoc(doc(db, "stats", "followers"));
      if (followersDoc.exists()) {
        const fCount = followersDoc.data()?.count || 0;
        setFollowerCount(fCount);
      }
    } catch (eStats) {
      console.warn("Could not retrieve stats from Firestore:", eStats);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Follow & Unfollow Toggle submission
  const handleFollowChannel = async () => {
    const clientId = localStorage.getItem("ga_playzzz_client_uuid") || "temp_id";
    const nextFollowed = !hasFollowed;
    
    // 1. Immediately update local state
    setHasFollowed(nextFollowed);
    localStorage.setItem("ga_playzzz_has_followed", nextFollowed ? "true" : "false");
    
    if (nextFollowed) {
      spawnParticles("flame", "up");
    }

    // 2. Perform direct actual Firestore write and deletion operations
    try {
      const followerDocRef = doc(db, "followers", clientId);
      if (nextFollowed) {
        await setDoc(followerDocRef, {
          followed: true,
          timestamp: new Date().toISOString()
        });
      } else {
        await deleteDoc(followerDocRef);
      }
    } catch (dbErr) {
      console.warn("Direct Firestore execution deferred, caching offline:", dbErr);
    }

    // 3. Keep stats documents atomically synchronized inside Firestore
    try {
      const statFollowersRef = doc(db, "stats", "followers");
      await updateDoc(statFollowersRef, {
        count: increment(nextFollowed ? 1 : -1)
      }).catch(async () => {
        await setDoc(statFollowersRef, { count: nextFollowed ? 1 : 0 }, { merge: true });
      });

      const updatedSnap = await getDoc(statFollowersRef);
      if (updatedSnap.exists()) {
        setFollowerCount(updatedSnap.data()?.count || 0);
      }
    } catch (err) {
      console.warn("Could not synchronize follower statistics doc:", err);
      setFollowerCount((prev) => nextFollowed ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const handleShareVideo = async (video: Video) => {
    // Production-first domain resolution to prevent sharing temporary Cloud Run container URLs
    const isLocalDev = typeof window !== "undefined" && (
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1"
    );
    const origin = isLocalDev ? window.location.origin : "https://gaplayzzz.web.app";
    const shareUrl = `${origin}/?video=${video.id}`;
    const shareTitle = `GAPlayzzz Highlight`;
    const shareText = `Check out "${video.title}" by GAPlayzzz!\nWatch high-octane GTA gameplay here:`;

    // Try native sharing API first
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.warn("Native share failed, falling back to copy:", err);
          copyToClipboardFallback(shareUrl);
        }
      }
    } else {
      // Fallback: Copy to clipboard quietly & trigger high-fidelity status toast
      copyToClipboardFallback(shareUrl);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedToastVisible(true);
      setTimeout(() => setCopiedToastVisible(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const spawnParticles = (type: "heart" | "flame" | "cracked-heart", direction: "up" | "down" = "up") => {
    const count = 12;
    const colors = type === "flame"
      ? ["#ea580c", "#f97316", "#fdba74", "#ef4444"]
      : ["#ef4444", "#f43f5e", "#ec4899", "#fda4af"];
    
    const newItems = Array.from({ length: count }).map((_, i) => ({
      id: `particle-${Date.now()}-${i}-${Math.random()}`,
      type,
      direction,
      x: window.innerWidth / 2 + (Math.random() * 260 - 130),
      y: direction === "down"
        ? window.innerHeight * 0.35 + (Math.random() * 85 - 40)
        : window.innerHeight * 0.70 + (Math.random() * 80 - 40),
      size: Math.random() * 18 + 14,
      color: colors[i % colors.length],
    }));
    setFloatingParticles((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => !newItems.find((ni) => ni.id === p.id)));
    }, 1600);
  };

  // Video reaction like/unlike toggle submission
  const handleLikeVideo = async (videoId: string) => {
    const wasLiked = !!likedVideos[videoId];
    const updatedDict = { ...likedVideos, [videoId]: !wasLiked };
    setLikedVideos(updatedDict);
    localStorage.setItem("ga_playzzz_liked_videos", JSON.stringify(updatedDict));

    spawnParticles(wasLiked ? "cracked-heart" : "heart", wasLiked ? "down" : "up");

    try {
      const likesRef = doc(db, "stats", "likes");
      await setDoc(likesRef, {
        videoLikes: {
          [videoId]: increment(wasLiked ? -1 : 1)
        }
      }, { merge: true });
    } catch (eLike) {
      console.warn("Could not save video like to Firestore:", eLike);
    }
  };

  // Community Post like/unlike toggle submission
  const handleLikePost = async (postId: string) => {
    const wasLiked = !!likedPosts[postId];
    const updatedDict = { ...likedPosts, [postId]: !wasLiked };
    setLikedPosts(updatedDict);
    localStorage.setItem("ga_playzzz_liked_posts", JSON.stringify(updatedDict));

    spawnParticles(wasLiked ? "cracked-heart" : "heart", wasLiked ? "down" : "up");

    try {
      const postDocRef = doc(db, "posts", postId);
      await updateDoc(postDocRef, {
        likes: increment(wasLiked ? -1 : 1)
      });
    } catch (ePostLike) {
      console.warn("Failed to update post like in Firestore:", ePostLike);
    }
  };

  const checkIfVideoIsShort = (v: Video) => {
    if (!v) return false;
    const urlIsShort = v.videoUrl?.toLowerCase().includes("short") || v.id?.toLowerCase().includes("short");
    const titleIsShort = v.title?.toLowerCase().includes("short") || v.title?.toLowerCase().includes("#short");
    const descIsShort = v.description?.toLowerCase().includes("short") || v.description?.toLowerCase().includes("#short");
    const isDurationShort = v.duration?.startsWith("0:") || v.duration?.startsWith("00:") || v.duration?.includes("0:") || v.duration === "0:58" || v.duration === "0:45" || v.duration === "0:52" || v.duration === "0:50" || v.duration === "0:40";
    return !!(v.isShort || urlIsShort || titleIsShort || descIsShort || isDurationShort);
  };

  // Chronologically sorted video lists from OLDEST to NEWEST as requested!
  const getChronologicalVideos = () => {
    // Filter out standard videos first vs shorts depending on state
    const isTargetShort = libraryType === "shorts";
    const filtered = videosState.filter((v) => {
      const isShort = checkIfVideoIsShort(v);
      return isShort === isTargetShort;
    });

    // Sort: Newest Publish dates first so scrolling goes down to oldest
    return [...filtered].sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  };

  const [shuffledSecondaryPool, setShuffledSecondaryPool] = useState<Video[]>([]);

  // Trigger shuffle of remaining videos underneath (retained standard and short elements)
  // Periodically rotates grid items every 8 seconds for a highly alive channel viewport.
  useEffect(() => {
    if (videosState.length === 0) return;

    const spinShuffle = () => {
      // Find the absolute latest video (sorted newest first by publish date)
      const sortedByDate = [...videosState].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      const activeLatestVideo = sortedByDate[0] || null;

      // Filter activeLatestVideo out from the shuffle pool so it is NEVER rotated
      const allExceptLatest = videosState.filter((v) => v.id !== activeLatestVideo?.id);
      
      // Professional Fisher-Yates Randomize selection of the remaining grid pool
      for (let i = allExceptLatest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allExceptLatest[i], allExceptLatest[j]] = [allExceptLatest[j], allExceptLatest[i]];
      }

      // Fill secondary grid with up to 6 items
      let targetCount = 6;
      if (allExceptLatest.length <= 6) {
        targetCount = allExceptLatest.length;
      }

      setShuffledSecondaryPool(allExceptLatest.slice(0, targetCount));
    };

    spinShuffle();

    // Auto-rotates titles, thumbnails, and URLs with a beautiful fade every 8 seconds
    const shuffleTimer = setInterval(spinShuffle, 8000);
    return () => clearInterval(shuffleTimer);
  }, [videosState, activeTab]);

  const handleNavigateToLibraryList = () => {
    setActiveTab("library");
    setLibraryType("videos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Primary layouts selector router
  const renderTabContent = () => {
    // Determine the fixed absolute latest video
    const sortedByDate = [...videosState].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const latestFixedVideo = sortedByDate[0] || null;

    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            <SpotlightPlayer
              videos={latestFixedVideo ? [latestFixedVideo, ...shuffledSecondaryPool] : []}
              onLikeVideo={handleLikeVideo}
              likedVideos={likedVideos}
              onNavigateToLibrary={handleNavigateToLibraryList}
              onShareVideo={handleShareVideo}
            />
            {postsState && postsState.length > 0 && (
              <div className="pt-2">
                <CommunityPosts
                  posts={postsState}
                  onLikePost={handleLikePost}
                  likedPosts={likedPosts}
                />
              </div>
            )}
          </div>
        );

      case "library":
        const chronoLibraryList = getChronologicalVideos();
        return (
          <div className="space-y-5 select-none">
            {/* Header with dual tabs for Videos and Shorts */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl flex items-center justify-between flex-wrap gap-2">
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-900 items-center">
                <button
                  id="tab-library-videos"
                  onClick={() => setLibraryType("videos")}
                  className={`px-4 py-1.5 rounded-md font-bold font-sans text-xs tracking-wider uppercase transition cursor-pointer ${
                    libraryType === "videos"
                      ? "bg-orange-600 text-white font-extrabold"
                      : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  YouTube Videos
                </button>
                <button
                  id="tab-library-shorts"
                  onClick={() => setLibraryType("shorts")}
                  className={`px-4 py-1.5 rounded-md font-bold font-sans text-xs tracking-wider uppercase transition cursor-pointer ${
                    libraryType === "shorts"
                      ? "bg-orange-600 text-white font-extrabold"
                      : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  YouTube Shorts
                </button>
              </div>

              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                Official Creator Feed
              </span>
            </div>

            {/* Sub content grids (chronologically mapped oldest to newest with professional smoothness transition) */}
            <AnimatePresence mode="wait">
              {chronoLibraryList.length > 0 ? (
                libraryType === "videos" ? (
                  <motion.div
                    key="videos-list"
                    initial={{ opacity: 0, filter: "blur(4px)", y: 15 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(4px)", y: -15 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {chronoLibraryList.map((vid) => (
                      <div
                        key={vid.id}
                        className="group flex flex-col bg-zinc-900/30 rounded-xl border border-zinc-850 overflow-hidden hover:border-orange-500/45 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <div className="relative aspect-video bg-black overflow-hidden pointer-events-auto">
                          <img
                            referrerPolicy="no-referrer"
                            src={vid.thumbnail}
                            alt={vid.title}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80" />
                          
                          {/* Inline click play selector triggers on-site theater pops */}
                          <div
                            id={`play-lib-video-${vid.id}`}
                            onClick={() => {
                              // Custom structure triggers beautiful modal pop natively
                              setActiveShortTheatre(vid);
                            }}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/40 cursor-pointer"
                          >
                            <div className="p-3 bg-orange-600 rounded-full text-white shadow shadow-orange-600/30">
                              <Gamepad2 className="w-4 h-4 fill-current" />
                            </div>
                          </div>

                          {/* Released Dates */}
                          <span className="absolute bottom-2 left-2 text-[9px] font-mono text-zinc-400 bg-zinc-950/70 py-0.5 px-1 rounded border border-zinc-900/40">
                            {vid.publishedDate}
                          </span>

                          {/* Durations */}
                          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-zinc-300 bg-zinc-950/70 py-0.5 px-1 rounded border border-zinc-900/40">
                            {vid.duration}
                          </span>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h5
                              onClick={() => setActiveShortTheatre(vid)}
                              className="text-xs font-bold text-zinc-100 leading-snug hover:text-orange-500 cursor-pointer transition-colors uppercase tracking-tight"
                            >
                              {vid.title}
                            </h5>
                            <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2 mt-1">
                              {vid.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[9px] font-mono text-zinc-500">
                            <span>{vid.viewCount} views</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareVideo(vid);
                              }}
                              className="p-1 px-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-700 transition cursor-pointer flex items-center space-x-1"
                              title="Share Video"
                            >
                              <Share2 className="w-3 h-3 text-orange-500" />
                              <span className="font-bold text-[8px] uppercase">Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="shorts-list"
                    initial={{ opacity: 0, filter: "blur(4px)", y: 15 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(4px)", y: -15 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                  >
                    {chronoLibraryList.map((short) => (
                      <div
                        key={short.id}
                        className="group relative rounded-xl border border-zinc-850 overflow-hidden bg-zinc-900/40 flex flex-col h-[280px] hover:border-orange-500/45 transition duration-300"
                      >
                        <div className="relative flex-1 bg-zinc-950 overflow-hidden">
                          <img
                            referrerPolicy="no-referrer"
                            src={short.thumbnail}
                            alt={short.title}
                            className="w-full h-full object-cover opacity-85 group-hover:scale-105 duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10" />

                          {/* Click Short triggers custom modal iframe directly on-site (NO redirection!) */}
                          <div
                            id={`play-lib-short-${short.id}`}
                            onClick={() => setActiveShortTheatre(short)}
                            className="absolute inset-0 flex flex-col justify-end p-2.5 cursor-pointer hover:bg-black/20"
                          >
                            <div className="w-8 h-8 rounded-full bg-orange-600/90 text-white flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-orange-600/30">
                              <Gamepad2 className="w-3.5 h-3.5 fill-current" />
                            </div>

                            <p className="text-[10.5px] font-bold font-sans text-zinc-200 line-clamp-3 leading-snug drop-shadow-md">
                              {short.title}
                            </p>
                          </div>
                        </div>

                        <div className="p-2 bg-zinc-950/80 border-t border-zinc-900/40 flex items-center justify-between text-[9px] font-mono text-zinc-500 shrink-0">
                          <span>{short.viewCount} views</span>
                          
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareVideo(short);
                              }}
                              className="p-1 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850 transition cursor-pointer"
                              title="Share Short"
                            >
                              <Share2 className="w-2.5 h-2.5 text-orange-500" />
                            </button>
                            <span className="text-orange-500 text-[8px] uppercase font-bold tracking-widest">
                              Short
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="empty-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 bg-zinc-900 rounded-xl text-center text-zinc-500 text-xs font-mono uppercase"
                >
                  Offline or syncing feed... Please tap refresh button above.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "about":
        return <AboutSetup />;

      case "specs":
        return <SpecsSetup />;

      case "admin":
        return <AdminPanel />;

      default:
        return null;
    }
  };

  return (
    <>
      {/* 2. Visual loader overlay while first loading for slow network simulations */}
      <AnimatePresence>{isLoading && <GamerLoader />}</AnimatePresence>

      {/* Main gaming UI body configured specially for mobile & iOS, with smooth scrolling capabilities */}
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-x-hidden flex flex-col pb-28 md:pb-12">
        
        {/* Curved dynamic hovering top bar with glass blur */}
        <GamerBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onFollow={handleFollowChannel}
          hasFollowed={hasFollowed}
          isAdminUnlocked={isAdminUnlocked}
          followerCount={followerCount}
        />

        {/* Global Hub Stage wrapper with smooth page fade and ease-up triggers */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Social Hub credit */}
        <motion.footer
          animate={isAtBottom ? { y: -10, scale: 0.99 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full bg-zinc-950 border-t border-zinc-900 px-4 py-8 md:py-10 text-center select-none"
        >
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-4">
            
            {/* Real YouTube and Instagram Redirect portal links (Icons Only, Hover animations) */}
            <div className="flex items-center space-x-5 py-1 justify-center">
              <Magnetic range={50} actionMaxX={20} actionMaxY={20}>
                <a
                  href="https://www.youtube.com/channel/UCdHgG_YvbHdMBrQA6rW1Elg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center w-12 h-12 bg-red-950/20 hover:bg-gradient-to-br hover:from-red-650 hover:to-red-500 text-red-500 hover:text-white border border-red-900/35 hover:border-red-500 rounded-full transition-all duration-300 hover:scale-115 active:scale-95 shadow-[0_4px_20px_rgba(239,68,68,0.15)] group"
                  title="GAPlayzzz YouTube Channel"
                >
                  <div className="absolute inset-0 bg-red-500/10 rounded-full group-hover:scale-125 transition duration-500 group-hover:opacity-100 opacity-0 blur-md" />
                  <Youtube className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 z-10" />
                </a>
              </Magnetic>
              
              <Magnetic range={50} actionMaxX={20} actionMaxY={20}>
                <a
                  href="https://www.instagram.com/gaplayzzz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center w-12 h-12 bg-orange-950/20 hover:bg-gradient-to-tr hover:from-yellow-600 hover:to-pink-600 text-orange-400 hover:text-white border border-orange-900/35 hover:border-orange-550 rounded-full transition-all duration-300 hover:scale-115 active:scale-95 shadow-[0_4px_20px_rgba(249,115,22,0.15)] group"
                  title="GAPlayzzz Instagram Feed"
                >
                  <div className="absolute inset-0 bg-orange-500/10 rounded-full group-hover:scale-125 transition duration-500 group-hover:opacity-100 opacity-0 blur-md" />
                  <Instagram className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 z-10" />
                </a>
              </Magnetic>
            </div>

            {/* Single Copyright line with User's name and rights */}
            <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em] leading-none py-1 mt-1">
              © GAPLAYZZZ 2026 • ALL RIGHTS RESERVED
            </div>

            {/* Website Developed by AI Studio & Creator Credit in Beautiful Glowing Orange */}
            <div className="text-[9.5px] font-mono uppercase tracking-[0.16em] flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1 text-orange-500 font-extrabold">
              <span>Website Developed by AI Studio</span>
              <span className="text-orange-700/60">•</span>
              <span>Developer GA-Kidzzz</span>
            </div>
          </div>
        </motion.footer>

        {/* Chronological direct Shorts on-site overlay theater portal (Never redirects) */}
        <AnimatePresence>
          {activeShortTheatre && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md select-none">
              <div className="absolute inset-0" onClick={() => setActiveShortTheatre(null)} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm aspect-[9/18] overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                {/* Header title */}
                <div className="p-3 border-b border-zinc-900 flex justify-between items-center text-[10px] font-mono bg-zinc-950/80 z-10 shrink-0">
                  <span className="text-orange-550 uppercase font-black">Direct Shorts Loop</span>
                  <button
                    id="close-short-modal"
                    onClick={() => setActiveShortTheatre(null)}
                    className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {/* Direct Video embed stage */}
                <div className="flex-1 bg-black relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeShortTheatre.id}?autoplay=1&rel=0`}
                    title={activeShortTheatre.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Shorts info panel overlay */}
                <div className="p-3.5 bg-zinc-950 border-t border-zinc-900 shrink-0 text-xs text-zinc-400 font-sans space-y-1.5 leading-normal">
                  <h5 className="font-bold text-white line-clamp-2">
                    {activeShortTheatre.title}
                  </h5>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                    <span>{activeShortTheatre.viewCount} views</span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShareVideo(activeShortTheatre)}
                        className="p-1.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition text-[9px] font-mono font-bold flex items-center space-x-1"
                        title="Share on WhatsApp/Socials"
                      >
                        <Share2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Share</span>
                      </button>

                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        id={`like-short-theater-${activeShortTheatre.id}`}
                        onClick={() => handleLikeVideo(activeShortTheatre.id)}
                        className={`px-3 py-1.5 rounded-lg border font-mono flex items-center space-x-1.5 transition-all text-[9px] cursor-pointer ${
                          likedVideos[activeShortTheatre.id]
                            ? "bg-red-950/25 text-red-500 border-red-900/40"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800 hover:text-white"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedVideos[activeShortTheatre.id] ? "fill-current text-red-500" : ""}`} />
                        <span>{likedVideos[activeShortTheatre.id] ? "Liked" : "Like"}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Immersive Floating Particles Champagne Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <AnimatePresence>
            {floatingParticles.map((p) => {
              const isUp = p.direction === "up";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, x: p.x, y: p.y, scale: isUp ? 0.3 : 1.1 }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    y: isUp 
                      ? p.y - 250 - Math.random() * 150 
                      : p.y + 150 + Math.random() * 100, 
                    x: isUp
                      ? p.x + Math.sin(Math.random()) * 200 - 100
                      : p.x + Math.sin(Math.random()) * 120 - 60,
                    scale: isUp ? [0.3, 1.4, 0.7] : [1.1, 0.6, 0.2]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute"
                  style={{ color: p.color }}
                >
                  {p.type === "flame" ? (
                    <Flame className="w-4 h-4 fill-current drop-shadow-[0_2px_8px_rgba(234,88,12,0.6)]" style={{ width: p.size, height: p.size }} />
                  ) : p.type === "cracked-heart" ? (
                    <HeartCrack className="w-4 h-4 fill-current drop-shadow-[0_2px_8px_rgba(239,68,68,0.7)]" style={{ width: p.size, height: p.size }} />
                  ) : (
                    <Heart className="w-4 h-4 fill-current drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" style={{ width: p.size, height: p.size }} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Real-time Fluent Device Link Copied Micro-Toast Indicator */}
        <AnimatePresence>
          {copiedToastVisible && (
            <motion.div
              initial={{ opacity: 0, y: -40, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -40, x: "-50%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-zinc-950/95 backdrop-blur-md border border-orange-500/30 rounded-full px-5 py-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.85),_0_0_15px_rgba(234,88,12,0.15)] flex items-center space-x-2.5 select-none shrink-0"
              style={{ left: "50%" }}
            >
              <div className="w-5 h-5 rounded-full bg-orange-550/20 flex items-center justify-center border border-orange-500/20">
                <Check className="w-3 h-3 text-orange-500 shrink-0" />
              </div>
              <span className="text-[10px] font-sans font-black tracking-widest text-zinc-100 uppercase">
                Direct Link Copied to Clipboard!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
