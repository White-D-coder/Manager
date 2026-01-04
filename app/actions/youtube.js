"use server";

import { YouTubeService } from "@/lib/api/youtube";
import { cookies } from "next/headers";

export async function getYouTubeAuthUrl() {
    // In a real app, you might generate a 'state' token here for security
    return YouTubeService.getAuthUrl();
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
