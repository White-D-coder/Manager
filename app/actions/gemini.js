"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { YouTubeService } from "@/lib/api/youtube";
import { cookies } from "next/headers";

export async function analyzeWithGemini(trends) {
    return await GeminiBrain.analyzeTrends(trends);
}

export async function generateScriptWithGemini(trend, config, tone) {
    return await GeminiBrain.generateScript(trend, config, tone);
}

export async function analyzeSingleVideoAction(video) {
    const comments = await YouTubeService.getVideoComments(video.video_id);
    return await GeminiBrain.analyzeSingleVideo(video, comments);
}

export async function runAutonomousLoopAction(videoCount = 1) {
    // In a real app, this would check a persistent job queue
    // For this local MVP, we grab the token and run one cycle immediately
    const { getYouTubeAuthUrl } = await import("@/app/actions/youtube"); // dynamic import to avoid circ dependencies if any
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "Authorization Needed" };

    const { ViralManager } = await import("@/lib/brain/ViralManager");
    return await ViralManager.runFullCycle(token, videoCount);
}

export async function chatWithVideoAgentAction(message, context) {
    return await GeminiBrain.chatWithVideoAgent(message, context);
}

export async function analyzeUploadTimingAction(trends) {
    return await GeminiBrain.analyzeUploadTiming(trends);
}

export async function analyzeViralMetadataAction(trends) {
    return await GeminiBrain.analyzeViralMetadata(trends);
}

export async function identifyWinningNicheAction() {
    // Dynamic import to avoid cycles
    const { ViralManager } = await import("@/lib/brain/ViralManager");
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    // If no token (not connected), we can't search. Return null or default.
    // For MVP, if no token, we might return a static "Recommended" list or error.
    if (!token) return { error: "Connect YouTube First" };

    return await ViralManager.identifyWinningNiche(token);
}

export async function suggestNicheIdeasAction() {
    return await GeminiBrain.generateTrendIdeas();
}
