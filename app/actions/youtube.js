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

    console.log(`Debug: fetchRealYouTubeTrends called with query: "${query}"`);

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

export async function uploadVideoAction(formData) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;
    if (!token) return { error: "No YouTube Token" };

    const file = formData.get("file");
    const title = formData.get("title");
    const description = formData.get("description");
    const tags = formData.get("tags") ? formData.get("tags").split(",") : [];
    const publishAt = formData.get("publishAt"); // New: Scheduled Time

    if (!file) return { error: "No file provided" };

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return await YouTubeService.uploadVideo(buffer, { title, description, tags, publishAt }, token);
    } catch (e) {
        console.error("Upload Action Failed", e);
        return { error: e.message };
    }
}

export async function disconnectYouTube() {
    const cookieStore = await cookies();
    cookieStore.delete("yt_access_token");
    console.log("Debug: YouTube Token cookie deleted.");
    return { success: true };
}

export async function nicheScoutAction(query) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "Please connect YouTube channel first." };

    console.log(`Debug: Scouting niche for: ${query}`);
    return await YouTubeService.searchRecruitChannels(query, token);
}

export async function channelDeepDiveAction(channelId) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "Please connect YouTube channel first." };

    console.log(`Debug: Deep diving into channel: ${channelId}`);
    return await YouTubeService.getChannelDeepAnalytics(channelId, token);
}
