/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  publishedDate: string;
  thumbnail: string;
  videoUrl: string;
  isShort: boolean;
  viewCount: string;
  duration: string;
  game?: string;
  likes?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  relativeTime: string;
  likes: number;
  commentsCount: number;
  game?: string;
}

export interface UpcomingVideo {
  id: string;
  title: string;
  scheduledTime: string;
  thumbnail: string;
  game: string;
  hypeCount: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  gameTitle?: string;
}

export interface SiteStats {
  totalFollowers: number;
  totalViews: number;
  videoLikes: Record<string, number>;
  postLikes: Record<string, number>;
  pageViewsByDay: Record<string, number>; // date (YYYY-MM-DD) -> count
  recentVisitors: {
    id: string;
    os: string;
    deviceType: string;
    timestamp: string;
  }[];
}

export function checkIfVideoIsShort(v: Video): boolean {
  if (!v) return false;
  const urlIsShort = v.videoUrl?.toLowerCase().includes("short") || v.id?.toLowerCase().includes("short");
  const titleIsShort = v.title?.toLowerCase().includes("short") || v.title?.toLowerCase().includes("#short");
  const descIsShort = v.description?.toLowerCase().includes("short") || v.description?.toLowerCase().includes("#short");
  const isDurationShort = v.duration?.startsWith("0:") || v.duration?.startsWith("00:") || v.duration?.includes("0:") || v.duration === "0:58" || v.duration === "0:45" || v.duration === "0:52" || v.duration === "0:50" || v.duration === "0:40";
  return !!(v.isShort || urlIsShort || titleIsShort || descIsShort || isDurationShort);
}
