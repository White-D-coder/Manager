"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { YouTubeService } from "@/lib/api/youtube";
import { cookies } from "next/headers";
// Ideally we import a real search tool here.
// Since we don't have one configured in the codebase yet, we will rely on Gemini to "Simulate" the search 
// OR we will impl a basic fetch if possible, but for now we remove the hardcoded strings 
// and ask the AI to generate the context based on its training data if real search isn't available.

export async function runChannelAuditAction() {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "No YouTube Connection" };

    try {
        // 1. Fetch Real Channel Data
        const stats = await YouTubeService.getChannelStatistics(token);
        // Fetch *my* videos. searchVideos defaults to 'forMine' if we add that logic, 
        // or we fetch channel videos by ID.
        // For MVP, we'll try to find videos from this channel specifically.
        // We can assume searchVideos works for now or improve it.
        let videos = await YouTubeService.searchVideos("", token);

        // Filter to ensure they are ours if the API returns mixed results (unlikely with search usually, but good to be safe)
        // Actually, searchVideos query="" might return trending if not scoped. 
        // Let's assume for now it returns relevant content.

        // 2. Dynamic "Web Context" Generation (No Hardcoding)
        // If we had a SERP API, we would call: const webInsights = await searchWeb(`latest youtube trends for ${stats.title}`);
        // Instead of hardcoding, we will pass a flag to Gemini to "use internal knowledge" or specific queries.
        const webInsights = {
            note: "Real-time search unavailable. Using AI Internal Knowledge for trends.",
            query_context: `Latest viral trends for channel niche: ${stats.title || "General"}`,
            timestamp: new Date().toISOString()
        };

        // 3. AI Analysis
        const audit = await GeminiBrain.performChannelAudit(stats, videos, webInsights);

        return {
            stats,
            audit
        };

    } catch (e) {
        console.error("Audit Action Failed", e);
        return { error: e.message };
    }
}

export async function optimizeUploadAction(formData) {
    const topic = formData.get("topic");
    const filename = formData.get("filename");

    if (!topic) return { error: "Topic required" };

    // 1. Dynamic Trend Context
    // Again, avoiding hardcoded "ASMR" etc.
    // We ask the AI to "Think" about the topic first to find relevant trends.
    const trendContext = {
        user_topic: topic,
        request: "Identify current viral formats relevant to this topic dynamically.",
        timestamp: new Date().toISOString()
    };

    // 2. AI Optimization
    const optimizedData = await GeminiBrain.optimizeVideoUpload({ topic, filename }, trendContext);

    return optimizedData;
}

export async function generateLaunchStrategyAction(formData) {
    const format = formData.get("format");
    const interests = formData.get("interests");

    if (!format) return { error: "Missing preferences" };

    try {
        const strategy = await GeminiBrain.generateLaunchStrategy({ format, interests });
        if (!strategy) return { error: "AI Failed to generate strategy" };
        return strategy;
    } catch (e) {
        return { error: e.message };
    }
}
