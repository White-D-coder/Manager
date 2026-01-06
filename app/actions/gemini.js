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

export async function chatWithVideoAgentAction(message, context) {
    return await GeminiBrain.chatWithVideoAgent(message, context);
}

export async function analyzeUploadTimingAction(trends) {
    return await GeminiBrain.analyzeUploadTiming(trends);
}
