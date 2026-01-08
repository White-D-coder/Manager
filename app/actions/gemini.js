"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { YouTubeService } from "@/lib/api/youtube";

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

export async function runAutonomousLoopAction() {
    // In a real app, this would check a persistent job queue
    // For this local MVP, we grab the token and run one cycle immediately
    const { getYouTubeAuthUrl } = await import("@/app/actions/youtube"); // dynamic import to avoid circ dependencies if any
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "Authorization Needed" };

    const { ViralManager } = await import("@/lib/brain/ViralManager");
    return await ViralManager.runFullCycle(token);
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
