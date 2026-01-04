"use server";

import { YouTubeService } from "@/lib/api/youtube";
import { cookies } from "next/headers";

export async function getYouTubeAuthUrl() {
    console.log("Debug: Generating YouTube Auth URL...");
    console.log("Debug: Env Check - ClientID:", !!process.env.YOUTUBE_CLIENT_ID, "Secret:", !!process.env.YOUTUBE_CLIENT_SECRET);

    try {
        const url = YouTubeService.getAuthUrl();
        console.log("Debug: Generated URL:", url ? "YES (Length: " + url.length + ")" : "NO");
        return url;
    } catch (error) {
        console.error("Debug: Error generating auth URL:", error);
        return null;
    }
}

export async function fetchRealYouTubeTrends(query) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) {
        console.log("No YouTube token found in cookies.");
        return [];
    }

    return await YouTubeService.searchVideos(query, token);
}

export async function getRealChannelStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) {
        console.log("Debug: No Token found in getRealChannelStats. Cookies available:", cookieStore.getAll().map(c => c.name));
        return null;
    }

    console.log("Debug: Token found. Fetching channel stats...");
    return await YouTubeService.getChannelStatistics(token);
}
