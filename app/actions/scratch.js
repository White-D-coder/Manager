"use server";

import { GeminiBrain } from "@/lib/brain/GeminiBrain";
import { ViralManager } from "@/lib/brain/ViralManager";
import { cookies } from "next/headers";

export async function generateScratchIdeasAction() {
    return await GeminiBrain.generateTrendIdeas();
}

export async function generateScratchScriptAction(topic) {
    const config = {
        risk_profile: 'medium',
        voice_tone: 'Engaging',
    };
    // Passing string topic is supported by existing GenerateScript
    return await GeminiBrain.generateScript(topic, config, "Engaging");
}

export async function finalizeScratchUploadAction(formData, scriptContext) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    if (!token) return { error: "Please log in to YouTube first." };

    const file = formData.get("file");
    if (!file) return { error: "No file provided" };

    // Convert file to ArrayBuffer for uploading (YouTubeService expects Readable or similiar, but we can handle buffer)
    // Actually YouTubeService.uploadVideo expects a stream or buffer. Let's pass the file object directly if node environment supports it,
    // or convert to buffer.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await ViralManager.processUserUpload(buffer, scriptContext, token);
}

return await GeminiBrain.analyzeWeeklySchedule([]);
}

export async function predictViralityAction(conceptData) {
    const cookieStore = await cookies();
    const token = cookieStore.get("yt_access_token")?.value;

    const { YouTubeService } = await import("@/lib/api/youtube");

    // 1. Get Live Trends for Context
    let trends = [];
    if (token) {
        try {
            // Search for the topic to see what's currently winning
            trends = await YouTubeService.searchVideos(conceptData.topic, token);
        } catch (e) {
            console.warn("Virality Prediction: Failed to fetch trends", e);
        }
    }

    // 2. AI Prediction
    const prediction = await GeminiBrain.predictViralPotential(conceptData, trends);

    // 3. Audience Authenticity Check
    const audienceHealth = await GeminiBrain.analyzeAudienceAuthenticity(trends);

    return {
        ...prediction,
        audience_health: audienceHealth
    };
}
